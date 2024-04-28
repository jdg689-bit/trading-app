import { useState } from "react"

// Demo suggestions to test autocomplete functionality since API request limit reached
const DEMO_SUGGESTIONS = [
    'WOOLWORTHS LIMITED',
    'COMMONWEALTH BANK OF AUSTRALIA',
    'APPLE',
    'NETFLIX',
    'TESLA',
]

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
        setStockPrice(lastPrice.closing);
    } catch (error) {
        console.error(`There was an error with the getStockPrice fetch request: ${error}`)
    }
}


function AutoSuggestions({ suggestions, setStock, setShowSuggestions, setStockPrice }) {
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


export default function Trade() {
    const [stock, setStock] = useState('')
    const [suggestions, setSuggestions] = useState('') // This is for the autocomplete feature
    const [showSuggestions, setShowSuggestions] = useState(true); // Show or hide the autocomplete options on click
    const [stockPrice, setStockPrice] = useState(0); // Save price of selected stock, get total when qty is entered
    const [quantity, setQuantity] = useState('')
    const [orderValue, setOrderValue] = useState((0).toFixed(2));
    const [brokerageFee, setBrokerageFee] = useState((0).toFixed(2));

    return (
        <>
            <form>
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

                            <input type="radio" id="buy"></input>
                            <label htmlFor="buy" style={{color:"green"}}>BUY</label>

                            <input type="radio" id="sell"></input>
                            <label htmlFor="buy" style={{color:"red"}}>SELL</label>
                    </div>
                </div>
                <div className="field-container">
                    <label htmlFor="quantity">Quantity: </label>
                    <input 
                        type="number"
                        id="quantity"
                        value={quantity}
                        onChange={event => {
                            setQuantity(event.target.value);
                            setOrderValue((event.target.value * stockPrice).toFixed(2));
                            setBrokerageFee(() => {
                                const orderValue = event.target.value * stockPrice;
                                // Set brokerage amount based on transaction value
                                if (orderValue > 25000) {
                                    return (orderValue * 0.12).toFixed(2);
                                } else if (orderValue <= 25000 && orderValue > 10000) {
                                    return 29.95;
                                } else if (orderValue <= 10000 && orderValue > 3000) {
                                    return 19.95;
                                } else if (orderValue <= 3000 && orderValue > 1000) {
                                    return 10.00.toFixed(2);
                                } else {
                                    return 5.00.toFixed(2);
                                }
                            })
                        }} 
                    />
                </div>    
            </form>

            <div className="estimate-header">
                <p><b>Order Estimate</b></p>
            </div>

            <div className="order-details-container">
                <table className="order-details">
                    <tr>
                        <th><b>Order Value ($):</b></th>
                        <td>{orderValue}</td>
                    </tr>
                    <tr>
                        <th><b>Brokerage & Cost ($):</b></th>
                        <td>{brokerageFee}</td>
                    </tr>
                    <tr>
                        <th><b>Total ($):</b></th>
                        <td className="total">{(Number(orderValue) + Number(brokerageFee)).toFixed(2)}</td>
                    </tr>
                </table>
            </div>
            <button id="submit-trade">Proceed</button>
        </>
    )
}