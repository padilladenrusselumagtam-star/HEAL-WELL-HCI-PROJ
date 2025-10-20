if (!sessionStorage.getItem('currentUser')) {
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    document.getElementById('welcomeUser').textContent = `Welcome, ${currentUser.name}`;
    
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
    
    const patientData = JSON.parse(sessionStorage.getItem('currentPatient'));
    
    if (!patientData) {
        window.location.href = 'register-step1.html';
        return;
    }
    
    displaySlipData(patientData);
});

function displaySlipData(patient) {
    document.getElementById('patientId').textContent = patient.id;
    document.getElementById('registrationDate').textContent = new Date(patient.registrationDate).toLocaleDateString();
    
    const patientInfo = document.getElementById('patientSlipInfo');
    patientInfo.innerHTML = `
        <div class="slip-item">
            <span class="slip-label">Full Name:</span>
            <span class="slip-value">${patient.firstName} ${patient.lastName}</span>
        </div>
        <div class="slip-item">
            <span class="slip-label">Date of Birth:</span>
            <span class="slip-value">${patient.dateOfBirth}</span>
        </div>
        <div class="slip-item">
            <span class="slip-label">Gender:</span>
            <span class="slip-value">${patient.gender}</span>
        </div>
        <div class="slip-item">
            <span class="slip-label">Phone:</span>
            <span class="slip-value">${patient.phone}</span>
        </div>
        <div class="slip-item">
            <span class="slip-label">Email:</span>
            <span class="slip-value">${patient.email}</span>
        </div>
        <div class="slip-item">
            <span class="slip-label">Emergency Contact:</span>
            <span class="slip-value">${patient.emergencyName} (${patient.emergencyRelationship})</span>
        </div>
    `;
}

function printSlip() {
    const slipContent = document.getElementById('registrationSlip').innerHTML;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Registration Slip</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    color: #333;
                }
                .slip-logo { 
                    text-align: center; 
                    margin-bottom: 30px;
                    border-bottom: 2px solid #3498db;
                    padding-bottom: 20px;
                }
                .slip-section { 
                    margin-bottom: 20px; 
                }
                .slip-section h3 {
                    color: #3498db;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 5px;
                }
                .slip-grid { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 10px; 
                }
                .slip-item { 
                    margin-bottom: 8px; 
                }
                .slip-label { 
                    font-weight: bold; 
                }
                .slip-footer { 
                    margin-top: 30px; 
                    text-align: center; 
                    font-style: italic; 
                    color: #666;
                }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            ${slipContent}
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 500);
                };
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}
