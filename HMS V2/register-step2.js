document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const form = document.getElementById('step2Form');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    
    form.addEventListener('input', function() {
        saveFormData();
    });
    
    nextBtn.addEventListener('click', function() {
        if (validateStep2()) {
            saveFormData();
            window.location.href = 'register-step3.html';
        }
    });
    
    prevBtn.addEventListener('click', function() {
        window.location.href = 'register-step1.html';
    });
    
    loadSavedData();
});

function validateStep2() {
    const required = [
        document.getElementById('emergencyContact'),
        document.getElementById('emergencyNumber')
    ];
    
    if (!validateRequiredFields(required)) {
        showToast('Please fill all required fields', 'error');
        return false;
    }
    
    const phone = document.getElementById('emergencyNumber').value;
    if (!validatePhone(phone)) {
        showToast('Please enter a valid emergency phone number', 'error');
        return false;
    }
    
    return true;
}

function saveFormData() {
    const formData = {
        emergencyContact: document.getElementById('emergencyContact').value,
        emergencyNumber: document.getElementById('emergencyNumber').value,
        bloodType: document.getElementById('bloodType').value,
        medicalHistory: document.getElementById('medicalHistory').value,
        allergies: document.getElementById('allergies').value
    };
    
    let tempData = JSON.parse(sessionStorage.getItem('hwh_reg_temp') || '{}');
    tempData.step2 = formData;
    sessionStorage.setItem('hwh_reg_temp', JSON.stringify(tempData));
}

function loadSavedData() {
    const tempData = JSON.parse(sessionStorage.getItem('hwh_reg_temp') || '{}');
    if (tempData.step2) {
        Object.keys(tempData.step2).forEach(key => {
            const element = document.getElementById(key);
            if (element) element.value = tempData.step2[key];
        });
    }
}