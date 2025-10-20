document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const appointmentId = urlParams.get('id');
    const editMode = urlParams.get('edit') === 'true';
    
    if (appointmentId) {
        loadAppointment(appointmentId, editMode);
    }
    
    setupEventListeners(appointmentId);
});

function loadAppointment(appointmentId, editMode) {
    const appointments = readCollection('hwh_appointments');
    const appointment = appointments.find(a => a.id === appointmentId);
    const currentUser = getCurrentUser();
    
    if (!appointment) {
        showToast('Appointment not found', 'error');
        setTimeout(() => window.location.href = 'appointments.html', 2000);
        return;
    }
    
    if (currentUser.role === 'Patient' && appointment.patientId !== currentUser.patientId) {
        showToast('Access denied', 'error');
        setTimeout(() => window.location.href = 'appointments.html', 2000);
        return;
    }
    
    document.getElementById('appointmentId').textContent = appointment.id;
    document.getElementById('patientName').textContent = appointment.patientName;
    document.getElementById('appointmentDate').textContent = new Date(appointment.date).toLocaleDateString();
    document.getElementById('appointmentTime').textContent = appointment.time;
    document.getElementById('doctorName').textContent = appointment.doctorName;
    document.getElementById('status').textContent = appointment.status;
    document.getElementById('reason').textContent = appointment.reason;
    
    if (appointment.packageName) {
        document.getElementById('packageInfo').textContent = appointment.packageName;
    } else {
        document.getElementById('packageInfo').parentElement.style.display = 'none';
    }
    
    if (editMode && canEditAppointment(appointment)) {
        enableEditMode(appointment);
    }
    
    updateActionButtons(appointment);
}

function enableEditMode(appointment) {
    document.querySelectorAll('.view-mode').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.edit-mode').forEach(el => el.style.display = 'block');
    
    document.getElementById('editDate').value = appointment.date;
    document.getElementById('editTime').value = appointment.time;
    document.getElementById('editReason').value = appointment.reason;
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('editDate').min = today;
}

function updateActionButtons(appointment) {
    const currentUser = getCurrentUser();
    const editBtn = document.getElementById('editBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const printBtn = document.getElementById('printBtn');
    
    if (!canEditAppointment(appointment)) {
        editBtn.style.display = 'none';
    }
    
    if (!canCancelAppointment(appointment)) {
        cancelBtn.style.display = 'none';
    }
    
    if (currentUser.role === 'Patient' && appointment.patientId !== currentUser.patientId) {
        printBtn.style.display = 'none';
    }
}

function setupEventListeners(appointmentId) {
    document.getElementById('editBtn').addEventListener('click', function() {
        window.location.href = `appointment-view.html?id=${appointmentId}&edit=true`;
    });
    
    document.getElementById('cancelBtn').addEventListener('click', function() {
        cancelAppointment(appointmentId);
    });
    
    document.getElementById('printBtn').addEventListener('click', function() {
        printAppointment(appointmentId);
    });
    
    document.getElementById('saveBtn').addEventListener('click', function() {
        saveAppointment(appointmentId);
    });
    
    document.getElementById('cancelEditBtn').addEventListener('click', function() {
        window.location.href = `appointment-view.html?id=${appointmentId}`;
    });
}

function cancelAppointment(appointmentId) {
    if (!confirmAction('Are you sure you want to cancel this appointment?')) return;
    
    simulateServerDelay(() => {
        const appointments = readCollection('hwh_appointments');
        const appointment = appointments.find(a => a.id === appointmentId);
        
        if (appointment) {
            appointment.status = 'cancelled';
            appointment.cancelledAt = new Date().toISOString();
            persistCollection('hwh_appointments', appointments);
            
            showToast('Appointment cancelled successfully', 'success');
            setTimeout(() => window.location.href = 'appointments.html', 1000);
        }
    });
}

function saveAppointment(appointmentId) {
    const newDate = document.getElementById('editDate').value;
    const newTime = document.getElementById('editTime').value;
    const newReason = document.getElementById('editReason').value;
    
    if (!newDate || !newTime || !newReason) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    const selectedDate = new Date(newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showToast('Cannot schedule appointments in the past', 'error');
        return;
    }
    
    simulateServerDelay(() => {
        const appointments = readCollection('hwh_appointments');
        const appointment = appointments.find(a => a.id === appointmentId);
        
        if (appointment) {
            appointment.date = newDate;
            appointment.time = newTime;
            appointment.reason = newReason;
            appointment.updatedAt = new Date().toISOString();
            
            persistCollection('hwh_appointments', appointments);
            
            showToast('Appointment updated successfully', 'success');
            setTimeout(() => window.location.href = `appointment-view.html?id=${appointmentId}`, 1000);
        }
    });
}

function printAppointment(appointmentId) {
    const appointments = readCollection('hwh_appointments');
    const appointment = appointments.find(a => a.id === appointmentId);
    
    if (!appointment) return;
    
    const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Appointment Summary - Heal Well Hospital</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .patient-info, .appointment-info { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
                .info-row { display: flex; margin-bottom: 8px; }
                .info-label { font-weight: bold; width: 150px; }
                .footer { text-align: center; margin-top: 50px; color: #666; font-size: 12px; }
                .status { padding: 4px 8px; border-radius: 4px; font-weight: bold; }
                .status-scheduled { background: #e3f2fd; color: #1976d2; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Heal Well Hospital</h1>
                <h2>Appointment Summary</h2>
            </div>
            
            <div class="patient-info">
                <h3>Patient Information</h3>
                <div class="info-row">
                    <div class="info-label">Patient Name:</div>
                    <div>${appointment.patientName}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Appointment ID:</div>
                    <div>${appointment.id}</div>
                </div>
            </div>
            
            <div class="appointment-info">
                <h3>Appointment Details</h3>
                <div class="info-row">
                    <div class="info-label">Date:</div>
                    <div>${new Date(appointment.date).toLocaleDateString()}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Time:</div>
                    <div>${appointment.time}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Doctor:</div>
                    <div>${appointment.doctorName}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Status:</div>
                    <div class="status status-${appointment.status}">${appointment.status}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Reason:</div>
                    <div>${appointment.reason}</div>
                </div>
                ${appointment.packageName ? `
                <div class="info-row">
                    <div class="info-label">Package:</div>
                    <div>${appointment.packageName}</div>
                </div>
                ` : ''}
            </div>
            
            <div class="footer">
                <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                <p>Please arrive 15 minutes before your scheduled appointment time.</p>
            </div>
        </body>
        </html>
    `;
    
    openPrintWindow(printHtml);
}

document.getElementById('logoutBtn').addEventListener('click', function() {
        logout();
    });