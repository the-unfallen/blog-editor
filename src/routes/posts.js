const Router = require("express");
const passport = require("passport");
const postsController = require("../controllers/postsController");
const router = Router();
const auth = passport.authenticate("jwt", { session: false });
router.get("/", postsController.allPosts);
router.get("/post/:postId", postsController.viewPost);
router.get("/published", postsController.publishedPosts);
router.get("/unpublished", postsController.unpublishedPosts);
router.put("/edit/:postId", auth, postsController.editPosts);
router.post("/create", auth, postsController.createPost);
router.delete("/delete/:postId", auth, postsController.deletePosts);
router.put("/action/publish/:postId", auth, postsController.publishAction);
router.put("/action/unpublish/:postId", auth, postsController.unpublishAction);

module.exports = router;
