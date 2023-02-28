const myForm = document.getElementById("myForm");
//ul
const expenseList = document.getElementById("expenseList");
const table = document.getElementById("record1");

var leaderListDiv = document.getElementById("leaderBoard");
var leaderBtnDiv = document.getElementById("showLeaderShipButton");

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

  axios
    .get("http://localhost:4000/user/expense/getExpense", config)
    .then((res) => {
      if (res.data.isPremiumUser) {
        document.getElementById("buy_premium").innerHTML =
          "You are a Premium User";
        document.getElementById("buy_premium").disabled = true;
        document.getElementById("premiumFront").style.display = "block";
        leaderShipBtn();
        showFileHistory(res.data.fileHistory);
      }

      for (let i = 0; i < res.data.expenses.length; i++) {
        toCreateListItem(res.data.expenses[i]);
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

function leaderShipBtn() {
  var leaderShipButton = document.createElement("button");
  leaderShipButton.innerHTML = "Show LeaderBoard";

  leaderBtnDiv.appendChild(leaderShipButton);
  leaderShipButton.addEventListener("click", () => {
    axios
      .get("http://localhost:4000/premium/leaderBoardSum", config)
      .then((res) => {
        const userData = res.data.userData;
        console.log(userData);

        var ul = document.createElement("ul");
        var li = document.createElement("li");

        for (let i = 0; i < userData.length; i++) {
          createLeaderBoardList(userData[i]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
}

function createLeaderBoardList(data) {
  var ul = document.createElement("ul");
  var li = document.createElement("li");

  li.appendChild(document.createTextNode(`${data.total_spend} ${data.name}`));
  ul.appendChild(li);
  leaderListDiv.appendChild(ul);
}

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
      // document.getElementById("buy_premium").innerHTML =
      //   "You are a Premium User";
      // document.getElementById("buy_premium").disabled = true;
      // leaderShipBtn();
      window.location.reload();
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
function downloadFile() {
  axios
    .get("http://localhost:4000/user/downloadFile", config)
    .then((res) => {
      if (res.status === 201) {
        var a = document.createElement("a");
        a.href = res.data.fileUrl;
        a.download = "myExpense.csv";
        a.click();
      } else {
        throw new Error(res.data.message);
      }
    })
    .catch((err) => {
      showError(err);
    });
}

function showFileHistory(data) {
  let table = document.createElement("table");
  let headerRow = table.insertRow();
  let header1 = headerRow.insertCell(0);
  let header2 = headerRow.insertCell(1);
  header1.innerHTML = "<b> Sr.No </b>";
  header2.innerHTML = "<b>File Link</b>";

  for (let i = 0; i < data.length; i++) {
    let row = table.insertRow();
    let col1 = row.insertCell(0);
    let col2 = row.insertCell(1);
    col1.innerHTML = ` ${i}`;
    col2.innerHTML = `<a href='${data[i].fileUrl}'> File ${i + 1}</a>`;
  }
  document.getElementById("downloadExpenseDiv").appendChild(table);
}

function showError(err) {
  document.getElementById("showError").innerHTML = `${err}`;
}
