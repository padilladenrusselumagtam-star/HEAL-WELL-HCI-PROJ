document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const currentUser = getCurrentUser();
    if (currentUser.role !== 'Doctor' && currentUser.role !== 'Admin') {
        showToast('Access denied. Doctor role required.', 'error');
        setTimeout(() => window.location.href = 'medical-records.html', 2000);
        return;
    }
    
    loadPatients();
    setupEventListeners();
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
    document.getElementById('medicalRecordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveMedicalRecord();
    });
    
    document.getElementById('addPrescriptionBtn').addEventListener('click', function() {
        addPrescriptionRow();
    });
    
    document.getElementById('patientSelect').addEventListener('change', function() {
        loadPatientInfo(this.value);
    });
}

function loadPatientInfo(patientId) {
    if (!patientId) return;
    
    const patients = readCollection('hwh_patients');
    const patient = patients.find(p => p.id === patientId);
    
    if (patient) {
        document.getElementById('patientInfo').innerHTML = `
            <strong>Patient:</strong> ${patient.firstName} ${patient.lastName} | 
            <strong>DOB:</strong> ${patient.dateOfBirth} | 
            <strong>Blood Type:</strong> ${patient.bloodType || 'Unknown'} |
            <strong>Allergies:</strong> ${patient.allergies?.join(', ') || 'None'}
        `;
    }
}

function addPrescriptionRow() {
    const container = document.getElementById('prescriptionsContainer');
    const row = document.createElement('div');
    row.className = 'prescription-row';
    row.innerHTML = `
        <input type="text" placeholder="Medication" class="medication" required>
        <input type="text" placeholder="Dosage" class="dosage" required>
        <input type="text" placeholder="Duration" class="duration" required>
        <input type="text" placeholder="Instructions" class="instructions">
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(row);
}

function saveMedicalRecord() {
    const patientId = document.getElementById('patientSelect').value;
    const recordDate = document.getElementById('recordDate').value;
    const diagnosis = document.getElementById('diagnosis').value;
    const symptoms = document.getElementById('symptoms').value;
    const bloodPressure = document.getElementById('bloodPressure').value;
    const heartRate = document.getElementById('heartRate').value;
    const temperature = document.getElementById('temperature').value;
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;
    const notes = document.getElementById('notes').value;
    
    if (!patientId || !recordDate || !diagnosis) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    const prescriptionRows = document.querySelectorAll('.prescription-row');
    const prescriptions = [];
    
    prescriptionRows.forEach(row => {
        const medication = row.querySelector('.medication').value;
        const dosage = row.querySelector('.dosage').value;
        const duration = row.querySelector('.duration').value;
        const instructions = row.querySelector('.instructions').value;
        
        if (medication && dosage && duration) {
            prescriptions.push({
                medication,
                dosage,
                duration,
                instructions
            });
        }
    });
    
    simulateServerDelay(() => {
        const patients = readCollection('hwh_patients');
        const patient = patients.find(p => p.id === patientId);
        const currentUser = getCurrentUser();
        
        const medicalRecord = {
            id: generateId('MR'),
            patientId: patientId,
            patientName: `${patient.firstName} ${patient.lastName}`,
            date: recordDate,
            doctorId: currentUser.id,
            doctorName: currentUser.name,
            diagnosis: diagnosis,
            symptoms: symptoms,
            bloodPressure: bloodPressure,
            heartRate: heartRate ? parseInt(heartRate) : null,
            temperature: temperature ? parseFloat(temperature) : null,
            weight: weight ? parseFloat(weight) : null,
            height: height ? parseFloat(height) : null,
            notes: notes,
            prescriptions: prescriptions,
            createdAt: new Date().toISOString()
        };
        
        const medicalRecords = readCollection('hwh_medical_records');
        medicalRecords.push(medicalRecord);
        persistCollection('hwh_medical_records', medicalRecords);
        
        showToast('Medical record created successfully', 'success');
        
        setTimeout(() => {
            window.location.href = 'medical-records.html';
        }, 1500);
    });
}

document.getElementById('logoutBtn').addEventListener('click', function() {
        logout();
    });