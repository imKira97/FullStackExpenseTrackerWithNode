const User = require("../model/user");

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
      const user = await User.create({
        name: name,
        email: email,
        password: password,
      });
      console.log(user);
      res.status(201).json({ message: "user created", data: user });
    }
  } catch (err) {
    res.status(500).json({ err: err, message: "user already exist" });
  }
};
