function seedInitialData() {
    if (localStorage.getItem('hwh_counters') !== null) return;

    const counters = { patients: 18, appts: 3, medrecords: 2, labs: 2, diets: 1, bills: 2, users: 4 };
    localStorage.setItem('hwh_counters', JSON.stringify(counters));

    const users = [
        { id: 'U-2025-0001', username: 'admin', password: 'admin123', role: 'Admin', name: 'System Administrator', email: 'admin@healwell.com', isActive: true },
        { id: 'U-2025-0002', username: 'drsantos', password: 'doctor123', role: 'Doctor', name: 'Dr. Maria Santos', email: 'drsantos@healwell.com', specialization: 'Cardiology', licenseNumber: 'MD-12345', isActive: true },
        { id: 'U-2025-0003', username: 'staff1', password: 'staff123', role: 'Staff', name: 'John Smith', email: 'staff1@healwell.com', department: 'Registration', employeeId: 'EMP-001', isActive: true },
        { id: 'U-2025-0004', username: 'patient1', password: 'patient123', role: 'Patient', name: 'Robert Johnson', email: 'robert@email.com', patientId: 'P-2025-0018', isActive: true }
    ];
    localStorage.setItem('hwh_users', JSON.stringify(users));

    const patients = [
        { id: 'P-2025-0018', registrationDate: '2025-01-15', firstName: 'Robert', lastName: 'Johnson', dateOfBirth: '1985-03-22', gender: 'Male', contactNumber: '09171234567', email: 'robert@email.com', address: '123 Main St, Manila', emergencyContact: 'Maria Johnson', emergencyNumber: '09176543210', bloodType: 'O+', medicalHistory: ['Hypertension'], allergies: ['Penicillin'] },
        { id: 'P-2025-0019', registrationDate: '2025-01-16', firstName: 'Sarah', lastName: 'Chen', dateOfBirth: '1990-07-14', gender: 'Female', contactNumber: '09172345678', email: 'sarah@email.com', address: '456 Oak Ave, Quezon City', emergencyContact: 'Michael Chen', emergencyNumber: '09177654321', bloodType: 'A+', medicalHistory: ['Asthma'], allergies: [] },
        { id: 'P-2025-0020', registrationDate: '2025-01-17', firstName: 'Carlos', lastName: 'Reyes', dateOfBirth: '1978-11-30', gender: 'Male', contactNumber: '09173456789', email: 'carlos@email.com', address: '789 Pine St, Makati', emergencyContact: 'Elena Reyes', emergencyNumber: '09178765432', bloodType: 'B+', medicalHistory: ['Diabetes'], allergies: ['Shellfish'] }
    ];
    localStorage.setItem('hwh_patients', JSON.stringify(patients));

    const packages = [
        { id: 'PKG-2025-0001', name: 'Basic Health Check', price: 1500, inclusions: ['Physical Examination', 'Basic Blood Tests', 'Doctor Consultation'], description: 'Comprehensive basic health assessment' },
        { id: 'PKG-2025-0002', name: 'Executive Check-up', price: 5000, inclusions: ['Full Blood Work', 'ECG', 'Chest X-ray', 'Ultrasound', 'Specialist Consultation'], description: 'Complete executive health evaluation' },
        { id: 'PKG-2025-0003', name: 'Cardiac Screening', price: 3000, inclusions: ['Cardiologist Consultation', 'ECG', 'Stress Test', 'Cholesterol Panel'], description: 'Focused cardiac health assessment' }
    ];
    localStorage.setItem('hwh_packages', JSON.stringify(packages));

    const appointments = [
        { id: 'APPT-2025-0001', patientId: 'P-2025-0018', patientName: 'Robert Johnson', packageId: 'PKG-2025-0001', packageName: 'Basic Health Check', date: '2025-02-15', time: '09:00', doctorId: 'U-2025-0002', doctorName: 'Dr. Maria Santos', status: 'scheduled', reason: 'Routine check-up', createdAt: '2025-01-20T10:00:00' },
        { id: 'APPT-2025-0002', patientId: 'P-2025-0019', patientName: 'Sarah Chen', packageId: 'PKG-2025-0002', packageName: 'Executive Check-up', date: '2025-01-10', time: '14:00', doctorId: 'U-2025-0002', doctorName: 'Dr. Maria Santos', status: 'completed', reason: 'Annual executive check-up', createdAt: '2025-01-05T09:00:00' },
        { id: 'APPT-2025-0003', patientId: 'P-2025-0020', patientName: 'Carlos Reyes', packageId: null, date: '2025-01-12', time: '11:00', doctorId: 'U-2025-0002', doctorName: 'Dr. Maria Santos', status: 'cancelled', reason: 'Follow-up consultation', notes: 'Patient rescheduled', createdAt: '2025-01-08T16:00:00' }
    ];
    localStorage.setItem('hwh_appointments', JSON.stringify(appointments));

    const medicalRecords = [
        { id: 'MR-2025-0001', patientId: 'P-2025-0018', patientName: 'Robert Johnson', date: '2025-01-15', doctorId: 'U-2025-0002', doctorName: 'Dr. Maria Santos', diagnosis: 'Hypertension Stage 1', symptoms: 'Elevated BP, headaches', bloodPressure: '140/90', heartRate: 72, temperature: 36.8, weight: 75, height: 175, notes: 'Prescribed medication and lifestyle changes', prescriptions: [{ medication: 'Lisinopril 10mg', dosage: 'Once daily', duration: '30 days' }] },
        { id: 'MR-2025-0002', patientId: 'P-2025-0019', patientName: 'Sarah Chen', date: '2025-01-16', doctorId: 'U-2025-0002', doctorName: 'Dr. Maria Santos', diagnosis: 'Mild Asthma', symptoms: 'Shortness of breath during exercise', bloodPressure: '120/80', heartRate: 68, temperature: 36.5, weight: 62, height: 165, notes: 'Asthma management plan provided', prescriptions: [{ medication: 'Albuterol Inhaler', dosage: 'As needed', duration: '90 days' }] }
    ];
    localStorage.setItem('hwh_medical_records', JSON.stringify(medicalRecords));

    const labs = [
        { id: 'LAB-2025-0001', patientId: 'P-2025-0018', patientName: 'Robert Johnson', testType: 'Blood Chemistry', testDate: '2025-01-15', resultsDate: '2025-01-16', status: 'completed', results: { glucose: 95, cholesterol: 180, hemoglobin: 14.2 }, notes: 'Within normal ranges' },
        { id: 'LAB-2025-0002', patientId: 'P-2025-0019', patientName: 'Sarah Chen', testType: 'Pulmonary Function', testDate: '2025-01-16', resultsDate: '2025-01-17', status: 'completed', results: { fev1: 85, fvc: 90, ratio: 0.94 }, notes: 'Mild obstruction noted' }
    ];
    localStorage.setItem('hwh_labs', JSON.stringify(labs));

    const dietPlans = [
        { id: 'DIET-2025-0001', patientId: 'P-2025-0018', patientName: 'Robert Johnson', createdDate: '2025-01-15', bmi: 24.5, weightHistory: [{ date: '2025-01-15', weight: 75 }], allowedFoods: ['Vegetables', 'Lean proteins', 'Whole grains'], avoidFoods: ['High sodium foods', 'Processed foods', 'Alcohol'], education: 'Low sodium diet for hypertension management. Limit salt intake to 1500mg daily.' }
    ];
    localStorage.setItem('hwh_diet_plans', JSON.stringify(dietPlans));

    const bills = [
        { id: 'BILL-2025-0001', patientId: 'P-2025-0018', patientName: 'Robert Johnson', date: '2025-01-15', items: [{ description: 'Consultation Fee', quantity: 1, unitCost: 500 }, { description: 'Laboratory Tests', quantity: 1, unitCost: 800 }], subtotal: 1300, tax: 156, discount: 0, total: 1456, paid: 1456, balance: 0, status: 'paid', paymentMethod: 'Cash' },
        { id: 'BILL-2025-0002', patientId: 'P-2025-0019', patientName: 'Sarah Chen', date: '2025-01-16', items: [{ description: 'Executive Check-up', quantity: 1, unitCost: 5000 }], subtotal: 5000, tax: 600, discount: 0, total: 5600, paid: 3000, balance: 2600, status: 'partial', paymentMethod: 'Credit Card' }
    ];
    localStorage.setItem('hwh_bills', JSON.stringify(bills));
}

function readCollection(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function persistCollection(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
}

function generateId(prefix) {
    const counters = JSON.parse(localStorage.getItem('hwh_counters'));
    const year = new Date().getFullYear();
    const counterKey = prefix === 'P' ? 'patients' : 
                      prefix === 'APPT' ? 'appts' :
                      prefix === 'MR' ? 'medrecords' :
                      prefix === 'LAB' ? 'labs' :
                      prefix === 'DIET' ? 'diets' :
                      prefix === 'BILL' ? 'bills' :
                      prefix === 'U' ? 'users' : 'default';
    
    if (counters[counterKey] === undefined) counters[counterKey] = 0;
    counters[counterKey]++;
    localStorage.setItem('hwh_counters', JSON.stringify(counters));
    
    const counterValue = counters[counterKey].toString().padStart(4, '0');
    return `${prefix}-${year}-${counterValue}`;
}

function formatCurrency(amount) {
    return `₱${parseFloat(amount).toFixed(2)}`;
}

function getCurrentUser() {
    const session = sessionStorage.getItem('hwh_session');
    return session ? JSON.parse(session) : null;
}

function checkSession() {
    const session = getCurrentUser();
    if (!session) {
        window.location.href = 'login.html';
        return false;
    }
    
    if (session.expiry && new Date() > new Date(session.expiry)) {
        sessionStorage.removeItem('hwh_session');
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

function fetchPatientById(id) {
    const patients = readCollection('hwh_patients');
    return patients.find(p => p.id === id) || null;
}

function fetchAppointmentsByPatient(id) {
    const appointments = readCollection('hwh_appointments');
    return appointments.filter(a => a.patientId === id);
}

function openPrintWindow(htmlString, width = 800, height = 600) {
    const printWindow = window.open('', '_blank', `width=${width},height=${height}`);
    if (!printWindow) {
        showToast('Please allow popups for printing', 'error');
        return;
    }
    printWindow.document.write(htmlString);
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = 'position:fixed;top:20px;right:20px;padding:12px 20px;background:var(--success-color);color:white;border-radius:4px;z-index:10000;box-shadow:0 4px 12px rgba(0,0,0,0.3);font-family:inherit;';
    
    if (type === 'error') toast.style.background = 'var(--error-color)';
    if (type === 'warning') toast.style.background = 'var(--warning-color)';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 3000);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^\d{10,11}$/;
    return re.test(phone.replace(/\D/g, ''));
}

function validateRequiredFields(fields) {
    for (const field of fields) {
        if (!field.value.trim()) {
            field.focus();
            return false;
        }
    }
    return true;
}

function confirmAction(message) {
    return confirm(message);
}

function simulateServerDelay(callback, delay = 600) {
    setTimeout(callback, delay);
}

function validatePassword(password) {
    return password.length >= 6;
}

function isUsernameAvailable(username) {
    const users = readCollection('hwh_users');
    return !users.find(u => u.username === username);
}

function isEmailAvailable(email) {
    const users = readCollection('hwh_users');
    return !users.find(u => u.email === email);
}

function logout() {
    sessionStorage.removeItem('hwh_session');
    window.location.href = 'login.html';
}