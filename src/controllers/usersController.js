const prisma = require("../lib/prisma.js");
const bcrypt = require("bcryptjs");

const registerUser = async (req, res) => {
    // check that name, email and password exists in req.body
    if (!req.body.name && !req.body.email && !req.body.password) {
        return res
            .status(400)
            .json({ error: "Name, email, and password are required" });
    }

    // check that email is unique
    const checkUser = await prisma.user.findUnique({
        where: {
            email: req.body.email,
        },
    });

    if (checkUser) {
        return res.status(400).json({ error: "Email already in use" });
    }

    // save new user to database
    const newUser = await prisma.user.create({
        data: {
            name: req.body.name,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, 10),
        },
    });

    // console.log("Registering user with data:", newUser);
    res.json({
        message: "User registered successfully",
        userData: newUser,
    });
};

const editUser = (req, res) => {
    const userId = req.params.userId;
    // console.log(`Editing user ${userId} with data:`, req.body);
    res.json({
        message: `User ${userId} can not be edited for now`,
    });
};

const getUserProfile = async (req, res) => {
    const userId = req.params.userId;
    // console.log(`Fetching profile for user ${userId}`);
    const this_user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!this_user) {
        return res.status(404).json({ error: "User not found" });
    }
    res.json({
        message: `Profile data for user ${userId}`,
        userData: this_user,
    });
};

const allUsers = async (req, res) => {
    const all_users = await prisma.user.findMany();
    res.json({
        message: "All users fetched successfully",
        users: all_users,
    });
};

const deleteUser = async (req, res) => {
    const userId = req.params.userId;

    // check that user exist
    const checkUser = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!checkUser) {
        return res.status(404).json({ error: "User not found" });
    }
    const delete_user = await prisma.user.delete({
        where: {
            id: userId,
        },
    });

    // console.log(`User ${userId} deleted:`, delete_user);
    res.json({
        message: `User ${userId} deleted successfully`,
    });
};

const getUser = async (req, res) => {
    const user = req.user;
    if (user) {
        return res.json(user);
    } else {
        return res.json(null);
    }
};

module.exports = {
    registerUser,
    editUser,
    getUserProfile,
    deleteUser,
    allUsers,
    getUser,
};
