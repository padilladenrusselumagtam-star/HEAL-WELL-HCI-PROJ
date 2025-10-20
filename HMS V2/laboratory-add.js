document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const currentUser = getCurrentUser();
    if (currentUser.role === 'Patient') {
        showToast('Access denied', 'error');
        setTimeout(() => window.location.href = 'laboratory.html', 2000);
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
    document.getElementById('labTestForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveLabTest();
    });
    
    document.getElementById('testType').addEventListener('change', function() {
        updateTestFields(this.value);
    });
}

function updateTestFields(testType) {
    const resultsFields = document.getElementById('resultsFields');
    
    const testTemplates = {
        'Blood Chemistry': [
            { name: 'glucose', label: 'Glucose (mg/dL)', normalRange: '70-100' },
            { name: 'cholesterol', label: 'Cholesterol (mg/dL)', normalRange: '< 200' },
            { name: 'hemoglobin', label: 'Hemoglobin (g/dL)', normalRange: '12-16' }
        ],
        'Pulmonary Function': [
            { name: 'fev1', label: 'FEV1 (% predicted)', normalRange: '> 80' },
            { name: 'fvc', label: 'FVC (% predicted)', normalRange: '> 80' },
            { name: 'ratio', label: 'FEV1/FVC Ratio', normalRange: '> 0.7' }
        ],
        'Urinalysis': [
            { name: 'appearance', label: 'Appearance', normalRange: 'Clear' },
            { name: 'ph', label: 'pH', normalRange: '4.5-8.0' },
            { name: 'protein', label: 'Protein', normalRange: 'Negative' }
        ]
    };
    
    const fields = testTemplates[testType] || [];
    
    let html = '<h4>Test Results</h4>';
    fields.forEach(field => {
        html += `
            <div class="form-group">
                <label>${field.label} (Normal: ${field.normalRange})</label>
                <input type="text" name="${field.name}" placeholder="Enter result">
            </div>
        `;
    });
    
    resultsFields.innerHTML = html;
}

function saveLabTest() {
    const patientId = document.getElementById('patientSelect').value;
    const testType = document.getElementById('testType').value;
    const testDate = document.getElementById('testDate').value;
    const notes = document.getElementById('notes').value;
    
    if (!patientId || !testType || !testDate) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    const results = {};
    const resultInputs = document.querySelectorAll('#resultsFields input');
    resultInputs.forEach(input => {
        if (input.value) {
            results[input.name] = isNaN(input.value) ? input.value : parseFloat(input.value);
        }
    });
    
    simulateServerDelay(() => {
        const patients = readCollection('hwh_patients');
        const patient = patients.find(p => p.id === patientId);
        
        const labTest = {
            id: generateId('LAB'),
            patientId: patientId,
            patientName: `${patient.firstName} ${patient.lastName}`,
            testType: testType,
            testDate: testDate,
            resultsDate: new Date().toISOString().split('T')[0],
            status: Object.keys(results).length > 0 ? 'completed' : 'pending',
            results: results,
            notes: notes,
            createdBy: getCurrentUser().username,
            createdAt: new Date().toISOString()
        };
        
        const labs = readCollection('hwh_labs');
        labs.push(labTest);
        persistCollection('hwh_labs', labs);
        
        showToast('Laboratory test saved successfully', 'success');
        
        setTimeout(() => {
            window.location.href = 'laboratory.html';
        }, 1500);
    });
}