document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const currentUser = getCurrentUser();
    document.getElementById('userName').textContent = currentUser.name;
    
    if (currentUser.role === 'Patient') {
        document.querySelectorAll('.admin-only, .staff-only, .doctor-only').forEach(el => {
            el.style.display = 'none';
        });
    } else if (currentUser.role === 'Staff') {
        document.querySelectorAll('.admin-only, .doctor-only').forEach(el => {
            el.style.display = 'none';
        });
    } else if (currentUser.role === 'Doctor') {
        document.querySelectorAll('.admin-only, .staff-only').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    loadDashboardData();
    setupEventListeners();
});

function loadDashboardData() {
    const appointments = readCollection('hwh_appointments');
    const medicalRecords = readCollection('hwh_medical_records');
    const bills = readCollection('hwh_bills');
    const currentUser = getCurrentUser();
    
    const today = new Date().toISOString().split('T')[0];
    
    let upcomingAppointments = appointments.filter(a => a.date >= today && a.status === 'scheduled');
    let medicalRecordsCount = medicalRecords.length;
    
    if (currentUser.role === 'Patient') {
        upcomingAppointments = upcomingAppointments.filter(a => a.patientId === currentUser.patientId);
        medicalRecordsCount = medicalRecords.filter(mr => mr.patientId === currentUser.patientId).length;
    }
    
    const pendingBills = bills.filter(b => b.status !== 'paid');
    const pendingTotal = pendingBills.reduce((sum, bill) => sum + bill.balance, 0);
    
    document.getElementById('upcomingAppointments').textContent = upcomingAppointments.length;
    document.getElementById('medicalRecords').textContent = medicalRecordsCount;
    document.getElementById('treatmentProgress').textContent = '75%';
    document.getElementById('pendingBills').textContent = formatCurrency(pendingTotal);
    
    loadRecentActivity();
    loadQuickActions();
}

function loadRecentActivity() {
    const activityList = document.getElementById('recentActivity');
    const appointments = readCollection('hwh_appointments');
    const currentUser = getCurrentUser();
    
    let recentActivities = appointments
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    if (currentUser.role === 'Patient') {
        recentActivities = recentActivities.filter(a => a.patientId === currentUser.patientId);
    }
    
    activityList.innerHTML = '';
    
    if (recentActivities.length === 0) {
        activityList.innerHTML = '<li class="no-data">No recent activity</li>';
        return;
    }
    
    recentActivities.forEach(activity => {
        const li = document.createElement('li');
        li.style.padding = '0.5rem 0';
        li.style.borderBottom = '1px solid var(--border-color)';
        li.innerHTML = `
            <strong>${activity.patientName}</strong> - ${activity.packageName || 'Consultation'}
            <span style="float: right; color: var(--dark-gray); font-size: 0.9rem;">${new Date(activity.date).toLocaleDateString()}</span>
        `;
        activityList.appendChild(li);
    });
}

function loadQuickActions() {
    const currentUser = getCurrentUser();
    const quickActions = document.getElementById('quickActions');
    
    quickActions.innerHTML = '';
    
    const actions = [];
    
    if (currentUser.role !== 'Patient') {
        actions.push({ text: 'Register Patient', url: 'register-step1.html', icon: '📝' });
        actions.push({ text: 'Book Appointment', url: 'packages.html', icon: '📅' });
    }
    
    if (currentUser.role === 'Doctor' || currentUser.role === 'Admin') {
        actions.push({ text: 'Medical Records', url: 'medical-records.html', icon: '🏥' });
        actions.push({ text: 'Laboratory', url: 'laboratory.html', icon: '🔬' });
        actions.push({ text: 'Diet Plans', url: 'diet.html', icon: '🥗' });
    }
    
    if (currentUser.role !== 'Patient') {
        actions.push({ text: 'Billing', url: 'billing.html', icon: '💰' });
        actions.push({ text: 'Inpatient', url: 'inpatient.html', icon: '🏨' });
    }
    
    actions.push({ text: 'My Appointments', url: 'appointments.html', icon: '👨‍⚕️' });
    
    actions.forEach(action => {
        const button = document.createElement('a');
        button.className = 'quick-action-btn';
        button.href = action.url;
        button.innerHTML = `<div style="font-size: 2rem; margin-bottom: 0.5rem;">${action.icon}</div>${action.text}`;
        quickActions.appendChild(button);
    });
}

function setupEventListeners() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = searchInput.value.trim().toLowerCase();
            
            if (query) {
                const patients = readCollection('hwh_patients');
                const foundPatient = patients.find(p => 
                    p.id.toLowerCase().includes(query) || 
                    `${p.firstName} ${p.lastName}`.toLowerCase().includes(query)
                );
                
                if (foundPatient) {
                    window.location.href = `medical-record-view.html?patientId=${foundPatient.id}`;
                } else {
                    if (confirm('Patient not found. Would you like to register a new patient?')) {
                        window.location.href = 'register-step1.html';
                    }
                }
            }
        });
    }
    
    document.getElementById('logoutBtn').addEventListener('click', function() {
        logout();
    });
}