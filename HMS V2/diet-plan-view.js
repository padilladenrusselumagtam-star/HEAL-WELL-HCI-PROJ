document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('id');
    
    if (planId) {
        loadDietPlan(planId);
    }
    
    setupEventListeners(planId);
});

function loadDietPlan(planId) {
    const dietPlans = readCollection('hwh_diet_plans');
    const plan = dietPlans.find(p => p.id === planId);
    const currentUser = getCurrentUser();
    
    if (!plan) {
        showToast('Diet plan not found', 'error');
        setTimeout(() => window.location.href = 'diet.html', 2000);
        return;
    }
    
    if (currentUser.role === 'Patient' && plan.patientId !== currentUser.patientId) {
        showToast('Access denied', 'error');
        setTimeout(() => window.location.href = 'diet.html', 2000);
        return;
    }
    
    document.getElementById('patientName').textContent = plan.patientName;
    document.getElementById('createdDate').textContent = new Date(plan.createdDate).toLocaleDateString();
    document.getElementById('bmi').textContent = plan.bmi ? plan.bmi.toFixed(1) : 'N/A';
    document.getElementById('targetWeight').textContent = plan.targetWeight ? plan.targetWeight + ' kg' : 'Not specified';
    document.getElementById('caloriesPerDay').textContent = plan.caloriesPerDay ? plan.caloriesPerDay + ' calories' : 'Not specified';
    
    const currentWeight = plan.weightHistory && plan.weightHistory.length > 0 ? 
        plan.weightHistory[plan.weightHistory.length - 1].weight : 'N/A';
    document.getElementById('currentWeight').textContent = currentWeight + ' kg';
    
    renderFoodLists(plan.allowedFoods, plan.avoidFoods);
    document.getElementById('education').textContent = plan.education || 'No specific education provided.';
    
    renderWeightChart(plan.weightHistory);
}

function renderFoodLists(allowedFoods, avoidFoods) {
    const allowedContainer = document.getElementById('allowedFoods');
    const avoidContainer = document.getElementById('avoidFoods');
    
    if (!allowedFoods || allowedFoods.length === 0) {
        allowedContainer.innerHTML = '<li>No specific recommendations</li>';
    } else {
        allowedContainer.innerHTML = allowedFoods.map(food => `<li>${food}</li>`).join('');
    }
    
    if (!avoidFoods || avoidFoods.length === 0) {
        avoidContainer.innerHTML = '<li>No restrictions specified</li>';
    } else {
        avoidContainer.innerHTML = avoidFoods.map(food => `<li>${food}</li>`).join('');
    }
}

function renderWeightChart(weightHistory) {
    const container = document.getElementById('weightChart');
    
    if (!weightHistory || weightHistory.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 2rem;">No weight history data</div>';
        return;
    }
    
    const weights = weightHistory.map(entry => entry.weight);
    const maxWeight = Math.max(...weights);
    const minWeight = Math.min(...weights);
    const range = maxWeight - minWeight;
    
    let html = '<div style="display: flex; align-items: end; height: 100%; padding: 10px; gap: 5px;">';
    
    weightHistory.forEach((entry, index) => {
        const height = range > 0 ? ((entry.weight - minWeight) / range) * 80 + 20 : 50;
        html += `
            <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                <div style="background: var(--primary-color); width: 20px; height: ${height}px; border-radius: 3px 3px 0 0;"></div>
                <div style="font-size: 10px; margin-top: 5px;">${entry.weight}kg</div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function setupEventListeners(planId) {
    document.getElementById('printBtn').addEventListener('click', function() {
        printDietPlan(planId);
    });
    
    document.getElementById('backBtn').addEventListener('click', function() {
        window.location.href = 'diet.html';
    });
}

function printDietPlan(planId) {
    const dietPlans = readCollection('hwh_diet_plans');
    const plan = dietPlans.find(p => p.id === planId);
    
    if (!plan) return;
    
    const allowedFoodsHtml = plan.allowedFoods && plan.allowedFoods.length > 0 ? 
        plan.allowedFoods.map(food => `<li>${food}</li>`).join('') : '<li>No specific recommendations</li>';
    
    const avoidFoodsHtml = plan.avoidFoods && plan.avoidFoods.length > 0 ? 
        plan.avoidFoods.map(food => `<li>${food}</li>`).join('') : '<li>No restrictions specified</li>';
    
    const weightHistoryHtml = plan.weightHistory && plan.weightHistory.length > 0 ? 
        plan.weightHistory.map(entry => `
            <tr>
                <td>${new Date(entry.date).toLocaleDateString()}</td>
                <td>${entry.weight} kg</td>
            </tr>
        `).join('') : '<tr><td colspan="2">No weight history</td></tr>';
    
    const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Diet Plan - Heal Well Hospital</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .patient-info { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 4px; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .section { margin: 20px 0; }
                .section-title { background: #f5f5f5; padding: 8px 12px; font-weight: bold; border-left: 4px solid #2c5aa0; }
                .food-lists { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
                ul { list-style: none; padding: 0; }
                ul li { padding: 8px 0; border-bottom: 1px solid #eee; }
                ul li:before { content: "•"; color: #2c5aa0; font-weight: bold; margin-right: 10px; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background: #f5f5f5; }
                .footer { text-align: center; margin-top: 50px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Heal Well Hospital</h1>
                <h2>Personalized Diet Plan</h2>
            </div>
            
            <div class="patient-info">
                <div class="info-grid">
                    <div><strong>Patient:</strong> ${plan.patientName}</div>
                    <div><strong>Plan ID:</strong> ${plan.id}</div>
                    <div><strong>Created Date:</strong> ${new Date(plan.createdDate).toLocaleDateString()}</div>
                    <div><strong>BMI:</strong> ${plan.bmi ? plan.bmi.toFixed(1) : 'N/A'}</div>
                    <div><strong>Target Weight:</strong> ${plan.targetWeight || 'Not specified'} kg</div>
                    <div><strong>Daily Calories:</strong> ${plan.caloriesPerDay || 'Not specified'}</div>
                </div>
            </div>
            
            <div class="food-lists">
                <div>
                    <div class="section-title">Recommended Foods</div>
                    <ul>${allowedFoodsHtml}</ul>
                </div>
                <div>
                    <div class="section-title">Foods to Avoid</div>
                    <ul>${avoidFoodsHtml}</ul>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Weight History</div>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Weight (kg)</th>
                        </tr>
                    </thead>
                    <tbody>${weightHistoryHtml}</tbody>
                </table>
            </div>
            
            <div class="section">
                <div class="section-title">Nutrition Education</div>
                <p>${plan.education || 'No specific education provided.'}</p>
            </div>
            
            <div class="section">
                <div class="section-title">General Guidelines</div>
                <ul>
                    <li>Follow the recommended food list for optimal health</li>
                    <li>Maintain regular meal times and avoid skipping meals</li>
                    <li>Stay hydrated by drinking at least 8 glasses of water daily</li>
                    <li>Combine this diet plan with regular physical activity</li>
                    <li>Consult your doctor before making significant dietary changes</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                <p>For questions or concerns, please contact our nutrition department at (02) 1234-5678</p>
            </div>
        </body>
        </html>
    `;
    
    openPrintWindow(printHtml);
}