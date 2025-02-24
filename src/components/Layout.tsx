import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div">
                        Done Is Better
                    </Typography>
                </Toolbar>
            </AppBar>
            <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
                <Outlet />
            </Container>
        </Box>
    );
};

export default Layout;

