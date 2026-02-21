// src/controllers/authController.js
const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // 1️⃣ Access token (short-lived)
    const accessToken = jwt.sign(
        { sub: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" },
    );

    // 2️⃣ Refresh token (random, stored)
    const refreshTokenValue = crypto.randomBytes(64).toString("hex");

    const refreshToken = await prisma.refreshToken.create({
        data: {
            token: refreshTokenValue,
            userId: user.id,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
        },
    });

    res.cookie("refreshToken", refreshTokenValue, {
        httpOnly: true,
        secure: false, // 🔹 must be false for local HTTP dev
        sameSite: "lax", // 🔹 allows cross-origin dev requests
        path: "/auth", // ✅ must match logout & refresh
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    const refreshTokenCheck = req.cookies.refreshToken;
    // console.log({ refreshTokenCheck });

    res.json({
        accessToken,
    });
};

exports.refresh = async (req, res) => {
    // const { refreshToken } = req.body;
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required" });
    }

    const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
    });

    if (
        !storedToken ||
        storedToken.revoked ||
        storedToken.expiresAt < new Date()
    ) {
        return res
            .status(403)
            .json({ message: "Invalid refresh token", accessToken: null });
    }

    const newAccessToken = jwt.sign(
        { sub: storedToken.user.id, role: storedToken.user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" },
    );

    res.json({ accessToken: newAccessToken });
};

exports.logout = async (req, res) => {
    const refreshTokenValue = req.cookies.refreshToken;
    // console.log({ refreshTokenValue });

    if (!refreshTokenValue) {
        return res
            .status(400)
            .json({ message: "Refresh token cookie required" });
    }

    const revoked = await prisma.refreshToken.updateMany({
        where: {
            token: refreshTokenValue,
            userId: req.user.id,
            revoked: false,
        },
        data: { revoked: true },
    });

    if (!revoked.count) {
        return res
            .status(403)
            .json({ message: "Refresh token not valid or already revoked" });
    }

    res.clearCookie("refreshToken", { path: "/auth" });

    res.json({ message: "Logged out" });
};
