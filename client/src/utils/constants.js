// User roles
export const ROLES = {
  USER: 'USER',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
};

// Blood groups
export const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

// Request status
export const REQUEST_STATUS = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// Urgency levels - as array for dropdowns
export const URGENCY_LEVELS = ['NORMAL', 'HIGH', 'CRITICAL'];

// Urgency levels object for reference
export const URGENCY = {
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

// Staff status
export const STAFF_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
};

// Staff roles/positions
export const STAFF_POSITIONS = [
  'Doctor',
  'Nurse',
  'Lab Technician',
  'Blood Bank Officer',
  'Assistant',
  'Administrator',
  'Coordinator',
];

// API endpoints
export const API_BASE_URL = '/api';

// Socket events
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'joinRoom',
  LEAVE_ROOM: 'leaveRoom',
  SEND_MESSAGE: 'sendMessage',
  MESSAGE_RECEIVED: 'messageReceived',
  NOTIFICATION: 'notification',
  REQUEST_UPDATE: 'requestUpdate',
};
