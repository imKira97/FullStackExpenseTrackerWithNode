const form = document.querySelector("#login");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const password = document.querySelector("#userPassword").value;
  const email = document.querySelector("#userEmail").value;
  const userDetail = {
    email: email,
    password: password,
  };
  axios
    .post("http://localhost:4000/user/login", userDetail)
    .then((result) => {
      //console.log(result);
      if (result.status === 201) {
        alert("login SuccessFully");
        //here we are setting the token of login user
        localStorage.setItem("token", result.data.token);
        //this will redirect to addExpense
        window.location.href = "../expense/addExpense.html";
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
