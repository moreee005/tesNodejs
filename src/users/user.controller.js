var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); 
const { verifyToken } = require('../../auth/service');
const prisma = new PrismaClient();
const dotenv = require('dotenv'); 
const jwt = require('jsonwebtoken');
const { findUserById,
    createUser,
    updateUserById,
    deleteUserById,
    closePrisma,
    findUserByEmail,
findUserByUsername } = require('./user.repository')
const { createUserService, loginUserService, editUserByIdService, updateProfileImageService } = require('./user.service')
const path = require('path');
const fs = require('fs');



dotenv.config();

router.post('/register', async (req, res) => {
    const { username, email, password, firstName, lastName} = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);


    // Validasi input
    if (!username || !email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: 'All fields are required' });
    }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            status: 102,
            message: 'Format email tidak valid' 
        });
    }

    // Validasi panjang password
    if (password.length < 8) {
        return res.status(400).json({ 
            status: 103,
            message: 'Password harus minimal 8 karakter' 
        });
    }


    try {
        // Cek apakah email sudah terdaftar
        const existingUser = await findUserByEmail(email)

        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const existingUser1 = await findUserByUsername(username)

        if (existingUser1) {
            return res.status(400).json({ message: 'Username already exists' });
        }



        // Simpan user baru ke database
        const user = await createUserService(username, email, hashedPassword, firstName, lastName);
        const user_id = user.id;

        // Validasi input
        if (!user_id) {
            return res.status(400).json({ message: 'All fields are required' });
        }




        // Kirim respon berhasil
        res.status(201).json({ status:0 ,message: 'Registrasi berhasil silahkan', user});
    } catch (error) {
        console.error(error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Error registering user' });
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({status:102, message: 'Email dan password harus diisi', data:null });
    }

    try {
        const { token, user } = await loginUserService(email, password);

        res.status(200).json({status:0, message: 'Login berhasil',data: token});
    } catch (error) {
        console.error(error);
        res.status(500).json({status:103, message: error.message, data:null });
    }
});

router.put('/profile/update', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) throw new Error("User ID tidak valid");
        const user = req.body;

        const userRes = await editUserByIdService(userId,user);

        res.status(200).json({
  status: 0,
  message: 'Update Profile berhasil',
  data: {
    email: userRes.email,
    first_name: userRes.firstName, 
    last_name: userRes.lastName,    
    profile_image: userRes.imageProfile
  }
});
    }catch (error){
        res.status(400).send(error.message);
    }
})

const uploadDir = path.join(__dirname, '../../public/uploads/profile_images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Add this route after your other routes
router.put('/profile/image', verifyToken, async (req, res) => {
    try {
        const id = req.user.id;
        if (!id) throw new Error("User ID tidak valid");
        
        if (!req.files || !req.files.image) {
            return res.status(400).json({
                status: 102,
                message: 'No image file uploaded'
            });
        }

        const imageFile = req.files.image;
        const updatedUser = await updateProfileImageService(id, imageFile);

        res.status(200).json({
            status: 0,
            message: 'Profile image updated successfully',
            data: {
                email: updatedUser.email,
                first_name: updatedUser.firstName, 
                last_name: updatedUser.lastName, 
                profile_image: updatedUser.imageProfile
            }
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            status: 103,
            message: error.message
        });
    }
});

router.get('/profile', verifyToken, async (req, res) => {
    try{
        const id = req.user.id;

        const user = await findUserById(id);
        res.status(200).json({
            status: 0,
            message: 'Profile image updated successfully',
            data: {
                email: user.email,
                first_name: user.firstName, 
                last_name: user.lastName, 
                profile_image: user.imageProfile
            }
        });
    }catch(error){

        console.error(error);
        res.status(400).json({
            status: 103,
            message: error.message
        });
    }
});

module.exports = router;
