# Stock Market Tracker

A vanilla JavaScript stock market application that allows users to search for stocks, view real-time price data, manage a watchlist, and track the total value of their portfolio.

The app integrates with the **Twelve Data API** to fetch live market data and demonstrates asynchronous JavaScript, API integration, and local data persistence.

---

## Features

- Search stocks by **ticker symbol or company name**
- View real-time stock data including:
  - Current price
  - Daily percentage change
  - Open, high, low, and volume
- Add stocks to a watchlist
- Enter number of shares owned per stock
- Automatically calculates **total value per stock**
- Displays **total portfolio value**
- Stores data using **localStorage**
- Picker modal when multiple stocks match a search query

---

## Built with

- **HTML5**
- **CSS**
- **Vanilla JavaScript(ES6+)**
- **Twelve Data API**

---

## API and Security

This project uses the Twelve Data API.

**Note:**
- To run the project, you will need to create your own API key.
- Create a free API key at https://twelvedata.com
- Copy 'config.example.js'
- Rename it to 'config.js'
- Add your API key inside

API keys are stored locally and are **not committed** to the repository.


---

## How to run locally

1. **Clone the repository**
```bash
git clone https://github.com/jsonrbrt/stock-tracker.git
```

2. Navigate to the project directory

cd your-repo-name

3. Add your API key

Create a file (or update your JS file) with:
const API_KEY = "Your_API_key_here";

4. Open the app

Open index.html in your browser

---

## Takeaways
- Working with third-party APIs using fetch and async/await
- Handling query parameters and API response errors
- Managing application state with localStorage
- Building dynamic UI components without frameworks
- Implementing user-friendly error handling and loading states

---

## License
This project is licensed under the **MIT License**.