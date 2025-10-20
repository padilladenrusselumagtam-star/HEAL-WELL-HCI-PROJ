document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const labId = urlParams.get('id');
    
    if (labId) {
        loadLabTest(labId);
    }
    
    setupEventListeners(labId);
});

function loadLabTest(labId) {
    const labs = readCollection('hwh_labs');
    const lab = labs.find(l => l.id === labId);
    const currentUser = getCurrentUser();
    
    if (!lab) {
        showToast('Lab test not found', 'error');
        setTimeout(() => window.location.href = 'laboratory.html', 2000);
        return;
    }
    
    if (currentUser.role === 'Patient' && lab.patientId !== currentUser.patientId) {
        showToast('Access denied', 'error');
        setTimeout(() => window.location.href = 'laboratory.html', 2000);
        return;
    }
    
    document.getElementById('testId').textContent = lab.id;
    document.getElementById('patientName').textContent = lab.patientName;
    document.getElementById('testType').textContent = lab.testType;
    document.getElementById('testDate').textContent = new Date(lab.testDate).toLocaleDateString();
    document.getElementById('resultsDate').textContent = lab.resultsDate ? new Date(lab.resultsDate).toLocaleDateString() : 'Pending';
    document.getElementById('status').textContent = lab.status;
    document.getElementById('performedBy').textContent = lab.createdBy || 'Lab Technician';
    document.getElementById('notes').textContent = lab.notes || 'No additional notes';
    
    renderResultsTable(lab.results, lab.testType);
}

function renderResultsTable(results, testType) {
    const container = document.getElementById('resultsTable');
    
    if (!results || Object.keys(results).length === 0) {
        container.innerHTML = '<p class="no-data">Results pending</p>';
        return;
    }
    
    let html = '<table class="table"><thead><tr><th>Parameter</th><th>Result</th><th>Normal Range</th><th>Status</th></tr></thead><tbody>';
    
    const normalRanges = {
        'Blood Chemistry': {
            'glucose': '70-100 mg/dL',
            'cholesterol': '< 200 mg/dL', 
            'hemoglobin': '12-16 g/dL'
        },
        'Pulmonary Function': {
            'fev1': '> 80% predicted',
            'fvc': '> 80% predicted',
            'ratio': '> 0.7'
        },
        'Urinalysis': {
            'appearance': 'Clear',
            'ph': '4.5-8.0',
            'protein': 'Negative'
        }
    };
    
    const ranges = normalRanges[testType] || {};
    
    Object.keys(results).forEach(key => {
        const value = results[key];
        const normalRange = ranges[key] || 'N/A';
        const isNormal = checkIfNormal(value, key, testType);
        const status = isNormal ? 'Normal' : 'Abnormal';
        const statusClass = isNormal ? 'status-completed' : 'status-pending';
        
        html += `
            <tr>
                <td>${formatParameterName(key)}</td>
                <td>${value}</td>
                <td>${normalRange}</td>
                <td><span class="status ${statusClass}">${status}</span></td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function formatParameterName(key) {
    const names = {
        'glucose': 'Glucose',
        'cholesterol': 'Cholesterol',
        'hemoglobin': 'Hemoglobin',
        'fev1': 'FEV1',
        'fvc': 'FVC', 
        'ratio': 'FEV1/FVC Ratio',
        'appearance': 'Appearance',
        'ph': 'pH',
        'protein': 'Protein'
    };
    return names[key] || key;
}

function checkIfNormal(value, parameter, testType) {
    if (testType === 'Blood Chemistry') {
        switch(parameter) {
            case 'glucose': return value >= 70 && value <= 100;
            case 'cholesterol': return value < 200;
            case 'hemoglobin': return value >= 12 && value <= 16;
            default: return true;
        }
    }
    if (testType === 'Pulmonary Function') {
        switch(parameter) {
            case 'fev1': return value >= 80;
            case 'fvc': return value >= 80;
            case 'ratio': return value >= 0.7;
            default: return true;
        }
    }
    return true;
}

function setupEventListeners(labId) {
    document.getElementById('printBtn').addEventListener('click', function() {
        printLabReport(labId);
    });
    
    document.getElementById('backBtn').addEventListener('click', function() {
        window.location.href = 'laboratory.html';
    });
}

function printLabReport(labId) {
    const labs = readCollection('hwh_labs');
    const lab = labs.find(l => l.id === labId);
    
    if (!lab) return;
    
    const resultsHtml = lab.results && Object.keys(lab.results).length > 0 ? 
        Object.keys(lab.results).map(key => `
            <tr>
                <td>${formatParameterName(key)}</td>
                <td>${lab.results[key]}</td>
                <td>${getNormalRange(key, lab.testType)}</td>
            </tr>
        `).join('') : '<tr><td colspan="3">Results pending</td></tr>';
    
    const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Lab Report - Heal Well Hospital</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .patient-info { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 4px; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background: #f5f5f5; }
                .footer { text-align: center; margin-top: 50px; color: #666; font-size: 12px; }
                .signature-area { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
                .signature-line { border-top: 1px solid #333; padding-top: 4px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Heal Well Hospital</h1>
                <h2>Laboratory Report</h2>
            </div>
            
            <div class="patient-info">
                <div class="info-grid">
                    <div><strong>Patient:</strong> ${lab.patientName}</div>
                    <div><strong>Report ID:</strong> ${lab.id}</div>
                    <div><strong>Test Type:</strong> ${lab.testType}</div>
                    <div><strong>Test Date:</strong> ${new Date(lab.testDate).toLocaleDateString()}</div>
                    <div><strong>Results Date:</strong> ${lab.resultsDate ? new Date(lab.resultsDate).toLocaleDateString() : 'Pending'}</div>
                    <div><strong>Status:</strong> ${lab.status}</div>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Parameter</th>
                        <th>Result</th>
                        <th>Normal Range</th>
                    </tr>
                </thead>
                <tbody>
                    ${resultsHtml}
                </tbody>
            </table>
            
            <div style="margin: 20px 0;">
                <strong>Notes:</strong>
                <p>${lab.notes || 'No additional notes'}</p>
            </div>
            
            <div class="signature-area">
                <div>
                    <div class="signature-line">${lab.createdBy || 'Lab Technician'}</div>
                    <div style="text-align: center;">Medical Technologist</div>
                </div>
                <div>
                    <div class="signature-line">Dr. Maria Santos</div>
                    <div style="text-align: center;">Reviewing Physician</div>
                </div>
            </div>
            
            <div class="footer">
                <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                <p>This is an official laboratory report from Heal Well Hospital</p>
            </div>
        </body>
        </html>
    `;
    
    openPrintWindow(printHtml);
}

function getNormalRange(parameter, testType) {
    const ranges = {
        'Blood Chemistry': {
            'glucose': '70-100 mg/dL',
            'cholesterol': '< 200 mg/dL',
            'hemoglobin': '12-16 g/dL'
        },
        'Pulmonary Function': {
            'fev1': '> 80% predicted',
            'fvc': '> 80% predicted', 
            'ratio': '> 0.7'
        },
        'Urinalysis': {
            'appearance': 'Clear',
            'ph': '4.5-8.0',
            'protein': 'Negative'
        }
    };
    return ranges[testType]?.[parameter] || 'N/A';
}

