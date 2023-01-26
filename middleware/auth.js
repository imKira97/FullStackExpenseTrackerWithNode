const jwt = require("jsonwebtoken");
const User = require("../model/user");

//this will authenenticate the user we will get which user has login here
const authenticate = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    console.log(token);

    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    console.log("login user Id" + user.userId);
    User.findByPk(user.userId).then((user) => {
      console.log(JSON.stringify(user));
      //we are setting our user object here
      req.user = user;
      next();
    });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ success: false });
  }
};

module.exports = {
  authenticate,
};
