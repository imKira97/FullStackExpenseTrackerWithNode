const myForm = document.getElementById("myForm");
//ul
const expenseList = document.getElementById("list_of_expense");
const table = document.getElementById("record1");
//leaderBoard
const leaderBoardBtn = document.getElementById("leaderboard_btn");
const leaderList = document.getElementById("leaderboard_list");

//files
const fileHistoryBtn = document.getElementById("file_history_btn");

let expensePerPage = localStorage.getItem("noOfRows");
console.log("rows" + expensePerPage);
//pagination
const pagination = document.getElementById("pagination");
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
  //by default page number will be 1
  const page = 1;
  axios
    .get(
      `http://3.111.53.105:4000/user/expense/getExpense?page=${page}&perPage=${expensePerPage}`,
      config
    )
    .then((res) => {
      if (res.data.isPremiumUser) {
        document.getElementById("buy_premium").innerHTML =
          "You are a Premium User";
        document.getElementById("buy_premium").disabled = true;
        document.getElementById("premiumFront").style.display = "block";
        premiumFunction();
      } else {
        leaderBoardBtn.style.display = "none";
      }
      if (res.data.expenses.length === 0) {
        document.getElementById("expenseListDiv").innerHTML = "";
      }

      for (let i = 0; i < res.data.expenses.length; i++) {
        toCreateListItem(res.data.expenses[i]);
      }
      showPagination(res.data, res.data.per_page);
    })
    .catch((err) => {
      console.log(err);
    });
});

function premiumFunction() {
  leaderBoardBtn.addEventListener("click", () => {
    if (leaderBoardBtn.innerText === "Show LeaderBoard") {
      leaderBoardBtn.innerText = "hide";

      axios
        .get("http://3.111.53.105:4000/premium/leaderBoardSum", config)
        .then((res) => {
          const userData = res.data.userData;
          for (let i = 0; i < userData.length; i++) {
            createLeaderBoardList(userData[i]);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      leaderBoardBtn.innerText = "Show LeaderBoard";
      document.getElementById("leaderboard_list").innerHTML = "";
      document.getElementById("leaderboard_list").style.display = "none";
    }
  });

  fileHistoryBtn.addEventListener("click", () => {
    const fileList = document.getElementById("file_list");
    if (fileHistoryBtn.innerText == "Show File History") {
      fileHistoryBtn.innerText = "Hide Files";
      axios
        .get("http://3.111.53.105:4000/user/fileHistory", config)
        .then((result) => {
          const fileData = result.data.fileHistory;

          if (fileData.length === 0) {
            const h3 = document.createElement("h3");
            h3.innerHTML = "No File History";
          } else {
            for (i = 0; i < fileData.length; i++) {
              var li = document.createElement("li");
              var a = document.createElement("a");
              a.href = fileData[i].fileUrl;
              a.text = `file${i + 1}`;

              li.appendChild(a);
              fileList.appendChild(li);
            }
            fileList.style.display = "block";
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      fileHistoryBtn.innerText = "Show File History";
      fileList.innerHTML = "";
      fileList.style.display = "none";
    }
  });
}

function createLeaderBoardList(data) {
  const ol = document.getElementById("leaderboard_list");
  var li = document.createElement("li");

  li.appendChild(
    document.createTextNode(`${data.totalExpense} - ${data.name}`)
  );
  ol.appendChild(li);
  ol.style.display = "block";
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
      "http://3.111.53.105:4000/user/expense/addExpense",
      expenseDetails,
      config
    )
    .then((res) => {
      console.log(res);
      toCreateListItem(expenseDetails);
      window.location.reload();
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
        `http://3.111.53.105:4000/user/expense/deleteExpense/${expenseData.id}`,
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
    "http://3.111.53.105:4000/user/purchase/premiumMember",
    config
  );
  console.log("response" + response);

  var options = {
    key: response.data.key_id,
    order_id: response.data.order.id, //handler will be called when payment is successfully

    handler: async function (response) {
      await axios.post(
        "http://3.111.53.105:4000/user/purchase/updateTranscationStatus",
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
      "http://3.111.53.105:4000/user/purchase/updateTranscationStatus",
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
    .get("http://3.111.53.105:4000/user/downloadFile", config)
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

function showError(err) {
  document.getElementById("showError").innerHTML = `${err}`;
}

function showPagination(pageData, expense_per_page) {
  const prev = pageData.hasPreviousPage;
  const next = pageData.hasNextPage;
  const last = pageData.lastPage;

  pagination.innerHTML = "";

  if (prev) {
    const prevBtn = document.createElement("button");
    prevBtn.innerHTML = pageData.previousPage;
    prevBtn.addEventListener("click", () => {
      getExpenses(pageData.previousPage, expense_per_page);
    });
    pagination.appendChild(prevBtn);
  }
  const current = document.createElement("button");
  current.innerHTML = pageData.currentPage;
  pagination.appendChild(current);

  if (next) {
    const nextbtn = document.createElement("button");
    nextbtn.innerHTML = pageData.nextPage;
    nextbtn.addEventListener("click", () =>
      getExpenses(pageData.nextPage, expense_per_page)
    );
    pagination.appendChild(nextbtn);
  }
  const lastbtn = document.createElement("button");
  lastbtn.innerHTML = "last";
  lastbtn.addEventListener("click", () => getExpenses(last, expense_per_page));
  pagination.appendChild(lastbtn);
}

function getExpenses(page, expensePerPage) {
  expenseList.innerHTML = "";
  console.log("here" + expensePerPage);
  axios
    .get(
      `http://3.111.53.105:4000/user/expense/getExpense?page=${page}&perPage=${expensePerPage}`,
      config
    )
    .then((res) => {
      for (let i = 0; i < res.data.expenses.length; i++) {
        toCreateListItem(res.data.expenses[i]);
      }
      showPagination(res.data, expensePerPage);
    })
    .catch((err) => {
      console.log(err);
    });
}

//set per page
const rowBtn = document.getElementById("setRows");
rowBtn.addEventListener("click", () => {
  expensePerPage = document.getElementById("expensePage").value;
  console.log("rows per page " + expensePerPage);
  localStorage.setItem("noOfRows", expensePerPage);
  window.location.reload();
});
