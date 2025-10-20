document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    loadConfirmationData();
    
    document.getElementById('confirmBtn').addEventListener('click', function() {
        if (!document.getElementById('confirmationCheck').checked) {
            showToast('Please confirm that all information is correct', 'error');
            return;
        }
        
        registerPatient();
    });
    
    document.getElementById('editBtn').addEventListener('click', function() {
        window.location.href = 'register-step1.html';
    });
});

function loadConfirmationData() {
    const tempData = JSON.parse(sessionStorage.getItem('hwh_reg_temp') || '{}');
    const container = document.getElementById('confirmationData');
    
    if (!tempData.step1) {
        window.location.href = 'register-step1.html';
        return;
    }
    
    let html = '';
    
    if (tempData.step1) {
        html += `
            <div class="data-section">
                <h3>Personal Information</h3>
                <p><strong>Name:</strong> ${tempData.step1.firstName} ${tempData.step1.lastName}</p>
                <p><strong>Date of Birth:</strong> ${tempData.step1.dateOfBirth}</p>
                <p><strong>Gender:</strong> ${tempData.step1.gender}</p>
                <p><strong>Contact:</strong> ${tempData.step1.contactNumber}</p>
                <p><strong>Email:</strong> ${tempData.step1.email}</p>
                <p><strong>Address:</strong> ${tempData.step1.address || 'N/A'}</p>
            </div>
        `;
    }
    
    if (tempData.step2) {
        html += `
            <div class="data-section">
                <h3>Medical Information</h3>
                <p><strong>Emergency Contact:</strong> ${tempData.step2.emergencyContact}</p>
                <p><strong>Emergency Number:</strong> ${tempData.step2.emergencyNumber}</p>
                <p><strong>Blood Type:</strong> ${tempData.step2.bloodType || 'N/A'}</p>
                <p><strong>Medical History:</strong> ${tempData.step2.medicalHistory || 'None'}</p>
                <p><strong>Allergies:</strong> ${tempData.step2.allergies || 'None'}</p>
            </div>
        `;
    }
    
    if (tempData.step3) {
        html += `
            <div class="data-section">
                <h3>Additional Information</h3>
                <p><strong>Insurance Provider:</strong> ${tempData.step3.insuranceProvider || 'N/A'}</p>
                <p><strong>Insurance Number:</strong> ${tempData.step3.insuranceNumber || 'N/A'}</p>
                <p><strong>Occupation:</strong> ${tempData.step3.occupation || 'N/A'}</p>
                <p><strong>Marital Status:</strong> ${tempData.step3.maritalStatus || 'N/A'}</p>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function registerPatient() {
    const tempData = JSON.parse(sessionStorage.getItem('hwh_reg_temp') || '{}');
    
    if (!tempData.step1) {
        showToast('Registration data missing', 'error');
        return;
    }
    
    simulateServerDelay(() => {
        const patientId = generateId('P');
        const currentUser = getCurrentUser();
        
        const patient = {
            id: patientId,
            registrationDate: new Date().toISOString().split('T')[0],
            firstName: tempData.step1.firstName,
            lastName: tempData.step1.lastName,
            dateOfBirth: tempData.step1.dateOfBirth,
            gender: tempData.step1.gender,
            contactNumber: tempData.step1.contactNumber,
            email: tempData.step1.email,
            address: tempData.step1.address,
            emergencyContact: tempData.step2.emergencyContact,
            emergencyNumber: tempData.step2.emergencyNumber,
            bloodType: tempData.step2.bloodType,
            medicalHistory: tempData.step2.medicalHistory ? [tempData.step2.medicalHistory] : [],
            allergies: tempData.step2.allergies ? [tempData.step2.allergies] : [],
            insuranceProvider: tempData.step3.insuranceProvider,
            insuranceNumber: tempData.step3.insuranceNumber,
            occupation: tempData.step3.occupation,
            maritalStatus: tempData.step3.maritalStatus,
            registeredBy: currentUser.username
        };
        
        const patients = readCollection('hwh_patients');
        patients.push(patient);
        persistCollection('hwh_patients', patients);
        
        showToast('Patient registered successfully!', 'success');
        
        const printHtml = generateRegistrationSlip(patient);
        openPrintWindow(printHtml, 800, 600);
        
        sessionStorage.removeItem('hwh_reg_temp');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    });
}

function generateRegistrationSlip(patient) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Registration Slip - Heal Well Hospital</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { max-width: 150px; margin-bottom: 10px; }
                .patient-info { border: 2px solid #333; padding: 20px; margin: 20px 0; }
                .info-row { display: flex; margin-bottom: 10px; }
                .info-label { font-weight: bold; width: 200px; }
                .registration-id { font-size: 24px; font-weight: bold; text-align: center; color: #2c5aa0; margin: 20px 0; }
                .footer { text-align: center; margin-top: 50px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Heal Well Hospital</h1>
                <p>123 Healing Street, Medical City, Philippines</p>
                <p>Tel: (02) 1234-5678 | Email: info@healwell.com</p>
            </div>
            
            <div class="registration-id">
                REGISTRATION CONFIRMATION: ${patient.id}
            </div>
            
            <div class="patient-info">
                <div class="info-row">
                    <div class="info-label">Patient Name:</div>
                    <div>${patient.firstName} ${patient.lastName}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Date of Birth:</div>
                    <div>${patient.dateOfBirth}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Gender:</div>
                    <div>${patient.gender}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Contact Number:</div>
                    <div>${patient.contactNumber}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Email:</div>
                    <div>${patient.email}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Registration Date:</div>
                    <div>${patient.registrationDate}</div>
                </div>
            </div>
            
            <div class="footer">
                <p>This is an automated registration slip. Please present this ID during hospital visits.</p>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                };
            </script>
        </body>
        </html>
    `;
}

document.getElementById('logoutBtn').addEventListener('click', function() {
        logout();
    });