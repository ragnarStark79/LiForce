// Application-wide constants
export const ROLES = {
  USER: 'USER',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
};

export const USER_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
};

export const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

export const REQUEST_STATUS = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const URGENCY_LEVELS = {
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

export const STAFF_ROLES = {
  DOCTOR: 'Doctor',
  NURSE: 'Nurse',
  ASSISTANT: 'Assistant',
  TECHNICIAN: 'Technician',
  ADMINISTRATOR: 'Administrator',
};

export default {
  ROLES,
  USER_STATUS,
  BLOOD_GROUPS,
  REQUEST_STATUS,
  URGENCY_LEVELS,
  STAFF_ROLES,
};
