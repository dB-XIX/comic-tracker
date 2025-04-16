function fetchEbaySalesMock(title, issue) {
    // Simulate random-ish recent sales
    const now = new Date();
    const sales = [];

    for (let i = 0; i < 5; i++) {
        const price = +(8 + Math.random() * 10).toFixed(2);
        const date = new Date(now);
        date.setDate(date.getDate() - i * 7); // space them weekly
        sales.push({ price, date });
    }

    return sales.reverse(); // oldest to newest
}

module.exports = fetchEbaySalesMock;
