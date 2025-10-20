document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const currentUser = getCurrentUser();
    if (currentUser.role === 'Patient') {
        document.getElementById('addAppointmentBtn').style.display = 'none';
    }
    
    loadAppointments();
    setupEventListeners();
});

function loadAppointments() {
    const appointments = readCollection('hwh_appointments');
    const currentUser = getCurrentUser();
    
    let filteredAppointments = appointments;
    
    if (currentUser.role === 'Patient') {
        filteredAppointments = appointments.filter(a => a.patientId === currentUser.patientId);
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    const upcoming = filteredAppointments.filter(a => a.date >= today && a.status === 'scheduled');
    const past = filteredAppointments.filter(a => a.date < today && a.status === 'completed');
    const cancelled = filteredAppointments.filter(a => a.status === 'cancelled');
    
    renderAppointmentGroup('upcomingAppointments', upcoming, 'Upcoming Appointments');
    renderAppointmentGroup('pastAppointments', past, 'Past Appointments');
    renderAppointmentGroup('cancelledAppointments', cancelled, 'Cancelled Appointments');
}

function renderAppointmentGroup(containerId, appointments, title) {
    const container = document.getElementById(containerId);
    
    if (appointments.length === 0) {
        container.innerHTML = `<p class="no-data">No ${title.toLowerCase()}</p>`;
        return;
    }
    
    let html = '';
    
    appointments.forEach(appt => {
        html += `
            <div class="appointment-card">
                <div class="appointment-header">
                    <h4>${appt.patientName}</h4>
                    <span class="appointment-status status-${appt.status}">${appt.status}</span>
                </div>
                <div class="appointment-details">
                    <p><strong>Date:</strong> ${new Date(appt.date).toLocaleDateString()} at ${appt.time}</p>
                    <p><strong>Doctor:</strong> ${appt.doctorName}</p>
                    <p><strong>Reason:</strong> ${appt.reason}</p>
                    ${appt.packageName ? `<p><strong>Package:</strong> ${appt.packageName}</p>` : ''}
                </div>
                <div class="appointment-actions">
                    <button class="btn-view" onclick="viewAppointment('${appt.id}')">View</button>
                    ${canEditAppointment(appt) ? `<button class="btn-edit" onclick="editAppointment('${appt.id}')">Edit</button>` : ''}
                    ${canCancelAppointment(appt) ? `<button class="btn-cancel" onclick="cancelAppointment('${appt.id}')">Cancel</button>` : ''}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function canEditAppointment(appt) {
    const currentUser = getCurrentUser();
    if (currentUser.role === 'Patient') return false;
    if (appt.status !== 'scheduled') return false;
    return true;
}

function canCancelAppointment(appt) {
    const currentUser = getCurrentUser();
    if (appt.status !== 'scheduled') return false;
    if (currentUser.role === 'Patient' && appt.patientId !== currentUser.patientId) return false;
    return true;
}

function setupEventListeners() {
    document.getElementById('addAppointmentBtn').addEventListener('click', function() {
        window.location.href = 'packages.html';
    });
    
    document.getElementById('filterStatus').addEventListener('change', function() {
        loadAppointments();
    });
}

function viewAppointment(appointmentId) {
    window.location.href = `appointment-view.html?id=${appointmentId}`;
}

function editAppointment(appointmentId) {
    window.location.href = `appointment-view.html?id=${appointmentId}&edit=true`;
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
            loadAppointments();
        }       
    });

    
}
