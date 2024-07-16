async function fetchData() {
    const response = await fetch('data.json');
    const data = await response.json();
    // console.log(data);
    return data;
}

async function renderTable() {
    const data = await fetchData();
    const tableBody = document.querySelector('#customers-table tbody');
    tableBody.innerHTML = '';

    data.transactions.forEach(transaction => {
        const customer = data.customers.find(c => c.id === transaction.customer_id);
        console.log(customer);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${transaction.date}</td>
            <td>${transaction.amount}</td>
        `;
        tableBody.appendChild(row);
    });
}

async function filterTable() {
    // console.log("working");
    const nameFilter = document.getElementById('filter-name').value.toLowerCase();
    const amountFilter = document.getElementById('filter-amount').value;

    // console.log(nameFilter);

    const data = await fetchData();
    const tableBody = document.querySelector('#customers-table tbody');
    tableBody.innerHTML = '';

    const filteredTransactions = data.transactions.filter(transaction => {
        const customer = data.customers.find(c => c.id === transaction.customer_id);
        const matchesName = customer.name.toLowerCase().includes(nameFilter);
        const matchesAmount = amountFilter ? transaction.amount >= amountFilter : true;
        console.log(matchesName, matchesAmount);
        return matchesName && matchesAmount;
    });

    filteredTransactions.forEach(transaction => {
        const customer = data.customers.find(c => c.id === transaction.customer_id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${transaction.date}</td>
            <td>${transaction.amount}</td>
        `;
        tableBody.appendChild(row);
    });

    renderChart(filteredTransactions);
}

async function renderChart(filteredTransactions = null) {
    const data = await fetchData();
    const ctx = document.getElementById('transaction-chart').getContext('2d');
    const transactions = filteredTransactions || data.transactions;

    const chartData = transactions.reduce((acc, transaction) => {
        const date = transaction.date;
        if (!acc[date]) {
            acc[date] = 0;
        }
        acc[date] += transaction.amount;
        return acc;
    }, {});

    const labels = Object.keys(chartData);
    const amounts = Object.values(chartData);

    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Total Transaction Amount',
                data: amounts,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderTable();
    renderChart();

    document.getElementById('filter-name').addEventListener('input', filterTable);
    document.getElementById('filter-amount').addEventListener('input', filterTable);
});
