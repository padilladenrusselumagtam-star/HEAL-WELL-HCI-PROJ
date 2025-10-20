document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const currentUser = getCurrentUser();
    if (currentUser.role === 'Patient') {
        document.getElementById('addRecordBtn').style.display = 'none';
    }
    
    loadMedicalRecords();
    setupEventListeners();
});

function loadMedicalRecords() {
    const records = readCollection('hwh_medical_records');
    const patients = readCollection('hwh_patients');
    const currentUser = getCurrentUser();
    
    let filteredRecords = records;
    
    if (currentUser.role === 'Patient') {
        filteredRecords = records.filter(r => r.patientId === currentUser.patientId);
    }
    
    const patientFilter = document.getElementById('patientFilter').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    const doctorFilter = document.getElementById('doctorFilter').value;
    
    if (patientFilter) {
        filteredRecords = filteredRecords.filter(r => r.patientId === patientFilter);
    }
    
    if (dateFrom) {
        filteredRecords = filteredRecords.filter(r => r.date >= dateFrom);
    }
    
    if (dateTo) {
        filteredRecords = filteredRecords.filter(r => r.date <= dateTo);
    }
    
    if (doctorFilter) {
        filteredRecords = filteredRecords.filter(r => r.doctorId === doctorFilter);
    }
    
    renderMedicalRecords(filteredRecords);
    populateFilters(patients);
}

function renderMedicalRecords(records) {
    const container = document.getElementById('medicalRecordsList');
    
    if (records.length === 0) {
        container.innerHTML = '<tr><td colspan="6" class="no-data">No medical records found</td></tr>';
        return;
    }
    
    let html = '';
    
    records.forEach(record => {
        html += `
            <tr>
                <td>${record.date}</td>
                <td>${record.patientName}</td>
                <td>${record.doctorName}</td>
                <td>${record.diagnosis}</td>
                <td>${record.bloodPressure || 'N/A'}</td>
                <td>
                    <button class="btn-view" onclick="viewMedicalRecord('${record.id}')">View</button>
                    ${canEditMedicalRecord(record) ? `<button class="btn-edit" onclick="editMedicalRecord('${record.id}')">Edit</button>` : ''}
                </td>
            </tr>
        `;
    });
    
    container.innerHTML = html;
}

function populateFilters(patients) {
    const patientFilter = document.getElementById('patientFilter');
    const doctorFilter = document.getElementById('doctorFilter');
    const users = readCollection('hwh_users');
    
    patientFilter.innerHTML = '<option value="">All Patients</option>';
    patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = `${patient.firstName} ${patient.lastName}`;
        patientFilter.appendChild(option);
    });
    
    const doctors = users.filter(u => u.role === 'Doctor');
    doctorFilter.innerHTML = '<option value="">All Doctors</option>';
    doctors.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor.id;
        option.textContent = doctor.name;
        doctorFilter.appendChild(option);
    });
}

function canEditMedicalRecord(record) {
    const currentUser = getCurrentUser();
    if (currentUser.role === 'Patient') return false;
    if (currentUser.role === 'Doctor' && record.doctorId !== currentUser.id) return false;
    return true;
}

function setupEventListeners() {
    document.getElementById('addRecordBtn').addEventListener('click', function() {
        window.location.href = 'medical-record-add.html';
    });
    
    document.getElementById('patientFilter').addEventListener('change', loadMedicalRecords);
    document.getElementById('dateFrom').addEventListener('change', loadMedicalRecords);
    document.getElementById('dateTo').addEventListener('change', loadMedicalRecords);
    document.getElementById('doctorFilter').addEventListener('change', loadMedicalRecords);
    
    document.getElementById('resetFilters').addEventListener('click', function() {
        document.getElementById('patientFilter').value = '';
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        document.getElementById('doctorFilter').value = '';
        loadMedicalRecords();
    });
}

function viewMedicalRecord(recordId) {
    window.location.href = `medical-record-view.html?id=${recordId}`;
}

function editMedicalRecord(recordId) {
    window.location.href = `medical-record-edit.html?id=${recordId}`;
}

    document.getElementById('logoutBtn').addEventListener('click', function() {
        logout();
    });

    