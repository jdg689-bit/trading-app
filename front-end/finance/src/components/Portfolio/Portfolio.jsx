import { React, useEffect, useState } from "react";
import './Portfolio.css';
import { Link } from "react-router-dom";

async function getHoldings() {
    // Request portfolio information from server

    // DB needs unique user token to find relevant document
    const sessionStorageToken = sessionStorage.token;
    const parsedToken = JSON.parse(sessionStorageToken);
    const token = parsedToken.token;

    // Make fetch request
    try {
        const response = await fetch('https://trading-platform-e1f89da02b4b.herokuapp.com/holdings', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({token: token})
        });

        if (!response.ok) {
            throw new Error(`Server response from /holdings was not ok.`)
        }

        const holdings = await response.json();

        return holdings;

    } catch (error) {
        console.error(`There was an error with the requestHoldings fetch request: ${error}`)
    }
}


async function getLastPrices(stocksHeld) {
    // Get most recent closing prices for array of stocks provided

    try {
        const response = await fetch('https://trading-platform-e1f89da02b4b.herokuapp.com/get-prices', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(stocksHeld)
        })

        if (!response.ok) {
            throw new Error('Server response from /get-prices was not ok.')
        }

        const data = await response.json();

        return data;

    } catch (error) {
        console.error(`There was an error with the getLastPrices fetch request: ${error}`);
    }
}


export default function Portfolio() {
    // Main page component

    const [portfolio, setPortfolio] = useState(null);
    const [latestPrices, setLatestPrices] = useState(null);

    useEffect(() => {
        // Get portfolio from database, use effect hook to handle async behaviour

        async function fetchPortfolio() {
            // Call getHoldings() and update state
            try {
                const holdings = await getHoldings();
                setPortfolio(holdings);
            } catch (error) {
                console.error(`Error retrieving holdings: ${error}`);
            }
        }

        fetchPortfolio(); 

    }, []); // Empty dependency array, effect called only after inital render when the component mounts


    useEffect(() => {
        // Another effect hook to handle additional async calls

        if (portfolio) { // Don't execute on initial render; portfolio == null
            async function fetchLastPrices() {
                // API request for current stock prices
                
                try {
                    const stocksHeld = portfolio.holdings.map(holding => holding.stock);
    
                    // lastPrices = [{stock, price}, {stock, price}, ...]
                    const lastPrices = await getLastPrices(stocksHeld);
                    setLatestPrices(lastPrices);

                } catch (error) {
                    console.error(`Error retrieving last prices: ${error}`);
                }
            }

            fetchLastPrices();

        }
    }, [portfolio]); // Call effect when portfolio state updates (i.e. portfolio fetch request has completed)


    // *****************
    // DEFINE TABLE ROWS
    // *****************
    let tableRows = (portfolio == null || latestPrices == null) ? null : portfolio.holdings.map((holding) => {
        // Destructure holding object 
        let {stock, quantity, purchase_price} = holding;
        purchase_price = Number(purchase_price); // Convert to number so toFixed() can be applied

        // Calculate table data
        const lastPrice = (latestPrices.find(result => result.stock == stock)).price;
        const marketVal = lastPrice * quantity;
        const profit = marketVal - (quantity * purchase_price);
        const profit_percent = (profit / (quantity * purchase_price) * 100);

        return (
            <tr key={`${stock}-data`}>
                <td>{stock}</td>
                <td>{quantity}</td>
                <td>{purchase_price.toFixed(2)}</td>
                <td>{lastPrice.toFixed(2)}</td>
                <td>{marketVal.toFixed(2)}</td>
                <td>{profit.toFixed(2)}</td>
                <td>{profit_percent.toFixed(2)}</td>
            </tr>
        )
    });

    // Page content
    return (
        <>
            <h2>Portfolio</h2>
            <table className="holdings-table">
                <thead>
                    <tr>
                        <th className="empty"></th>
                        <th className="empty"></th>
                        <th className="empty"></th>
                        <th className="empty"></th>
                        <th className="empty"></th>
                        <th>CASH $</th>
                        <th>{portfolio?.balance.toFixed(2)}</th>
                    </tr>
                </thead>
                <thead>
                    <tr>
                        <th>CODE</th>
                        <th>AVAIL UNITS</th>
                        <th>PURCHASE $</th>
                        <th>LAST $</th>
                        <th>MARKET VALUE $</th>
                        <th>PROFIT/LOSS $</th>
                        <th>P/L %</th>
                    </tr>
                </thead>
                <tbody>
                    {tableRows}
                </tbody>
            </table>

            {!portfolio && 
                <div className="loading-table">LOADING...</div>}

            {portfolio?.holdings.length == 0 &&
                <div className="no-holdings">
                    <p>You don't hold any positions. Visit <Link to={'/trade'}>Trade</Link> to make a trade.</p>
                </div>
            }
        </>
    )
}