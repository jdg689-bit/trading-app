const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

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
    // Find user
    const user = await client.db("trading_app").collection("user_info").find({ username: username}).toArray();

    // Check submitted password against database
    const storedPassword = user[0].password;

    return storedPassword == password ? user[0]._id : null;
}


async function makeTrade(client, orderDetails) {
    // Update user (identified by orderDetails.token)
    // Destructure here
    const stock = orderDetails.stock;
    const qty = orderDetails.orderType == 'buy' ? +orderDetails.quantity : +orderDetails.quantity * -1;
    const userToken = (orderDetails.token);

    console.log(`User token is ${userToken}`);

    const tokenObject = new ObjectId(userToken);

    // Does the account holder already own shares of this stock?
    const result = await client.db("trading_app").collection("user_info").findOne(
        {
            _id: tokenObject,
            "holdings.stock": stock
        }
    );
    
    if (result) {
        // Increment current holdings
        await client.db("trading_app").collection("user_info").updateOne(
            {
                _id: tokenObject,
                "holdings.stock": stock
            },
            {$inc: { "holdings.$.quantity": qty}}
        )
    } else {
        // Add stock to holdings array
        await client.db("trading_app").collection("user_info").updateOne(
            {
                _id: tokenObject
            },
            {
                $push: {
                    "holdings": {
                        "stock": stock,
                        "quantity": qty
                    }
                }
            }
        )
    }
}

module.exports = {
    connectToDB,
    addUser,
    lookUpUser,
    verifyPassword,
    makeTrade,
}

