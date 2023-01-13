const express = require("express");
const router = express.Router();
const path = require("path");
const bodyParser = require("body-parser");
const jsonparser = bodyParser.json();

const userController = require("../controller/user.js");
router.get("/", jsonparser, userController.getUser);
router.post("/user/signUp", jsonparser, userController.newUser);
module.exports = router;
