document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const currentUser = getCurrentUser();
    if (currentUser.role === 'Patient') {
        document.getElementById('addBillBtn').style.display = 'none';
    }
    
    loadBills();
    setupEventListeners();
});

function loadBills() {
    const bills = readCollection('hwh_bills');
    const currentUser = getCurrentUser();
    
    let filteredBills = bills;
    
    if (currentUser.role === 'Patient') {
        filteredBills = bills.filter(bill => bill.patientId === currentUser.patientId);
    }
    
    const statusFilter = document.getElementById('statusFilter').value;
    if (statusFilter) {
        filteredBills = filteredBills.filter(bill => bill.status === statusFilter);
    }
    
    renderBills(filteredBills);
}

function renderBills(bills) {
    const container = document.getElementById('billsList');
    const summaryContainer = document.getElementById('billingSummary');
    
    if (bills.length === 0) {
        container.innerHTML = '<tr><td colspan="7" class="no-data">No bills found</td></tr>';
        summaryContainer.innerHTML = '<div class="no-data">No billing data</div>';
        return;
    }
    
    let html = '';
    let totalAmount = 0;
    let totalPaid = 0;
    let totalBalance = 0;
    
    bills.forEach(bill => {
        totalAmount += bill.total;
        totalPaid += bill.paid;
        totalBalance += bill.balance;
        
        const statusClass = bill.status === 'paid' ? 'status-paid' : 
                           bill.status === 'partial' ? 'status-partial' : 'status-pending';
        
        html += `
            <tr>
                <td>${bill.date}</td>
                <td>${bill.patientName}</td>
                <td>${bill.id}</td>
                <td>${formatCurrency(bill.total)}</td>
                <td>${formatCurrency(bill.paid)}</td>
                <td>${formatCurrency(bill.balance)}</td>
                <td><span class="status ${statusClass}">${bill.status}</span></td>
                <td>
                    <button class="btn-view" onclick="viewBill('${bill.id}')">View</button>
                    ${canEditBill(bill) ? `<button class="btn-pay" onclick="processPayment('${bill.id}')">Pay</button>` : ''}
                </td>
            </tr>
        `;
    });
    
    container.innerHTML = html;
    
    summaryContainer.innerHTML = `
        <div class="summary-card">
            <h3>Total Amount</h3>
            <div class="summary-amount">${formatCurrency(totalAmount)}</div>
        </div>
        <div class="summary-card">
            <h3>Total Paid</h3>
            <div class="summary-amount">${formatCurrency(totalPaid)}</div>
        </div>
        <div class="summary-card">
            <h3>Total Balance</h3>
            <div class="summary-amount">${formatCurrency(totalBalance)}</div>
        </div>
    `;
}

function canEditBill(bill) {
    const currentUser = getCurrentUser();
    if (currentUser.role === 'Patient') return false;
    if (bill.status === 'paid') return false;
    return true;
}

function setupEventListeners() {
    document.getElementById('addBillBtn').addEventListener('click', function() {
        window.location.href = 'billing-add.html';
    });
    
    document.getElementById('statusFilter').addEventListener('change', loadBills);
    
    document.getElementById('resetFilters').addEventListener('click', function() {
        document.getElementById('statusFilter').value = '';
        loadBills();
    });
}

function viewBill(billId) {
    window.location.href = `billing-view.html?id=${billId}`;
}

function processPayment(billId) {
    window.location.href = `billing-payment.html?id=${billId}`;
}

