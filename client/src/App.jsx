import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ComicDetails from './pages/ComicDetails'; // ?? Add this line

function App() {
    return (
        <BrowserRouter>
            <nav style={{ marginBottom: '1rem' }}>
                <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
                <Link to="/register" style={{ marginRight: '1rem' }}>Register</Link>
                <Link to="/dashboard">Dashboard</Link>
            </nav>

            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/comic/:id" element={<ComicDetails />} /> {/* ?? Add this route */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
