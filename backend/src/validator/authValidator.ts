import { body } from 'express-validator';

const nameRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)+$/;

const emailRegex = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

export const registerValidator = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .trim()
    .isLength({ min: 5, max: 50 }).withMessage('Name must be between 5 and 50 characters')
    .matches(/^[A-Za-z\s]+$/).withMessage('Name can only contain letters and spaces')
    .custom((value) => {
      if (value.trim().length !== value.length) {
        throw new Error('Name cannot have leading or trailing spaces');
      }
      if (value.includes('  ')) {
        throw new Error('Name cannot have multiple consecutive spaces');
      }
      return true;
    }),
  
  body('email')
    .notEmpty().withMessage('Email is required')
    .trim()
    .toLowerCase()
    .isEmail().withMessage('Please provide a valid email address')
    .matches(emailRegex).withMessage('Please provide a professional email address')
    .custom((email) => {
      // Block common disposable/temporary email domains
      const disposableDomains = [
        'tempmail.com', 'throwaway.com', 'guerrillamail.com', 'mailinator.com',
        'yopmail.com', '10minutemail.com', 'temp-mail.org', 'fake-mail.net'
      ];
      const domain = email.split('@')[1];
      if (disposableDomains.includes(domain)) {
        throw new Error('Please use a permanent email address, not a temporary one');
      }
      return true;
    }),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character (@$!%*?&)')
    .matches(passwordRegex).withMessage('Password must meet all security requirements'),
];

export const loginValidator = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .trim()
    .toLowerCase()
    .isEmail().withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
];

export const registerManagerValidator = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .trim()
    .isLength({ min: 5, max: 50 }).withMessage('Name must be between 5 and 50 characters')
    .matches(/^[A-Za-z\s]+$/).withMessage('Name can only contain letters and spaces')
    .custom((value) => {
      if (value.trim().length !== value.length) {
        throw new Error('Name cannot have leading or trailing spaces');
      }
      if (value.includes('  ')) {
        throw new Error('Name cannot have multiple consecutive spaces');
      }
      return true;
    }),
  
  body('email')
    .notEmpty().withMessage('Email is required')
    .trim()
    .toLowerCase()
    .isEmail().withMessage('Please provide a valid email')
    .matches(emailRegex).withMessage('Please provide a professional email address'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character (@$!%*?&)'),
];

export const loginManagerValidator = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .trim()
    .toLowerCase()
    .isEmail().withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
];

export const loginAdminValidator = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .trim()
    .toLowerCase()
    .isEmail().withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
];