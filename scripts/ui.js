import { addRecord, getAll } from "./state.js";
import { validate } from "./validators.js";


// Confirm script is loaded
console.log("UI script loaded");


// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("transaction-form");
  const status = document.getElementById("form-status");
  const records = document.querySelector("#records");


  function render(txns) {
  const container = document.getElementById("records-list");
  if (!txns.length) {
    container.innerHTML = "<p>No transactions yet.</p>";
    return;
  }


  const rows = txns.map(t => `
    <tr data-id="${t.id}">
      <td><input type="date" class="edit-date" value="${t.date}" /></td>
      <td><input type="text" class="edit-description" value="${t.description}" /></td>
      <td><input type="number" class="edit-amount" value="${t.amount}" step="0.01" /></td>
      <td>
        <select class="edit-category">
          ${["fees", "books", "food", "transport", "trip", "other"].map(cat =>
            `<option value="${cat}" ${cat === t.category ? "selected" : ""}>${cat}</option>`
          ).join("")}
        </select>
      </td>
      <td class="actions">
        <button class="save-btn">Save</button>
        <button class="delete-btn">Delete</button>
      </td>
    </tr>
  `).join("");


  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Amount (USD)</th>
          <th>Category</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;


  attachRowEvents(); // Rebind buttons after rendering
}




function attachRowEvents() {
  const rows = document.querySelectorAll("#records-list tbody tr");
  rows.forEach(row => {
    const id = row.dataset.id;
    console.log("Binding row for ID:", id); // Confirm binding


    row.querySelector(".save-btn").addEventListener("click", () => {
      console.log("Save clicked for ID:", id); // Confirm click
      const updated = {
        id,
        date: row.querySelector(".edit-date").value,
        description: row.querySelector(".edit-description").value,
        amount: parseFloat(row.querySelector(".edit-amount").value),
        category: row.querySelector(".edit-category").value,
        createdAt: getAll().find(t => t.id === id)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      updateRecord(id, updated);
      render(getAll());
      updateDashboard(getAll());
    });


    row.querySelector(".delete-btn").addEventListener("click", () => {
      console.log("Delete clicked for ID:", id); // Confirm click
      if (confirm("Are you sure you want to delete this transaction?")) {
        deleteRecord(id);
        render(getAll());
        updateDashboard(getAll());
      }
    });
  });
}




function updateDashboard(txns) {
  const stats = document.getElementById("stats");
  stats.innerHTML = "";


  if (!txns.length) {
    stats.innerHTML = "<p>No data yet.</p>";
    return;
  }


  const total = txns.length;
  const sum = txns.reduce((acc, t) => acc + t.amount, 0);
  const categories = txns.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});
  const topCategory = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])[0][0];


  stats.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Total Transactions</td>
          <td>${total}</td>
        </tr>
        <tr>
          <td>Total Spent</td>
          <td>$${sum.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Top Category</td>
          <td>${topCategory}</td>
        </tr>
      </tbody>
    </table>
  `;
}


const defaultSettings = {
  currency: "USD",
  rate: 1,
  budget: 500
};


function loadSettings() {
  return JSON.parse(localStorage.getItem("finance:settings")) || defaultSettings;
}


function saveSettings(settings) {
  localStorage.setItem("finance:settings", JSON.stringify(settings));
}


document.getElementById("save-settings").addEventListener("click", () => {
  const currency = document.getElementById("currency").value;
  const rate = parseFloat(document.getElementById("rate").value);
  const budget = parseFloat(document.getElementById("budget").value);
  saveSettings({ currency, rate, budget });
  alert("Settings saved!");
});


document.getElementById("reset-settings").addEventListener("click", () => {
  saveSettings(defaultSettings);
  document.getElementById("currency").value = defaultSettings.currency;
  document.getElementById("rate").value = defaultSettings.rate;
  document.getElementById("budget").value = defaultSettings.budget;
  alert("Settings reset to defaults.");
});


// Load settings on page load
document.addEventListener("DOMContentLoaded", () => {
  // Load settings
  const s = loadSettings();
  document.getElementById("currency").value = s.currency;
  document.getElementById("rate").value = s.rate;
  document.getElementById("budget").value = s.budget;


  // Dark mode toggle
  document.getElementById("dark-toggle").addEventListener("change", e => {
    document.body.classList.toggle("dark", e.target.checked);
  });


  // Show default section (e.g. dashboard)
  showSection("dashboard");


  // Render records and dashboard
  render(getAll());
  updateDashboard(getAll());
});


document.getElementById("export-btn").addEventListener("click", () => {
  const data = getAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.json";
  a.click();
  URL.revokeObjectURL(url);
});


document.getElementById("import-file").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;


  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");
      imported.forEach(addRecord);
      render(getAll());
      updateDashboard(getAll());
      document.getElementById("import-status").textContent = "Import successful!";
    } catch {
      document.getElementById("import-status").textContent = "Import failed. Invalid file.";
    }
  };
  reader.readAsText(file);
});




  // Handle form submit
  form.addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target;
    const fields = ["description", "amount", "category", "date"];
    const valid = fields.every(id => validate(id, f[id].value));
    if (!valid) {
      status.textContent = "Please fix errors.";
      return;
    }


    const txn = {
      id: Date.now().toString(),
      description: f.description.value,
      amount: parseFloat(f.amount.value),
      category: f.category.value,
      date: f.date.value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };


    addRecord(txn);
    render(getAll());
    status.textContent = "Saved!";
    f.reset();
  });


  // Section switching logic
function showSection(id) {
  document.querySelectorAll("main > section").forEach(sec => {
    sec.classList.remove("active");
    if (sec.id === id) sec.classList.add("active");
  });


  document.querySelectorAll("nav a").forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${id}`) link.classList.add("active");
  });
}




// Handle nav clicks
document.querySelectorAll("nav a").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = link.getAttribute("href").replace("#", "");
    showSection(target);
  });
});


// Show home section on first load


document.addEventListener("DOMContentLoaded", () => {
  const s = loadSettings();
  document.getElementById("currency").value = s.currency;
  document.getElementById("rate").value = s.rate;
  document.getElementById("budget").value = s.budget;


  showSection("dashboard"); // or "home" if you prefer
  render(getAll());
  updateDashboard(getAll());
});






  // Initial render
  render(getAll());
  updateDashboard(getAll());
  attachRowEvents();


});



