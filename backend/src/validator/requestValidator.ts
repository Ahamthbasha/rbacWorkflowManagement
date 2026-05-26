// validators/requestValidator.ts
import { body } from 'express-validator';

export const createRequestValidator = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isString().withMessage('Title must be a string')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .notEmpty().withMessage('Description is required')
    .isString().withMessage('Description must be a string')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  
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