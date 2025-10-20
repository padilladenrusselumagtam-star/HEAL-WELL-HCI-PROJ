document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const form = document.getElementById('step1Form');
    const nextBtn = document.getElementById('nextBtn');
    
    form.addEventListener('input', function() {
        saveFormData();
    });
    
    nextBtn.addEventListener('click', function() {
        if (validateStep1()) {
            saveFormData();
            window.location.href = 'register-step2.html';
        }
    });
    
    loadSavedData();
});

function validateStep1() {
    const required = [
        document.getElementById('firstName'),
        document.getElementById('lastName'),
        document.getElementById('dateOfBirth'),
        document.getElementById('gender'),
        document.getElementById('contactNumber'),
        document.getElementById('email')
    ];
    
    if (!validateRequiredFields(required)) {
        showToast('Please fill all required fields', 'error');
        return false;
    }
    
    const email = document.getElementById('email').value;
    if (!validateEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return false;
    }
    
    const phone = document.getElementById('contactNumber').value;
    if (!validatePhone(phone)) {
        showToast('Please enter a valid phone number (10-11 digits)', 'error');
        return false;
    }
    
    return true;
}

function saveFormData() {
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        gender: document.getElementById('gender').value,
        contactNumber: document.getElementById('contactNumber').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value
    };
    
    let tempData = JSON.parse(sessionStorage.getItem('hwh_reg_temp') || '{}');
    tempData.step1 = formData;
    sessionStorage.setItem('hwh_reg_temp', JSON.stringify(tempData));
}

function loadSavedData() {
    const tempData = JSON.parse(sessionStorage.getItem('hwh_reg_temp') || '{}');
    if (tempData.step1) {
        Object.keys(tempData.step1).forEach(key => {
            const element = document.getElementById(key);
            if (element) element.value = tempData.step1[key];
        });
    }
}

