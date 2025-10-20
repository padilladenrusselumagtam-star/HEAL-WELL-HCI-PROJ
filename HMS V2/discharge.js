document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const currentUser = getCurrentUser();
    if (currentUser.role === 'Patient') {
        showToast('Access denied', 'error');
        setTimeout(() => window.location.href = 'dashboard.html', 2000);
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('patientId');
    
    if (patientId) {
        loadPatientForDischarge(patientId);
    }
    
    setupEventListeners();
});

function loadPatientForDischarge(patientId) {
    const patients = readCollection('hwh_patients');
    const patient = patients.find(p => p.id === patientId);
    
    if (patient) {
        document.getElementById('patientId').textContent = patient.id;
        document.getElementById('patientName').textContent = `${patient.firstName} ${patient.lastName}`;
        document.getElementById('admissionDate').textContent = patient.admissionDate;
        document.getElementById('ward').textContent = patient.ward;
        document.getElementById('admissionDiagnosis').textContent = patient.diagnosis;
        
        document.getElementById('dischargeDate').value = new Date().toISOString().split('T')[0];
    }
}

function setupEventListeners() {
    document.getElementById('dischargeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        processDischarge();
    });
    
    document.getElementById('addMedication').addEventListener('click', function() {
        addDischargeMedication();
    });
    
    document.getElementById('addFollowup').addEventListener('click', function() {
        addFollowup();
    });
}

function addDischargeMedication() {
    const container = document.getElementById('dischargeMeds');
    const row = document.createElement('div');
    row.className = 'medication-row';
    row.innerHTML = `
        <input type="text" placeholder="Medication" required>
        <input type="text" placeholder="Dosage" required>
        <input type="text" placeholder="Duration" required>
        <input type="text" placeholder="Instructions">
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(row);
}

function addFollowup() {
    const container = document.getElementById('followupInstructions');
    const row = document.createElement('div');
    row.className = 'followup-row';
    row.innerHTML = `
        <input type="text" placeholder="Instruction" required>
        <input type="date" placeholder="Follow-up Date">
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(row);
}

function processDischarge() {
    const patientId = document.getElementById('patientId').textContent;
    const dischargeDate = document.getElementById('dischargeDate').value;
    const dischargeDiagnosis = document.getElementById('dischargeDiagnosis').value;
    const summary = document.getElementById('dischargeSummary').value;
    const condition = document.getElementById('dischargeCondition').value;
    
    if (!dischargeDate || !dischargeDiagnosis || !condition) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    const medicationRows = document.querySelectorAll('#dischargeMeds .medication-row');
    const medications = [];
    medicationRows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        medications.push({
            medication: inputs[0].value,
            dosage: inputs[1].value,
            duration: inputs[2].value,
            instructions: inputs[3].value
        });
    });
    
    const followupRows = document.querySelectorAll('#followupInstructions .followup-row');
    const followups = [];
    followupRows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        followups.push({
            instruction: inputs[0].value,
            date: inputs[1].value
        });
    });
    
    simulateServerDelay(() => {
        const patients = readCollection('hwh_patients');
        const patient = patients.find(p => p.id === patientId);
        
        if (patient) {
            patient.admissionStatus = 'discharged';
            patient.dischargeDate = dischargeDate;
            patient.dischargeDiagnosis = dischargeDiagnosis;
            patient.dischargeSummary = summary;
            patient.dischargeCondition = condition;
            patient.dischargeMedications = medications;
            patient.followupInstructions = followups;
            patient.dischargedBy = getCurrentUser().username;
            
            persistCollection('hwh_patients', patients);
            
            const dischargeRecord = {
                id: generateId('DC'),
                patientId: patientId,
                patientName: `${patient.firstName} ${patient.lastName}`,
                admissionDate: patient.admissionDate,
                dischargeDate: dischargeDate,
                ward: patient.ward,
                admissionDiagnosis: patient.diagnosis,
                dischargeDiagnosis: dischargeDiagnosis,
                dischargeSummary: summary,
                dischargeCondition: condition,
                medications: medications,
                followups: followups,
                dischargedBy: getCurrentUser().username,
                dischargeTime: new Date().toISOString()
            };
            
            const dischargeRecords = readCollection('hwh_discharge_records') || [];
            dischargeRecords.push(dischargeRecord);
            localStorage.setItem('hwh_discharge_records', JSON.stringify(dischargeRecords));
            
            showToast('Patient discharged successfully', 'success');
            
            const printHtml = generateDischargeSummary(dischargeRecord);
            openPrintWindow(printHtml, 900, 700);
            
            setTimeout(() => {
                window.location.href = 'inpatient.html';
            }, 3000);
        }
    });
}

function generateDischargeSummary(record) {
    const medicationsHtml = record.medications && record.medications.length > 0 ? 
        record.medications.map(med => `
            <tr>
                <td>${med.medication}</td>
                <td>${med.dosage}</td>
                <td>${med.duration}</td>
                <td>${med.instructions || 'As directed'}</td>
            </tr>
        `).join('') : '<tr><td colspan="4">No discharge medications</td></tr>';
    
    const followupsHtml = record.followups && record.followups.length > 0 ? 
        record.followups.map(fu => `
            <tr>
                <td>${fu.instruction}</td>
                <td>${fu.date || 'As needed'}</td>
            </tr>
        `).join('') : '<tr><td colspan="2">No specific follow-up instructions</td></tr>';
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Discharge Summary - Heal Well Hospital</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .patient-info { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 4px; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .section { margin: 20px 0; }
                .section-title { background: #f5f5f5; padding: 8px 12px; font-weight: bold; border-left: 4px solid #2c5aa0; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background: #f5f5f5; }
                .signature-area { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
                .signature-line { border-top: 1px solid #333; padding-top: 4px; text-align: center; }
                .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Heal Well Hospital</h1>
                <h2>Discharge Summary</h2>
            </div>
            
            <div class="patient-info">
                <div class="info-grid">
                    <div><strong>Patient:</strong> ${record.patientName}</div>
                    <div><strong>Discharge ID:</strong> ${record.id}</div>
                    <div><strong>Admission Date:</strong> ${record.admissionDate}</div>
                    <div><strong>Discharge Date:</strong> ${record.dischargeDate}</div>
                    <div><strong>Ward:</strong> ${record.ward}</div>
                    <div><strong>Condition at Discharge:</strong> ${record.dischargeCondition}</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Diagnosis</div>
                <p><strong>Admission Diagnosis:</strong> ${record.admissionDiagnosis}</p>
                <p><strong>Discharge Diagnosis:</strong> ${record.dischargeDiagnosis}</p>
            </div>
            
            <div class="section">
                <div class="section-title">Hospital Course & Summary</div>
                <p>${record.dischargeSummary || 'No summary provided.'}</p>
            </div>
            
            <div class="section">
                <div class="section-title">Discharge Medications</div>
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
                        ${medicationsHtml}
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <div class="section-title">Follow-up Instructions</div>
                <table>
                    <thead>
                        <tr>
                            <th>Instruction</th>
                            <th>Follow-up Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${followupsHtml}
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <div class="section-title">Important Instructions</div>
                <ul>
                    <li>Take medications as prescribed</li>
                    <li>Follow up with your primary care physician</li>
                    <li>Return to the emergency department if symptoms worsen</li>
                    <li>Maintain a healthy diet and lifestyle as discussed</li>
                </ul>
            </div>
            
            <div class="signature-area">
                <div>
                    <div class="signature-line">${record.dischargedBy}</div>
                    <div style="text-align: center;">Attending Physician</div>
                </div>
                <div>
                    <div class="signature-line"></div>
                    <div style="text-align: center;">Patient/Guardian Signature</div>
                </div>
            </div>
            
            <div class="footer">
                <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                <p>For emergency concerns, please contact: (02) 1234-5678</p>
            </div>
        </body>
        </html>
    `;
}

