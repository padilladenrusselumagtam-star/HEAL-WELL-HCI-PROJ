document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const appointmentId = urlParams.get('appointment');
    
    if (appointmentId) {
        loadAppointmentConfirmation(appointmentId);
    }
});

function loadAppointmentConfirmation(appointmentId) {
    const appointments = readCollection('hwh_appointments');
    const appointment = appointments.find(a => a.id === appointmentId);
    
    if (appointment) {
        document.getElementById('referenceNumber').textContent = appointment.id;
        document.getElementById('patientName').textContent = appointment.patientName;
        document.getElementById('appointmentDate').textContent = new Date(appointment.date).toLocaleDateString();
        document.getElementById('appointmentTime').textContent = appointment.time;
        document.getElementById('doctorName').textContent = appointment.doctorName;
        document.getElementById('packageName').textContent = appointment.packageName || 'Consultation';
    }
}

function printConfirmation() {
    const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Appointment Confirmation - Heal Well Hospital</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .confirmation-id { font-size: 24px; font-weight: bold; text-align: center; color: #2c5aa0; margin: 20px 0; }
                .appointment-info { border: 2px solid #333; padding: 20px; margin: 20px 0; }
                .info-row { display: flex; margin-bottom: 10px; }
                .info-label { font-weight: bold; width: 150px; }
                .instructions { background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 50px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Heal Well Hospital</h1>
                <h2>Appointment Booking Confirmation</h2>
            </div>
            
            <div class="confirmation-id">
                Reference: ${document.getElementById('referenceNumber').textContent}
            </div>
            
            <div class="appointment-info">
                <div class="info-row">
                    <div class="info-label">Patient Name:</div>
                    <div>${document.getElementById('patientName').textContent}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Date & Time:</div>
                    <div>${document.getElementById('appointmentDate').textContent} at ${document.getElementById('appointmentTime').textContent}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Doctor:</div>
                    <div>${document.getElementById('doctorName').textContent}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Service:</div>
                    <div>${document.getElementById('packageName').textContent}</div>
                </div>
            </div>
            
            <div class="instructions">
                <h3>Important Instructions:</h3>
                <ul>
                    <li>Please arrive 15 minutes before your scheduled appointment time</li>
                    <li>Bring your valid ID and insurance card (if applicable)</li>
                    <li>Carry any previous medical records or test results</li>
                    <li>Fasting may be required for certain tests - follow doctor's instructions</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>For cancellations or rescheduling, please call (02) 1234-5678 at least 24 hours in advance</p>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
        </body>
        </html>
    `;
    
    openPrintWindow(printHtml);
}