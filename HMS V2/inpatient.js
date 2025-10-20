document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const currentUser = getCurrentUser();
    if (currentUser.role === 'Patient') {
        document.querySelectorAll('.admin-only, .staff-only').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    loadInpatients();
    setupEventListeners();
});

function loadInpatients() {
    const patients = readCollection('hwh_patients');
    const container = document.getElementById('inpatientsList');
    
    const inpatients = patients.filter(p => p.admissionStatus === 'admitted');
    
    if (inpatients.length === 0) {
        container.innerHTML = '<tr><td colspan="6" class="no-data">No inpatients currently admitted</td></tr>';
        return;
    }
    
    let html = '';
    
    inpatients.forEach(patient => {
        html += `
            <tr>
                <td>${patient.id}</td>
                <td>${patient.firstName} ${patient.lastName}</td>
                <td>${patient.admissionDate}</td>
                <td>${patient.ward || 'General Ward'}</td>
                <td>${patient.diagnosis || 'Under observation'}</td>
                <td>
                    <button class="btn-view" onclick="viewInpatient('${patient.id}')">View</button>
                    <button class="btn-discharge" onclick="initiateDischarge('${patient.id}')">Discharge</button>
                </td>
            </tr>
        `;
    });
    
    container.innerHTML = html;
}

function setupEventListeners() {
    document.getElementById('admitPatientBtn').addEventListener('click', function() {
        showAdmitPatientModal();
    });
    
    document.getElementById('admitForm').addEventListener('submit', function(e) {
        e.preventDefault();
        admitPatient();
    });
}

function showAdmitPatientModal() {
    const modal = document.getElementById('admitPatientModal');
    const patientSelect = document.getElementById('admitPatientSelect');
    
    const patients = readCollection('hwh_patients');
    patientSelect.innerHTML = '<option value="">Select Patient</option>';
    
    patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = `${patient.id} - ${patient.firstName} ${patient.lastName}`;
        patientSelect.appendChild(option);
    });
    
    modal.style.display = 'block';
}

function admitPatient() {
    const patientId = document.getElementById('admitPatientSelect').value;
    const admissionDate = document.getElementById('admissionDate').value;
    const ward = document.getElementById('ward').value;
    const diagnosis = document.getElementById('admissionDiagnosis').value;
    
    if (!patientId || !admissionDate || !ward) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    const selectedDate = new Date(admissionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showToast('Cannot admit for past dates', 'error');
        return;
    }
    
    simulateServerDelay(() => {
        const patients = readCollection('hwh_patients');
        const patient = patients.find(p => p.id === patientId);
        
        if (patient) {
            patient.admissionStatus = 'admitted';
            patient.admissionDate = admissionDate;
            patient.ward = ward;
            patient.diagnosis = diagnosis;
            patient.admittedBy = getCurrentUser().username;
            
            persistCollection('hwh_patients', patients);
            
            document.getElementById('admitPatientModal').style.display = 'none';
            showToast('Patient admitted successfully', 'success');
            loadInpatients();
        }
    });
}

function viewInpatient(patientId) {
    window.location.href = `inpatient-view.html?id=${patientId}`;
}

function initiateDischarge(patientId) {
    if (confirmAction('Are you sure you want to discharge this patient?')) {
        window.location.href = `discharge.html?patientId=${patientId}`;
    }
}