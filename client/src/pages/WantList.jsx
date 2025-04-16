import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';
import './WantList.css';

function WantList() {
    const [comics, setComics] = useState([]);
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
    const [tokenValid, setTokenValid] = useState(true);
    const token = localStorage.getItem('token');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTitles, setFilterTitles] = useState([]);
    const [filterPublishers, setFilterPublishers] = useState([]);
    const [filterSlabbed, setFilterSlabbed] = useState('any');
    const [sortDirection, setSortDirection] = useState('az');
    const [sortField, setSortField] = useState('title');

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
                setComics(data.filter(c => c.wantList));
            } catch (err) {
                console.error('Error fetching want list:', err);
            }
        };
        fetchComics();
    }, [token, tokenValid]);

    const capitalizeWords = (str) =>
        str?.toLowerCase()
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace('Dc', 'DC')
            .replace('Dc Comics', 'DC')
            .replace('Detective Comics', 'DC') || '';

    const isSlabbed = (comic) => {
        const gradeNum = parseFloat(comic.grade);
        const notes = comic.notes?.toLowerCase() || '';
        return !isNaN(gradeNum) || /cgc|cbcs|pgx/i.test(notes);
    };

    const getAllTitles = () =>
        Array.from(new Set(comics.map(c => c.title).filter(Boolean))).sort();

    const getAllPublishers = () =>
        Array.from(new Set(comics.map(c => capitalizeWords(c.publisher)).filter(Boolean))).sort();

    if (!tokenValid) return <h2>Access denied. Please log in again.</h2>;

    const filteredSorted = comics
        .filter((c) => {
            const titleMatch = filterTitles.length === 0 || filterTitles.includes('All') || filterTitles.includes(c.title);
            const publisherMatch = filterPublishers.length === 0 || filterPublishers.includes(capitalizeWords(c.publisher));
            const slabMatch =
                filterSlabbed === 'any' ||
                (filterSlabbed === 'slabbed' && isSlabbed(c)) ||
                (filterSlabbed === 'raw' && !isSlabbed(c));
            const query = searchQuery.toLowerCase();
            const searchMatch =
                !query ||
                c.title?.toLowerCase().includes(query) ||
                c.seriesTitle?.toLowerCase().includes(query) ||
                c.issue?.toLowerCase().includes(query) ||
                c.publisher?.toLowerCase().includes(query) ||
                c.notes?.toLowerCase().includes(query) ||
                c.grade?.toLowerCase().includes(query) ||
                c.year?.toLowerCase().includes(query);

            return titleMatch && publisherMatch && slabMatch && searchMatch;
        })
        .sort((a, b) => {
            if (sortField === 'title') {
                const titleCompare = a.title.localeCompare(b.title);
                if (titleCompare !== 0) return sortDirection === 'az' ? titleCompare : -titleCompare;
                return (parseFloat(a.issue) || 0) - (parseFloat(b.issue) || 0);
            }
            if (sortField === 'grade') {
                const gradeA = (a.grade || '').toUpperCase();
                const gradeB = (b.grade || '').toUpperCase();
                return sortDirection === 'az' ? gradeA.localeCompare(gradeB) : gradeB.localeCompare(gradeA);
            }
            if (sortField === 'date') {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return sortDirection === 'az' ? dateB - dateA : dateA - dateB;
            }
            if (sortField === 'ebayAverage') {
                const avgA = a.ebayAverage || 0;
                const avgB = b.ebayAverage || 0;
                return sortDirection === 'az' ? avgA - avgB : avgB - avgA;
            }
            return 0;
        });

    return (
        <div>
            <h2>📋 Your Want List</h2>
            <Link to="/dashboard" style={{ display: 'inline-block', marginBottom: '1rem' }}>
                ← Back to Dashboard
            </Link>

            <h3>Add to Want List:</h3>
            <form onSubmit={async (e) => {
                e.preventDefault();
                const newComic = {
                    title, seriesTitle, issue, year, publisher, grade, notes, image, wantList: true
                };
                try {
                    const res = await fetch('http://localhost:5000/api/comics', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(newComic),
                    });
                    const saved = await res.json();
                    if (saved.wantList) setComics([saved, ...comics]);
                    setTitle(''); setSeriesTitle(''); setIssue('');
                    setYear(''); setPublisher(''); setGrade('');
                    setNotes(''); setImage('');
                } catch (err) {
                    console.error('Error adding comic to want list:', err);
                }
            }}>
                <div className="compact-form">
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
                    <input value={seriesTitle} onChange={(e) => setSeriesTitle(e.target.value)} placeholder="Series Title" />
                    <input value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="Issue" />
                    <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" />
                    <input value={publisher} onChange={(e) => setPublisher(e.target.value)} placeholder="Publisher" />
                    <input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Grade" />
                    <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" />
                    <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="Image URL" />
                    <button type="submit">Add Comic</button>
                </div>
            </form>

            <h3>Search, Filter, and Sort:</h3>
            <div className="filter-bar">
                <input className="search-bar" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <select multiple value={filterTitles} onChange={(e) => setFilterTitles(Array.from(e.target.selectedOptions, opt => opt.value))}>
                    <option value="All">All Titles</option>
                    {getAllTitles().map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select multiple value={filterPublishers} onChange={(e) => setFilterPublishers(Array.from(e.target.selectedOptions, opt => opt.value))}>
                    {getAllPublishers().map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select value={filterSlabbed} onChange={(e) => setFilterSlabbed(e.target.value)}>
                    <option value="any">All</option>
                    <option value="slabbed">Slabbed</option>
                    <option value="raw">Raw</option>
                </select>
                <select value={sortField} onChange={(e) => setSortField(e.target.value)}>
                    <option value="title">Title</option>
                    <option value="grade">Grade</option>
                    <option value="date">Date Added</option>
                    <option value="ebayAverage">eBay Average</option>
                </select>
                <select value={sortDirection} onChange={(e) => setSortDirection(e.target.value)}>
                    <option value="az">Ascending</option>
                    <option value="za">Descending</option>
                </select>
            </div>

            {filteredSorted.length === 0 ? (
                <p>No comics on your want list yet.</p>
            ) : (
                <ul style={{ padding: 0 }}>
                    {filteredSorted.map(comic => (
                        <li key={comic._id} className="comic-item">
                            <Link to={`/comic/${comic._id}`}>
                                <img src={comic.image} alt={comic.title} className="comic-thumb" />
                            </Link>
                            {editingId === comic._id ? (
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const res = await fetch(`http://localhost:5000/api/comics/${comic._id}`, {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            Authorization: `Bearer ${token}`,
                                        },
                                        body: JSON.stringify(editForm),
                                    });
                                    const updated = await res.json();
                                    setComics(comics.map(c => c._id === comic._id ? updated : c));
                                    setEditingId(null);
                                }}>
                                    {['title', 'seriesTitle', 'issue', 'year', 'publisher', 'grade', 'notes', 'image'].map(field => (
                                        <input
                                            key={field}
                                            value={editForm[field] || ''}
                                            onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                                            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                        />
                                    ))}
                                    <button type="submit">Save</button>
                                    <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
                                </form>
                            ) : (
                                <div>
                                    <strong>
                                        <Link to={`/comic/${comic._id}`}>{comic.title} #{comic.issue}</Link>
                                    </strong>
                                    <p>{comic.publisher} | {comic.year} | {comic.grade || 'No grade'}</p>
                                    {comic.notes && <p>Notes: {comic.notes}</p>}
                                    {comic.ebayAverage && (
                                        <p style={{ color: 'green' }}>eBay Avg: ${comic.ebayAverage.toFixed(2)}</p>
                                    )}
                                    <div>
                                        <button onClick={() => {
                                            setEditingId(comic._id);
                                            setEditForm({ ...comic });
                                        }}>Edit</button>
                                        <button onClick={async () => {
                                            const confirmed = window.confirm('Are you sure you want to delete this comic?');
                                            if (!confirmed) return;
                                            await fetch(`http://localhost:5000/api/comics/${comic._id}`, {
                                                method: 'DELETE',
                                                headers: { Authorization: `Bearer ${token}` },
                                            });
                                            setComics(comics.filter(c => c._id !== comic._id));
                                        }}>Delete</button>
                                        <button onClick={async () => {
                                            await fetch(`http://localhost:5000/api/comics/${comic._id}/markAsAcquired`, {
                                                method: 'PUT',
                                                headers: {
                                                    Authorization: `Bearer ${token}`,
                                                    'Content-Type': 'application/json',
                                                },
                                            });
                                            setComics(comics.filter(c => c._id !== comic._id));
                                        }}>✅ Mark as Acquired</button>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default WantList;
