var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dotenv = require('dotenv');
const { verifyToken } = require('../auth/service'); // Mengimpor middleware verifyToken

dotenv.config();

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/api', (req, res) => {
    res.send('selamat datang');
});

// Route untuk mengambil data stock (memerlukan token yang valid)
router.get('/stock', verifyToken, async (req, res) => {
    try {
        const stock = await prisma.stock.findMany();  // Mengambil semua data stock
        res.send(stock);
    } catch (error) {
        console.error('Error detail:', error);
        res.status(500).send({
            error: 'Terjadi kesalahan saat mengambil data stock',
            message: error.message,
            stack: error.stack
        });
    }
});

// Route untuk mengambil data produk (tanpa autentikasi)
router.get('/product', async (req, res) => {
    try {
        const stock = await prisma.product.findMany();  // Mengambil semua data produk
        res.send(stock);
    } catch (error) {
        console.error('Error detail:', error);
        res.status(500).send({
            error: 'Terjadi kesalahan saat mengambil data produk',
            message: error.message,
            stack: error.stack
        });
    }
});

module.exports = router;
