let allFavCoins = [];            
let currentPage = 1;             
let itemsPerPage = 25;

const pagination = document.querySelector(".pagination");
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");

// fetch all fav coins
async function fetchedfavCoins() {
  const favList = JSON.parse(localStorage.getItem("favourites")) || [];

  const noDataMsg = document.querySelector(".no-data");
  const table = document.querySelector("table");

  // if no favourites found
  if (favList.length === 0) {
    document.querySelector("tbody").innerHTML =
      `<tr><td colspan="7" style="text-align:center;">No favourite coins added yet!</td></tr>`;
      
    noDataMsg.style.display = "block";
    table.style.display = "none";
    pagination.style.display = "none";
    return;
  }

  try {
    // Fetch all favourite coins
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${favList.join(",")}`
    );

    allFavCoins = await res.json();

    // Show table
    noDataMsg.style.display = "none";
    table.style.display = "table";

    if (currentPage === 1 && allFavCoins.length > 25) {
      currentPage = 1;
    }

    renderPage();
    updatePaginationUI();

  } catch (err) {
    console.error("Error loading favourite coins:", err);
  }
}

  // render 25 coin only
function renderPage() {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  const coinsToShow = allFavCoins.slice(start, end);

  coinsToShow.forEach((coin, index) => {
    tbody.appendChild(renderCoinsByRow(coin, start + index));
  });
}

  // Row (Same UI as main table)
function renderCoinsByRow(coin, indexNumber) {
  let row = document.createElement("tr");
  row.setAttribute("data-id", coin.id);

  row.innerHTML = `
    <td>${indexNumber + 1}</td>
    <td><img src="${coin.image}" width="20"/></td>
    <td>${coin.name}</td>
    <td>$${coin.current_price.toLocaleString()}</td>
    <td>$${coin.total_volume.toLocaleString()}</td>
    <td>$${coin.market_cap.toLocaleString()}</td>

    <!-- REMOVE button -->
    <td>
      <i class="fa-solid fa-trash"
         data-id="${coin.id}"
         style="color:rgb(243,111,23); cursor:pointer;">
      </i>
    </td>
  `;
  return row;
}

  // Pagination Ui control
function updatePaginationUI() {
  const totalPages = Math.ceil(allFavCoins.length / itemsPerPage);

  // Show pagination only when more than 25 favourite coins
  pagination.style.display = totalPages > 1 ? "flex" : "none";

  // first page prev disable
  if (currentPage === 1) {
    prevBtn.disabled = true;
    prevBtn.classList.add("disabled-btn");
  } else {
    prevBtn.disabled = false;
    prevBtn.classList.remove("disabled-btn");
  }

  // last page next disable
  if (currentPage === totalPages) {
    nextBtn.disabled = true;
    nextBtn.classList.add("disabled-btn");
  } else {
    nextBtn.disabled = false;
    nextBtn.classList.remove("disabled-btn");
  }
}

  // pagination click button
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage();
    updatePaginationUI();
  }
});

nextBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(allFavCoins.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderPage();
    updatePaginationUI();
  }
});

  // Remove from fav
function handleRemove(coinId) {
  let favList = JSON.parse(localStorage.getItem("favourites")) || [];

  // Remove clicked coin
  favList = favList.filter(id => id !== coinId);

  // Save again
  localStorage.setItem("favourites", JSON.stringify(favList));

  // Re-fetch updated list
  fetchedfavCoins();
}

  //remove and click event
document.addEventListener("click", (e) => {
  // Trash button → Remove Favourite
  if (e.target.classList.contains("fa-trash")) {
    handleRemove(e.target.dataset.id);
    return;
  }

  // Clicking a row → open coin details page
  const row = e.target.closest("tr");
  if (!row || row.parentElement.tagName !== "TBODY") return;

  window.location.href = `coin.html?id=${row.dataset.id}`;
});

  // Sorting manage pagination button
const handleSortPrice = (order) => {
  allFavCoins.sort((a, b) =>
    order === "asc" ? a.current_price - b.current_price : b.current_price - a.current_price
  );

  currentPage = 1;
  renderPage();
  updatePaginationUI();
};

const handleSortVolume = (order) => {
  allFavCoins.sort((a, b) =>
    order === "asc" ? a.total_volume - b.total_volume : b.total_volume - a.total_volume
  );

  currentPage = 1;
  renderPage();
  updatePaginationUI();
};

const handleSortMarketCap = (order) => {
  allFavCoins.sort((a, b) =>
    order === "asc" ? a.market_cap - b.market_cap : b.market_cap - a.market_cap
  );

  currentPage = 1;
  renderPage();
  updatePaginationUI();
};

document.addEventListener("DOMContentLoaded", fetchedfavCoins);