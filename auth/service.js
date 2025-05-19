const jwt = require('jsonwebtoken'); // Import jsonwebtoken untuk memverifikasi token
const dotenv = require('dotenv'); // Pastikan dotenv diimpor
dotenv.config();

const verifyToken = (req, res, next) => {
    // Ambil token dengan memisahkan 'Bearer ' dari token itu sendiri
    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access Denied, Token Missing' }); // Jika tidak ada token
    }

    try {
        // Verifikasi token dengan secret
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;  // Menyimpan informasi user di req.user
        next();  // Lanjutkan ke route berikutnya
    } catch (error) {
        return res.status(400).json({ message: 'Invalid Token' });  // Jika token tidak valid
    }
};


module.exports = { verifyToken };  // Mengekspor verifyToken untuk digunakan di file lain
