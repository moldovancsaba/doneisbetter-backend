import express from 'express';
import { Card } from '../models/Card';
import mongoose from 'mongoose';

const router = express.Router();

// Get all cards
router.get('/', async (req, res) => {
try {
    const cards = await Card.find().sort({ order: 1 });
    res.json(cards);
} catch (error) {
    res.status(500).json({ message: 'Error fetching cards' });
}
});

// Create new card 
router.post('/', async (req, res) => {
try {
    const lastCard = await Card.findOne().sort('-order');
    const order = lastCard ? lastCard.order + 1 : 0;
    
    const card = new Card({
    ...req.body,
    order
    });
    
    await card.save();
    res.status(201).json(card);
} catch (error) {
    res.status(500).json({ message: 'Error creating card' });
}
});

// PUT update all cards (for reordering)
router.put('/', async (req, res) => {
const session = await mongoose.startSession();
session.startTransaction();

try {
    const { cards } = req.body;

    if (!Array.isArray(cards)) {
    throw new Error('Cards must be an array');
    }

    // Validate all cards have required fields
    const validCards = cards.every(card => 
    card._id && 
    mongoose.Types.ObjectId.isValid(card._id) && 
    typeof card.order === 'number'
    );

    if (!validCards) {
    throw new Error('Invalid card data');
    }

    // Update all cards in a single transaction
    await Promise.all(
    cards.map(card =>
        Card.findByIdAndUpdate(
        card._id,
        { $set: { order: card.order } },
        { session, new: true }
        )
    )
    );

    await session.commitTransaction();

    // Fetch and return updated cards
    const updatedCards = await Card.find().sort({ order: 1 });
    res.json(updatedCards);
} catch (error) {
    await session.abortTransaction();
    res.status(400).json({ 
    message: error instanceof Error ? error.message : 'Error updating cards'
    });
} finally {
    session.endSession();
}
});

export const cardsRouter = router;
