document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    loadOutpatients();
});

function loadOutpatients() {
    const appointments = readCollection('hwh_appointments');
    const today = new Date().toISOString().split('T')[0];
    
    const todayAppointments = appointments.filter(apt => 
        apt.date === today && apt.status === 'scheduled'
    );
    
    renderOutpatients(todayAppointments);
}

function renderOutpatients(appointments) {
    const container = document.getElementById('outpatientsList');
    
    if (appointments.length === 0) {
        container.innerHTML = '<tr><td colspan="5" class="no-data">No outpatient appointments today</td></tr>';
        return;
    }
    
    let html = '';
    
    appointments.forEach(apt => {
        html += `
            <tr>
                <td>${apt.time}</td>
                <td>${apt.patientName}</td>
                <td>${apt.doctorName}</td>
                <td>${apt.reason}</td>
                <td>
                    <button class="btn-view" onclick="viewOutpatient('${apt.id}')">View</button>
                    <button class="btn-checkin" onclick="checkInPatient('${apt.id}')">Check In</button>
                </td>
            </tr>
        `;
    });
    
    container.innerHTML = html;
}

function viewOutpatient(appointmentId) {
    window.location.href = `appointment-view.html?id=${appointmentId}`;
}

function checkInPatient(appointmentId) {
    simulateServerDelay(() => {
        const appointments = readCollection('hwh_appointments');
        const appointment = appointments.find(apt => apt.id === appointmentId);
        
        if (appointment) {
            appointment.checkedIn = true;
            appointment.checkInTime = new Date().toLocaleTimeString();
            persistCollection('hwh_appointments', appointments);
            
            showToast('Patient checked in successfully', 'success');
            loadOutpatients();
        }
    });
}

document.getElementById('logoutBtn').addEventListener('click', function() {
        logout();
    });