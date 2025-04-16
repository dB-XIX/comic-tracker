import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ComicDetails from './pages/ComicDetails';
import WantList from './pages/WantList';
import './App.css'; // ⬅️ Make sure you import your styles

function App() {
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
                        {/* This will be filled dynamically from Dashboard using JS or React */}
                    </div>
                </div>
            </header>

            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/comic/:id" element={<ComicDetails />} />
                <Route path="/wantlist" element={<WantList />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
