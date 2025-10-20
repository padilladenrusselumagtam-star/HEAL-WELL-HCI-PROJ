document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const currentUser = getCurrentUser();
    if (currentUser.role === 'Patient') {
        showToast('Access denied', 'error');
        setTimeout(() => window.location.href = 'diet.html', 2000);
        return;
    }
    
    loadPatients();
    setupEventListeners();
});

function loadPatients() {
    const patients = readCollection('hwh_patients');
    const patientSelect = document.getElementById('patientSelect');
    
    patientSelect.innerHTML = '<option value="">Select Patient</option>';
    patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = `${patient.id} - ${patient.firstName} ${patient.lastName}`;
        patientSelect.appendChild(option);
    });
}

function setupEventListeners() {
    document.getElementById('dietPlanForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveDietPlan();
    });
    
    document.getElementById('patientSelect').addEventListener('change', function() {
        loadPatientMetrics(this.value);
    });
    
    document.getElementById('currentWeight').addEventListener('input', calculateBMI);
    document.getElementById('height').addEventListener('input', calculateBMI);
    
    document.getElementById('addAllowedFood').addEventListener('click', function() {
        addFoodItem('allowedFoods');
    });
    
    document.getElementById('addAvoidFood').addEventListener('click', function() {
        addFoodItem('avoidFoods');
    });
}

function loadPatientMetrics(patientId) {
    if (!patientId) return;
    
    const patients = readCollection('hwh_patients');
    const patient = patients.find(p => p.id === patientId);
    const medicalRecords = readCollection('hwh_medical_records');
    const patientRecords = medicalRecords.filter(mr => mr.patientId === patientId);
    
    if (patientRecords.length > 0) {
        const latestRecord = patientRecords[patientRecords.length - 1];
        if (latestRecord.height) {
            document.getElementById('height').value = latestRecord.height;
        }
        if (latestRecord.weight) {
            document.getElementById('currentWeight').value = latestRecord.weight;
            calculateBMI();
        }
    }
}

function calculateBMI() {
    const weight = parseFloat(document.getElementById('currentWeight').value);
    const height = parseFloat(document.getElementById('height').value) / 100;
    
    if (weight && height) {
        const bmi = weight / (height * height);
        document.getElementById('bmiResult').textContent = bmi.toFixed(1);
        
        let category = '';
        if (bmi < 18.5) category = 'Underweight';
        else if (bmi < 25) category = 'Normal weight';
        else if (bmi < 30) category = 'Overweight';
        else category = 'Obese';
        
        document.getElementById('bmiCategory').textContent = category;
    }
}

function addFoodItem(containerId) {
    const container = document.getElementById(containerId);
    const input = document.createElement('div');
    input.className = 'food-item';
    input.innerHTML = `
        <input type="text" placeholder="Enter food item" required>
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(input);
}

function saveDietPlan() {
    const patientId = document.getElementById('patientSelect').value;
    const currentWeight = document.getElementById('currentWeight').value;
    const height = document.getElementById('height').value;
    const targetWeight = document.getElementById('targetWeight').value;
    const caloriesPerDay = document.getElementById('caloriesPerDay').value;
    const education = document.getElementById('education').value;
    
    if (!patientId || !currentWeight || !height) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    const allowedFoods = Array.from(document.querySelectorAll('#allowedFoods input'))
        .map(input => input.value)
        .filter(value => value.trim() !== '');
    
    const avoidFoods = Array.from(document.querySelectorAll('#avoidFoods input'))
        .map(input => input.value)
        .filter(value => value.trim() !== '');
    
    const bmi = parseFloat(document.getElementById('bmiResult').textContent);
    
    simulateServerDelay(() => {
        const patients = readCollection('hwh_patients');
        const patient = patients.find(p => p.id === patientId);
        
        const dietPlan = {
            id: generateId('DIET'),
            patientId: patientId,
            patientName: `${patient.firstName} ${patient.lastName}`,
            createdDate: new Date().toISOString().split('T')[0],
            bmi: bmi,
            weightHistory: [{
                date: new Date().toISOString().split('T')[0],
                weight: parseFloat(currentWeight)
            }],
            targetWeight: targetWeight ? parseFloat(targetWeight) : null,
            caloriesPerDay: caloriesPerDay ? parseInt(caloriesPerDay) : null,
            allowedFoods: allowedFoods,
            avoidFoods: avoidFoods,
            education: education,
            createdBy: getCurrentUser().username
        };
        
        const dietPlans = readCollection('hwh_diet_plans');
        dietPlans.push(dietPlan);
        persistCollection('hwh_diet_plans', dietPlans);
        
        showToast('Diet plan created successfully', 'success');
        
        setTimeout(() => {
            window.location.href = 'diet.html';
        }, 1500);
    });
}

document.getElementById('logoutBtn').addEventListener('click', function() {
        logout();
    });