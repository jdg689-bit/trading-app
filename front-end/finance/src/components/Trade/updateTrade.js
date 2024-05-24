export default function updateTrade({ stockPrice, quantity, orderType, brokerageFee }, { setOrderValue, setBrokerageFee, setOrderTotal }) {
    // Update trade totals when any relevant form information changes state

    const newOrderValue = stockPrice * quantity;
    const newOrderTotal = orderType == 'buy' ? newOrderValue + brokerageFee : newOrderValue - brokerageFee;

    // Brokerage fee dependent on orderValue
    let newBrokerageFee;
    if (newOrderValue > 25000) {
        newBrokerageFee = newOrderValue * 0.12;
    } else if (newOrderValue <= 25000 && newOrderValue > 10000) {
        newBrokerageFee = 29.95;
    } else if (newOrderValue <= 10000 && newOrderValue > 3000) {
        newBrokerageFee = 19.95;
    } else if (newOrderValue <= 3000 && newOrderValue > 1000) {
        newBrokerageFee = 10;
    } else if (newOrderValue > 0) {
        newBrokerageFee = 5;
    } else {
        newBrokerageFee = 0;
    }
    
    setOrderValue(newOrderValue);
    setOrderTotal(newOrderTotal);
    setBrokerageFee(newBrokerageFee);
}