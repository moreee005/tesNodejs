const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const findUserById = async (id) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
        });
        return user;
    } catch (error) {
        console.error('Error finding user by ID:', error.message);
    }
};

const findUserByEmail = async (email) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        return user;
    } catch (error) {
        console.error('Error finding user by ID:', error.message);
    }
};

const findUserByUsername = async (username) => {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
        });
        return user;
    } catch (error) {
        console.error('Error finding user by ID:', error.message);
    }
};

const createUser = async ({ username, email, password, firstName, lastName }) => {
    try {

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password,
                firstName,
                lastName
            },
        });
        return user;
    } catch (error) {
        console.error('Detailed error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack trace:', error.stack);
    }
};

const updateUserById = async (id, user) => {
    try {

        const updateUser = await prisma.user.update({
            where: { id },
            data: {
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
        return updateUser;
    } catch (error) {
        console.error('Error updating user:', error.message);
        throw new Error('Failed to update user');
    }
};

const updateUserProfileImage = async (userId, imagePath) => {
    return await prisma.user.update({
        where: { id: userId },
        data: { imageProfile: imagePath }
    });
};

const deleteUserById = async (id) => {
    try {
        const user = await prisma.user.delete({
            where: { id },
        });
        return user;
    } catch (error) {
        console.error('Error deleting user:', error);
    }
};

const closePrisma = async () => {
    await prisma.$disconnect();
};

module.exports = {
    findUserById,
    createUser,
    updateUserById,
    deleteUserById,
    closePrisma,
    findUserByEmail,
    updateUserProfileImage,
    findUserByUsername
};
