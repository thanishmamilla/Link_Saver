import { Routes, Route, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Bookmarks from './pages/Bookmarks';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#1976d2' },
    background: { default: '#181a1b', paper: '#23272f' },
  },
  typography: {
    fontFamily: 'Segoe UI, Arial, sans-serif',
  },
});

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <ThemeProvider theme={theme}>
      <Box minHeight="100vh" width="100vw" sx={{ background: theme.palette.background.default }}>
        <AppBar position="static" color="primary" elevation={2}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              <Link component={RouterLink} to="/" color="inherit" underline="none">
                Link Saver
              </Link>
            </Typography>
            {token ? (
              <Button color="inherit" onClick={logout} variant="outlined" sx={{ ml: 2 }}>
                Logout
              </Button>
            ) : (
              <Box>
                <Button color="inherit" component={RouterLink} to="/login" sx={{ mr: 1 }}>
                  Login
                </Button>
                <Button color="inherit" component={RouterLink} to="/register" variant="outlined">
                  Register
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/" element={<Bookmarks token={token} />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Box>
    </ThemeProvider>
  );
}

export default App;
