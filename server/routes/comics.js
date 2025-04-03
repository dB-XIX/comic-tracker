const router = require('express').Router();
const Comic = require('../models/Comic');
const verifyToken = require('../middleware/verifyToken');

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

module.exports = router;
