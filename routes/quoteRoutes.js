const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');

// Quote routes
router.get('/', quoteController.getAllQuotes);
router.get('/:id/:created_at', quoteController.getQuoteById);
router.post('/', quoteController.createQuote);
router.put('/:id/:created_at', quoteController.updateQuote);
router.delete('/:id/:created_at', quoteController.deleteQuote);
router.patch('/:id/reminder', quoteController.setReminderDate);
router.patch('/:id/confirm', quoteController.confirmQuote);

module.exports = router;