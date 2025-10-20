document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const packageId = urlParams.get('pkg');
    
    if (packageId) {
        loadPackageDetails(packageId);
    }
    
    setupEventListeners();
    loadPatients();
});

function loadPackageDetails(packageId) {
    const packages = readCollection('hwh_packages');
    const pkg = packages.find(p => p.id === packageId);
    
    if (pkg) {
        document.getElementById('packageName').textContent = pkg.name;
        document.getElementById('packagePrice').textContent = formatCurrency(pkg.price);
        document.getElementById('packageInclusions').innerHTML = pkg.inclusions.map(inc => `<li>${inc}</li>`).join('');
    }
}

function setupEventListeners() {
    const patientSearch = document.getElementById('patientSearch');
    const patientSelect = document.getElementById('patientSelect');
    const newPatientSection = document.getElementById('newPatientSection');
    const existingPatientSection = document.getElementById('existingPatientSection');
    
    patientSearch.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const patients = readCollection('hwh_patients');
        
        const filtered = patients.filter(p => 
            p.id.toLowerCase().includes(query) || 
            `${p.firstName} ${p.lastName}`.toLowerCase().includes(query)
        );
        
        patientSelect.innerHTML = '<option value="">Select Patient</option>';
        filtered.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.id} - ${patient.firstName} ${patient.lastName}`;
            patientSelect.appendChild(option);
        });
    });
    
    document.getElementById('patientType').addEventListener('change', function() {
        if (this.value === 'new') {
            newPatientSection.style.display = 'block';
            existingPatientSection.style.display = 'none';
        } else {
            newPatientSection.style.display = 'none';
            existingPatientSection.style.display = 'block';
        }
    });
    
    document.getElementById('bookingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        confirmBooking();
    });
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;
}

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

function confirmBooking() {
    const patientType = document.getElementById('patientType').value;
    const appointmentDate = document.getElementById('appointmentDate').value;
    const appointmentTime = document.getElementById('appointmentTime').value;
    const reason = document.getElementById('reason').value;
    
    if (!appointmentDate || !appointmentTime || !reason) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    const selectedDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showToast('Cannot book appointments in the past', 'error');
        return;
    }
    
    let patientId, patientName;
    
    if (patientType === 'existing') {
        const patientSelect = document.getElementById('patientSelect');
        if (!patientSelect.value) {
            showToast('Please select a patient', 'error');
            return;
        }
        
        const patients = readCollection('hwh_patients');
        const patient = patients.find(p => p.id === patientSelect.value);
        patientId = patient.id;
        patientName = `${patient.firstName} ${patient.lastName}`;
    } else {
        const firstName = document.getElementById('newFirstName').value;
        const lastName = document.getElementById('newLastName').value;
        const contact = document.getElementById('newContact').value;
        
        if (!firstName || !lastName || !contact) {
            showToast('Please fill all new patient details', 'error');
            return;
        }
        
        if (!validatePhone(contact)) {
            showToast('Please enter a valid phone number', 'error');
            return;
        }
        
        patientId = generateId('P');
        patientName = `${firstName} ${lastName}`;
        
        const newPatient = {
            id: patientId,
            registrationDate: new Date().toISOString().split('T')[0],
            firstName: firstName,
            lastName: lastName,
            contactNumber: contact,
            email: document.getElementById('newEmail').value || '',
            gender: document.getElementById('newGender').value || 'Unknown'
        };
        
        const patients = readCollection('hwh_patients');
        patients.push(newPatient);
        persistCollection('hwh_patients', patients);
    }
    
    simulateServerDelay(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const packageId = urlParams.get('pkg');
        const packages = readCollection('hwh_packages');
        const pkg = packages.find(p => p.id === packageId);
        
        const currentUser = getCurrentUser();
        
        const appointment = {
            id: generateId('APPT'),
            patientId: patientId,
            patientName: patientName,
            packageId: packageId,
            packageName: pkg ? pkg.name : null,
            date: appointmentDate,
            time: appointmentTime,
            doctorId: 'U-2025-0002',
            doctorName: 'Dr. Maria Santos',
            status: 'scheduled',
            reason: reason,
            createdAt: new Date().toISOString()
        };
        
        const appointments = readCollection('hwh_appointments');
        appointments.push(appointment);
        persistCollection('hwh_appointments', appointments);
        
        showToast('Appointment booked successfully!', 'success');
        
        setTimeout(() => {
            window.location.href = `booking-confirm.html?appointment=${appointment.id}`;
        }, 1000);
    });
}