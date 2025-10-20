document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;

    const urlParams = new URLSearchParams(window.location.search);
    const appointmentId = urlParams.get('id');
    const editMode = urlParams.get('edit') === 'true';

    document.getElementById('backBtn').addEventListener('click', function() {
        window.location.href = 'appointments.html';
    });

    document.getElementById('editBtn').addEventListener('click', function() {
        if (appointmentId) {
            window.location.href = `appointment-view.html?id=${appointmentId}&edit=true`;
        } else {
            showToast('Cannot edit, no appointment specified', 'error');
        }
    });

    document.getElementById('printBtn').addEventListener('click', function() {
        if (appointmentId) {
            printAppointment(appointmentId);
        } else {
            showToast('Cannot print, no appointment specified', 'error');
        }
    });
    
    if (appointmentId) {
        loadAppointment(appointmentId, editMode);
        setupConditionalEventListeners(appointmentId);
    } else {
        showToast('No appointment specified', 'error');
        setTimeout(() => window.location.href = 'appointments.html', 2000);
    }
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

function setupConditionalEventListeners(appointmentId) {
    document.getElementById('cancelBtn').addEventListener('click', function() {
        cancelAppointment(appointmentId);
    });

    document.getElementById('saveBtn').addEventListener('click', function() {
        saveAppointment(appointmentId);
    });

    document.getElementById('cancelEditBtn').addEventListener('click', function() {
        window.location.href = `appointment-view.html?id=${appointmentId}`;
    });
}

function enableEditMode(appointment) {
    document.querySelector('.view-mode').style.display = 'none';
    document.querySelector('.edit-mode').style.display = 'block';

    document.getElementById('editDate').value = appointment.date;
    document.getElementById('editTime').value = appointment.time;
    document.getElementById('editReason').value = appointment.reason;

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('editDate').min = today;
}

function updateActionButtons(appointment) {
    const editBtn = document.getElementById('editBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    if (!canEditAppointment(appointment)) {
        editBtn.style.display = 'none';
    }

    if (!canCancelAppointment(appointment)) {
        cancelBtn.style.display = 'none';
    }
}

function cancelAppointment(appointmentId) {
    if (!confirmAction('Are you sure you want to cancel this appointment?')) return;

    simulateServerDelay(() => {
        const appointments = readCollection('hwh_appointments');
        const appointmentIndex = appointments.findIndex(a => a.id === appointmentId);

        if (appointmentIndex > -1) {
            appointments[appointmentIndex].status = 'Cancelled';
            appointments[appointmentIndex].updatedAt = new Date().toISOString();
            persistCollection('hwh_appointments', appointments);

            showToast('Appointment cancelled successfully', 'success');
            setTimeout(() => window.location.href = 'appointments.html', 1000);
        } else {
            showToast('Error: Appointment not found.', 'error');
        }
    });
}

function saveAppointment(appointmentId) {
    const newDate = document.getElementById('editDate').value;
    const newTime = document.getElementById('editTime').value;
    const newReason = document.getElementById('editReason').value;

    if (!newDate || !newTime || !newReason) {
        showToast('Please fill all required fields.', 'error');
        return;
    }

    const selectedDateTime = new Date(`${newDate}T${newTime}`);
    if (selectedDateTime < new Date()) {
        showToast('Cannot schedule appointments in the past.', 'error');
        return;
    }

    simulateServerDelay(() => {
        const appointments = readCollection('hwh_appointments');
        const appointmentIndex = appointments.findIndex(a => a.id === appointmentId);

        if (appointmentIndex > -1) {
            appointments[appointmentIndex].date = newDate;
            appointments[appointmentIndex].time = newTime;
            appointments[appointmentIndex].reason = newReason;
            appointments[appointmentIndex].status = 'Scheduled';
            appointments[appointmentIndex].updatedAt = new Date().toISOString();

            persistCollection('hwh_appointments', appointments);

            showToast('Appointment updated successfully', 'success');
            setTimeout(() => window.location.href = `appointment-view.html?id=${appointmentId}`, 1000);
        } else {
            showToast('Error: Appointment not found.', 'error');
        }
    });
}


function printAppointment(appointmentId) {
    const appointments = readCollection('hwh_appointments');
    const appointment = appointments.find(a => a.id === appointmentId);

    if (!appointment) {
        showToast('Could not find appointment details to print.', 'error');
        return;
    }

    const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Appointment Summary - Heal Well Hospital</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                .header h1 { color: #0056b3; }
                .info-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
                .info-section h3 { margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                .info-row { display: flex; margin-bottom: 10px; font-size: 14px; }
                .info-label { font-weight: bold; width: 150px; color: #555; }
                .footer { text-align: center; margin-top: 50px; color: #777; font-size: 12px; }
                .status { padding: 4px 10px; border-radius: 12px; font-weight: bold; text-transform: uppercase; font-size: 12px; }
                .status-Scheduled { background-color: #e3f2fd; color: #1e88e5; }
                .status-Completed { background-color: #e8f5e9; color: #43a047; }
                .status-Cancelled { background-color: #ffebee; color: #e53935; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Heal Well Hospital</h1>
                <h2>Appointment Summary</h2>
            </div>

            <div class="info-section">
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

            <div class="info-section">
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
                    <div><span class="status status-${appointment.status}">${appointment.status}</span></div>
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
                <p>Generated on: ${new Date().toLocaleString()}</p>
                <p>Please arrive 15 minutes before your scheduled appointment time.</p>
                <p>Heal Well Hospital | 123 Health St, Wellness City | (123) 456-7890</p>
            </div>
        </body>
        </html>
    `;

    openPrintWindow(printHtml);
}