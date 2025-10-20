document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const form = document.getElementById('step3Form');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    
    form.addEventListener('input', function() {
        saveFormData();
    });
    
    nextBtn.addEventListener('click', function() {
        saveFormData();
        window.location.href = 'register-confirm.html';
    });
    
    prevBtn.addEventListener('click', function() {
        window.location.href = 'register-step2.html';
    });
    
    loadSavedData();
});

function saveFormData() {
    const formData = {
        insuranceProvider: document.getElementById('insuranceProvider').value,
        insuranceNumber: document.getElementById('insuranceNumber').value,
        occupation: document.getElementById('occupation').value,
        maritalStatus: document.getElementById('maritalStatus').value
    };
    
    let tempData = JSON.parse(sessionStorage.getItem('hwh_reg_temp') || '{}');
    tempData.step3 = formData;
    sessionStorage.setItem('hwh_reg_temp', JSON.stringify(tempData));
}

function loadSavedData() {
    const tempData = JSON.parse(sessionStorage.getItem('hwh_reg_temp') || '{}');
    if (tempData.step3) {
        Object.keys(tempData.step3).forEach(key => {
            const element = document.getElementById(key);
            if (element) element.value = tempData.step3[key];
        });
    }
}

document.getElementById('logoutBtn').addEventListener('click', function() {
        logout();
    });