const router = require('express').Router();
const { register, login } = require('../controllers/authController');
const { body } = require('express-validator');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const User = require('../models/User');
const bcrypt = require('bcrypt');

router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Invalid email'),
        body('password').isLength({ min: 6 }).withMessage('Password too short')
    ],
    register
);

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Invalid email'),
        body('password').exists().withMessage('Password required')
    ],
    login
);

router.get('/test-email', async (req, res) => {
    try {
        await sendEmail(
            'berrydb19@gmail.com',
            'Test Email from Comic Tracker',
            'This is a test email. If you got this, your email setup works!'
        );
        res.status(200).json({ message: 'Test email sent successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Email failed to send.', error: error.message });
    }
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(200).json({ message: 'If that email exists, a reset link was sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // 30 minutes
    await user.save();

    const resetURL = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `You requested a password reset. Click the link below to reset your password:\n\n${resetURL}`;

    try {
        await sendEmail(user.email, 'Password Reset Request', message);
        res.status(200).json({ message: 'Password reset email sent.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error sending email. Try again later.' });
    }
});

router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
});

router.post('/refresh-token', (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const newAccessToken = jwt.sign(
            { userId: decoded.userId },
            process.env.JWT_SECRET,
            { expiresIn: '30m' }
        );
        res.json({ token: newAccessToken });
    } catch {
        res.status(403).json({ message: 'Invalid refresh token' });
    }
});

module.exports = router;
