const User = require("../model/user");
// var nodemailer = require("nodemailer");
// const path = require("path");
// const rootDir = require("../util/path");
const bcrypt = require("bcrypt");
const sgMail = require("@sendgrid/mail");
const uuid = require("uuid");

/**
 Here we will use sendGrid API
 instead of nodemailer
 */

const ForgetPassword = require("../model/forgetPassword");

exports.forgetPassword = async (req, res, next) => {
  try {
    const emailId = req.body.emailId;
    const isUser = await User.findOne({ where: { email: emailId } });
    if (isUser) {
      console.log(isUser);
      const id = uuid.v4();
      isUser.createForgetPassword({ id, active: true }).catch((err) => {
        console.log(err);
      });
      sgMail.setApiKey(process.env.SEND_GRID_API);

      const msg = {
        to: emailId,
        from: "codingshiva97@gmail.com",
        subject: "Reset Password Request",
        html: `<h3>Click on the below link to reset your password</h3>
        <br>
        <a href='https://13.127.148.238:4000/password/resetpassword/${id}'>Click Here</a>
  `,
      };

      sgMail
        .send(msg)
        .then((response) => {
          return res.status(response[0].statusCode).json({
            message: "Link to reset password sent to your mail ",
            sucess: true,
          });
        })
        .catch((err) => {
          throw new Error(err);
        });
    } else {
      return res.status(401).json({ message: "user is not registered" });
    }
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: err, sucess: false });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log("id " + id);
    ForgetPassword.findOne({ where: { id: id } }).then((result) => {
      if (result) {
        if (result.active) {
          result.update({ active: false });
          res.status(200).send(`<html>  
                                  <script>
                                  
                                      function formsubmitted(e){
                                        e.preventDefault();
                                        console.log('called')
                                      }
                                    </script>
                                      <form action="/password/updatepassword/${id}" method="get">
                                          <label for="newpassword">Enter New password</label>
                                          <input name="newpassword" type="password" required></input>
                                          <button>reset password</button>
                                      </form>
                                  </html>`);
          res.end();
        } else {
          res.status(402).json({ err: "link expired" });
        }
      }
    });
  } catch (err) {
    console.log(err);
  }
};
exports.updatePassword = async (req, res, next) => {
  try {
    console.log("uppdate password");
    const { newpassword } = req.query;
    const { resetpasswordid } = req.params;

    ForgetPassword.findOne({ where: { id: resetpasswordid } }).then(
      (result) => {
        User.findOne({ where: { id: result.userId } }).then((user) => {
          if (user) {
            bcrypt.genSalt(10, function (err, salt) {
              if (err) {
                console.log(err);
                throw new Error(err);
              }
              bcrypt.hash(newpassword, salt, function (err, hash) {
                if (err) {
                  console.log(err);
                  throw new Error(err);
                }
                user.update({ password: hash }).then(() => {
                  res
                    .status(201)
                    .json({ message: "Successfuly update the new password" });
                });
              });
            });
          } else {
            return res
              .status(404)
              .json({ error: "No user Exists", success: false });
          }
        });
      }
    );
  } catch (err) {
    return res.status(403).json({ err, success: false });
  }
};
