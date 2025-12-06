import ChatMessage from '../models/ChatMessage.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';

// Get Chat Messages for a conversation
export const getChatMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await ChatMessage.find({ roomId })
      .populate('senderId', 'name email role avatar')
      .populate('receiverId', 'name email role avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ChatMessage.countDocuments({ roomId });

    res.json({
      messages: messages.reverse(),
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send Message via REST
export const sendMessage = async (req, res) => {
  try {
    const { roomId, receiverId, message, messageType = 'text', relatedRequestId } = req.body;
    const senderId = req.user._id;

    if (!roomId || !message) {
      return res.status(400).json({ message: 'Room ID and message are required' });
    }

    const chatMessage = await ChatMessage.create({
      roomId,
      senderId,
      receiverId,
      message,
      messageType,
      relatedRequestId,
      isRead: false
    });

    await chatMessage.populate('senderId', 'name email role avatar');

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(roomId, {
      lastMessage: {
        content: message,
        senderId,
        timestamp: new Date()
      }
    });

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      // Emit to the conversation room (with prefix to match socket handler)
      io.to(`conversation:${roomId}`).emit('chat:newMessage', {
        conversationId: roomId,
        message: chatMessage
      });

      // Also send notification to the receiver
      if (receiverId) {
        const sender = await User.findById(senderId).select('name');
        io.to(`user:${receiverId}`).emit('chat:notification', {
          conversationId: roomId,
          message,
          senderName: sender?.name || 'Someone',
          senderId
        });
      }
    }

    res.status(201).json({
      message: 'Message sent successfully',
      chatMessage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's conversations
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    })
      .populate('participants', 'name email role avatar phone')
      .populate('hospitalId', 'name code')
      .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 });

    // Format conversations with other participant info
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== userId.toString()
      );
      return {
        _id: conv._id,
        roomId: conv._id,
        type: conv.type,
        otherParticipant,
        hospital: conv.hospitalId,
        lastMessage: conv.lastMessage,
        updatedAt: conv.updatedAt
      };
    });

    res.json({ conversations: formattedConversations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Find or create conversation with a user (by phone number - for Staff)
export const findUserByPhone = async (req, res) => {
  try {
    const { phone } = req.query;
    const staffId = req.user._id;
    const hospitalId = req.user.hospitalId;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Clean phone number (remove spaces, dashes)
    const cleanPhone = phone.replace(/[\s-]/g, '');

    // First search in Users
    let user = await User.findOne({
      phone: { $regex: cleanPhone, $options: 'i' },
      role: 'USER'
    }).select('_id name email phone');

    // If not found in Users, search in Patients
    let patient = null;
    if (!user) {
      patient = await Patient.findOne({
        phone: { $regex: cleanPhone, $options: 'i' },
        hospitalId
      }).select('_id name phone email');
    }

    if (!user && !patient) {
      return res.status(404).json({ 
        message: 'No user or patient found with this phone number',
        code: 'USER_NOT_FOUND'
      });
    }

    // If it's a patient without a user account, return patient info
    if (patient && !user) {
      return res.json({
        found: true,
        isPatient: true,
        patient: {
          _id: patient._id,
          name: patient.name,
          phone: patient.phone.slice(-4).padStart(patient.phone.length, '*'), // Mask phone
        },
        message: 'Patient found. Note: This patient does not have a user account for chat.'
      });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [staffId, user._id] },
      type: 'USER_STAFF'
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [staffId, user._id],
        type: 'USER_STAFF',
        hospitalId
      });
    }

    res.json({
      found: true,
      isPatient: false,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone.slice(-4).padStart(user.phone.length, '*'), // Mask phone
      },
      conversation: {
        _id: conversation._id,
        roomId: conversation._id
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Start or get Staff-Admin conversation
export const getStaffAdminConversation = async (req, res) => {
  try {
    const staffId = req.user._id;
    const hospitalId = req.user.hospitalId;

    // Find an admin (system admin or hospital admin)
    const admin = await User.findOne({ role: 'ADMIN' }).select('_id name email');

    if (!admin) {
      return res.status(404).json({ message: 'No admin available for chat' });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [staffId, admin._id] },
      type: 'STAFF_ADMIN',
      hospitalId
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [staffId, admin._id],
        type: 'STAFF_ADMIN',
        hospitalId
      });
    }

    await conversation.populate('participants', 'name email role avatar');

    res.json({
      conversation: {
        _id: conversation._id,
        roomId: conversation._id,
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    await ChatMessage.updateMany(
      {
        roomId,
        receiverId: userId,
        isRead: false
      },
      {
        $set: { isRead: true, readAt: new Date() }
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await ChatMessage.countDocuments({
      receiverId: userId,
      isRead: false
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search users by name or phone for staff chat
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const staffId = req.user._id;
    const hospitalId = req.user.hospitalId;

    if (!query || query.length < 2) {
      return res.json({ users: [] });
    }

    // Search users by name or phone
    const users = await User.find({
      role: 'USER',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ]
    })
      .select('_id name phone email')
      .limit(10);

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Start conversation with a user
export const startConversation = async (req, res) => {
  try {
    const { userId } = req.body;
    const staffId = req.user._id;
    const hospitalId = req.user.hospitalId;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find existing conversation or create new one
    let conversation = await Conversation.findOne({
      participants: { $all: [staffId, userId] },
      type: 'USER_STAFF'
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [staffId, userId],
        type: 'USER_STAFF',
        hospitalId,
        isActive: true
      });
    }

    await conversation.populate('participants', 'name email role phone');

    const otherParticipant = conversation.participants.find(
      p => p._id.toString() !== staffId.toString()
    );

    res.json({
      conversation: {
        _id: conversation._id,
        roomId: conversation._id,
        otherParticipant,
        type: conversation.type
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
