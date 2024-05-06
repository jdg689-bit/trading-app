const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// **********************************************
// SET UP

// database functions
const db = require('./database');

// For API key
require('dotenv').config({path:path.join(__dirname, '../', '.env')});

// Configure cors
const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
}));

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

    const sessionToken = await db.verifyPassword(client, loginUser, loginPassword);
    if (sessionToken) {
        res.send({token: sessionToken});
    }
    else {
        console.log('Incorrect password');
        res.status(401).send({error: 'Incorrect password'});
    }
})


app.post('/make-trade', async (req, res) => {
    // Just confirm order details were posted correctly for now
    const orderDetails = req.body;
    console.log(orderDetails);
    
    // Connect to db
    const client = await db.connectToDB();

    // Update user's document
    const tradeComplete = await db.makeTrade(client, orderDetails);

    // Make sure you change this later
    res.status(200).send();
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
    const lastTimestamp = Object.keys(data['Time Series (5min)'])[0];
    const lastClosePrice = data['Time Series (5min)'][lastTimestamp]['4. close'];

    res.send(JSON.stringify({"closing": lastClosePrice}));
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


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})