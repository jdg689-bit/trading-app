const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

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


app.get('/', (req, res) => {
    res.send();
})


app.post('/register', async (req, res) => {

    // add credentials to a mongo doc
    const client = await db.connectToDB();

    const newUser = {
        firstname: req.body.firstName,
        lastname: req.body.lastName,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
    }

    // See if username is already in use
    const userExists = await db.lookUpUser(client, newUser.username);
    
    if (userExists) {
        console.log(`Username ${newUser.username} is already taken.`)
    } else {
        await db.addUser(client, newUser);
        console.log('New user added successfully');
        res.send({token: "test123"});
    }
})
/*
app.post('/login', async (req, res) => {
    // verify password of existing user
    // Authenticate password
    const passwordVerified = await db.verifyPassword(client, newUser.username, newUser.password);
    if (passwordVerified) {
        res.send({token: "test123"});
    }
    else {
        console.log('Incorrect password');
    }
})
*/


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