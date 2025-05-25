import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ComicDetails from './pages/ComicDetails';
import WantList from './pages/WantList';
import './App.css';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';

function App() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    useEffect(() => {
        const refreshToken = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/auth/refresh-token', {
                    method: 'POST',
                    credentials: 'include',
                });
                const data = await res.text();
                const parsed = data ? JSON.parse(data) : {};

                if (res.ok && parsed.token) {
                    localStorage.setItem('token', parsed.token);
                } else {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
            } catch {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        };

        const token = localStorage.getItem('token');
        if (!token) return;

        const decode = (token) => {
            try {
                return JSON.parse(atob(token.split('.')[1]));
            } catch {
                return null;
            }
        };

        const decoded = decode(token);
        if (!decoded) return;

        const expiry = decoded.exp * 1000;
        const timeout = expiry - Date.now();

        if (timeout > 0) {
            setTimeout(refreshToken, timeout - 1000); // refresh just before expiration
        } else {
            refreshToken();
        }
    }, []);

    useEffect(() => {
        document.body.className = theme === 'dark' ? 'dark-theme' : '';
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <BrowserRouter>
            <header className="main-header">
                <div className="nav-container">
                    <h1 className="site-title">📚 Comic Book Tracker</h1>

                    <nav className="nav-links">
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/wantlist">Want List</Link>
                    </nav>
                    <div className="nav-actions">
                        <button
                            className="theme-toggle"
                            onClick={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
                        >
                            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                        </button>
                        <button className="logout-btn" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </header>

            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/comic/:id" element={<ComicDetails />} />
                <Route path="/wantlist" element={<WantList />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
