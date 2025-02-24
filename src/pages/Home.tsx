import { Typography, Paper, Box } from '@mui/material';

const Home = () => {
    return (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Welcome to Done Is Better
                </Typography>
                <Typography variant="body1">
                    A simple and effective way to organize your thoughts and tasks.
                </Typography>
            </Box>
        </Paper>
    );
};

export default Home;

