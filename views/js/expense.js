const myForm = document.getElementById("myForm");
//ul
const expenseList = document.getElementById("expenseList");

let editExpenseId = null;
//to display message
window.addEventListener("DOMContentLoaded", () => {
  axios
    .get("http://localhost:4000/user/expense/getExpense")
    .then((res) => {
      for (let i = 0; i < res.data.expenses.length; i++) {
        console.log(res.data.expenses[i]);
        toCreateListItem(res.data.expenses[i]);
      }
    })
    .catch((err) => console.log(err));
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
    .post("http://localhost:4000/user/expense/addExpense", expenseDetails)
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
        `http://localhost:4000/user/expense/deleteExpense/${expenseData.id}`
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
