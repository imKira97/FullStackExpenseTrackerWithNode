const form = document.querySelector("#signUpForm");
const errorDiv = document.querySelector("#errorDiv");

window.addEventListener("DOMContentLoaded", () => {
  axios
    .get("http://localhost:4000/")
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("userName").value;
  const email = document.getElementById("userEmail").value;
  const password = document.getElementById("userPassword").value;

  const userDetail = { name: name, email: email, password: password };
  axios
    .post("http://localhost:4000/user/signUp", userDetail)
    .then((result) => {
      console.log("res" + result);
      alert("signup success");
      window.location.href = "../html/login.html";
    })
    .catch((err) => {
      if (err.response.data.message === "user already exist") {
        document.querySelector("#errorText").innerHTML = "User Already Exist";
      }
    });
  document.getElementById("userName").value = "";
  document.getElementById("userEmail").value = "";
  document.getElementById("userPassword").value = "";
});
