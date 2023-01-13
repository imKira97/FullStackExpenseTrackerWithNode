const User = require("../model/user");
const bcrypt = require("bcrypt");

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
        res.status(201).json({ message: "login Success" });
      } else {
        console.log("password fail");
        res.status(401).json({ message: "password does not match" });
      }
    } else {
      console.log("user not exist");
      res.status(401).json({ message: "user doesnot exist" });
    }
  } catch (err) {
    console.log(err);
  }
};
