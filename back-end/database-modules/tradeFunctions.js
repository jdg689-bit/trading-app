// FUNCTIONS CALLED IN DATABASE.JS TO UPDATE MONGO DOCUMENT PENDING BUY/SELL REQUEST
const { MongoClient, ObjectId } = require('mongodb');


async function buyOrder(client, user, stock, stockPrice, quantity, orderTotal, tokenObject) {
    // Does user have the funds to execute trade?
    const funds = user.balance;
    if (funds < orderTotal) {
        return {
            success: false,
            message: 'Insufficient funds.'
        }
    }

    // Does the user already own this stock?
    const stockOwned = user.holdings.find((element) => element.stock == stock); 
    if (!stockOwned) {
        // NO -> add position to holdings array using $push
        await client.db("trading_app").collection("user_info").updateOne(
            {
                _id: tokenObject,
            },
            {
                $push: {
                    "holdings": {
                        "stock": stock,
                        "quantity": quantity,
                        "purchase_price": stockPrice,
                    }
                },
                $inc: {
                    "balance": -orderTotal
                }
            }
        )
    } else {
        // YES -> increase element.quantity using $inc
        await client.db("trading_app").collection("user_info").updateOne(
            {
                _id: tokenObject,
                "holdings.stock": stock
            },
            {
                $inc: { 
                    "holdings.$.quantity": quantity,
                    "balance": -orderTotal
                }
            }
        )
    }

    return {
        success: true,
        message: 'Buy order executed.'
    }
}


async function sellOrder(client, user, stock, quantity, orderTotal, tokenObject) {
    // Does the user currently hold the stock
    const position = user.holdings.find((element) => element.stock == stock);
    if (!position) {
        return {
            success: false,
            message: 'Stock not currently held in portfolio'
        }
    }
    
    // User owns the stock. Do they have enough shares to execute the order?
    const shares = position.quantity;
    if (shares < quantity) {
        return {
            success: false,
            message: 'Insufficient shares held.'
        }
    }

    // Execute sell order
    await client.db("trading_app").collection("user_info").updateOne(
        {
            _id: tokenObject,
            "holdings.stock": stock
        },
        {
            $inc: { 
                "holdings.$.quantity": -quantity,
                "balance": orderTotal
            }
        }
    )

    return {
        success: true,
        message: 'Sell order executed.'
    }

}


async function makeTrade(client, {stock, stockPrice, quantity, orderTotal, orderType, token}) {
    // Process user's buy/sell order by updating holdings embedded document

    // Token must be ObjectID instance to work with mongo queries
    const tokenObject = new ObjectId(token);
    // Get users' dcoument
    const user = await client.db("trading_app").collection("user_info").findOne(
        {
            _id: tokenObject,
        }
    );

    let trade;

    if (orderType == 'buy') {
        trade = await buyOrder(client, user, stock, stockPrice, quantity, orderTotal, tokenObject);
    } else if (orderType == 'sell') {
        trade = await sellOrder(client, user, stock, stockPrice, quantity, orderTotal, tokenObject);
    }

    if (trade.success) {
        // trade executed successfully
        return {
            error: false,
            message: trade.message
        }
    } else {
        return {
            error: true,
            message: trade.message
        }
    }
}

module.exports = {
    makeTrade,
}