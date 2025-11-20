document.addEventListener("DOMContentLoaded", async () => {

    const urlParams = new URLSearchParams(window.location.search);
    const coinId = urlParams.get("id");

    const container = document.getElementById("coin-container");
    const coinimg = document.getElementById("coin-image");
    const coinName = document.getElementById("coin-name");
    const coinDesc = document.getElementById("coin-desc");
    const coinRank = document.getElementById("coin-rank");
    const coinPrice = document.getElementById("coin-price");
    const coinCap = document.getElementById("coin-cap");

    async function fetchCoinData() {
        try {
            const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
            const data = await res.json();
            displayData(data);
        }
        catch (err) {
            console.log("Error fetching coin:", err);
        }
    }

    function displayData(coin) {

        container.style.display = "block";

        coinimg.src = coin.image.large;
        coinName.innerHTML = coin.name;
        coinDesc.innerHTML = coin.description.en.split(". ")[0] + ".";

        coinRank.innerHTML = coin.market_cap_rank;
        coinPrice.innerHTML = coin.market_data.current_price.usd.toLocaleString();
        coinCap.innerHTML = coin.market_data.market_cap.usd.toLocaleString();
    }

    let coinData = await fetchCoinData();

    const ctx = document.getElementById('coinChart').getContext("2d");

    let coinChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
               {
                label: 'Price(USD)',
                data: [],  
                borderWidth: 1,
                borderColor: "#F16222",
                backgroundColor: "lightyellow",
                fill:true
               }],
        },
        options: {
            scales: {
                x:{
                    grid:{display:false},
                    title:{
                        display: true,
                        text:"Date",
                    },
                },
                y: {
                    beginAtZero: false,
                    title:{
                        display:true,
                        text:'Price(USD)'
                    },
                    ticks: {
                        //include a dollar sign in the ticks
                        callback: function(value) {
                            return `$${value}`;
                        }
                     },
                },
            },
        },
    });

    async function fetchChartData(days){
        let res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
        let data= await res.json();
        updateChart(data);
    }

    function updateChart(data) {
    const labels = data.prices.map(price => {
        let date = new Date(price[0]);     
        return date.toLocaleDateString();  
    });

    const priceData = data.prices.map(price => price[1]);

    coinChart.data.labels = labels;
    coinChart.data.datasets[0].data = priceData;
    coinChart.update();
}

const buttons = document.querySelectorAll(".btn-container button");

buttons.forEach(btn => {
    btn.addEventListener("click", (event) => {
        buttons.forEach(b => b.classList.remove("active"));
        event.target.classList.add("active");
        const id = event.target.id;
        const days = id === '24h' ? 1 : id === '30d' ? 30 : 90;

        fetchChartData(days);
    });
});

// Load default 24h chart
fetchChartData(1);
document.getElementById("24h").classList.add("active");

// favourites
function getFavorites() {
  return JSON.parse(localStorage.getItem("favourites")) || [];
}

function saveFavorites(list) {
  localStorage.setItem("favourites", JSON.stringify(list));
}

function toggleFav() {
  let list = getFavorites();

  if (list.includes(coinId)) {
    list = list.filter(id => id !== coinId);
    alert("❌ Removed from favourites");
  } else {
    list.push(coinId);
    alert("✅ Added to favourites");
  }

  saveFavorites(list);
  updateFavText(); 
}

function updateFavText() {
  const list = getFavorites();
  const btn = document.querySelector("#add-fav-btn");

  btn.textContent = list.includes(coinId)
    ? "Remove from Favourites"
    : "Add to Favourites";
}

// run at page load
updateFavText();

document.querySelector("#add-fav-btn").addEventListener("click", toggleFav);
});