const express = require("express");
const uploadController = require("./../controllers/uploadController");
const router = express.Router();

router.route("/images/:path").get(uploadController.sendImageFile);
module.exports = router;
