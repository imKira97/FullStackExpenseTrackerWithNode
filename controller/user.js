const User = require("../model/user");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

exports.getUser = async (req, res, next) => {
  await User.findAll()
    .then((result) => {
      console.log("getUSer");
      res.status(201).json({ message: "home" });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.newUser = async (req, res, next) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    if (name === "" || email === "" || password === "") {
      return res.status(400).json({ message: "please enter all fields" });
    } else {
      const data = {
        name: name,
        email: email,
        //10 act as salt (randomize )
        password: await bcrypt.hash(password, 10),
      };
      const user = await User.create(data);
      console.log(user);
      res.status(201).json({ message: "user created", data: user });
    }
  } catch (err) {
    res.status(500).json({ err: err, message: "user already exist" });
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    console.log(email + " dasdsa " + password);
    const userMatch = await User.findOne({ where: { email: email } });
    console.log("match " + userMatch);
    /**
     1st find user with that email 
     if found than checks password matches or not 
     if not match  throw err 

     if user not exist also throw err
     */

    if (userMatch) {
      const isUserPassword = await bcrypt.compare(password, userMatch.password);

      if (isUserPassword) {
        console.log("success");
        return res.status(201).json({
          user: email,
          message: "login Success",
          token: generateToken(userMatch.id),
        });
      } else {
        console.log("password fail");

        return res.status(401).json({ message: "User not authorized  " });
      }
    } else {
      console.log("user not exist");
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.log(err);
  }
};

function generateToken(id) {
  return jwt.sign({ userId: id }, process.env.TOKEN_SECRET);
}
