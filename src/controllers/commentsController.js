const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
// const { request } = require("../routes/posts");

//src/controllers/commentsController.js
const createComment = async (req, res) => {
    // anyone can create a comment but they must leave a author-name and author-email.
    const { authorName, authorEmail, content } = req.body;
    const postId = req.params.postId;
    // Check if post exist in the database.
    if (!req.params.postId) {
        return res.status(400).json({ message: "Post Id not found." });
    }

    const checkPost = await prisma.post.findUnique({
        where: {
            id: req.params.postId,
        },
    });

    if (!checkPost) {
        return res.status(400).json({
            error: "Post does not exist, Wrong Post Id sent from client.",
        });
    }
    // Check if content is not blank
    if (!content) {
        return res.status(400).json({ message: "Content can not be blank" });
    }

    //Bearer Token
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    // if (token === null) {
    //     return res.json({ message: "No user is logged in" });
    // }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        req.user = user;
        // return res.json(req.user);
    });

    if (!req.user) {
        if (!authorName && !authorEmail) {
            return res.status(400).json({
                message:
                    "Please provide either author name or author email or sign in as a user",
            });
        }
        try {
            const newComment = await prisma.comment.create({
                data: {
                    content: content,
                    authorName: authorName || null,
                    authorEmail: authorEmail || null,
                    postId: req.params.postId,
                },
            });

            // console.log("New Comment Created: ", newComment);
            return res.status(201).json({ "New comment": newComment });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                error: "Something is wrong - from the database side.",
            });
        }
    } else {
        const checkUser = await prisma.user.findUnique({
            where: {
                id: req.user.sub,
            },
        });
        if (!checkUser)
            return res
                .status(404)
                .json({ error: "user not found - incorrect user credentials" });
        try {
            const newComment = await prisma.comment.create({
                data: {
                    content: content,
                    userId: req.user.sub,
                    postId: req.params.postId,
                },
            });

            // console.log("New Comment Created: ", newComment);
            return res.status(201).json({ "New comment": newComment });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                error: "Something is wrong - from the database side.",
            });
        }
    }

    //postId
};

const editComment = async (req, res) => {
    // check if comment exist
    const { content } = req.body;
    const { commentId } = req.params;
    if (!commentId) {
        return res.status(400).json({ message: "Comment Id not available." });
    }
    const checkComment = await prisma.comment.findUnique({
        where: {
            id: commentId,
        },
    });
    if (!checkComment)
        return res.status(400).json({ message: "Comment entry not found" });

    const checkPost = await prisma.post.findUnique({
        where: {
            id: checkComment.postId,
        },
    });
    if (!checkPost) {
        return res.status(400).json({
            error: "Post does not exist or post have been deleted.",
        });
    }
    // user must be the author of the comment to be modified
    if (checkComment.userId !== req.user.id) {
        return res.status(400).json({
            error: "Comment was made by a different user.",
        });
    }
    // Check if content is not blank
    if (!req.body.content) {
        return res.status(400).json({ message: "Content can not be blank" });
    }

    try {
        const editComment = await prisma.comment.update({
            where: {
                id: commentId,
            },
            data: {
                content: content,
            },
        });

        return res.json({ "Comment edited": editComment });
    } catch (err) {
        console.error(err);
        return res
            .status(500)
            .json({ error: "something went wrong in the database queries" });
    }
};

const getComments = async (req, res) => {
    const { postId } = req.params;
    if (!postId) {
        return res.status(400).json({ error: "No post Id" });
    }
    try {
        const this_comments = await prisma.comment.findMany({
            where: {
                postId: postId,
            },
            include: {
                user: true,
                post: true,
            },
        });

        return res.json(this_comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database retrieval error." });
    }
};

const deleteComment = async (req, res) => {
    const { commentId } = req.params;
    if (!commentId) {
        return res.status(400).json({ message: "Comment Id not available." });
    }
    const checkComment = await prisma.comment.findUnique({
        where: {
            id: commentId,
        },
        include: {
            post: true,
        },
    });
    if (!checkComment) {
        return res.status(400).json({ message: "Comment entry not found" });
    }
    // user must be the author of the comment to be deleted
    // the author of the post that the comment is under can also delete it.
    // An admin can also delete the comment

    const isCommentAuthor = checkComment.userId === req.user.id;
    const isPostAuthor = checkComment.post.authorId === req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
        return res.status(403).json({
            error: "You are not authorized to delete this comment",
        });
    }

    try {
        // delete comment
        const deleteComment = await prisma.comment.delete({
            where: {
                id: commentId,
            },
        });
        // console.log("deleted comment", deleteComment);
        return res.json(deleteComment);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Something went wrong with the databse server or queries",
        });
    }
};

module.exports = {
    createComment,
    editComment,
    getComments,
    deleteComment,
    // countComments
};
