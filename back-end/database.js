const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const {makeTrade} = require('./database-modules/tradeFunctions.js');


async function connectToDB() {

    const uri = `mongodb+srv://myAtlasDBUser:${process.env.MONGO_DB_PWORD}@myatlasclusteredu.fz0pefl.mongodb.net/?retryWrites=true&w=majority&appName=myAtlasClusterEDU`

    const client = new MongoClient(uri);

    try {
        await client.connect();
        return client;
    } catch (error) {
        console.error(error);
    }
}

async function addUser(client, newUser) {
    const result = await client.db("trading_app").collection("user_info").insertOne(newUser);
}


async function lookUpUser(client, username) {
    // Find out if username is already in use

    // find() always returns cursor
    // use toArray() to you can check length, if length == 0  there are no results
    const result = await client.db("trading_app").collection("user_info").find({ username: username}).toArray();

    let userExists = result.length > 0 ? true : false;

    return userExists;
}


async function verifyPassword(client, username, password) {
    try {
        // Find user
        const user = await client.db("trading_app").collection("user_info").find({ username: username}).toArray();

        // User doesn't exist
        if (!user) {
            throw new Error('Username does not exist.');
        }

        // Check password is correct
        const storedPassword = user[0].password;

        return storedPassword == password ? user[0]._id : null;

    } catch (error) {
        console.error(`Error verifying password: ${error}`);
    }
}

async function getHoldings(client, token) {
    // Get users stock holdings and balance
    const tokenObject = new ObjectId(token);

    const user = await client.db("trading_app").collection("user_info").findOne({_id: tokenObject});
    const holdings = {balance: user['balance'], holdings: user['holdings']};

    return holdings;
}

module.exports = {
    connectToDB,
    addUser,
    lookUpUser,
    verifyPassword,
    makeTrade,
    getHoldings,
}

