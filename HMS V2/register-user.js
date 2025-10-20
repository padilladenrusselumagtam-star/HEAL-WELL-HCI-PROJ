document.addEventListener('DOMContentLoaded', function() {
    seedInitialData();
    
    const registerForm = document.getElementById('registerForm');
    const roleSelect = document.getElementById('regRole');
    const patientFields = document.getElementById('patientFields');
    const doctorFields = document.getElementById('doctorFields');
    const staffFields = document.getElementById('staffFields');
    
    roleSelect.addEventListener('change', function() {
        patientFields.style.display = 'none';
        doctorFields.style.display = 'none';
        staffFields.style.display = 'none';
        
        switch(this.value) {
            case 'Patient':
                patientFields.style.display = 'block';
                break;
            case 'Doctor':
                doctorFields.style.display = 'block';
                break;
            case 'Staff':
                staffFields.style.display = 'block';
                break;
        }
    });
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        registerUser();
    });
});

function registerUser() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('regRole').value;
    
    if (!validateRegistrationForm()) {
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    const users = readCollection('hwh_users');
    const existingUser = users.find(u => u.username === username || u.email === email);
    
    if (existingUser) {
        showToast('Username or email already exists', 'error');
        return;
    }
    
    simulateServerDelay(() => {
        const newUser = {
            id: generateId('U'),
            username: username,
            password: password,
            role: role,
            name: `${firstName} ${lastName}`,
            email: email,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        
        if (role === 'Patient') {
            newUser.patientId = generateId('P');
            newUser.dateOfBirth = document.getElementById('dob').value;
            newUser.contactNumber = document.getElementById('contact').value;
            
            const patient = {
                id: newUser.patientId,
                registrationDate: new Date().toISOString().split('T')[0],
                firstName: firstName,
                lastName: lastName,
                dateOfBirth: newUser.dateOfBirth,
                contactNumber: newUser.contactNumber,
                email: email,
                gender: 'Unknown'
            };
            
            const patients = readCollection('hwh_patients');
            patients.push(patient);
            persistCollection('hwh_patients', patients);
        }
        
        if (role === 'Doctor') {
            newUser.specialization = document.getElementById('specialization').value;
            newUser.licenseNumber = document.getElementById('license').value;
        }
        
        if (role === 'Staff') {
            newUser.department = document.getElementById('department').value;
            newUser.employeeId = document.getElementById('employeeId').value;
        }
        
        users.push(newUser);
        persistCollection('hwh_users', users);
        
        showToast('Account created successfully!', 'success');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    });
}

function validateRegistrationForm() {
    const requiredFields = [
        document.getElementById('firstName'),
        document.getElementById('lastName'),
        document.getElementById('regUsername'),
        document.getElementById('email'),
        document.getElementById('regPassword'),
        document.getElementById('confirmPassword'),
        document.getElementById('regRole')
    ];
    
    if (!validateRequiredFields(requiredFields)) {
        showToast('Please fill all required fields', 'error');
        return false;
    }
    
    if (document.getElementById('regPassword').value.length < 6) {
        showToast('Password must be at least 6 characters long', 'error');
        return false;
    }
    
    if (!document.getElementById('termsCheck').checked) {
        showToast('Please agree to the terms and conditions', 'error');
        return false;
    }
    
    const role = document.getElementById('regRole').value;
    
    if (role === 'Patient') {
        const dob = document.getElementById('dob').value;
        if (dob && new Date(dob) > new Date()) {
            showToast('Date of birth cannot be in the future', 'error');
            return false;
        }
    }
    
    return true;
}