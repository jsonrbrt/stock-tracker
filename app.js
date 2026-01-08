// API_KEY is available globally

// Access elements within the app
const input = document.getElementById("stock-input");
const searchButton = document.getElementById("search-btn");
const stockCard = document.getElementById("stock-card");
const pickerModal = document.getElementById("picker-modal");
const pickerList = document.getElementById("picker-list");
const closeModalBtn = document.getElementById("close-modal");

// Event listener for the search button
searchButton.addEventListener("click", async () => {
  const query = input.value.trim().toUpperCase();
  if (!query) return;

  showLoading();

  const matches = await searchStocks(query);

  if (!matches) {
    stockCard.textContent = "No data found.";
    return;
  }
  
  if (matches.length === 1) {
    const stock = await fetchStockData(matches[0].symbol);
    if (stock) renderStockCard(stock);
    return;
  }
  showPickerModal(matches);
});

// Function to fetch the stock data from API source
async function fetchStockData(symbol) {
  const url = `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API request failed (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    showError(error.message);
    return null;
  }
}

// Return a list of stocks from the text input field
async function searchStocks(query) {
  const url = `https://api.twelvedata.com/symbol_search?symbol=${query}&apikey=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return null;
    }

    return data.data; // array of matches
  } catch (error) {
    showError(error.message);
    return null;
  }
}

// Render the stock card
function renderStockCard(data) {
  const name = data.name;
  const tickerSymbol = data.symbol;
  const price = Math.round(data.close * 100) / 100;
  const change = Math.round(data.percent_change * 100) / 100;
  const changeColor = change >= 0 ? "green" : "red";
  const open = Number(data.open).toFixed(2);
  const high = Number(data.high).toFixed(2);
  const low = Number(data.low).toFixed(2);
  const volume = Number(data.volume).toFixed(2);

  stockCard.innerHTML = `
  <div class="stock-card">
    <h2>${tickerSymbol} - ${name}</h2>
    <p><strong>Price:</strong> $${price}</p>
    <p style="color: ${changeColor}";><strong>Change:</strong> ${change}%</p>
    <div class="extra-data">
      <h4>Daily Stats</h4>
      <p><strong>Open:</strong> $${open}</p>
      <p><strong>High:</strong> $${high}</p>
      <p><strong>Low:</strong> $${low}</p>
      <p><strong>Volume:</strong> $${volume}</p>
    </div>
    <button id="watchlist-btn">Add to watchlist</button>
  </div>
  `;

  const watchlistButton = document.getElementById("watchlist-btn");

  watchlistButton.addEventListener("click", () => {
    const list = getWatchlist();

    if (!list.includes(tickerSymbol)) {
      list.push(tickerSymbol);
      saveWatchlist(list);
      alert(`${tickerSymbol} added to watchlist!`);
      renderWatchlist();
    } else {
      alert(`${tickerSymbol} is already in watchlist.`);
    }
  });

  localStorage.setItem("lastViewed", tickerSymbol);
}

const watchlistCardsContainer = document.getElementById(
  "watchlist-cards-container"
);

// Render the stock watchlist card
function renderWatchlistCard(data, symbol) {
  const name = data.name;
  const tickerSymbol = symbol;
  const price = Math.round(data.close * 100) / 100;
  const change = Math.round(data.percent_change * 100) / 100;
  const changeColor = change >= 0 ? "green" : "red";

  watchlistCardsContainer.innerHTML += `
  <div class="watchlist-card">
    <h2>${tickerSymbol} - ${name}</h2>
    <p>
      <strong>Price:</strong> 
      $<span class="current-price">${price}</span>
    </p>
    <p style="color: ${changeColor}";><strong>Change:</strong> ${change}%</p>

    <label>
      Shares owned:
      <input
        type="number"
        class="shares-input"
        min=0
        placeholder=0
        />
    </label>

    <p>
      Total value: $
      <span class="total-value">0.00</span>
    </p>
  </div>
  `;

  initializeShareInputs();
  updatePortfolioTotal();

  console.log("renderWatchlistCard called with:", data, symbol);
}

// Helper function to access watchlist item
function getWatchlist() {
  const saved = localStorage.getItem("watchlist");
  return saved ? JSON.parse(saved) : [];
}

// Helper function to save watchlist item
function saveWatchlist(list) {
  localStorage.setItem("watchlist", JSON.stringify(list));
}

// Render the watchlist container
const watchlistContainer = document.getElementById("watchlist");

function renderWatchlist() {
  const list = getWatchlist();

  if (list.length === 0) {
    watchlistContainer.innerHTML = "<p>No stocks in watchlist.</p>";
    return;
  }

  watchlistContainer.innerHTML = `
  <h3>Your watchlist</h3>
  <div class="watchlist-list">
    ${list
      .map(
        (symbol) =>
          `<div class="watchlist-item" data-symbol="${symbol}">
          ${symbol}
          <button class="remove-btn" data-symbol="${symbol}">X</button>
          </div>`
      )
      .join("")}
  </div>
  `;

  watchlistCardsContainer.innerHTML = "";
  for (let i = 0; i < list.length; i++) {
    const symbol = list[i];
    fetchStockData(symbol).then((data) => {
      renderWatchlistCard(data, symbol);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderWatchlist();
  initializeShareInputs();
  updatePortfolioTotal();
  const lastViewed = localStorage.getItem("lastViewed");
  if (lastViewed) {
    fetchStockData(lastViewed);
  }
});

document.addEventListener("click", (e) => {
  const item = e.target.closest(".watchlist-item");

  if (item) {
    const symbol = item.dataset.symbol;
    console.log("Watchlist clicked:", symbol); // debug
    fetchStockData(symbol);
  }
});

function removeWatchlist(symbol) {
  const list = getWatchlist();
  const updated = list.filter((item) => item !== symbol);
  saveWatchlist(updated);
  renderWatchlist();
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-btn")) {
    const symbol = e.target.dataset.symbol;
    removeWatchlist(symbol);
    e.stopPropagation();
  }
});

function showLoading() {
  stockCard.innerHTML = `
  <p>Loading...</p>
  `;
}

function showError(message) {
  stockCard.innerHTML = `
  <p>${message}</p>
  `;
}

function initializeShareInputs() {
  document.querySelectorAll(".watchlist-card").forEach((card) => {
    const symbol = card.dataset.symbol;
    const input = card.querySelector(".shares-input");
    const totalEl = card.querySelector(".total-value");
    const priceEl = card.querySelector(".current-price");

    // Load saved value from localStorage
    const savedShares = Number(localStorage.getItem(symbol) || 0);
    input.value = savedShares;
    totalEl.textContent = (savedShares * Number(priceEl.textContent)).toFixed(
      2
    );

    // Update localStorage and total value on input change
    input.addEventListener("input", () => {
      const shares = Number(input.value || 0);
      localStorage.setItem(symbol, shares);

      const price = Number(priceEl.textContent);
      totalEl.textContent = (shares * price).toFixed(2);
      updatePortfolioTotal();
    });
  });
}

function updatePortfolioTotal() {
  let total = 0;

  document.querySelectorAll('.watchlist-card').forEach(card => {
    const price = Number(card.querySelector('.current-price').textContent
  );
    const shares = Number(card.querySelector('.shares-input').value || 0
  );

  total += price*shares;
  });

  document.getElementById('portfolio-total').textContent = total.toFixed(2);
}

// Function to show the picker modal
function showPickerModal(stocks) {
  pickerList.innerHTML = "";

  stocks.forEach(stock => {
    const li = document.createElement("li");
    li.textContent = `${stock.symbol} - ${stock.instrument_name}`;

    li.addEventListener("click", async () => {
      pickerModal.classList.add("hidden");
      showLoading();

      const data = await fetchStockData(stock.symbol);
      if (data) renderStockCard(data);
    });

    pickerList.appendChild(li);
  });

  pickerModal.classList.remove("hidden");
}

// Event listener for the close modal button
closeModalBtn.addEventListener("click", () => {
  pickerModal.classList.add("hidden");
});

// Event listener to hide the picker modal
pickerModal.addEventListener("click", (e) => {
  if (e.target === pickerModal) {
    pickerModal.classList.add("hidden");
  }
});

// Stock market lookup app

// This stock market lookup app fetches stock data via API where user can use the text input field to search for a particular stock by typing the name of the company or the stock ticker.
// User can also add stocks to their watchlist and calculate the total value of their portfolio by entering the amount of stocks they owned.

// This app is build with:
// • HTML5
// • CSS
// • JavaScript
// • Stock data uses TwelveData's API

// To view and run this project locally, follow these simple steps:

// Clone the repository:

  // git clone [YOUR_REPO_URL]

// Navigate to the project directory:

  // cd javascript-calculator

// Open the file: Open the index.html file in your preferred web browser (e.g., Chrome, Firefox).

  //open index.html 