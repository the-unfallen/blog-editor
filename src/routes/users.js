const Router = require("express");
const passport = require("passport");
const usersController = require("../controllers/usersController");
const router = Router();
const auth = passport.authenticate("jwt", { session: false });

router.post("/create", usersController.registerUser);
// router.put("/edit/:userId", auth, usersController.editUser);
// router.get("/profile/:userId", auth, usersController.getUserProfile);
// router.delete("/delete/:userId", auth, usersController.deleteUser);
// router.get("/all", auth, usersController.allUsers);
router.get("/me", auth, usersController.getUser);

module.exports = router;
