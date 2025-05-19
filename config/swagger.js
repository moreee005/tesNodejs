const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'API Saya',
    description: 'Dokumentasi API',
    version: '1.0.0'
  },
  host: 'localhost:3001',
  basePath: '/',
  schemes: ['http'],
  securityDefinitions: {
    // Anda bisa menambahkan konfigurasi keamanan di sini jika diperlukan
  },
  definitions: {
    // Definisi model data bisa ditambahkan di sini
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./app.js']; // Ganti dengan file utama aplikasi Anda

// Menghasilkan file swagger-output.json
swaggerAutogen(outputFile, endpointsFiles, doc);