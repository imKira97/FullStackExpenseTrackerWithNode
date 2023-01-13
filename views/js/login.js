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
      if (result.status === 201) {
        document.querySelector("#errorText").innerHTML = "Login SuccessFully";
      }
    })
    .catch((err) => {
      if (err.response.status === 401) {
        document.querySelector("#errorText").innerHTML = "User not authorized";
      } else if (err.response.status === 404) {
        document.querySelector("#errorText").innerHTML = "User not found";
      } else {
        document.querySelector(
          "#errorText"
        ).innerHTML = `${err.response.message}`;
      }
    });
});
