const express = require("express");
const router = express.Router();
const path = require("path");
const bodyParser = require("body-parser");
const jsonparser = bodyParser.json();

const passwordController = require("../controller/password");
const authUser = require("../middleware/auth");
router.post(
  "/password/forgetPassword",
  jsonparser,
  passwordController.forgetPassword
);

router.get(
  "/password/resetPassword/:id",
  jsonparser,
  passwordController.resetPassword
);
router.post(
  "/password/updatePassword",
  jsonparser,
  passwordController.updatePassword
);

module.exports = router;
