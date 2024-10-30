const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// Fungsi untuk autentikasi
exports.authenticate = (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token tidak ditemukan' });
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("Error verifikasi token: ", err);
            return res.status(401).json({ message: 'Token tidak valid' });
        }

        res.json({ message: 'Autentikasi berhasil', userId: decoded.userId });
    });
};

// Menambahkan User dan Profil
exports.createUser = async (req, res) => {
    const { name, email, password, bio } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({ message: 'Email sudah terdaftar, silakan gunakan email lain!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                profile: {
                    create: { bio },
                },
            },
        });
        res.status(201).json(user);
    } catch (error) {
        console.error("Error saat menambahkan user:", error);
        res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan pengguna' });
    }
};

// Menampilkan Semua User
exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: { profile: true },
        });
        res.status(200).json(users);
    } catch (error) {
        console.error("Error saat mendapatkan semua pengguna:", error);
        res.status(500).json({ message: 'Terjadi kesalahan' });
    }
};

// Menampilkan User Berdasarkan ID
exports.getUserById = async (req, res) => {
    const { userId } = req.params;

    if (isNaN(userId) || Number(userId) <= 0) {
        return res.status(400).json({ message: 'Silakan periksa ID pengguna dengan benar' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            include: { profile: true },
        });

        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan!' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error saat mendapatkan pengguna berdasarkan ID:", error);
        res.status(500).json({ message: 'Terjadi kesalahan saat mendapatkan pengguna. Silakan coba lagi.' });
    }
};

// Memperbarui data pengguna
exports.updateUser = async (req, res) => {
    const { userId } = req.params;

    if (isNaN(userId) || Number(userId) <= 0) {
        return res.status(400).json({ message: 'Silakan periksa ID pengguna dengan benar' });
    }

    const { name, email, password, bio } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Nama dan email wajib diisi' });
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { id: Number(userId) },
            include: { profile: true },
        });

        if (!existingUser) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan!' });
        }

        const dataToUpdate = {
            name,
            email,
        };

        if (bio !== undefined) {
            dataToUpdate.profile = {
                update: {
                    bio: bio !== null ? bio : existingUser.profile.bio, // jika bio null, tetap menggunakan bio yang lama
                },
            };
        }

        if (password) {
            dataToUpdate.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id: Number(userId) },
            data: dataToUpdate,
            include: { profile: true },
        });

        res.status(200).json({ message: 'User dan profil berhasil diperbarui', user });
    } catch (error) {
        console.error("Error saat memperbarui pengguna:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan!' });
        }
        res.status(500).json({ message: 'Gagal memperbarui User dan profil', details: error.message });
    }
};


// Menghapus User dan Profil
exports.deleteUser = async (req, res) => {
    const { userId } = req.params;

    if (isNaN(userId)) {
        return res.status(400).json({ message: 'Silakan periksa ID pengguna dengan benar' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            include: { profile: true },
        });

        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan!' });
        }

        if (user.profile) {
            await prisma.profile.delete({
                where: { id: user.profile.id }
            });
        }

        await prisma.user.delete({
            where: { id: Number(userId) },
        });

        res.status(200).json({ message: 'User dan profil berhasil dihapus', user });
    } catch (error) {
        console.error("Error saat menghapus pengguna:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan!' });
        }
        res.status(500).json({ message: 'Gagal menghapus User dan profil', details: error.message });
    }
};
