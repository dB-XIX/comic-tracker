import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import './Dashboard.css';

function Dashboard() {
    // State variables
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [comics, setComics] = useState([]);
    const [tokenValid, setTokenValid] = useState(true);
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
    const [sortField, setSortField] = useState('title');
    const [searchQuery, setSearchQuery] = useState('');
    const [ebayData, setEbayData] = useState({});

    const token = localStorage.getItem('token');

    // Apply theme and store it in localStorage
    useEffect(() => {
        document.body.className = theme === 'dark' ? 'dark-theme' : '';
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Validate token
    useEffect(() => {
        if (!token) return setTokenValid(false);
        try {
            const decoded = jwtDecode(token);
            if (decoded.exp < Date.now() / 1000) {
                localStorage.removeItem('token');
                setTokenValid(false);
            }
        } catch {
            localStorage.removeItem('token');
            setTokenValid(false);
        }
    }, [token]);

    // Fetch comics that are not on the want list
    useEffect(() => {
        if (!tokenValid || !token) return;
        const fetchComics = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/comics', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setComics(data.filter(c => !c.wantList));
            } catch (err) {
                console.error('Error fetching comics:', err);
            }
        };
        fetchComics();
    }, [token, tokenValid]);

    // Fetch eBay data for each comic
    useEffect(() => {
        const fetchEbayData = async () => {
            const data = {};
            for (const comic of comics) {
                try {
                    const res = await fetch(`http://localhost:5000/api/comics/${comic._id}/ebay`);
                    const json = await res.json();
                    data[comic._id] = json;
                } catch (err) {
                    console.error(`Error fetching eBay data for comic ${comic._id}`, err);
                }
            }
            setEbayData(data);
        };
        if (comics.length > 0) {
            fetchEbayData();
        }
    }, [comics]);

    // Helper: Capitalize each word in a string
    const capitalizeWords = (str) =>
        str
            .toLowerCase()
            .replace(/\b\w/g, (l) => l.toUpperCase())
            .replace('Dc', 'DC')
            .replace('Dc Comics', 'DC')
            .replace('Detective Comics', 'DC');

    // Logout handler
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    // Delete handler
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

    // Edit submit handler
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

    // Determine if a comic is slabbed
    const isSlabbed = (comic) => {
        const gradeNum = parseFloat(comic.grade);
        const notes = comic.notes?.toLowerCase() || '';
        return !isNaN(gradeNum) || /cgc|cbcs|pgx/i.test(notes);
    };

    // Get unique titles and publishers
    const getAllTitles = () =>
        Array.from(new Set(comics.map((c) => c.title).filter(Boolean))).sort();
    const getAllPublishers = () =>
        Array.from(new Set(comics.map((c) => capitalizeWords(c.publisher)).filter(Boolean))).sort();

    // Filter and sort comics based on user inputs
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
            if (sortField === 'ebayAverage') {
                const avgA = ebayData[a._id]?.average || 0;
                const avgB = ebayData[b._id]?.average || 0;
                return sortDirection === 'az' ? avgA - avgB : avgB - avgA;
            }
            if (sortField === 'date') {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return sortDirection === 'az' ? dateB - dateA : dateA - dateB;
            }
            if (sortField === 'grade') {
                const gradeA = (a.grade || '').toUpperCase();
                const gradeB = (b.grade || '').toUpperCase();
                return sortDirection === 'az'
                    ? gradeA.localeCompare(gradeB)
                    : gradeB.localeCompare(gradeA);
            }
            return 0;
        });

    // Export comics as JSON or CSV
    const handleExport = (type) => {
        const exportData = comics.map((comic) => {
            const {
                title,
                seriesTitle,
                issue,
                year,
                publisher,
                grade,
                notes,
                image,
                ebayAverage,
                ebaySales,
                lastEbayUpdate,
                wantList,
                createdAt,
                updatedAt,
            } = comic;
            return {
                title,
                seriesTitle,
                issue,
                year,
                publisher,
                grade,
                notes,
                image,
                ebayAverage,
                ebaySales,
                lastEbayUpdate,
                wantList,
                createdAt,
                updatedAt,
            };
        });

        if (type === 'json') {
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            downloadFile(url, 'comic_collection.json');
        } else if (type === 'csv') {
            const headers = Object.keys(exportData[0]).join(',');
            const rows = exportData.map((c) =>
                Object.values(c)
                    .map((val) => `"${String(val).replace(/"/g, '""')}"`)
                    .join(',')
            );
            const csv = [headers, ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            downloadFile(url, 'comic_collection.csv');
        }
    };

    // Utility to download file
    const downloadFile = (url, filename) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const totalValue = comics.reduce((sum, comic) => {
        const avg = parseFloat(ebayData[comic._id]?.average);
        return sum + (isNaN(avg) ? 0 : avg);
    }, 0);

    if (!tokenValid) return <h2>Access denied. Please log in again.</h2>;

    return (
        <div className="dashboard">
            <nav className="navbar">
                <div className="nav-actions">
                    <button
                        className="theme-toggle"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </nav>

            <section className="form-section">
                <h3>Add a Comic</h3>
                <form
                    className="add-comic-form"
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
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title"
                    />
                    <input
                        type="text"
                        value={seriesTitle}
                        onChange={(e) => setSeriesTitle(e.target.value)}
                        placeholder="Series Title"
                    />
                    <input
                        type="text"
                        value={issue}
                        onChange={(e) => setIssue(e.target.value)}
                        placeholder="Issue"
                    />
                    <input
                        type="text"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="Year"
                    />
                    <input
                        type="text"
                        value={publisher}
                        onChange={(e) => setPublisher(e.target.value)}
                        placeholder="Publisher"
                    />
                    <input
                        type="text"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        placeholder="Grade"
                    />
                    <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Notes"
                    />
                    <input
                        type="text"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="Image URL"
                    />
                    <button type="submit">Add Comic</button>
                </form>
            </section>

            <section className="search-section">
                <input
                    type="text"
                    placeholder="Search comics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </section>

            <section className="filters-section">
                <div className="filter-group">
                    <label>Titles</label>
                    <select
                        multiple
                        value={filterTitles}
                        onChange={(e) =>
                            setFilterTitles(Array.from(e.target.selectedOptions, (opt) => opt.value))
                        }
                    >
                        <option value="All">All Titles</option>
                        {getAllTitles().map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Publishers</label>
                    <select
                        multiple
                        value={filterPublishers}
                        onChange={(e) =>
                            setFilterPublishers(Array.from(e.target.selectedOptions, (opt) => opt.value))
                        }
                    >
                        {getAllPublishers().map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Format</label>
                    <select value={filterSlabbed} onChange={(e) => setFilterSlabbed(e.target.value)}>
                        <option value="any">All</option>
                        <option value="slabbed">Slabbed</option>
                        <option value="raw">Raw</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Sort By</label>
                    <select value={sortField} onChange={(e) => setSortField(e.target.value)}>
                        <option value="title">Title</option>
                        <option value="ebayAverage">eBay Average</option>
                        <option value="date">Date Added</option>
                        <option value="grade">Grade</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Direction</label>
                    <select value={sortDirection} onChange={(e) => setSortDirection(e.target.value)}>
                        <option value="az">Ascending</option>
                        <option value="za">Descending</option>
                    </select>
                </div>
            </section>

            <section className="export-section">
                <button onClick={() => handleExport('json')}>Export JSON</button>
                <button onClick={() => handleExport('csv')}>Export CSV</button>
            </section>

            <h3 className="total-value">
                💰 Estimated Total Value: ${totalValue.toFixed(2)}
            </h3>

            <section className="comic-list">
                {filteredComics.length === 0 ? (
                    <p className="no-results">No comics found.</p>
                ) : (
                    <ul className="comic-grid">
                        {filteredComics.map((comic) => (
                            <li key={comic._id} className="comic-card">
                                {comic.image && (
                                    <Link to={`/comic/${comic._id}`}>
                                        <img
                                            src={comic.image}
                                            alt={comic.title}
                                            className="comic-thumbnail"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSelectedImage(comic.image);
                                            }}
                                        />
                                    </Link>
                                )}
                                {editingId === comic._id ? (
                                    <form onSubmit={(e) => handleEditSubmit(e, comic._id)} className="edit-form">
                                        <input
                                            value={editForm.title || ''}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            placeholder="Title"
                                        />
                                        <input
                                            value={editForm.seriesTitle || ''}
                                            onChange={(e) => setEditForm({ ...editForm, seriesTitle: e.target.value })}
                                            placeholder="Series Title"
                                        />
                                        <input
                                            value={editForm.issue || ''}
                                            onChange={(e) => setEditForm({ ...editForm, issue: e.target.value })}
                                            placeholder="Issue"
                                        />
                                        <input
                                            value={editForm.year || ''}
                                            onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                                            placeholder="Year"
                                        />
                                        <input
                                            value={editForm.publisher || ''}
                                            onChange={(e) => setEditForm({ ...editForm, publisher: e.target.value })}
                                            placeholder="Publisher"
                                        />
                                        <input
                                            value={editForm.grade || ''}
                                            onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                                            placeholder="Grade"
                                        />
                                        <input
                                            value={editForm.notes || ''}
                                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                            placeholder="Notes"
                                        />
                                        <input
                                            value={editForm.image || ''}
                                            onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                                            placeholder="Image URL"
                                        />
                                        <div className="edit-buttons">
                                            <button type="submit">Save</button>
                                            <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="comic-info">
                                        <Link to={`/comic/${comic._id}`}>
                                            <h4>{comic.title} #{comic.issue}</h4>
                                        </Link>
                                        <p>
                                            {comic.seriesTitle} | {comic.publisher} | {comic.year} | {isSlabbed(comic) ? 'Slabbed' : 'Raw'}
                                            {comic.grade && <> | Grade: {comic.grade}</>}
                                            {comic.notes && <> | Notes: {comic.notes}</>}
                                        </p>
                                        {ebayData[comic._id] && (
                                            <div className="ebay-value">
                                                eBay Avg: ${ebayData[comic._id].average.toFixed(2)}
                                            </div>
                                        )}
                                        <div className="comic-actions">
                                            <button
                                                onClick={() => {
                                                    setEditingId(comic._id);
                                                    setEditForm({ ...comic });
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(comic._id)} className="delete-btn">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {selectedImage && (
                <div className="image-modal" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} alt="Full Size Comic" />
                </div>
            )}
        </div>
    );
}

export default Dashboard;
