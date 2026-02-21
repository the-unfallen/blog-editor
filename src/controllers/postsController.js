const passport = require("passport");
const prisma = require("../lib/prisma");

const allPosts = async (req, res) => {
    //get all posts

    const posts = await prisma.post.findMany({
        include: {
            author: true,
            comments: true,
        },
        orderBy: {
            createdAt: "desc", // Sorts by the most recently created
        },
    });

    if (posts) {
        return res.json(posts);
    } else {
        return res.json(null);
    }
};

const viewPost = async (req, res) => {
    try {
        const this_post = await prisma.post.findUnique({
            where: {
                id: req.params.postId,
            },

            include: {
                author: true,
                comments: {
                    include: {
                        user: true, // 👈 nested include
                    },
                },
            },
        });
        if (this_post) {
            return res.json(this_post);
        } else {
            return res.json(null);
        }
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "something went wrong with the database query" });
    }
};

const publishedPosts = async (req, res) => {
    //Get Published Posts
    try {
        const posts = await prisma.post.findMany({
            where: {
                published: true,
            },
            include: {
                author: true,
                comments: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (posts) {
            return res.json(posts);
        } else {
            return res.json(null);
        }
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "something went wrong with the database query" });
    }
};

const unpublishedPosts = async (req, res) => {
    //Get unpublished Posts
    try {
        const posts = await prisma.post.findMany({
            where: {
                published: false,
            },

            include: {
                author: true,
                comments: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (posts) {
            return res.json(posts);
        } else {
            return res.json(null);
        }
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "something went wrong with the database query" });
    }
};

const editPosts = async (req, res) => {
    const userId = req.user.id;
    const postId = req.params.postId;
    try {
        // get the post details
        const this_post = await prisma.post.findUnique({
            where: {
                id: postId,
            },

            include: {
                author: true,
            },
        });
        if (!this_post)
            return res.status(404).json({ error: "No resource in database" });
        // check if userId is same as AuthorId
        if (this_post.authorId !== userId)
            return res
                .status(403)
                .json({ error: "You are not authorized to edit this post" });

        const { title, content } = req.body;

        if (!title && !content)
            return res
                .status(400)
                .json({ error: "title and content entries must be provided." });

        // update post
        const updatedPost = await prisma.post.update({
            where: {
                id: postId,
            },
            data: {
                title: title,
                content: content,
            },
        });
        // console.log(updatedPost);

        res.json({
            "updated Post": updatedPost,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Something went wrong with the database.",
        });
    }
};

const createPost = async (req, res) => {
    // check if title and content are not blank.
    const { title, content } = req.body;
    if (!title && !content)
        return res.status(400).json({ message: "Content is required" });
    // create the post in the database
    const newPost = await prisma.post.create({
        data: {
            title,
            content,
            authorId: req.user.id,
        },
    });
    res.json({ message: "Post created successfully", post: newPost });
};

const deletePosts = async (req, res) => {
    const postId = req.params.postId;
    try {
        // get the post details
        const this_post = await prisma.post.findUnique({
            where: {
                id: postId,
            },

            include: {
                author: true,
            },
        });

        if (!this_post)
            return res.status(404).json({ error: "No resource in database" });
        // check if userId is same as AuthorId
        if (this_post.authorId !== req.user.id)
            return res
                .status(403)
                .json({ error: "You are not authorized to delete this post" });

        const deletedPost = await prisma.post.delete({
            where: {
                id: postId,
            },
        });

        res.json({
            message: `Post with title - ${deletedPost.title}  Deleted Successfully`,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Something went wrong with the database.",
        });
    }
};

const publishAction = async (req, res) => {
    const postId = req.params.postId;

    try {
        // check that post exist.
        const this_post = await prisma.post.findUnique({
            where: {
                id: postId,
            },

            include: {
                author: true,
            },
        });
        if (!this_post)
            return res.status(404).json({ error: "No resource in database" });

        //check if post is already published
        if (this_post.published) {
            return res.status(200).json(this_post);
        }

        // who can initiate a publish action - post author or admin.
        const isPostAuthor = req.user.id === this_post.authorId;
        const isAdmin = req.user.role === "ADMIN";

        if (!isPostAuthor && !isAdmin)
            return res
                .status(403)
                .json({ error: "You can not perform this action." });

        //publish the post
        const publish_this_post = await prisma.post.update({
            where: {
                id: postId,
            },
            data: {
                published: true,
                publishedAt: new Date(),
            },
        });
        // console.log(publish_this_post);

        res.json(publish_this_post);
    } catch (error) {
        console.error("Error publishing the post", error);
    }
};

const unpublishAction = async (req, res) => {
    const postId = req.params.postId;

    try {
        // check that post exist.
        const this_post = await prisma.post.findUnique({
            where: {
                id: postId,
            },

            include: {
                author: true,
            },
        });
        if (!this_post)
            return res.status(404).json({ error: "No resource in database" });

        //check if post is already unpublished
        if (!this_post.published) {
            return res.status(200).json(this_post);
        }

        // who can initiate an unpublish action - post author or admin.
        const isPostAuthor = req.user.id === this_post.authorId;
        const isAdmin = req.user.role === "ADMIN";

        if (!isPostAuthor && !isAdmin)
            return res
                .status(403)
                .json({ error: "You can not perform this action." });

        // Unpublish this post.
        const unpublish_this_post = await prisma.post.update({
            where: {
                id: postId,
            },
            data: {
                published: false,
            },
        });
        // console.log(unpublish_this_post);

        res.json(unpublish_this_post);
    } catch (error) {
        console.error("Error unpublishing the post", error);
    }
};

module.exports = {
    allPosts,
    editPosts,
    createPost,
    deletePosts,
    publishedPosts,
    unpublishedPosts,
    viewPost,
    publishAction,
    unpublishAction,
};
