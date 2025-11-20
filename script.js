let coins = [];
let currentPage =1;
let itemPerpage = 25;
let favList =[];
let paginationContainer = document.querySelector(".pagination");

function renderCoinsByRow(coin, index){
  const favList = getFavs();
  const isFavorite = favList.includes(coin.id);
  
  let row = document.createElement("tr");
  row.setAttribute("data-id", coin.id);

  const count = (currentPage - 1) * itemPerpage + (index + 1);

  row.innerHTML = `
    <td>${count}</td>             
    <td><img src="${coin.image}" alt="${coin.name}" width="16" height="16"/></td>
    <td>${coin.name}</td>
    <td>$${coin.current_price.toLocaleString()}</td>
    <td>$${coin.total_volume.toLocaleString()}</td>
    <td>$${coin.market_cap.toLocaleString()}</td>    
    <td><i class="fa-solid fa-star ${isFavorite ? "favourite" : ""}" 
         style="color: ${isFavorite ? "gold" : "#74C0FC"};" 
         data-id="${coin.id}">
      </i></td>
  `;
  return row;
}

function renderCoins(coins){
  let tbody = document.querySelector("tbody");
  tbody.innerHTML = ``;
  coins.forEach((coin,index)=> {
    let row = renderCoinsByRow(coin, index);
    tbody.appendChild(row);
  });
  setupFavoriteListeners();
}

// show shimmer
const showShimmer=()=>{
  document.querySelector(".shimmer-container").style.display="block";
  paginationContainer.style.display="none";
}

// hide shimmer
const hideShimmer=()=>{
  document.querySelector(".shimmer-container").style.display="none";
  paginationContainer.style.display="flex";
}

function setupFavoriteListeners() {
  const stars = document.getElementsByClassName("fa-star");
  Array.from(stars).forEach(star => {
    star.addEventListener("click", addFav);
  });
}

async function fetchCoins(){
    let title = document.querySelector(".no-data");
    let table = document.querySelector("table");

  try{
    showShimmer();
    let res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${itemPerpage}&page=${currentPage}&order=market_cap_desc`);
    coins = await res.json(); 

    if(coins.length==0){
        console.error("no coin fetched");

        title.style.display = "block";
        table.style.display="none";
        paginationContainer.style.display="none";

        return;
    }

    console.log("fetched coins", coins);
    renderCoins(coins);
    
  }
  catch(err){
    console.log("Error fetching the coins", err); 
  } finally{
    hideShimmer();
  }
}

// favourites
function getFavs() {
  return JSON.parse(localStorage.getItem("favourites")) || [];
}

function saveFav(favouriteList) {
  localStorage.setItem("favourites", JSON.stringify(favouriteList));
}

function handleFav(coinId) {
  let favList = getFavs();

  if (favList.includes(coinId)) {
    favList = favList.filter(id => id !== coinId);
    alert("❌ Removed from favourites");
  } else {
    favList.push(coinId);
    alert("✅ Added to favourites");
  }

  saveFav(favList);
}

// row-click listener
document.addEventListener("click", (e) => {

  if (e.target.classList.contains("fa-star")) {
    const coinId = e.target.dataset.id;
    handleFav(coinId);
    renderCoins(coins);
    return; 
  }

  const row = e.target.closest("tr");
  if (!row) return;
  if (row.parentElement.tagName !== "TBODY") return;

  const coinId = row.dataset.id;
  if (coinId) {
    window.location.href = `coin.html?id=${coinId}`;
  }
});

// debounce function -calling  FUNCTION AFTER DELAY
function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

// handle close dialog box
const handleCloseSearchDialog= ()=>{
   const searchDialog = document.querySelector(".dialog-box");
   searchDialog.style.display = "none";
}

// show search resulr
const showSearchResults = (data) => {
  const searchDialog = document.querySelector(".dialog-box");
  const resultList = document.querySelector(".search-content ul");

  resultList.innerHTML = "";

  if (data.coins.length) {
  data.coins.slice(0, 10).forEach((coin) => {
    let listItem = document.createElement("li");

    listItem.dataset.id = coin.id;  

    listItem.innerHTML = `
      <img src="${coin.thumb}" width="20" height="20"/>
      <span>${coin.name}</span>
    `;

    resultList.appendChild(listItem);
  });
  }else {
    resultList.innerHTML = "<li>No coins found</li>";
  }

  // Add click on each li
  resultList.querySelectorAll("li").forEach(item => {
  item.addEventListener("click", (e) => {
    const coinId = e.currentTarget.dataset.id; 
    console.log(coinId, "id");
    window.location.href = `coin.html?id=${coinId}`;
  });
});
  searchDialog.style.display = "block";
};

// search api dialog box
const debouncedSearch = debounce(async () => {
  let searchText = document.querySelector(".search-input").value.trim();

  if (searchText) {
    let results = await fetch(`https://api.coingecko.com/api/v3/search?query=${searchText}`);
    let searchData = await results.json();
    showSearchResults(searchData);
  }
}, 300);


// pagination buttons
function updatePagination() {
  const prev = document.querySelector(".prev-btn");
  const next = document.querySelector(".next-btn");

  // Prev button disable on page 1
  if (currentPage === 1) {
    prev.disabled = true;
    prev.classList.add("disabled-btn");
  } else {
    prev.disabled = false;
    prev.classList.remove("disabled-btn");
  }

  // Next button disable if less than 25 coins fetched
  if (coins.length < itemPerpage || currentPage >= 5) {
    next.disabled = true;
    next.classList.add("disabled-btn");
  } else {
    next.disabled = false;
    next.classList.remove("disabled-btn");
  }
}

// handle prev btn
const handlePrevControls = () => {
  if (currentPage > 1) {
    currentPage--;
    fetchCoins().then(updatePagination);
  }
};

// handle next btn
const handleNextControls = () => {
  currentPage++;
  fetchCoins().then(updatePagination);
};

// handle sorting
const handleSortPrice=(order)=>{
   coins.sort((a,b) =>
    order == "asc" 
    ? a.current_price - b.current_price
    : b.current_price - a.current_price
  );
  renderCoins(coins);
}

const handleSortVolume=(order)=>{
   coins.sort((a,b) =>
    order == "asc" 
    ? a.total_volume - b.total_volume
    : b.total_volume - a.total_volume
  );
  renderCoins(coins);
}

const handleSortMarketCap=(order)=>{
   coins.sort((a,b) =>
    order == "asc" 
    ? a.market_cap - b.market_cap
    : b.market_cap - a.market_cap
  );
  renderCoins(coins);
}

// by clicking icon open
document.querySelector(".search-icon").addEventListener("click", async () => {
  let searchText = document.querySelector(".search-input").value.trim();
  if (!searchText) return;

  let results = await fetch(`https://api.coingecko.com/api/v3/search?query=${searchText}`);
  let data = await results.json();

  if (data.coins.length > 0) {
    let coinId = data.coins[0].id;   
    window.location.href = `coin.html?id=${coinId}`;
  }
});

// keyobard enter button functionality
document.querySelector(".search-input").addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    let searchText = e.target.value.trim();
    if (!searchText) return;

    let results = await fetch(`https://api.coingecko.com/api/v3/search?query=${searchText}`);
    let data = await results.json();

    if (data.coins.length > 0) {
      let coinId = data.coins[0].id;
      window.location.href = `coin.html?id=${coinId}`;
    }
  }
});

document.querySelector(".prev-btn").addEventListener("click",handlePrevControls);
document.querySelector(".next-btn").addEventListener("click",handleNextControls);

document.addEventListener("DOMContentLoaded",()=>{ 
  fetchCoins().then(updatePagination)
});

document.querySelector(".search-input").addEventListener("input", debouncedSearch);
document.querySelector(".search-icon").addEventListener("click", debouncedSearch);
document.querySelector(".close-icon").addEventListener("click", handleCloseSearchDialog);

document.querySelector(".sort-price-asc").addEventListener("click", () => handleSortPrice("asc"));
document.querySelector(".sort-price-desc").addEventListener("click", () => handleSortPrice("desc"));
document.querySelector(".sort-volume-asc").addEventListener("click", () => handleSortVolume("asc"));
document.querySelector(".sort-volume-desc").addEventListener("click", () => handleSortVolume("desc"));
document.querySelector(".cap-sort-asc").addEventListener("click", () => handleSortMarketCap("asc"));
document.querySelector(".cap-sort-desc").addEventListener("click", () => handleSortMarketCap("desc"));











