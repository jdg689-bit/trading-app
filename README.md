Finance/stock trading app that allows user to buy and sell stocks. Get the price of stocks 
and BUY and SELL shares using data fetched from the Alphavantage API. Uses a token-based
authentication system to manager users' access to trading and portfolio pages.

Authentication: Successful verification of an existing user returns the users' _id 
from their mongo document as a session token. The token can then be used to make changes
to the correct users' document, for example when updating stock holdings after a successful trade.