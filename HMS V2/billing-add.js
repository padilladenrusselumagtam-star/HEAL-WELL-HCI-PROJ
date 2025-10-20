document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const currentUser = getCurrentUser();
    if (currentUser.role === 'Patient') {
        showToast('Access denied', 'error');
        setTimeout(() => window.location.href = 'billing.html', 2000);
        return;
    }
    
    loadPatients();
    setupEventListeners();
    calculateTotals();
});

function loadPatients() {
    const patients = readCollection('hwh_patients');
    const patientSelect = document.getElementById('patientSelect');
    
    patientSelect.innerHTML = '<option value="">Select Patient</option>';
    patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = `${patient.id} - ${patient.firstName} ${patient.lastName}`;
        patientSelect.appendChild(option);
    });
}

function setupEventListeners() {
    document.getElementById('billingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveBill();
    });
    
    document.getElementById('addItemBtn').addEventListener('click', addBillItem);
    
    document.getElementById('applyTax').addEventListener('change', calculateTotals);
    document.getElementById('discountAmount').addEventListener('input', calculateTotals);
}

function addBillItem() {
    const container = document.getElementById('billItems');
    const row = document.createElement('div');
    row.className = 'bill-item-row';
    row.innerHTML = `
        <input type="text" class="item-desc" placeholder="Description" required>
        <input type="number" class="item-qty" placeholder="Qty" value="1" min="1" required>
        <input type="number" class="item-cost" placeholder="Unit Cost" step="0.01" required>
        <span class="item-total">0.00</span>
        <button type="button" class="btn-remove" onclick="removeBillItem(this)">×</button>
    `;
    container.appendChild(row);
    
    row.querySelector('.item-qty').addEventListener('input', calculateItemTotal);
    row.querySelector('.item-cost').addEventListener('input', calculateItemTotal);
}

function removeBillItem(button) {
    button.parentElement.remove();
    calculateTotals();
}

function calculateItemTotal(event) {
    const row = event.target.closest('.bill-item-row');
    const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
    const cost = parseFloat(row.querySelector('.item-cost').value) || 0;
    const total = qty * cost;
    
    row.querySelector('.item-total').textContent = formatCurrency(total);
    calculateTotals();
}

function calculateTotals() {
    const itemRows = document.querySelectorAll('.bill-item-row');
    let subtotal = 0;
    
    itemRows.forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const cost = parseFloat(row.querySelector('.item-cost').value) || 0;
        subtotal += qty * cost;
    });
    
    const applyTax = document.getElementById('applyTax').checked;
    const taxRate = 0.12;
    const tax = applyTax ? subtotal * taxRate : 0;
    
    const discount = parseFloat(document.getElementById('discountAmount').value) || 0;
    const total = subtotal + tax - discount;
    
    document.getElementById('subtotalAmount').textContent = formatCurrency(subtotal);
    document.getElementById('taxAmount').textContent = formatCurrency(tax);
    document.getElementById('discountDisplay').textContent = formatCurrency(discount);
    document.getElementById('totalAmount').textContent = formatCurrency(total);
}

function saveBill() {
    const patientId = document.getElementById('patientSelect').value;
    const billDate = document.getElementById('billDate').value;
    const applyTax = document.getElementById('applyTax').checked;
    const discount = parseFloat(document.getElementById('discountAmount').value) || 0;
    
    if (!patientId || !billDate) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    const itemRows = document.querySelectorAll('.bill-item-row');
    if (itemRows.length === 0) {
        showToast('Please add at least one bill item', 'error');
        return;
    }
    
    const items = [];
    itemRows.forEach(row => {
        const description = row.querySelector('.item-desc').value;
        const quantity = parseFloat(row.querySelector('.item-qty').value);
        const unitCost = parseFloat(row.querySelector('.item-cost').value);
        
        items.push({
            description,
            quantity,
            unitCost
        });
    });
    
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    const tax = applyTax ? subtotal * 0.12 : 0;
    const total = subtotal + tax - discount;
    
    simulateServerDelay(() => {
        const patients = readCollection('hwh_patients');
        const patient = patients.find(p => p.id === patientId);
        
        const bill = {
            id: generateId('BILL'),
            patientId: patientId,
            patientName: `${patient.firstName} ${patient.lastName}`,
            date: billDate,
            items: items,
            subtotal: subtotal,
            tax: tax,
            discount: discount,
            total: total,
            paid: 0,
            balance: total,
            status: 'pending',
            paymentMethod: '',
            createdBy: getCurrentUser().username,
            createdAt: new Date().toISOString()
        };
        
        const bills = readCollection('hwh_bills');
        bills.push(bill);
        persistCollection('hwh_bills', bills);
        
        showToast('Bill created successfully', 'success');
        
        setTimeout(() => {
            window.location.href = 'billing.html';
        }, 1500);
    });
}

