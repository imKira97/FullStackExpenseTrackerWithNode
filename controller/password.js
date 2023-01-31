const User = require("../model/user");
var nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const path = require("path");
const rootDir = require("../util/path");
const bcrypt = require("bcrypt");

const ForgetPassword = require("../model/forgetPassword");
const { where } = require("sequelize");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.user_email,
    pass: process.env.user_email_password,
  },
});

exports.resetPassword = async (req, res, next) => {
  try {
    const checkResetStatus = await ForgetPassword.findOne({
      where: { id: req.params.id },
    });
    if (checkResetStatus) {
      res
        .status(201)
        .sendFile(path.join(rootDir, "views", "html", "resetPassword.html"));
    }
  } catch (err) {
    console.log(err);
  }
};

exports.forgetPassword = async (req, res, next) => {
  try {
    const emailId = req.body.emailId;
    const isRegistered = await User.findOne({ where: { email: emailId } });
    if (isRegistered) {
      console.log(isRegistered);
      const forgetReq = await ForgetPassword.create({
        userId: isRegistered.id,
      });
      console.log(forgetReq);

      var mailOptions = {
        from: process.env.user_email,
        to: emailId,
        subject: "Password reset mail",
        html: `<h3>Click on the below link to reset your password</h3>
              <br>
              <a href='http://localhost:4000/password/resetpassword/${forgetReq.id}'>Click Here</a>
        `,
      };
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          console.log(err);
        } else {
          res.status(201).json({ message: "success", id: forgetReq.id });
        }
      });
    } else {
      res.status(401).json({ message: "user is not registered" });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const email = req.body.data.emailId;
    const newPassword = await bcrypt.hash(req.body.data.password, 10);
    const statusId = req.body.data.id;
    const updateUserPwd = await User.update(
      { password: newPassword },
      { where: { email: email } }
    );
    const updateStatus = await ForgetPassword.update(
      { status: false },
      { where: { id: statusId } }
    );
    Promise.all([updateStatus, updateUserPwd])
      .then(() => {
        return res.status(201).json("success");
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
};
