const express = require('express');
const router = express.Router();
const {
    createEmotionCard,
    getAllEmotionCards,
    getEmotionCardById,
    updateEmotionCard,
    deleteEmotionCard
} = require('../controllers/EmotionCardController');

// Emotion Card Routes
router.post('/emotion-cards', createEmotionCard);
router.get('/emotion-cards', getAllEmotionCards);
router.get('/emotion-cards/:id', getEmotionCardById);
router.put('/emotion-cards/:id', updateEmotionCard);
router.delete('/emotion-cards/:id', deleteEmotionCard);

module.exports = router;

