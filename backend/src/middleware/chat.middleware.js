const { body, param, validationResult } = require('express-validator');
const ChatMessageTypeEnum = require('../enums/ChatMessageType');

const validateSendChatMessageRequest = (req, res, next) => {};

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

const validateMessageRequest = [
  // Validate chat ID parameter
  param('chatId')
    .notEmpty()
    .withMessage('Chat ID is required')
    .isMongoId()
    .withMessage('Invalid chat ID format'),

  // Validate message type parameter
  param('type')
    .notEmpty()
    .withMessage('Message type is required')
    .isIn([ChatMessageTypeEnum.TEXT, ChatMessageTypeEnum.AUDIO])
    .withMessage(`Message type must be either "${ChatMessageTypeEnum.TEXT}" or "${ChatMessageTypeEnum.AUDIO}"`),

  // Use oneOf to validate either text or audio message based on type
  oneOf(
    [
      // Text message validation
      [
        body('message')
          .notEmpty()
          .withMessage('Message is required')
          .isString()
          .withMessage('Message must be a string')
          .isLength({ min: 1, max: 1000 })
          .withMessage('Message must be between 1 and 1000 characters')
          .trim()
          .custom((value) => {
            if (value.length === 0) {
              throw new Error(
                'Message cannot be empty or contain only whitespace',
              );
            }
            return true;
          }),
        // Ensure no audio fields are present for text messages
        body('audioUrl')
          .not()
          .exists()
          .withMessage('audioUrl should not be present for text messages'),
        body('audioDuration')
          .not()
          .exists()
          .withMessage('audioDuration should not be present for text messages'),
      ],
      // Audio message validation
      [
        body('audioUrl')
          .notEmpty()
          .withMessage('audioUrl is required')
          .isString()
          .withMessage('audioUrl must be a string')
          .matches(
            /^\/uploads\/audio\/[a-zA-Z0-9\-_]+\.(webm|mp4|wav|ogg|m4a)$/,
          )
          .withMessage('audioUrl must be a valid audio file path'),

        body('audioDuration')
          .notEmpty()
          .withMessage('audioDuration is required')
          .isFloat({ min: 0.1, max: 300 })
          .withMessage('audioDuration must be between 0.1 and 300 seconds'),

        body('audioFormat')
          .optional()
          .isString()
          .withMessage('audioFormat must be a string')
          .isIn(['webm', 'mp4', 'wav', 'ogg', 'm4a'])
          .withMessage('audioFormat must be one of: webm, mp4, wav, ogg, m4a'),

        body('fileSize')
          .optional()
          .isInt({ min: 1, max: 10 * 1024 * 1024 })
          .withMessage('fileSize must be between 1 byte and 10MB'),

        body('originalFileName')
          .optional()
          .isString()
          .withMessage('originalFileName must be a string')
          .isLength({ max: 255 })
          .withMessage('originalFileName cannot exceed 255 characters'),

        // Ensure no text message field is present for audio messages
        body('message')
          .not()
          .exists()
          .withMessage('message should not be present for audio messages'),
      ],
    ],
    'Invalid message format for the specified type',
  ),

  // Handle validation errors
  handleValidationErrors,
];
