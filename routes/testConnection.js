// testConnection.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
    try {
        await prisma.$connect();  // Coba melakukan koneksi ke database
        console.log('Koneksi ke database berhasil!');
    } catch (error) {
        console.error('Gagal terhubung ke database:', error);
    } finally {
        await prisma.$disconnect();  // Pastikan koneksi ditutup setelah pengujian
    }
}

testConnection();
