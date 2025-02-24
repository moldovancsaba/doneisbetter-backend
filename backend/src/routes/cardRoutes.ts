import { Router, Request, Response } from 'express';
import { Card } from '../models/Card';

const router = Router();

// GET /cards - Fetch all cards sorted by newest first
router.get('/', async (req: Request, res: Response) => {
try {
    const cards = await Card.find().sort({ createdAt: -1 });
    res.json(cards);
} catch (error) {
    res.status(500).json({ message: 'Error fetching cards', error: error.message });
}
});

// POST /cards - Create a new card
router.post('/', async (req: Request, res: Response) => {
try {
    const { name } = req.body;
    if (!name) {
    return res.status(400).json({ message: 'Card name is required' });
    }
    
    const card = new Card({ name });
    await card.save();
    res.status(201).json(card);
} catch (error) {
    res.status(500).json({ message: 'Error creating card', error: error.message });
}
});

export default router;

