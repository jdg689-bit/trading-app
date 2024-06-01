const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');

// **********************************************
// SET UP

// database functions
const db = require('./database.js');

// For API key
require('dotenv').config({path:path.join(__dirname, '../', '.env')});

// Configure cors
app.use(cors({
    origin: 'https://jdg689-bit.github.io',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests (CORS)
app.options('*', cors({
    origin: 'https://jdg689-bit.github.io',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

// Cofigure json parsing
app.use(express.json());
// **********************************************

app.get('/', (req, res) => {
    res.send();
})


app.post('/register', async (req, res) => {
    // Add user info to a mongo doc

    try {
        // Connect to db
        const client = await db.connectToDB();

        const newUser = {
            firstname: req.body.firstName,
            lastname: req.body.lastName,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            holdings: [],
            balance: 10_000 // Start user with $10_000
        }

        // See if username is already in use
        const userExists = await db.lookUpUser(client, newUser.username);
        
        if (userExists) {
            console.log(`Username ${newUser.username} is already taken.`)
            res.status(409).send({error: 'Username alread taken'}); // Conflict status code
        } else {
            await db.addUser(client, newUser);
            console.log('New user added successfully');
            res.status(201).send({message: 'User registered successfully'});
        }
    } catch (error) {
        console.error(`Error registering new user: ${error}`);
        res.status(500).send({error: 'Internal server error'});
    }
})


app.post('/login', async (req, res) => {
    // Verify password of existing user

    // Connect to db
    // There would be a better way to do this than calling connectToDB() for every route
    const client = await db.connectToDB();

    const loginUser = req.body.username;
    const loginPassword = req.body.password;

    // Check username exists
    const userExists = await db.lookUpUser(client, loginUser);
    if (!userExists) {
        res.status(401).send({error: 'Username does not exist'});
    }
    else {
        // Verify password for existing user
        const sessionToken = await db.verifyPassword(client, loginUser, loginPassword);
        if (sessionToken) {
            res.send({token: sessionToken});
        }
        else {
            console.log('Incorrect password');
            res.status(401).send({error: 'Incorrect password'});
        }
    }
})


app.post('/make-trade', async (req, res) => {
    // Process buy and sell orders through the database
    const orderDetails = req.body;
    
    // Connect to db
    const client = await db.connectToDB();

    // Update user's document
    // db.makeTrade returns object with following structure
    /*
    {
        error: true/false,
        message: error description
    }
    */
    const tradeCompleted = await db.makeTrade(client, orderDetails);

    if (!tradeCompleted?.error) {
        res.status(200).send({message: tradeCompleted.message});
    } else {
        res.status(422).send({error: tradeCompleted.message})
    }
})



app.post('/quote', async (req, res) => {

    const stock = req.body['stock'];
    const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stock}&interval=5min&apikey=${process.env.API_ACCESS_KEY}`, {
        method: "GET",
    })

    // Get response from API
    if (!response.ok) {
        throw new Error('Failed API fetch request');
    }

    // View alphavantage docs for specifics about structure of response object
    // Interested in getting the last available price only
    const data = await response.json();
    console.log(data)
    if (data['Error Message']) {
        res.status(400).send(); // 400 = Bad Request
    } else {
        const lastTimestamp = Object.keys(data['Time Series (5min)'])[0];
        const lastClosePrice = data['Time Series (5min)'][lastTimestamp]['4. close'];
    
        res.send(JSON.stringify({"closing": lastClosePrice}));
    }
})


app.post('/autocomplete', async (req, res) => {
    const text = req.body['text'];

    // Make fetch request
    try {
        const response = await fetch(`https://alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${text}&apikey=${process.env.API_ACCESS_KEY}`)
        if(!response.ok) {
            throw new Error('Response from API is not OK.')
        }
        const data = await response.json()

        // data is a list of matches, each with multiple properties, only interested in name of match
        const suggestions = [];
        data['bestMatches'].forEach(match => {
            if (match['8. currency'] == 'USD') { // Only include US markets for now
                suggestions.push({'symbol': match['1. symbol'], 'name': match['2. name']})
            }
        });
        console.log(suggestions);
        
        // return list of matches to the front end
        res.send(JSON.stringify({"suggestions": suggestions}));

    } catch (error) {
        console.error(`There was error with the fetch request: ${error}`);
    }

    // res.send('') // Send response regardless of try/catch outcome
})


app.post('/holdings', async (req, res) => {
    // Make database request for the relevant users' document
    // Return an object with info on current positions

    // Retrieve token from request body
    const token = req.body['token'];
    
    // Connect to database
    const client = await db.connectToDB();

    // Find embedded holdings document within user doc
    const holdings = await db.getHoldings(client, token);

    res.status(200).send(JSON.stringify(holdings));
})


app.post('/get-prices', async (req, res) => {
    // User is accessing portfolio and needs current prices of all stocks held
    // POST request includes array of all portfolio stock tickers
    // RESPOND with prices
    const data = req.body;


    // Iterate over stock tickers, making db request for last price
    try {
        const lastPrices = await Promise.all(data.map(async (stock) => { // use Promise.all to await all fetch requests called in map

            const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stock}&interval=5min&apikey=${process.env.API_ACCESS_KEY}`, {
                method: "GET",
            })
        
            if (!response.ok) {
                throw new Error('Failed API fetch request');
            }
    
            // This code is the same as /quote -> can probably DRY this up
            const data = await response.json();
            const lastTimestamp = Object.keys(data['Time Series (5min)'])[0];
            const lastClosePrice = data['Time Series (5min)'][lastTimestamp]['4. close'];
    
            const lastPrice = {stock: stock, price: Number(lastClosePrice)};
    
            return lastPrice;
        }));
    
        res.send(JSON.stringify(lastPrices));

    } catch (error) {
        console.error(`Error retrieveing most recent price info: ${error}`);
    }
})

// Heroku dynamically assigns your app a PORT
app.listen(process.env.PORT || 3000)