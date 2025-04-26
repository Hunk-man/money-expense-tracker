let expenses = [];
let totalAmount = 0;

// DOM references
const categorySelect = document.getElementById("category-select");
const customCategoryInput = document.getElementById("custom-category");
const amountInput = document.getElementById("amount-input");
const dateInput = document.getElementById("date-input");
const addBtn = document.getElementById("add-btn");
const expensesTableBody = document.getElementById("expense-table-body");
const totalAmountCell = document.getElementById("total-amount");
const ctx = document.getElementById("expenseChart").getContext("2d");

let chartInstance = null;

// Show/hide custom category input
categorySelect.addEventListener("change", () => {
  if (categorySelect.value === "Other") {
    customCategoryInput.classList.remove("d-none");
  } else {
    customCategoryInput.classList.add("d-none");
    customCategoryInput.value = "";
  }
});

// Handle Add Expense
addBtn.addEventListener("click", () => {
  let category = categorySelect.value;
  const amount = parseFloat(amountInput.value);
  const date = dateInput.value;

  // If "Other" selected, get text input
  if (category === "Other") {
    category = customCategoryInput.value.trim();
    if (category === "") {
      alert("Please enter a custom category.");
      return;
    }
  }

  // Basic form validation
  if (!category || isNaN(amount) || amount <= 0 || !date) {
    alert("Please fill out all fields with valid values.");
    return;
  }

  // Add expense
  const newExpense = { category, amount, date };
  expenses.push(newExpense);

  // Update totals & table
  totalAmount += amount;
  totalAmountCell.textContent = `$${totalAmount.toFixed(2)}`;
  addExpenseToTable(newExpense);
  updateChartData();

  // Reset inputs
  amountInput.value = "";
  dateInput.value = "";
  if (categorySelect.value === "Other") {
    customCategoryInput.value = "";
  }
  categorySelect.value = "Food & Beverage";
  customCategoryInput.classList.add("d-none");
});

// Add row to table
function addExpenseToTable(expense) {
  const row = expensesTableBody.insertRow();

  row.insertCell().textContent = expense.category;
  row.insertCell().textContent = `$${expense.amount.toFixed(2)}`;
  row.insertCell().textContent = expense.date;

  const deleteCell = row.insertCell();
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.classList.add("btn", "btn-danger", "btn-sm");

  deleteBtn.addEventListener("click", () => {
    const index = expenses.indexOf(expense);
    if (index !== -1) {
      expenses.splice(index, 1);
      totalAmount -= expense.amount;
      totalAmountCell.textContent = `$${totalAmount.toFixed(2)}`;
      row.remove();
      updateChartData();
    }
  });

  deleteCell.appendChild(deleteBtn);
}

// Update pie chart
function updateChartData() {
  const categoryTotals = {};

  // Tally up amounts by category
  expenses.forEach((expense) => {
    if (!categoryTotals[expense.category]) {
      categoryTotals[expense.category] = 0;
    }
    categoryTotals[expense.category] += expense.amount;
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  // Destroy and redraw chart
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Spending",
          data: data,
          backgroundColor: [
            "#4caf50",
            "#2196f3",
            "#ff9800",
            "#e91e63",
            "#9c27b0",
            "#00bcd4",
            "#ff5722",
            "#607d8b",
            "#795548",
            "#ffc107",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.parsed;
              const total = data.reduce((a, b) => a + b, 0);
              const percent = ((value / total) * 100).toFixed(1);
              return `${context.label}: $${value} (${percent}%)`;
            },
          },
        },
      },
    },
  });
}
