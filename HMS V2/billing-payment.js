document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const currentUser = getCurrentUser();
    if (currentUser.role === 'Patient') {
        showToast('Access denied', 'error');
        setTimeout(() => window.location.href = 'billing.html', 2000);
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const billId = urlParams.get('id');
    
    if (billId) {
        loadBillForPayment(billId);
    }
    
    setupEventListeners();
});

function loadBillForPayment(billId) {
    const bills = readCollection('hwh_bills');
    const bill = bills.find(b => b.id === billId);
    
    if (bill) {
        document.getElementById('billId').textContent = bill.id;
        document.getElementById('patientName').textContent = bill.patientName;
        document.getElementById('billDate').textContent = bill.date;
        document.getElementById('totalAmount').textContent = formatCurrency(bill.total);
        document.getElementById('balanceDue').textContent = formatCurrency(bill.balance);
        document.getElementById('amountPaid').max = bill.balance;
        document.getElementById('amountPaid').value = bill.balance;
        
        renderBillItems(bill.items);
    }
}

function renderBillItems(items) {
    const container = document.getElementById('billItems');
    
    let html = '';
    items.forEach(item => {
        html += `
            <div class="bill-item">
                <span>${item.description}</span>
                <span>${item.quantity} x ${formatCurrency(item.unitCost)}</span>
                <span>${formatCurrency(item.quantity * item.unitCost)}</span>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function setupEventListeners() {
    document.getElementById('paymentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        processPayment();
    });
    
    document.getElementById('amountPaid').addEventListener('input', function() {
        updatePaymentSummary();
    });
    
    document.getElementById('paymentMethod').addEventListener('change', function() {
        toggleInsuranceFields(this.value);
    });
}

function updatePaymentSummary() {
    const bills = readCollection('hwh_bills');
    const billId = new URLSearchParams(window.location.search).get('id');
    const bill = bills.find(b => b.id === billId);
    
    if (!bill) return;
    
    const amountPaid = parseFloat(document.getElementById('amountPaid').value) || 0;
    const balance = bill.balance - amountPaid;
    
    document.getElementById('paymentSummary').innerHTML = `
        <div class="summary-row">
            <span>Total Amount:</span>
            <span>${formatCurrency(bill.total)}</span>
        </div>
        <div class="summary-row">
            <span>Previously Paid:</span>
            <span>${formatCurrency(bill.paid)}</span>
        </div>
        <div class="summary-row">
            <span>This Payment:</span>
            <span>${formatCurrency(amountPaid)}</span>
        </div>
        <div class="summary-row final">
            <span>Remaining Balance:</span>
            <span>${formatCurrency(balance)}</span>
        </div>
    `;
}

function toggleInsuranceFields(paymentMethod) {
    const insuranceFields = document.getElementById('insuranceFields');
    insuranceFields.style.display = paymentMethod === 'insurance' ? 'block' : 'none';
}

function processPayment() {
    const bills = readCollection('hwh_bills');
    const billId = new URLSearchParams(window.location.search).get('id');
    const bill = bills.find(b => b.id === billId);
    
    if (!bill) return;
    
    const amountPaid = parseFloat(document.getElementById('amountPaid').value) || 0;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const referenceNumber = document.getElementById('referenceNumber').value;
    const insuranceProvider = document.getElementById('insuranceProvider').value;
    const insuranceNumber = document.getElementById('insuranceNumber').value;
    
    if (amountPaid <= 0) {
        showToast('Please enter a valid payment amount', 'error');
        return;
    }
    
    if (amountPaid > bill.balance) {
        showToast('Payment amount cannot exceed balance due', 'error');
        return;
    }
    
    simulateServerDelay(() => {
        bill.paid += amountPaid;
        bill.balance = bill.total - bill.paid;
        bill.paymentMethod = paymentMethod;
        bill.paymentReference = referenceNumber;
        
        if (bill.balance === 0) {
            bill.status = 'paid';
        } else if (bill.paid > 0) {
            bill.status = 'partial';
        }
        
        if (paymentMethod === 'insurance') {
            bill.insuranceProvider = insuranceProvider;
            bill.insuranceNumber = insuranceNumber;
        }
        
        bill.paymentDate = new Date().toISOString();
        bill.processedBy = getCurrentUser().username;
        
        persistCollection('hwh_bills', bills);
        
        showToast('Payment processed successfully', 'success');
        
        setTimeout(() => {
            window.location.href = `billing-receipt.html?id=${billId}`;
        }, 1500);
    });
}