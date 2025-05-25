import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function ComicDetails() {
    const { id } = useParams();
    const [comic, setComic] = useState(null);
    const [ebayData, setEbayData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [toast, setToast] = useState('');


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
        const fetchEbayData = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/comics/${id}/ebay`);
                const data = await res.json();
                setEbayData(data);
            } catch (err) {
                console.error('Error fetching eBay data:', err);
            }
        };

        fetchComic();
        fetchEbayData();
    }, [id]);

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            setToast('');
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/comics/${id}/refreshEbayData`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();
            setComic(data.comic);
            setEbayData({
                average: data.comic.ebayAverage,
                sales: data.comic.ebaySales
            });
            setToast('✅ eBay data refreshed successfully!');
        } catch (err) {
            console.error('Error refreshing eBay data:', err);
            setToast('❌ Failed to refresh eBay data.');
        } finally {
            setRefreshing(false);
            setTimeout(() => setToast(''), 3000); // auto-hide after 3 seconds
        }
    };

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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                    <a
                        href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(`${comic.title} ${comic.issue}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            marginTop: '0.75rem',
                            color: '#007bff',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            fontSize: '1.05rem',
                        }}
                    >
                        🔎 Search this comic on eBay →
                    </a>
                </div>
                <div className="comic-details">
                    <h2>{comic.title} #{comic.issue}</h2>
                    <p><strong>Series:</strong> {comic.seriesTitle}</p>
                    <p><strong>Publisher:</strong> {comic.publisher}</p>
                    <p><strong>Year:</strong> {comic.year}</p>
                    <p><strong>Grade:</strong> {comic.grade}</p>
                    <p><strong>Notes:</strong> {comic.notes}</p>
                </div>              
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h3>eBay Sales Average</h3>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#228B22' }}>
                    {ebayData ? `$${ebayData.average.toFixed(2)}` : 'Loading...'}
                </p>
                <button
                    onClick={handleRefresh}
                    style={{
                        marginTop: '0.5rem',
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.9rem',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    🔄 Refresh eBay Data
                </button>
                {refreshing && <p style={{ color: '#888' }}>Refreshing eBay data...</p>}
                {toast && (
                    <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#f0f0f0',
                        borderLeft: toast.startsWith('✅') ? '4px solid green' : '4px solid red',
                        borderRadius: '4px',
                        color: '#333',
                    }}>
                        {toast}
                    </div>
                )}

                {ebayData?.sales?.length > 0 && (
                    <div style={{ marginTop: '2rem' }}>
                        <h3>Sales Trends</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={ebayData.sales}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString()}
                                />
                                <YAxis domain={['auto', 'auto']} />
                                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                <Line
                                    type="monotone"
                                    dataKey="price"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                    dot
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ComicDetails;
