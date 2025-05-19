
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { findUserById,
    createUser,
    updateUserById,
    deleteUserById,
    closePrisma,
    findUserByEmail,
    updateUserProfileImage,} = require('./user.repository')

dotenv.config();


const createUserService = async (username, email, hashedPassword, firstName, lastName) => {

    try {

        const user = await createUser({username,email,password: hashedPassword, firstName, lastName});

        

        return user;
    } catch (error) {
        console.error('Detailed error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack trace:', error.stack);
    }

}

const loginUserService = async (email, password) => {
    try {
        const user = await findUserByEmail(email)

        if (!user) {
            throw new Error('Pengguna tidak ditemukan');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Password tidak valid');
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '10h' }
        );

        return { token, user };
    } catch (error) {
        throw new Error('Gagal login: ' + error.message);
    }
};

const editUserByIdService = async (id, user) => {
    const users = await updateUserById(id,user)
    return users;
}

const deleteOldProfileImage = async (id) => {
  const uploadDir = path.join(__dirname, '../../public/uploads/profile_images');
  
  const files = fs.readdirSync(uploadDir);

  files.forEach(file => {
    if (file.startsWith(`profile_${id}_`)) {
      const filePath = path.join(uploadDir, file);
      console.log('Deleting:', filePath); 
      fs.unlinkSync(filePath);
    }
  });
};

// Add this function to your existing service
const updateProfileImageService = async (id, imageFile) => {
    try {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(imageFile.mimetype)) {
            throw new Error('Only JPG, JPEG, and PNG images are allowed');
        }

        const user = await findUserById(id);

        if (user.imageProfile) {
             await deleteOldProfileImage(id);
      
    }

        // Generate unique filename
        const fileExt = imageFile.mimetype.split('/')[1];
        const filename = `profile_${id}_${Date.now()}.${fileExt}`;
        const filePath = `public/uploads/profile_images/${filename}`;

        // Move the file to upload directory
        await imageFile.mv(filePath);

        // Update user profile image in database
        const imageUrl = `${filename}`;
        const updatedUser = await updateUserProfileImage(id, imageUrl);

        return updatedUser;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createUserService,
    loginUserService,
    editUserByIdService,
updateProfileImageService,};
