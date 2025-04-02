import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

function Dashboard() {
    const [comics, setComics] = useState([]);
    const [tokenValid, setTokenValid] = useState(true);
    const token = localStorage.getItem('token');

    const [title, setTitle] = useState('');
    const [issue, setIssue] = useState('');
    const [publisher, setPublisher] = useState('');
    const [grade, setGrade] = useState('');
    const [notes, setNotes] = useState('');
    const [image, setImage] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        issue: '',
        publisher: '',
        grade: '',
        notes: '',
        image: ''
    });

    const [selectedImage, setSelectedImage] = useState(null);

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
        } catch (err) {
            console.error('Invalid token:', err);
            localStorage.removeItem('token');
            setTokenValid(false);
        }
    }, [token]);

    useEffect(() => {
        if (!tokenValid || !token) return;

        const fetchComics = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/comics', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                setComics(data);
            } catch (err) {
                console.error('Error fetching comics:', err);
            }
        };

        fetchComics();
    }, [token, tokenValid]);

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
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                setComics(comics.filter(comic => comic._id !== id));
            } else {
                console.error('Delete failed');
            }
        } catch (err) {
            console.error('Error deleting comic:', err);
        }
    };

    const handleEditSubmit = async (e, comicId) => {
        e.preventDefault();

        await fetch(`http://localhost:5000/api/comics/${comicId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(editForm),
        });

        // Apply the updated fields locally without waiting for response
        setComics(comics.map(c =>
            c._id === comicId ? { ...c, ...editForm } : c
        ));
        setEditingId(null);
    };

    if (!tokenValid) {
        return <h2>Access denied. Please log in again.</h2>;
    }

    return (
        <div>
            <h2>Comic Book Tracker Dashboard</h2>
            <button onClick={handleLogout}>Logout</button>

            <h3>Add a Comic:</h3>
            <form
                onSubmit={async (e) => {
                    e.preventDefault();

                    const formData = { title, issue, publisher, grade, notes, image };

                    const res = await fetch('http://localhost:5000/api/comics', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(formData),
                    });

                    const newComic = await res.json();
                    setComics([newComic, ...comics]);

                    setTitle('');
                    setIssue('');
                    setPublisher('');
                    setGrade('');
                    setNotes('');
                    setImage('');
                }}
            >
                <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <input type="text" placeholder="Issue" value={issue} onChange={(e) => setIssue(e.target.value)} />
                <input type="text" placeholder="Publisher" value={publisher} onChange={(e) => setPublisher(e.target.value)} />
                <input type="text" placeholder="Grade" value={grade} onChange={(e) => setGrade(e.target.value)} />
                <input type="text" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                <input type="text" placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} />
                <button type="submit">Add Comic</button>
            </form>

            <h3>Your Comics:</h3>
            {comics.length === 0 ? (
                <p>No comics found.</p>
            ) : (
                <ul style={{ padding: 0 }}>
                    {comics.map((comic) => (
                        <li
                            key={comic._id}
                            style={{
                                listStyleType: 'disc',
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '1rem'
                            }}
                        >
                            {comic.image && (
                                <img
                                    src={comic.image}
                                    alt={comic.title}
                                    style={{ width: '60px', height: 'auto', marginRight: '1rem', cursor: 'pointer' }}
                                    onClick={() => setSelectedImage(comic.image)}
                                />
                            )}

                            {editingId === comic._id ? (
                                <form onSubmit={(e) => handleEditSubmit(e, comic._id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="Title" />
                                    <input type="text" value={editForm.issue} onChange={(e) => setEditForm({ ...editForm, issue: e.target.value })} placeholder="Issue" />
                                    <input type="text" value={editForm.publisher} onChange={(e) => setEditForm({ ...editForm, publisher: e.target.value })} placeholder="Publisher" />
                                    <input type="text" value={editForm.grade} onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })} placeholder="Grade" />
                                    <input type="text" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} placeholder="Notes" />
                                    <input type="text" value={editForm.image} onChange={(e) => setEditForm({ ...editForm, image: e.target.value })} placeholder="Image URL" />
                                    <div>
                                        <button type="submit">Save</button>
                                        <button type="button" onClick={() => setEditingId(null)} style={{ marginLeft: '0.5rem' }}>Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <div style={{ flex: 1 }}>
                                    <span style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                        <strong>{comic.title || 'Untitled'}</strong> #{comic.issue || '?'} | {comic.publisher || 'Unknown'}
                                        {comic.grade && <> | Grade: {comic.grade}</>}
                                        {comic.notes && <> | Notes: {comic.notes}</>}
                                    </span>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <button onClick={() => {
                                            setEditingId(comic._id);
                                            setEditForm({
                                                title: comic.title || '',
                                                issue: comic.issue || '',
                                                publisher: comic.publisher || '',
                                                grade: comic.grade || '',
                                                notes: comic.notes || '',
                                                image: comic.image || ''
                                            });
                                        }}>Edit</button>
                                        <button onClick={() => handleDelete(comic._id)} style={{ marginLeft: '0.5rem' }}>Delete</button>
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
                        zIndex: 1000
                    }}
                >
                    <img
                        src={selectedImage}
                        alt="Enlarged"
                        style={{ maxHeight: '90%', maxWidth: '90%', borderRadius: '8px' }}
                    />
                </div>
            )}
        </div>
    );
}

export default Dashboard;
