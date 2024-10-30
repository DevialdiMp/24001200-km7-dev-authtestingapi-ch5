const express = require('express');
const router = express.Router();
const { registerUser, loginUser, authenticateUser } = require('../controllers/authController');
const restrict = require('../middleware/restrict');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Manajemen autentikasi
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Mendaftar pengguna baru
 *     description: Endpoint ini memungkinkan pengguna untuk mendaftar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Devialdi Maisa Putra
 *               email:
 *                 type: string
 *                 example: devialdimaisaputra@mail.com
 *               password:
 *                 type: string
 *                 example: qwerty
 *     responses:
 *       201:
 *         description: Pengguna berhasil terdaftar
 *       400:
 *         description: Permintaan tidak valid
 *       409:
 *         description: Email sudah digunakan
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Masuk sebagai pengguna
 *     description: Endpoint ini memungkinkan pengguna untuk masuk ke akun mereka.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: devialdimaisaputra@mail.com
 *               password:
 *                 type: string
 *                 example: qwerty
 *     responses:
 *       200:
 *         description: Pengguna berhasil masuk
 *       401:
 *         description: Pengguna tidak ditemukan atau kredensial tidak valid
 */

/**
 * @swagger
 * /api/auth/authenticate:
 *   get:
 *     tags: [Auth]
 *     summary: Mengautentikasi pengguna
 *     description: Endpoint ini memeriksa apakah pengguna terautentikasi.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pengguna terautentikasi
 *       401:
 *         description: Tidak terotorisasi
 *       403:
 *         description: Akses ditolak. Token hilang atau tidak valid.
 */

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/authenticate', restrict, authenticateUser);

module.exports = router;
