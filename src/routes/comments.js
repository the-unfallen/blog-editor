const Router = require("express");
const passport = require("passport");
const auth = passport.authenticate("jwt", { session: false });
const commentController = require("../controllers/commentsController");

const router = Router();

router.post("/create/:postId", commentController.createComment);
router.get("/:postId", commentController.getComments);
router.put("/edit/:commentId", auth, commentController.editComment);
router.delete("/delete/:commentId", auth, commentController.deleteComment);
// router.delete("/count/:postId", commentController.countComments);

module.exports = router;
