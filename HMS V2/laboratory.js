document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const currentUser = getCurrentUser();
    if (currentUser.role === 'Patient') {
        document.getElementById('addLabBtn').style.display = 'none';
    }
    
    loadLaboratoryTests();
    setupEventListeners();
});

function loadLaboratoryTests() {
    const labs = readCollection('hwh_labs');
    const currentUser = getCurrentUser();
    
    let filteredLabs = labs;
    
    if (currentUser.role === 'Patient') {
        filteredLabs = labs.filter(lab => lab.patientId === currentUser.patientId);
    }
    
    const statusFilter = document.getElementById('statusFilter').value;
    const testTypeFilter = document.getElementById('testTypeFilter').value;
    
    if (statusFilter) {
        filteredLabs = filteredLabs.filter(lab => lab.status === statusFilter);
    }
    
    if (testTypeFilter) {
        filteredLabs = filteredLabs.filter(lab => lab.testType === testTypeFilter);
    }
    
    renderLaboratoryTests(filteredLabs);
}

function renderLaboratoryTests(labs) {
    const container = document.getElementById('labTestsList');
    
    if (labs.length === 0) {
        container.innerHTML = '<tr><td colspan="6" class="no-data">No laboratory tests found</td></tr>';
        return;
    }
    
    let html = '';
    
    labs.forEach(lab => {
        html += `
            <tr>
                <td>${lab.testDate}</td>
                <td>${lab.patientName}</td>
                <td>${lab.testType}</td>
                <td>${lab.resultsDate || 'Pending'}</td>
                <td><span class="status status-${lab.status}">${lab.status}</span></td>
                <td>
                    <button class="btn-view" onclick="viewLabTest('${lab.id}')">View</button>
                    ${canEditLabTest(lab) ? `<button class="btn-edit" onclick="editLabTest('${lab.id}')">Edit</button>` : ''}
                </td>
            </tr>
        `;
    });
    
    container.innerHTML = html;
}

function canEditLabTest(lab) {
    const currentUser = getCurrentUser();
    if (currentUser.role === 'Patient') return false;
    return true;
}

function setupEventListeners() {
    document.getElementById('addLabBtn').addEventListener('click', function() {
        window.location.href = 'laboratory-add.html';
    });
    
    document.getElementById('statusFilter').addEventListener('change', loadLaboratoryTests);
    document.getElementById('testTypeFilter').addEventListener('change', loadLaboratoryTests);
    
    document.getElementById('resetFilters').addEventListener('click', function() {
        document.getElementById('statusFilter').value = '';
        document.getElementById('testTypeFilter').value = '';
        loadLaboratoryTests();
    });
}

function viewLabTest(labId) {
    window.location.href = `laboratory-view.html?id=${labId}`;
}

function editLabTest(labId) {
    window.location.href = `laboratory-edit.html?id=${labId}`;
}

    document.getElementById('logoutBtn').addEventListener('click', function() {
        logout();
    });