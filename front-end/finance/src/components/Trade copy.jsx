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


function AutoSuggestions({ suggestions, setStock, setShowSuggestions }) {
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
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [quantity, setQuantity] = useState('')

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
                        onChange={event => setQuantity(event.target.value)} />
                </div>    
            </form>

            <div className="estimate-header">
                <p><b>Order Estimate</b></p>
            </div>

            <div className="order-details">
                <ul>
                    <li>Order Value ($)</li>
                    <li>Brokerage & Cost ($)</li>
                    <li>Total ($)</li>
                </ul>
            </div>
        </>
    )
}