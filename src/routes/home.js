const Router = require("express");

const router = Router();
const homeController = require("../controllers/homeController");

router.get("/", homeController.loadHomePage);

module.exports = router;
