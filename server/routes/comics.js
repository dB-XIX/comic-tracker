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
router.put('/:id', verifyToken, async (req, res) => {
    const comic = await Comic.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        req.body,
        { new: true }
    );
    if (!comic) return res.status(404).json({ msg: 'Comic not found.' });
    res.json({ msg: 'Comic deleted.' });
});

// Delete a comic
router.delete('/:id', verifyToken, async (req, res) => {
    const comic = await Comic.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!comic) return res.status(404).json({ msg: 'Comic not found' });
    res.json({ msg: 'Comic deleted' });
});


module.exports = router;
