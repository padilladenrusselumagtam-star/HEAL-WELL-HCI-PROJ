document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const currentUser = getCurrentUser();
    if (currentUser.role === 'Patient') {
        document.getElementById('addDietPlanBtn').style.display = 'none';
    }
    
    loadDietPlans();
    setupEventListeners();
});

function loadDietPlans() {
    const dietPlans = readCollection('hwh_diet_plans');
    const patients = readCollection('hwh_patients');
    const currentUser = getCurrentUser();
    
    let filteredPlans = dietPlans;
    
    if (currentUser.role === 'Patient') {
        filteredPlans = dietPlans.filter(plan => plan.patientId === currentUser.patientId);
    }
    
    const patientFilter = document.getElementById('patientFilter').value;
    if (patientFilter) {
        filteredPlans = filteredPlans.filter(plan => plan.patientId === patientFilter);
    }
    
    renderDietPlans(filteredPlans, patients);
    populatePatientFilter(patients);
}

function renderDietPlans(plans, patients) {
    const container = document.getElementById('dietPlansList');
    
    if (plans.length === 0) {
        container.innerHTML = '<tr><td colspan="5" class="no-data">No diet plans found</td></tr>';
        return;
    }
    
    let html = '';
    
    plans.forEach(plan => {
        const patient = patients.find(p => p.id === plan.patientId);
        const latestWeight = plan.weightHistory && plan.weightHistory.length > 0 ? 
            plan.weightHistory[plan.weightHistory.length - 1].weight : 'N/A';
        
        html += `
            <tr>
                <td>${plan.createdDate}</td>
                <td>${plan.patientName}</td>
                <td>${plan.bmi ? plan.bmi.toFixed(1) : 'N/A'}</td>
                <td>${latestWeight} kg</td>
                <td>
                    <button class="btn-view" onclick="viewDietPlan('${plan.id}')">View</button>
                    ${canEditDietPlan(plan) ? `<button class="btn-edit" onclick="editDietPlan('${plan.id}')">Edit</button>` : ''}
                </td>
            </tr>
        `;
    });
    
    container.innerHTML = html;
}

function populatePatientFilter(patients) {
    const patientFilter = document.getElementById('patientFilter');
    
    patientFilter.innerHTML = '<option value="">All Patients</option>';
    patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = `${patient.firstName} ${patient.lastName}`;
        patientFilter.appendChild(option);
    });
}

function canEditDietPlan(plan) {
    const currentUser = getCurrentUser();
    if (currentUser.role === 'Patient') return false;
    return true;
}

function setupEventListeners() {
    document.getElementById('addDietPlanBtn').addEventListener('click', function() {
        window.location.href = 'diet-plan-add.html';
    });
    
    document.getElementById('patientFilter').addEventListener('change', loadDietPlans);
    
    document.getElementById('resetFilters').addEventListener('click', function() {
        document.getElementById('patientFilter').value = '';
        loadDietPlans();
    });
}

function viewDietPlan(planId) {
    window.location.href = `diet-plan-view.html?id=${planId}`;
}

function editDietPlan(planId) {
    window.location.href = `diet-plan-edit.html?id=${planId}`;
}

document.getElementById('logoutBtn').addEventListener('click', function() {
        logout();
    });