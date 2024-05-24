import {useState, React} from 'react';


function PriceInfo({quoteMade, stock, price}) {
    if (quoteMade) {
        return (
            <>
                <p>{`${stock} is currently priced at $${price} per share.`}</p>
            </>
        );
    } else {
        return null;
    }
}


export default function Quote() {
    // Create form with controlled input
    const [stock, setStock] = useState('');
    const [price, setPrice] = useState('');
    const [quoteMade, setQuoteMade] = useState(false) // use to conditonally render price on successful quote
    
    // onSubmit send a request to the API using the input value
    const handleSubmit = async (event) => {
        // Prevent default form behaviour
        event.preventDefault();

        // DIRECT API REQUEST
        /*
        const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=5min&apikey=0RXJZRX0OACT4GV2`);
        const price = await response.json();
        console.log(price);
        */

        // POST stock to back end -> back end will GET stock data from API and return
        try {
            const response = await fetch('http://www.localhost:3000/quote', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({"stock": stock})
            });
    
            if (!response.ok) {
                if (response.status == 400) { // user has typed an invalid stock symbol
                    alert(`Could not find ${stock} in our database.`)
                }

                throw new Error(`Server response from /quote was not ok.`)
            }

            const data = await response.json();
            setPrice(data['closing']);
            setQuoteMade(true); // Triggers render of PriceInfo component

        } catch (error) {
            console.error(`Error quoting stock price: ${error}`);
        }
    }

    
    return (
        <>
            <form>
                <input 
                    type="text" 
                    id="ticker" 
                    value={stock}
                    onChange={(e) => {
                        setStock(e.target.value)
                        setQuoteMade(false);
                    }} 
                />
                <button onClick={handleSubmit}>Get Quote</button>
            </form>

            <PriceInfo
                quoteMade={quoteMade}
                stock={stock}
                price={price} 
            />
        </>
    )
}