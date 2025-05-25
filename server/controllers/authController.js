const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const sanitize = require('mongo-sanitize');

exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ msg: 'Invalid input' });

    const email = sanitize(req.body.email);
    const password = sanitize(req.body.password);

    try {
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ msg: 'Registration failed' });

        const hashed = await bcrypt.hash(password, 10);
        await User.create({ email, password: hashed });

        res.status(201).json({ msg: 'Registered successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30m',
    });

    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d',
    });

    res
        .cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, // set to true in production with HTTPS
            sameSite: 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
        .json({ token: accessToken });
};
