import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send email
export const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.warn('Email service not configured. Skipping email send.');
      return null;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"LifeForce Blood Bank" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

// Email templates
export const emailTemplates = {
  welcome: (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #DC2626;">Welcome to LifeForce Blood Bank!</h2>
      <p>Dear ${name},</p>
      <p>Thank you for registering with LifeForce Blood Bank. Your account has been created successfully.</p>
      <p>You can now log in and start using our services to save lives through blood donation.</p>
      <p>Best regards,<br>LifeForce Team</p>
    </div>
  `,

  bloodRequestCreated: (patientName, bloodGroup, urgency) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #DC2626;">New Blood Request</h2>
      <p>A new blood request has been submitted:</p>
      <ul>
        <li><strong>Patient:</strong> ${patientName}</li>
        <li><strong>Blood Group:</strong> ${bloodGroup}</li>
        <li><strong>Urgency:</strong> <span style="color: ${urgency === 'CRITICAL' ? '#EF4444' : urgency === 'HIGH' ? '#F59E0B' : '#6B7280'}">${urgency}</span></li>
      </ul>
      <p>Please log in to the system to review and process this request.</p>
      <p>Best regards,<br>LifeForce Team</p>
    </div>
  `,

  bloodRequestStatusUpdate: (requesterName, status, bloodGroup) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #DC2626;">Blood Request Update</h2>
      <p>Dear ${requesterName},</p>
      <p>Your blood request for <strong>${bloodGroup}</strong> has been <strong>${status.toLowerCase()}</strong>.</p>
      ${status === 'APPROVED' ? '<p>We will contact you shortly with further details.</p>' : ''}
      ${status === 'REJECTED' ? '<p>Unfortunately, we cannot fulfill your request at this time. Please contact us for more information.</p>' : ''}
      <p>Best regards,<br>LifeForce Team</p>
    </div>
  `,

  donationScheduled: (donorName, donationDate, hospitalName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #DC2626;">Donation Appointment Scheduled</h2>
      <p>Dear ${donorName},</p>
      <p>Your blood donation appointment has been scheduled:</p>
      <ul>
        <li><strong>Date:</strong> ${new Date(donationDate).toLocaleDateString()}</li>
        <li><strong>Time:</strong> ${new Date(donationDate).toLocaleTimeString()}</li>
        <li><strong>Location:</strong> ${hospitalName}</li>
      </ul>
      <p>Please arrive 15 minutes early and bring a valid ID.</p>
      <p><strong>Important:</strong> Make sure to eat well and stay hydrated before your donation.</p>
      <p>Best regards,<br>LifeForce Team</p>
    </div>
  `,

  staffApproved: (staffName, hospitalName, staffId) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10B981;">Staff Registration Approved</h2>
      <p>Dear ${staffName},</p>
      <p>Congratulations! Your staff registration has been approved.</p>
      <ul>
        <li><strong>Hospital:</strong> ${hospitalName}</li>
        <li><strong>Staff ID:</strong> ${staffId}</li>
      </ul>
      <p>You can now log in to the system and access staff features.</p>
      <p>Best regards,<br>LifeForce Team</p>
    </div>
  `,

  staffRejected: (staffName, hospitalName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #EF4444;">Staff Registration Update</h2>
      <p>Dear ${staffName},</p>
      <p>Unfortunately, your staff registration at ${hospitalName} has not been approved at this time.</p>
      <p>If you have questions, please contact the hospital administrator.</p>
      <p>Best regards,<br>LifeForce Team</p>
    </div>
  `,

  inventoryLowAlert: (bloodGroup, unitsAvailable, hospitalName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #F59E0B;">Low Inventory Alert</h2>
      <p>The blood inventory at ${hospitalName} is running low:</p>
      <ul>
        <li><strong>Blood Group:</strong> ${bloodGroup}</li>
        <li><strong>Units Available:</strong> ${unitsAvailable}</li>
      </ul>
      <p>Please take necessary action to replenish the inventory.</p>
      <p>Best regards,<br>LifeForce System</p>
    </div>
  `,
};

// Send welcome email
export const sendWelcomeEmail = async (email, name) => {
  return await sendEmail(
    email,
    'Welcome to LifeForce Blood Bank',
    emailTemplates.welcome(name)
  );
};

// Send blood request notification
export const sendBloodRequestEmail = async (email, patientName, bloodGroup, urgency) => {
  return await sendEmail(
    email,
    `New ${urgency} Blood Request - ${bloodGroup}`,
    emailTemplates.bloodRequestCreated(patientName, bloodGroup, urgency)
  );
};

// Send blood request status update
export const sendBloodRequestStatusEmail = async (email, requesterName, status, bloodGroup) => {
  return await sendEmail(
    email,
    `Blood Request ${status} - ${bloodGroup}`,
    emailTemplates.bloodRequestStatusUpdate(requesterName, status, bloodGroup)
  );
};

// Send donation scheduled email
export const sendDonationScheduledEmail = async (email, donorName, donationDate, hospitalName) => {
  return await sendEmail(
    email,
    'Blood Donation Appointment Scheduled',
    emailTemplates.donationScheduled(donorName, donationDate, hospitalName)
  );
};

// Send staff approval email
export const sendStaffApprovalEmail = async (email, staffName, hospitalName, staffId, isApproved) => {
  const subject = isApproved ? 'Staff Registration Approved' : 'Staff Registration Update';
  const template = isApproved 
    ? emailTemplates.staffApproved(staffName, hospitalName, staffId)
    : emailTemplates.staffRejected(staffName, hospitalName);
    
  return await sendEmail(email, subject, template);
};

// Send inventory low alert
export const sendInventoryAlertEmail = async (email, bloodGroup, unitsAvailable, hospitalName) => {
  return await sendEmail(
    email,
    `Low Inventory Alert - ${bloodGroup} at ${hospitalName}`,
    emailTemplates.inventoryLowAlert(bloodGroup, unitsAvailable, hospitalName)
  );
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendBloodRequestEmail,
  sendBloodRequestStatusEmail,
  sendDonationScheduledEmail,
  sendStaffApprovalEmail,
  sendInventoryAlertEmail,
};
