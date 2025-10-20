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
        printReceiptView(billId);
    });
    
    document.getElementById('backBtn').addEventListener('click', function() {
        window.location.href = 'billing.html';
    });
}

function getReceiptHtml(bill) {
    return `
        <div class="receipt-container">
            <div class="header">
                <div class="hospital-info">
                    <h1>Heal Well Hospital</h1>
                    <p>123 Healing Street, Medical City, Philippines</p>
                    <p>Tel: (02) 1234-5678 | VAT Reg TIN: 123-456-789-000</p>
                </div>
            </div>
            
            <div class="receipt-title">OFFICIAL RECEIPT</div>
            
            <div class="info-grid">
                <div class="patient-info">
                    <h3>Patient Information</h3>
                    <div class="info-item"><span class="info-label">Name:</span> ${bill.patientName}</div>
                    <div class="info-item"><span class="info-label">Bill Date:</span> ${bill.date}</div>
                </div>
                <div class="receipt-info">
                    <h3>Receipt Information</h3>
                    <div class="info-item"><span class="info-label">Receipt No:</span> ${bill.id}</div>
                    <div class="info-item"><span class="info-label">Date Issued:</span> ${new Date().toLocaleDateString()}</div>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Unit Cost</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${bill.items.map(item => `
                        <tr>
                            <td>${item.description}</td>
                            <td>${item.quantity}</td>
                            <td>${formatCurrency(item.unitCost)}</td>
                            <td>${formatCurrency(item.quantity * item.unitCost)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="totals">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(bill.subtotal)}</span>
                </div>
                ${bill.tax > 0 ? `
                <div class="total-row">
                    <span>Tax (12%):</span>
                    <span>${formatCurrency(bill.tax)}</span>
                </div>
                ` : ''}
                ${bill.discount > 0 ? `
                <div class="total-row">
                    <span>Discount:</span>
                    <span>-${formatCurrency(bill.discount)}</span>
                </div>
                ` : ''}
                <div class="total-row final">
                    <span>TOTAL:</span>
                    <span>${formatCurrency(bill.total)}</span>
                </div>
                <div class="total-row">
                    <span>Amount Paid:</span>
                    <span>${formatCurrency(bill.paid)}</span>
                </div>
                <div class="total-row final">
                    <span>BALANCE:</span>
                    <span>${formatCurrency(bill.balance)}</span>
                </div>
            </div>
            
            <div class="payment-method">
                <h3>Payment Information</h3>
                <div class="info-item"><span class="info-label">Payment Method:</span> ${bill.paymentMethod}</div>
                <div class="info-item"><span class="info-label">Status:</span> ${bill.status.toUpperCase()}</div>
            </div>
            
            <div class="signature-area">
                <div>
                    <div class="signature-line"></div>
                    <div style="text-align: center;">Cashier's Signature</div>
                </div>
                <div>
                    <div class="signature-line"></div>
                    <div style="text-align: center;">Patient/Guardian Signature</div>
                </div>
            </div>
            
            <div class="footer">
                <p>Thank you for choosing Heal Well Hospital</p>
                <p>This receipt is computer generated and does not require a signature</p>
                <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
            </div>
        </div>
    `;
}

function printReceiptView(billId) {
    const bills = readCollection('hwh_bills');
    const bill = bills.find(b => b.id === billId);
    
    if (!bill) {
        showToast('Cannot generate receipt for printing', 'error');
        return;
    }

    const receiptHtml = getReceiptHtml(bill);
    
    const printWindow = window.open('', '', 'height=600,width=800');

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Official Receipt - Heal Well Hospital</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .receipt-container { max-width: 800px; margin: 0 auto; border: 2px solid #333; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .hospital-info h1 { margin: 0; color: #2c5aa0; }
                .hospital-info p { margin: 4px 0; color: #666; }
                .receipt-title { text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; color: #2c5aa0; }
                .patient-info, .receipt-info { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 4px; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .info-item { margin-bottom: 8px; }
                .info-label { font-weight: bold; display: inline-block; width: 120px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background: #f5f5f5; font-weight: bold; }
                .totals { margin-left: auto; width: 300px; }
                .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                .total-row.final { font-weight: bold; font-size: 18px; border-top: 2px solid #333; margin-top: 8px; padding-top: 12px; }
                .payment-method { margin: 20px 0; padding: 15px; background: #f0f8ff; border-radius: 4px; }
                .signature-area { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 60px; }
                .signature-line { border-top: 1px solid #333; padding-top: 4px; text-align: center; }
                .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
                @media print {
                    body { margin: 0; }
                    .receipt-container { border: none; padding: 10px; }
                }
            </style>
        </head>
        <body>
            ${receiptHtml}
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => window.close(), 100); 
                };
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}