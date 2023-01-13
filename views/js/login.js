const form = document.querySelector("#login");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const password = document.querySelector("#userPassword").value;
  const email = document.querySelector("#userEmail").value;
  const userDetail = {
    email: email,
    password: password,
  };
  console.log(userDetail);

  axios
    .post("http://localhost:4000/user/login", userDetail)
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      if (err.response.data.message === "user does not  exist") {
        document.querySelector("#errorText").innerHTML = "user does not  exist";
      } else if (err.response.data.message === "email incorrect") {
      } else if (err.response.data.message === "password incorrect") {
      } else {
        document.querySelector(
          "#errorText"
        ).innerHTML = `${err.response.message}`;
      }
    });
});
