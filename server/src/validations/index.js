import { body } from 'express-validator';

// Registration validation
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['USER', 'STAFF', 'ADMIN']).withMessage('Invalid role'),
  
  body('phone')
    .optional()
    .isMobilePhone().withMessage('Invalid phone number'),
  
  body('bloodGroup')
    .if(body('role').equals('USER'))
    .notEmpty().withMessage('Blood group is required for users')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  
  body('hospitalId')
    .if(body('role').isIn(['STAFF', 'ADMIN']))
    .notEmpty().withMessage('Hospital ID is required for staff and admin'),
  
  body('department')
    .if(body('role').equals('STAFF'))
    .notEmpty().withMessage('Department is required for staff'),
];

// Login validation
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
];

// Blood request validation
export const bloodRequestValidation = [
  body('hospitalId')
    .notEmpty().withMessage('Hospital ID is required')
    .isMongoId().withMessage('Invalid hospital ID'),
  
  body('bloodGroup')
    .notEmpty().withMessage('Blood group is required')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  
  body('unitsRequired')
    .notEmpty().withMessage('Units required is required')
    .isInt({ min: 1, max: 10 }).withMessage('Units required must be between 1 and 10'),
  
  body('urgency')
    .notEmpty().withMessage('Urgency is required')
    .isIn(['NORMAL', 'HIGH', 'CRITICAL']).withMessage('Invalid urgency level'),
  
  body('patientName')
    .trim()
    .notEmpty().withMessage('Patient name is required'),
  
  body('medicalReason')
    .trim()
    .notEmpty().withMessage('Medical reason is required'),
];

// Donation validation
export const donationValidation = [
  body('donorId')
    .notEmpty().withMessage('Donor ID is required')
    .isMongoId().withMessage('Invalid donor ID'),
  
  body('bloodGroup')
    .notEmpty().withMessage('Blood group is required')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  
  body('unitsDonated')
    .notEmpty().withMessage('Units donated is required')
    .isInt({ min: 1, max: 2 }).withMessage('Units donated must be between 1 and 2'),
  
  body('donorWeight')
    .notEmpty().withMessage('Donor weight is required')
    .isFloat({ min: 45 }).withMessage('Donor weight must be at least 45 kg'),
  
  body('donorBloodPressure')
    .notEmpty().withMessage('Blood pressure is required'),
  
  body('donorHemoglobin')
    .notEmpty().withMessage('Hemoglobin level is required')
    .isFloat({ min: 12 }).withMessage('Hemoglobin must be at least 12 g/dL'),
];

export default {
  registerValidation,
  loginValidation,
  bloodRequestValidation,
  donationValidation,
};
