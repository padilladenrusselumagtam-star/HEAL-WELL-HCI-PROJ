document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const billId = urlParams.get('id');
    
    if (billId) {
        loadBill(billId);
    }
    
    setupEventListeners(billId);
});

function loadBill(billId) {
    const bills = readCollection('hwh_bills');
    const bill = bills.find(b => b.id === billId);
    const currentUser = getCurrentUser();
    
    if (!bill) {
        showToast('Bill not found', 'error');
        setTimeout(() => window.location.href = 'billing.html', 2000);
        return;
    }
    
    if (currentUser.role === 'Patient' && bill.patientId !== currentUser.patientId) {
        showToast('Access denied', 'error');
        setTimeout(() => window.location.href = 'billing.html', 2000);
        return;
    }
    
    document.getElementById('billId').textContent = bill.id;
    document.getElementById('patientName').textContent = bill.patientName;
    document.getElementById('billDate').textContent = bill.date;
    document.getElementById('status').textContent = bill.status;
    document.getElementById('totalAmount').textContent = formatCurrency(bill.total);
    document.getElementById('paidAmount').textContent = formatCurrency(bill.paid);
    document.getElementById('balanceDue').textContent = formatCurrency(bill.balance);
    document.getElementById('paymentMethod').textContent = bill.paymentMethod || 'Not specified';
    
    document.getElementById('subtotal').textContent = formatCurrency(bill.subtotal);
    document.getElementById('tax').textContent = formatCurrency(bill.tax);
    document.getElementById('discount').textContent = formatCurrency(bill.discount);
    document.getElementById('finalTotal').textContent = formatCurrency(bill.total);
    document.getElementById('paid').textContent = formatCurrency(bill.paid);
    document.getElementById('balance').textContent = formatCurrency(bill.balance);
    
    renderBillItems(bill.items);
}

function renderBillItems(items) {
    const container = document.getElementById('billItems');
    
    let html = '';
    items.forEach(item => {
        const total = item.quantity * item.unitCost;
        html += `
            <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.unitCost)}</td>
                <td>${formatCurrency(total)}</td>
            </tr>
        `;
    });
    
    container.innerHTML = html;
}

function setupEventListeners(billId) {
    document.getElementById('printBtn').addEventListener('click', function() {
        window.location.href = `billing-receipt.html?id=${billId}`;
    });
    
    document.getElementById('backBtn').addEventListener('click', function() {
        window.location.href = 'billing.html';
    });
}

document.getElementById('logoutBtn').addEventListener('click', function() {
        logout();
    });