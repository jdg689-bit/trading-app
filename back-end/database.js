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
    // Process user's buy/sell order by updating holdings embedded document

    // Destructure here
    const stock = orderDetails.stock;
    const qty = orderDetails.orderType == 'buy' ? +orderDetails.quantity : +orderDetails.quantity * -1;
    const userToken = (orderDetails.token);

    // Token must be ObjectID instance to work with mongo queries
    const tokenObject = new ObjectId(userToken);

    // Does user already own this stock? -> Find document where user id and holdings.stock match
    const user = await client.db("trading_app").collection("user_info").findOne(
        {
            _id: tokenObject,
            "holdings.stock": stock
        }
    );

    if (!user && orderDetails.orderType == 'buy') {
        // If no document found, user doesn't currently hold this stock
        // Need to add new object to holdings array
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
    } else {
        // If user currently holds this stock, increment position quantity
        try {
            // Can't sell stock if not in portfolio
            if (!user && orderDetails.orderType == 'sell') {
                throw new Error(`${stock} is not currently held in your portfolio`);
            }

            // For sell orders, throw error is user is trying to sell more stock than owned
            // user is the entire document
            // use regular find() array method to find the relevant position
            const userPosition = user.holdings.find((element) => element.stock == stock);

            if (orderDetails.orderType == 'sell' && userPosition.quantity < qty * -1) {
                throw new Error(`Requested sell quantity for ${stock} exceeds current position`);
            }
            
            // Increment current holdings
            await client.db("trading_app").collection("user_info").updateOne(
                {
                    _id: tokenObject,
                    "holdings.stock": stock
                },
                {$inc: { "holdings.$.quantity": qty}}
            )

        } catch (error) {
            return ({
                error: true,
                errorType: "TradeError",
                message: error.message,
            });
        }
    }
}

module.exports = {
    connectToDB,
    addUser,
    lookUpUser,
    verifyPassword,
    makeTrade,
}

