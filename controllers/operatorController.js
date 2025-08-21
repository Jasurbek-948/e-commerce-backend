const Operator = require('../models/Operator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerOperator = async (req, res) => {
    const { fullName, email, username, password } = req.body;

    try {
        // Validate required fields
        if (!fullName || !username || !password) {
            return res.status(400).json({ message: 'FullName, username va parol talab qilinadi' });
        }

        // Check for existing operator
        let operator = await Operator.findOne({ $or: [{ email }, { username }] });
        if (operator) {
            return res.status(400).json({ message: 'Email yoki username allaqachon mavjud' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        operator = new Operator({
            fullName,
            email,
            username,
            password: hashedPassword,
        });

        await operator.save();

        const token = jwt.sign({ operatorId: operator._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({
            token,
            operatorId: operator._id,
            message: 'Operator muvaffaqiyatli ro‘yxatdan o‘tdi',
        });
    } catch (error) {
        console.error('Operator register xatosi:', error);
        res.status(500).json({ message: 'Server xatosi' });
    }
};

exports.loginOperator = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({ message: 'Username va parol talab qilinadi' });
        }

        const operator = await Operator.findOne({ username });
        if (!operator) return res.status(400).json({ message: 'Operator topilmadi' });

        const isMatch = await bcrypt.compare(password, operator.password);
        if (!isMatch) return res.status(400).json({ message: 'Parol noto‘g‘ri' });

        const token = jwt.sign({ operatorId: operator._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({
            token,
            operatorId: operator._id,
            message: 'Muvaffaqiyatli kirish',
        });
    } catch (error) {
        console.error('Operator login xatosi:', error);
        res.status(500).json({ message: 'Server xatosi' });
    }
};