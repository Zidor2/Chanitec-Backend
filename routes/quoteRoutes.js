const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');

// Quote routes
router.get('/', quoteController.getAllQuotes);
router.get('/:id', quoteController.getQuoteById);
router.post('/', quoteController.createQuote);
router.put('/:id', quoteController.updateQuote);
router.delete('/:id', quoteController.deleteQuote);
router.patch('/:id/reminder', quoteController.setReminderDate);
router.patch('/:id/confirm', quoteController.confirmQuote);

module.exports = router;