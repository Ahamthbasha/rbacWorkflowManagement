
import { body } from 'express-validator';

export const createRequestValidator = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isString().withMessage('Title must be a string')
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters')
    .matches(/^[a-zA-Z0-9\s\-_,.!?()]+$/).withMessage('Title contains invalid characters'),
  
  body('description')
    .notEmpty().withMessage('Description is required')
    .isString().withMessage('Description must be a string')
    .trim()
    .isLength({ min: 20, max: 5000 }).withMessage('Description must be between 20 and 5000 characters')
    .matches(/^[a-zA-Z0-9\s\-_,.!?()\n\r]+$/).withMessage('Description contains invalid characters'),
  
  body('category')
    .optional()
    .isIn(['access', 'software', 'hardware', 'leave', 'budget', 'other']).withMessage('Invalid category'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
];

export const editRequestValidator = [
  body('title')
    .optional()
    .isString().withMessage('Title must be a string')
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters')
    .matches(/^[a-zA-Z0-9\s\-_,.!?()]+$/).withMessage('Title contains invalid characters'),
  
  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim()
    .isLength({ min: 20, max: 5000 }).withMessage('Description must be between 20 and 5000 characters')
    .matches(/^[a-zA-Z0-9\s\-_,.!?()\n\r]+$/).withMessage('Description contains invalid characters'),
  
  body('category')
    .optional()
    .isIn(['access', 'software', 'hardware', 'leave', 'budget', 'other']).withMessage('Invalid category'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
];

export const updateRequestStatusValidator = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'approved', 'rejected', 'clarification_needed', 'closed']).withMessage('Invalid status'),
  body('comments')
    .optional()
    .isString().withMessage('Comments must be a string'),
];