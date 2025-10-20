document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const recordId = urlParams.get('id');
    
    if (recordId) {
        loadMedicalRecord(recordId);
    }
    
    setupEventListeners(recordId);
});

function loadMedicalRecord(recordId) {
    const records = readCollection('hwh_medical_records');
    const record = records.find(r => r.id === recordId);
    const currentUser = getCurrentUser();
    
    if (!record) {
        showToast('Medical record not found', 'error');
        setTimeout(() => window.location.href = 'medical-records.html', 2000);
        return;
    }
    
    if (currentUser.role === 'Patient' && record.patientId !== currentUser.patientId) {
        showToast('Access denied', 'error');
        setTimeout(() => window.location.href = 'medical-records.html', 2000);
        return;
    }
    
    document.getElementById('recordId').textContent = record.id;
    document.getElementById('patientName').textContent = record.patientName;
    document.getElementById('recordDate').textContent = new Date(record.date).toLocaleDateString();
    document.getElementById('doctorName').textContent = record.doctorName;
    document.getElementById('diagnosis').textContent = record.diagnosis;
    document.getElementById('symptoms').textContent = record.symptoms || 'Not specified';
    document.getElementById('bloodPressure').textContent = record.bloodPressure || 'N/A';
    document.getElementById('heartRate').textContent = record.heartRate ? record.heartRate + ' bpm' : 'N/A';
    document.getElementById('temperature').textContent = record.temperature ? record.temperature + '°C' : 'N/A';
    document.getElementById('weight').textContent = record.weight ? record.weight + ' kg' : 'N/A';
    document.getElementById('height').textContent = record.height ? record.height + ' cm' : 'N/A';
    document.getElementById('notes').textContent = record.notes || 'No additional notes';
    
    renderPrescriptions(record.prescriptions);
    renderAttachedLabs(record.patientId);
    
    updateActionButtons(record);
}

function renderPrescriptions(prescriptions) {
    const container = document.getElementById('prescriptionsList');
    
    if (!prescriptions || prescriptions.length === 0) {
        container.innerHTML = '<tr><td colspan="4" class="no-data">No prescriptions</td></tr>';
        return;
    }
    
    let html = '';
    
    prescriptions.forEach(prescription => {
        html += `
            <tr>
                <td>${prescription.medication}</td>
                <td>${prescription.dosage}</td>
                <td>${prescription.duration}</td>
                <td>${prescription.instructions || 'As directed'}</td>
            </tr>
        `;
    });
    
    container.innerHTML = html;
}

function renderAttachedLabs(patientId) {
    const labs = readCollection('hwh_labs');
    const patientLabs = labs.filter(lab => lab.patientId === patientId);
    const container = document.getElementById('attachedLabs');
    
    if (patientLabs.length === 0) {
        container.innerHTML = '<p class="no-data">No laboratory results</p>';
        return;
    }
    
    let html = '';
    
    patientLabs.forEach(lab => {
        html += `
            <div class="lab-card">
                <h4>${lab.testType}</h4>
                <p><strong>Date:</strong> ${new Date(lab.testDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${lab.status}</p>
                <button class="btn-view" onclick="viewLab('${lab.id}')">View Results</button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function updateActionButtons(record) {
    const currentUser = getCurrentUser();
    const editBtn = document.getElementById('editBtn');
    const printBtn = document.getElementById('printBtn');
    
    if (!canEditMedicalRecord(record)) {
        editBtn.style.display = 'none';
    }
    
    if (currentUser.role === 'Patient' && record.patientId !== currentUser.patientId) {
        printBtn.style.display = 'none';
    }
}

function setupEventListeners(recordId) {
    document.getElementById('editBtn').addEventListener('click', function() {
        window.location.href = `medical-record-edit.html?id=${recordId}`;
    });
    
    document.getElementById('printBtn').addEventListener('click', function() {
        printMedicalRecord(recordId);
    });
    
    document.getElementById('backBtn').addEventListener('click', function() {
        window.location.href = 'medical-records.html';
    });
}

function viewLab(labId) {
    window.location.href = `laboratory-view.html?id=${labId}`;
}

function printMedicalRecord(recordId) {
    const records = readCollection('hwh_medical_records');
    const record = records.find(r => r.id === recordId);
    
    if (!record) return;
    
    const prescriptionsHtml = record.prescriptions && record.prescriptions.length > 0 ? 
        record.prescriptions.map(p => `
            <tr>
                <td>${p.medication}</td>
                <td>${p.dosage}</td>
                <td>${p.duration}</td>
                <td>${p.instructions || 'As directed'}</td>
            </tr>
        `).join('') : '<tr><td colspan="4">No prescriptions</td></tr>';
    
    const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Medical Record - Heal Well Hospital</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .section { margin: 20px 0; }
                .section-title { background: #f5f5f5; padding: 8px 12px; font-weight: bold; border-left: 4px solid #2c5aa0; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
                .info-item { margin-bottom: 8px; }
                .info-label { font-weight: bold; display: inline-block; width: 120px; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background: #f5f5f5; }
                .footer { text-align: center; margin-top: 50px; color: #666; font-size: 12px; }
                .signature-area { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .signature-line { border-top: 1px solid #333; padding-top: 4px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Heal Well Hospital</h1>
                <h2>Medical Record</h2>
            </div>
            
            <div class="section">
                <div class="section-title">Patient Information</div>
                <div class="info-grid">
                    <div class="info-item"><span class="info-label">Patient:</span> ${record.patientName}</div>
                    <div class="info-item"><span class="info-label">Record ID:</span> ${record.id}</div>
                    <div class="info-item"><span class="info-label">Date:</span> ${new Date(record.date).toLocaleDateString()}</div>
                    <div class="info-item"><span class="info-label">Doctor:</span> ${record.doctorName}</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Vital Signs</div>
                <div class="info-grid">
                    <div class="info-item"><span class="info-label">Blood Pressure:</span> ${record.bloodPressure || 'N/A'}</div>
                    <div class="info-item"><span class="info-label">Heart Rate:</span> ${record.heartRate || 'N/A'} bpm</div>
                    <div class="info-item"><span class="info-label">Temperature:</span> ${record.temperature || 'N/A'} °C</div>
                    <div class="info-item"><span class="info-label">Weight/Height:</span> ${record.weight || 'N/A'} kg / ${record.height || 'N/A'} cm</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Diagnosis & Symptoms</div>
                <div class="info-item"><span class="info-label">Diagnosis:</span> ${record.diagnosis}</div>
                <div class="info-item"><span class="info-label">Symptoms:</span> ${record.symptoms || 'Not specified'}</div>
            </div>
            
            <div class="section">
                <div class="section-title">Prescriptions</div>
                <table>
                    <thead>
                        <tr>
                            <th>Medication</th>
                            <th>Dosage</th>
                            <th>Duration</th>
                            <th>Instructions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${prescriptionsHtml}
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <div class="section-title">Clinical Notes</div>
                <p>${record.notes || 'No additional notes'}</p>
            </div>
            
            <div class="signature-area">
                <div>
                    <div class="signature-line">${record.doctorName}</div>
                    <div style="text-align: center;">Attending Physician</div>
                </div>
                <div>
                    <div class="signature-line"></div>
                    <div style="text-align: center;">Patient/Guardian Signature</div>
                </div>
            </div>
            
            <div class="footer">
                <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                <p>This is an official medical document from Heal Well Hospital</p>
            </div>
        </body>
        </html>
    `;
    
    openPrintWindow(printHtml);
}