import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function ComicDetails() {
    const { id } = useParams();
    const [comic, setComic] = useState(null);

    useEffect(() => {
        const fetchComic = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:5000/api/comics/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setComic(data);
            } catch (err) {
                console.error('Error fetching comic:', err);
            }
        };
        fetchComic();
    }, [id]);

    if (!comic) return <p style={{ padding: '2rem' }}>Loading comic...</p>;

    return (
        <div style={{
            padding: '2rem',
            maxWidth: '800px',
            margin: '0 auto',
            fontFamily: 'Arial, sans-serif',
            color: '#222'
        }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: '#007bff' }}>
                ← Back to Dashboard
            </Link>

            <div style={{
                display: 'flex',
                gap: '2rem',
                marginTop: '2rem',
                flexWrap: 'wrap'
            }}>
                <img
                    src={comic.image}
                    alt={comic.title}
                    style={{
                        width: '300px',
                        height: 'auto',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                />

                <div style={{ flex: 1 }}>
                    <h2 style={{ marginBottom: '0.5rem' }}>
                        {comic.title} #{comic.issue}
                    </h2>
                    <p><strong>Series:</strong> {comic.seriesTitle}</p>
                    <p><strong>Publisher:</strong> {comic.publisher}</p>
                    <p><strong>Year:</strong> {comic.year}</p>
                    <p><strong>Grade:</strong> {comic.grade}</p>
                    <p><strong>Notes:</strong> {comic.notes}</p>
                </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h3>eBay Sales Average</h3>
                <p style={{ fontSize: '1.1rem' }}>[Coming Soon]</p>

                <h3 style={{ marginTop: '2rem' }}>Sales Trends</h3>
                <p style={{ fontSize: '1.1rem' }}>[Chart Coming Soon]</p>
            </div>
        </div>
    );
}

export default ComicDetails;
