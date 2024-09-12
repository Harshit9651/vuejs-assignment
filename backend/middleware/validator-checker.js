const { body } = require('express-validator');
const moment = require('moment');

const validateUser = [
    body('username')
        .notEmpty().withMessage('Username is required')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username should not contain special characters like @$%^&*'),
    
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/^[a-zA-Z0-9!@#$%^&*]+$/).withMessage('Password contains invalid characters'),
    
    body('email')
        .isEmail().withMessage('Invalid email address'),
    
];





module.exports = { validateUser};
