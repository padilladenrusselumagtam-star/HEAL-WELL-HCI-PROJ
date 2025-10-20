document.addEventListener('DOMContentLoaded', function() {
    const dischargeData = JSON.parse(sessionStorage.getItem('dischargeSummary'));
    
    if (!dischargeData) {
        alert('No discharge data found. Redirecting to inpatient page.');
        window.location.href = 'inpatient.html';
        return;
    }
    
    displayDischargeSummary(dischargeData);
    
    window.print();
    
    setTimeout(function() {
        window.location.href = 'inpatient.html';
    }, 1000);
});

function displayDischargeSummary(data) {
    const patient = data.patientInfo;
    
    document.getElementById('patientSummary').innerHTML = `
        <div class="summary-item">
            <span class="summary-label">Patient Name:</span>
            <span class="summary-value">${patient.name}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Date of Birth:</span>
            <span class="summary-value">${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Not specified'}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Patient ID:</span>
            <span class="summary-value">${patient.id}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Address:</span>
            <span class="summary-value">${patient.address || 'Not specified'}</span>
        </div>
    `;
    
    const admissionDate = new Date(patient.admissionDate);
    const dischargeDate = new Date(data.dischargeDate);
    const lengthOfStay = Math.ceil((dischargeDate - admissionDate) / (1000 * 60 * 60 * 24));
    
    document.getElementById('hospitalizationDetails').innerHTML = `
        <div class="summary-item">
            <span class="summary-label">Admission Date:</span>
            <span class="summary-value">${admissionDate.toLocaleDateString()}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Discharge Date:</span>
            <span class="summary-value">${dischargeDate.toLocaleDateString()}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Length of Stay:</span>
            <span class="summary-value">${lengthOfStay} days</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Room/Bed:</span>
            <span class="summary-value">${patient.room} / ${patient.bed}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Primary Diagnosis:</span>
            <span class="summary-value">${patient.diagnosis}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Attending Physician:</span>
            <span class="summary-value">${patient.attendingPhysician}</span>
        </div>
    `;
    
    document.getElementById('physicianName').textContent = patient.attendingPhysician;
    
    document.getElementById('dischargeInfo').innerHTML = `
        <div class="summary-item">
            <span class="summary-label">Discharge Condition:</span>
            <span class="summary-value">${formatDischargeCondition(data.dischargeCondition)}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Discharge Time:</span>
            <span class="summary-value">${data.dischargeTime}</span>
        </div>
        ${data.followupAppointment ? `
        <div class="summary-item">
            <span class="summary-label">Follow-up Appointment:</span>
            <span class="summary-value">${new Date(data.followupAppointment).toLocaleString()}</span>
        </div>
        ` : ''}
        <div class="summary-item">
            <span class="summary-label">Discharge Summary ID:</span>
            <span class="summary-value">${data.dischargeSummaryId}</span>
        </div>
    `;
    
    document.getElementById('followupInstructions').textContent = data.followupCare || 'No specific follow-up instructions provided.';
    document.getElementById('dischargeMedications').textContent = data.medications || 'No medications prescribed at discharge.';
}

function formatDischargeCondition(condition) {
    const conditions = {
        'improved': 'Improved',
        'stable': 'Stable',
        'unchanged': 'Unchanged',
        'worsened': 'Worsened'
    };
    return conditions[condition] || condition;
}

