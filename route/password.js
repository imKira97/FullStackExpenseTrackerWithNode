const express = require("express");
const router = express.Router();
const path = require("path");
const bodyParser = require("body-parser");
const jsonparser = bodyParser.json();

const passwordController = require("../controller/password");
const authUser = require("../middleware/auth");

router.get(
  "/password/updatepassword/:resetpasswordid",
  jsonparser,
  passwordController.updatePassword
);
router.get(
  "/password/resetPassword/:id",
  jsonparser,
  passwordController.resetPassword
);

router.use(
  "/password/forgetPassword",
  jsonparser,
  passwordController.forgetPassword
);

module.exports = router;
