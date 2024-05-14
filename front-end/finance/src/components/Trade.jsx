import { useState, useEffect } from "react";
import updateTrade from "./updateTrade";

async function companySearch(text, setSuggestions) {
    // Called when stock name input changes, offers autocomplete suggestions for company name
    // API request made directly from front-end

    // API KEY is accessible from the back-end, POST other neccessary information to the back-end
    try {

        const response = await fetch(`http://localhost:3000/autocomplete`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({"text": text})
        });
        if (!response.ok) {
            throw new Error('Server response was not OK')
        }

        const suggestions = await response.json();
        setSuggestions(suggestions['suggestions']);

    } catch (error) {
        console.error(`There was an error with the fetch request: ${error}`)
    }
}

async function getStockPrice(symbol, setStockPrice) {
    // Request price from API, can use same express route as /quote
    try {
        const response = await fetch('http://localhost:3000/quote', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({"stock": symbol})
        });
        if (!response.ok) {
            throw new Error('Server response was not OK');
        }
        const lastPrice = await response.json();
        setStockPrice(Number(lastPrice.closing));
    } catch (error) {
        console.error(`There was an error with the getStockPrice fetch request: ${error}`)
    }
}


function AutoSuggestions({ suggestions, setStock, setShowSuggestions, setStockPrice}) {
    // Renders dropdown autocomplete suggestions based off of matching companies in the API

    // On first render, suggestions is an empty string. Trying to call .map on empty string = error
    if (!suggestions) {
        return null; 
    } else {
        // Map json suggestions into array of JSX nodes for rendering
        const listItems = suggestions.map(suggestion => {
            return (
                <li 
                    key={suggestion.symbol} 
                    className="suggestion-container"
                    onClick={() => {
                        setStock(suggestion.symbol); // clicking suggestion needs to complete the text input
                        setShowSuggestions(false); // it also needs to hide the drop down menu
                        getStockPrice(suggestion.symbol, setStockPrice);
                    }} 
                >
                    <p className="company-symbol"><b>{suggestion.symbol}</b></p>
                    <p className="company-name">{suggestion.name}</p>
                </li>
            )
        })

        return (
            <ul id="company-suggestions">{listItems}</ul>
        )
    }
}


async function makeTrade(orderDetails) {
    // Execute a buy or sell order
    // For now this just changes the qty of a stock in the users mongo doc - account balance is not considered or updated
    orderDetails.event.preventDefault();

    // Get token from browser
    const sessionStorageToken = sessionStorage.token;
    const parsedToken = JSON.parse(sessionStorageToken);
    const token = parsedToken.token;

    orderDetails.token = token;

    // Make fetch request to server.js
    try {
        const response = await fetch('http://localhost:3000/make-trade', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(orderDetails)
        });

        if (!response.ok) {
            if (response?.status == 422) {
                // Alert user of trade errors
                const data = await response.json()
                alert(data.error);
            }
            throw new Error('Server response from /make-trade was not ok.')
        }

        const data = await response.json()
        alert(data.message);


    } catch (error) {
        console.error(`Error making /trade fetch request: ${error}`);
    }
}



export default function Trade() {
    const [stock, setStock] = useState('');
    const [suggestions, setSuggestions] = useState(''); // This is for the autocomplete feature
    const [showSuggestions, setShowSuggestions] = useState(true); // Show or hide the autocomplete options on click
    const [stockPrice, setStockPrice] = useState(0); // Save price of selected stock, get total when qty is entered
    const [quantity, setQuantity] = useState('');
    const [orderType, setOrderType] = useState('buy'); // BUY checked by default
    const [orderValue, setOrderValue] = useState(0);
    const [brokerageFee, setBrokerageFee] = useState(0);
    const [orderTotal, setOrderTotal] = useState(0);

    // Organise effect parameters
    const effectValues = {
        stockPrice,
        quantity,
        orderType,
        brokerageFee,
    };

    const effectSetStates = {
        setOrderValue,
        setBrokerageFee,
        setOrderTotal,
    }

    useEffect(() => {
        updateTrade(effectValues, effectSetStates);
    }, [stockPrice, quantity, orderType]); // Call useEffect if any of these dependencies change

    return (
        <>
            <form id="order-form">
                <div className="field-container">
                    <label htmlFor="stock">Code: </label>
                    <input 
                        type="text" 
                        id="stock" 
                        placeholder="Start typing company name or stock ticker"
                        value={stock}
                        onChange={(event) => {
                            setStock(event.target.value);
                            setShowSuggestions(true);
                            companySearch(event.target.value, setSuggestions);
                        }}
                        style={{width: "250px"}} 
                    />
                    {showSuggestions && (
                        <AutoSuggestions 
                        suggestions={suggestions}
                        setShowSuggestions={setShowSuggestions}
                        setStock={setStock}
                        setStockPrice={setStockPrice}
                        />
                    )}
                </div>
                <div className="field-container">
                    <label htmlFor="order-type">Order Type: </label>
                    <div id="order-type" style={{display:"inline-block"}}>

                            <input 
                                type="radio" 
                                id="buy" 
                                name="order-type"
                                defaultChecked={true} 
                                onClick={() => setOrderType('buy')}
                            ></input>
                            <label htmlFor="buy" style={{color:"green"}}>BUY</label>

                            <input 
                                type="radio" 
                                id="sell" 
                                name="order-type" 
                                onClick={() => setOrderType('sell')}
                                ></input>
                            <label htmlFor="buy" style={{color:"red"}}>SELL</label>
                    </div>
                </div>
                <div className="field-container">
                    <label htmlFor="quantity">Quantity: </label>
                    <input 
                        type="number"
                        id="quantity"
                        value={quantity}
                        onChange={(event) => setQuantity(event.target.value)} 
                    />
                </div> 
            </form>

            <div className="estimate-header">
                <p><b>Order Estimate</b></p>
            </div>

            <div className="order-details-container">
                <table className="order-details">
                    <tbody>
                        <tr>
                            <th><b>Market Price ($):</b></th>
                            <td>{stockPrice.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <th><b>Order Value ($):</b></th>
                            <td>{orderValue.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <th><b>Brokerage & Cost ($):</b></th>
                            <td>{brokerageFee.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <th><b>Total ($):</b></th>
                            <td className="total">{orderTotal.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <button id="submit-trade" onClick={() => {
                const orderDetails = {
                    event,
                    stock,
                    stockPrice,
                    quantity,
                    orderType,
                    orderTotal,
                }
                makeTrade(orderDetails)
                }}
            >Proceed</button>
        </>
    )
}