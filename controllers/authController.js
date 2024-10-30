const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;


const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    console.log(`Menerima permintaan registrasi: name=${name}, email=${email}`);

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            console.log(`Email ${email} sudah terdaftar, Silahkan daftarkan email lain!`);
            return res.status(409).json({ message: 'Email sudah terdaftar, Silahkan daftarkan email lain!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        console.log(`Pengguna ini terdaftar pada ID: ${user.id}`);
        res.status(201).json({ message: 'Pengguna berhasil terdaftar', user });
    } catch (error) {
        console.error('Error saat registrasi:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat mendaftar pengguna', details: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(`Menerima permintaan login: email=${email}`);

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.log('Pengguna ini tidak ditemukan');
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password salah');
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log(`Login berhasil untuk ID pengguna: ${user.id}`);
        res.status(200).json({ message: 'Login berhasil', token });
    } catch (error) {
        console.error('Error saat login:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat login', details: error.message });
    }
};

const authenticateUser = (req, res) => {
    if (req.user) {
        console.log(`Pengguna terautentikasi: ${req.user.email}`);
        return res.status(200).json({ message: 'Autentikasi berhasil Bos', user: req.user });
    } else {
        return res.status(401).json({ message: 'Autentikasi gagal' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    authenticateUser,
};