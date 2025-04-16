const router = require('express').Router();
const Comic = require('../models/Comic');
const verifyToken = require('../middleware/verifyToken');
const fetchEbaySalesMock = require('../utils/fetchEbaySalesMock');


// GET all comics for logged-in user
router.get('/', verifyToken, async (req, res) => {
    const comics = await Comic.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(comics);
});

// POST a new comic
router.post('/', verifyToken, async (req, res) => {
    const newComic = new Comic({ ...req.body, userId: req.userId });
    const savedComic = await newComic.save();
    res.status(201).json(savedComic);
});

// PUT update a comic
router.put('/:id', async (req, res) => {
    try {
        const updatedComic = await Comic.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    title: req.body.title,
                    seriesTitle: req.body.seriesTitle,
                    issue: req.body.issue,
                    year: req.body.year,
                    publisher: req.body.publisher,
                    grade: req.body.grade,
                    notes: req.body.notes,
                    image: req.body.image,
                },
            },
            { new: true }
        );
        res.json(updatedComic);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update comic' });
    }
});


// Delete a comic
router.delete('/:id', verifyToken, async (req, res) => {
    const comic = await Comic.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!comic) return res.status(404).json({ msg: 'Comic not found' });
    res.json({ msg: 'Comic deleted' });
});

// GET /api/comics/:id - Get a single comic by ID
router.get('/:id', async (req, res) => {
    try {
        const comic = await Comic.findById(req.params.id);
        if (!comic) {
            return res.status(404).json({ message: 'Comic not found' });
        }
        res.json(comic);
    } catch (err) {
        console.error('Error fetching comic by ID:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/comics/:id/ebay - mock eBay data for now
router.get('/:id/ebay', async (req, res) => {
    try {
        const { id } = req.params;

        // Mock: generate fake sales from the past 30 days
        const sales = Array.from({ length: 15 }, () => {
            const price = (Math.random() * 40 + 10).toFixed(2); // $10 - $50
            const date = new Date(Date.now() - Math.random() * 30 * 86400000); // past 30 days
            return { price: parseFloat(price), date };
        }).sort((a, b) => new Date(a.date) - new Date(b.date));

        const avg = (
            sales.reduce((acc, s) => acc + s.price, 0) / sales.length
        ).toFixed(2);

        res.json({
            average: parseFloat(avg),
            sales,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error generating mock eBay data' });
    }
});

// Checks if it's been over 24 hours, fetches fresh data, updates the comic document
router.put('/:id/refreshEbayData', verifyToken, async (req, res) => {
    try {
        const comic = await Comic.findOne({ _id: req.params.id, userId: req.userId });
        if (!comic) return res.status(404).json({ message: 'Comic not found' });

        const now = new Date();
        const lastUpdate = comic.lastEbayUpdate || new Date(0);
        const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);

        if (hoursSinceUpdate < 24) {
            return res.status(200).json({ message: 'eBay data is still fresh', comic });
        }

        const sales = fetchEbaySalesMock(comic.title, comic.issue);
        const avg = +(sales.reduce((sum, s) => sum + s.price, 0) / sales.length).toFixed(2);

        comic.ebaySales = sales;
        comic.ebayAverage = avg;
        comic.lastEbayUpdate = now;
        await comic.save();

        res.json({ message: 'eBay data refreshed', comic });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error refreshing eBay data' });
    }
});

// PUT /api/comics/:id/markAsAcquired - move comic from want list to collection
router.put('/:id/markAsAcquired', verifyToken, async (req, res) => {
    try {
        const comic = await Comic.findOne({ _id: req.params.id, userId: req.userId });
        if (!comic) return res.status(404).json({ message: 'Comic not found' });

        comic.wantList = false;
        await comic.save();

        res.json({ message: 'Comic marked as acquired', comic });
    } catch (err) {
        console.error('Error marking comic as acquired:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
