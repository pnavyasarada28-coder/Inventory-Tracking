let allProducts = [];
let editId = null;

// CSRF
function getCSRFToken() {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
}

document.body.classList.add("dark-mode");
// SECTION SWITCH
function showSection(section) {
  document.getElementById("dashboardSection").style.display = "none";
  document.getElementById("productsSection").style.display = "none";
  document.getElementById("settingsSection").style.display = "none";

  document.getElementById(section + "Section").style.display = "block";
}

// LOAD PRODUCTS
async function loadProducts() {
  let res = await fetch("/products/");
  let data = await res.json();

  allProducts = data;
  displayProducts(allProducts);
}

// DISPLAY
function displayProducts(products) {
  let tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  products.forEach(p => {

    let status = p.quantity < 6
      ? "<span class='badge bg-danger'>Low</span>"
      : "<span class='badge bg-success'>In Stock</span>";

    let row = `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${p.quantity}</td>
        <td>${p.price}</td>
        <td>${p.category}</td>
        <td>${status}</td>
        <td>
          <button class="btn btn-warning btn-sm me-1" onclick="editProduct(${p.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Delete</button>
        </td>
      </tr>
    `;

    tableBody.innerHTML += row;
  });

  updateDashboard();
  updateCategoryDropdown();
}

// ADD / UPDATE
async function addProduct() {
  let product = {
    name: document.getElementById("name").value,
    quantity: Number(document.getElementById("quantity").value),
    price: Number(document.getElementById("price").value),
    category: document.getElementById("category").value
  };

  if (editId === null) {
    await fetch("/add/", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken()
      },
      body: JSON.stringify(product)
    });
  } else {
    await fetch(`/update/${editId}/`, {
      method: "PUT",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken()
      },
      body: JSON.stringify(product)
    });

    editId = null;
  }

  clearForm();
  loadProducts();
}

// EDIT
function editProduct(id) {
  let p = allProducts.find(item => item.id === id);

  document.getElementById("name").value = p.name;
  document.getElementById("quantity").value = p.quantity;
  document.getElementById("price").value = p.price;
  document.getElementById("category").value = p.category;

  editId = id;
}

// DELETE
async function deleteProduct(id) {
  if (confirm("Delete this product?")) {
    await fetch(`/delete/${id}/`, {
      method: "DELETE",
      credentials: "same-origin",
      headers: {
        "X-CSRFToken": getCSRFToken()
      }
    });

    loadProducts();
  }
}

// SEARCH
function searchProduct() {
  let input = document.getElementById("search").value.toLowerCase();

  let filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(input)
  );

  displayProducts(filtered);
}

// FILTER
function filterByCategory() {
  let selected = document.getElementById("categoryFilter").value;

  if (selected === "All") {
    displayProducts(allProducts);
  } else {
    let filtered = allProducts.filter(p => p.category === selected);
    displayProducts(filtered);
  }
}

// DASHBOARD
function updateDashboard() {
  document.getElementById("totalProducts").innerText = allProducts.length;

  let low = allProducts.filter(p => p.quantity < 6).length;
  document.getElementById("lowStock").innerText = low;

  let categories = [...new Set(allProducts.map(p => p.category))];
  document.getElementById("totalCategories").innerText = categories.length;
}

// CATEGORY DROPDOWN
function updateCategoryDropdown() {
  let dropdown = document.getElementById("categoryFilter");

  let categories = [...new Set(allProducts.map(p => p.category))];

  dropdown.innerHTML = "<option value='All'>All Categories</option>";

  categories.forEach(cat => {
    dropdown.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

// THEME (PERSISTENT)
function setDarkMode() {
  document.body.classList.add("dark-mode");
  localStorage.setItem("theme", "dark");
}

function setLightMode() {
  document.body.classList.remove("dark-mode");
  localStorage.setItem("theme", "light");
}

// Load saved theme
window.onload = () => {
  let theme = localStorage.getItem("theme");

  if (theme === "dark") {
    document.body.classList.add("dark-mode");
  }

  loadProducts();
};

// CLEAR
function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("quantity").value = "";
  document.getElementById("price").value = "";
  document.getElementById("category").value = "";
}
