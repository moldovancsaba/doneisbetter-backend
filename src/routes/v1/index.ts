import { Router, Request, Response } from 'express';

const router = Router();

// Root endpoint handler
router.get('/', (_req: Request, res: Response) => {
res.status(200).json({
    message: 'Welcome to the API',
    version: '1.0.0',
    endpoints: [
    { path: '/', method: 'GET', description: 'API information' },
    { path: '/health', method: 'GET', description: 'Health check endpoint' }
    ],
    serverTime: new Date().toISOString()
});
});

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
});
});

export default router;

