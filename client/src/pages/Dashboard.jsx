import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import './Dashboard.css';


function Dashboard() {
    const [comics, setComics] = useState([]);
    const [tokenValid, setTokenValid] = useState(true);
    const token = localStorage.getItem('token');

    const [title, setTitle] = useState('');
    const [seriesTitle, setSeriesTitle] = useState('');
    const [issue, setIssue] = useState('');
    const [year, setYear] = useState('');
    const [publisher, setPublisher] = useState('');
    const [grade, setGrade] = useState('');
    const [notes, setNotes] = useState('');
    const [image, setImage] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const [selectedImage, setSelectedImage] = useState(null);
    const [filterTitles, setFilterTitles] = useState([]);
    const [filterPublishers, setFilterPublishers] = useState([]);
    const [filterSlabbed, setFilterSlabbed] = useState('any');
    const [sortDirection, setSortDirection] = useState('az');

    useEffect(() => {
        if (!token) {
            setTokenValid(false);
            return;
        }
        try {
            const decoded = jwtDecode(token);
            const now = Date.now() / 1000;
            if (decoded.exp < now) {
                localStorage.removeItem('token');
                setTokenValid(false);
            }
        } catch {
            localStorage.removeItem('token');
            setTokenValid(false);
        }
    }, [token]);

    useEffect(() => {
        if (!tokenValid || !token) return;

        const fetchComics = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/comics', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setComics(data);
            } catch (err) {
                console.error('Error fetching comics:', err);
            }
        };

        fetchComics();
    }, [token, tokenValid]);

    const capitalizeWords = (str) =>
        str
            .toLowerCase()
            .replace(/\b\w/g, (l) => l.toUpperCase())
            .replace('Dc', 'DC')
            .replace('Dc Comics', 'DC')
            .replace('Detective Comics', 'DC');

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Are you sure you want to delete this comic?');
        if (!confirmed) return;

        try {
            const res = await fetch(`http://localhost:5000/api/comics/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setComics(comics.filter((c) => c._id !== id));
            }
        } catch (err) {
            console.error('Error deleting comic:', err);
        }
    };

    const handleEditSubmit = async (e, id) => {
        e.preventDefault();
        const cleaned = {
            ...editForm,
            title: capitalizeWords(editForm.title || ''),
            seriesTitle: capitalizeWords(editForm.seriesTitle || ''),
            publisher: capitalizeWords(editForm.publisher || ''),
            grade: editForm.grade?.toUpperCase() || '',
            notes: editForm.notes || '',
        };
        const res = await fetch(`http://localhost:5000/api/comics/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(cleaned),
        });
        const updated = await res.json();
        setComics(comics.map((c) => (c._id === id ? updated : c)));
        setEditingId(null);
    };

    const isSlabbed = (comic) => {
        const gradeNum = parseFloat(comic.grade);
        const notes = comic.notes?.toLowerCase() || '';
        return !isNaN(gradeNum) || /cgc|cbcs|pgx/i.test(notes);
    };

    const getAllTitles = () =>
        Array.from(new Set(comics.map((c) => c.title).filter(Boolean))).sort();

    const getAllPublishers = () =>
        Array.from(
            new Set(comics.map((c) => capitalizeWords(c.publisher)).filter(Boolean))
        ).sort();

    const filteredComics = comics
        .filter((c) => {
            const titleMatch =
                filterTitles.length === 0 ||
                filterTitles.includes('All') ||
                filterTitles.includes(c.title);
            const publisherMatch =
                filterPublishers.length === 0 ||
                filterPublishers.includes(capitalizeWords(c.publisher));
            const slabMatch =
                filterSlabbed === 'any' ||
                (filterSlabbed === 'slabbed' && isSlabbed(c)) ||
                (filterSlabbed === 'raw' && !isSlabbed(c));
            return titleMatch && publisherMatch && slabMatch;
        })
        .sort((a, b) => {
            const titleCompare = a.title.localeCompare(b.title);
            if (titleCompare !== 0) return sortDirection === 'az' ? titleCompare : -titleCompare;
            const issueA = parseFloat(a.issue) || 0;
            const issueB = parseFloat(b.issue) || 0;
            return issueA - issueB;
        });

    if (!tokenValid) return <h2>Access denied. Please log in again.</h2>;

    return (
        <div>
            <h2>Comic Book Tracker Dashboard</h2>
            <button onClick={handleLogout}>Logout</button>

            <h3>Add a Comic:</h3>
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    const newComic = {
                        title: capitalizeWords(title),
                        seriesTitle: capitalizeWords(seriesTitle),
                        issue,
                        year,
                        publisher: capitalizeWords(publisher),
                        grade: grade.toUpperCase(),
                        notes,
                        image,
                    };
                    const res = await fetch('http://localhost:5000/api/comics', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(newComic),
                    });
                    const saved = await res.json();
                    setComics([saved, ...comics]);
                    setTitle('');
                    setSeriesTitle('');
                    setIssue('');
                    setYear('');
                    setPublisher('');
                    setGrade('');
                    setNotes('');
                    setImage('');
                }}
            >
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
                <input type="text" value={seriesTitle} onChange={(e) => setSeriesTitle(e.target.value)} placeholder="Series Title" />
                <input type="text" value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="Issue" />
                <input type="text" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" />
                <input type="text" value={publisher} onChange={(e) => setPublisher(e.target.value)} placeholder="Publisher" />
                <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Grade" />
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" />
                <input type="text" value={image} onChange={(e) => setImage(e.target.value)} placeholder="Image URL" />
                <button type="submit">Add Comic</button>
            </form>

            <h3>Filters & Sorting:</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <label>Titles:</label>
                    <select multiple value={filterTitles} onChange={(e) =>
                        setFilterTitles(Array.from(e.target.selectedOptions, opt => opt.value))
                    } style={{ maxHeight: '100px', overflowY: 'auto' }}>
                        <option value="All">All Titles</option>
                        {getAllTitles().map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Publishers:</label>
                    <select multiple value={filterPublishers} onChange={(e) =>
                        setFilterPublishers(Array.from(e.target.selectedOptions, opt => opt.value))
                    } style={{ maxHeight: '100px', overflowY: 'auto' }}>
                        {getAllPublishers().map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Format:</label>
                    <select value={filterSlabbed} onChange={(e) => setFilterSlabbed(e.target.value)}>
                        <option value="any">All</option>
                        <option value="slabbed">Slabbed</option>
                        <option value="raw">Raw</option>
                    </select>
                </div>

                <div>
                    <label>Sort:</label>
                    <select value={sortDirection} onChange={(e) => setSortDirection(e.target.value)}>
                        <option value="az">Title A–Z, Issue ↑</option>
                        <option value="za">Title Z–A, Issue ↑</option>
                    </select>
                </div>
            </div>

            <h3>Your Comics:</h3>
            {filteredComics.length === 0 ? (
                <p>No comics found.</p>
            ) : (
                <ul style={{ padding: 0 }}>
                    {filteredComics.map((comic) => (
                        <li
                            key={comic._id}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                background: '#f9f9f9',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '1rem',
                                marginBottom: '1rem',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                gap: '1rem',
                            }}
                        >
                            {comic.image && (
                                <Link to={`/comic/${comic._id}`}>
                                    <img
                                        src={comic.image}
                                        alt={comic.title}
                                        className="thumbnail"
                                    />
                                </Link>
                            )}

                            {editingId === comic._id ? (
                                <form
                                    onSubmit={(e) => handleEditSubmit(e, comic._id)}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.25rem',
                                    }}
                                >
                                    <input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="Title" />
                                    <input value={editForm.seriesTitle || ''} onChange={(e) => setEditForm({ ...editForm, seriesTitle: e.target.value })} placeholder="Series Title" />
                                    <input value={editForm.issue || ''} onChange={(e) => setEditForm({ ...editForm, issue: e.target.value })} placeholder="Issue" />
                                    <input value={editForm.year || ''} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} placeholder="Year" />
                                    <input value={editForm.publisher || ''} onChange={(e) => setEditForm({ ...editForm, publisher: e.target.value })} placeholder="Publisher" />
                                    <input value={editForm.grade || ''} onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })} placeholder="Grade" />
                                    <input value={editForm.notes || ''} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} placeholder="Notes" />
                                    <input value={editForm.image || ''} onChange={(e) => setEditForm({ ...editForm, image: e.target.value })} placeholder="Image URL" />
                                    <button type="submit">Save</button>
                                    <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
                                </form>
                            ) : (
                                    <div style={{ flex: 1, lineHeight: '1.6' }}>
                                    <Link to={`/comic/${comic._id}`}>
                                        <strong>{comic.title}</strong>
                                    </Link>{' '}
                                    #{comic.issue} | {comic.seriesTitle} | {comic.publisher} | {comic.year} | {isSlabbed(comic) ? 'Slabbed' : 'Raw'}
                                    {comic.grade && <> | Grade: {comic.grade}</>}
                                    {comic.notes && <> | Notes: {comic.notes}</>}
                                    <div>
                                        <button
                                            onClick={() => {
                                                setEditingId(comic._id);
                                                setEditForm({ ...comic });
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(comic._id)}
                                            style={{ marginLeft: '0.5rem' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {selectedImage && (
                <div
                    onClick={() => setSelectedImage(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                    }}
                >
                    <img
                        src={selectedImage}
                        alt="Enlarged"
                        style={{
                            maxHeight: '90%',
                            maxWidth: '90%',
                            borderRadius: '8px',
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default Dashboard;
