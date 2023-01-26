const myForm = document.getElementById("myForm");
//ul
const expenseList = document.getElementById("expenseList");
const table = document.getElementById("record1");

let editExpenseId = null;
const token = localStorage.getItem("token");
const config = {
  headers: {
    Authorization: token,
  },
};
//to display message
window.addEventListener("DOMContentLoaded", () => {
  //getting the token

  const req1 = axios.get("http://localhost:4000/user/Status", config);
  const req2 = axios.get(
    "http://localhost:4000/user/expense/getExpense",
    config
  );
  axios.all([req1, req2]).then(
    axios.spread(function (res1, res2) {
      const isPremiumUser = res1.data.isPremiumUser;
      if (isPremiumUser) {
        document.getElementById("buy_premium").innerHTML =
          "You are a Premium User";
        document.getElementById("buy_premium").disabled = true;
      }

      for (let i = 0; i < res2.data.expenses.length; i++) {
        toCreateListItem(res2.data.expenses[i]);
      }
    })
  );

  // axios
  //   .get("http://localhost:4000/user/Status", config)
  //   .then((res) => {
  //     console.log("res status" + res.isPremiumUser);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
  // axios
  //   .get("http://localhost:4000/user/expense/getExpense", config)
  //   .then((res) => {
  //     for (let i = 0; i < res.data.expenses.length; i++) {
  //       console.log(res.data.expenses[i]);
  //       toCreateListItem(res.data.expenses[i]);
  //     }
  //   })
  //   .catch((err) => console.log(err));
});

myForm.addEventListener("submit", saveExpense);
function saveExpense(e) {
  e.preventDefault();
  console.log("hello");
  let expenseDetails = {
    amount: document.getElementById("expenseAmount").value,
    description: document.getElementById("desc").value,
    category: document.getElementById("selectCategory").value,
  };
  axios
    .post(
      "http://localhost:4000/user/expense/addExpense",
      expenseDetails,
      config
    )
    .then((res) => {
      console.log(res);
      toCreateListItem(expenseDetails);
    })
    .catch((err) => {
      console.log(err);
    });
}

function toCreateListItem(expenseData) {
  const li = document.createElement("li");
  li.appendChild(
    document.createTextNode(
      `${expenseData.amount} : ${expenseData.description} : ${expenseData.category}`
    )
  );

  //delete Button
  var deleteButton = document.createElement("input");
  deleteButton.type = "button";
  deleteButton.value = "Delete";
  deleteButton.id = "deleteExpense";
  deleteButton.class = "btn btn-warning";
  deleteButton.addEventListener("click", function () {
    axios
      .delete(
        `http://localhost:4000/user/expense/deleteExpense/${expenseData.id}`,
        config
      )
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
    li.remove();
  });
  li.appendChild(deleteButton);
  expenseList.appendChild(li);
}

//razorpay
document.getElementById("buy_premium").onclick = async function (e) {
  console.log("hello");
  const response = await axios.get(
    "http://localhost:4000/user/purchase/premiumMember",
    config
  );
  console.log("response" + response);

  var options = {
    key: response.data.key_id,
    order_id: response.data.order.id, //handler will be called when payment is successfully

    handler: async function (response) {
      await axios.post(
        "http://localhost:4000/user/purchase/updateTranscationStatus",
        {
          orderid: options.order_id,
          paymentid: response.razorpay_payment_id,
          status: "success",
        },
        config
      );
      console.log("options" + options);
      alert("Your are a premium user now");
      document.getElementById("buy_premium").innerHTML =
        "You are a Premium User";
      document.getElementById("buy_premium").disabled = true;
    },
  };
  const rzp1 = new Razorpay(options);
  rzp1.open(); //this opens razorpay payment
  e.preventDefault();
  rzp1.on("payment.failed", async function (response) {
    await axios.post(
      "http://localhost:4000/user/purchase/updateTranscationStatus",
      {
        orderid: options.order_id,
        paymentid: response.razorpay_payment_id,
        status: "failed",
      },
      config
    );
    alert("something went wrong");
  });
};
