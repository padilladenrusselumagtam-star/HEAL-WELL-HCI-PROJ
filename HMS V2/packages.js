document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) return;
    
    const currentUser = getCurrentUser();
    if (currentUser.role === 'Patient') {
        document.querySelectorAll('.select-package-btn').forEach(btn => {
            btn.style.display = 'none';
        });
    }
    
    loadPackages();
});

function loadPackages() {
    const packages = readCollection('hwh_packages');
    const container = document.getElementById('packagesContainer');
    
    container.innerHTML = '';
    
    packages.forEach(pkg => {
        const card = document.createElement('div');
        card.className = 'package-card';
        card.innerHTML = `
            <h3>${pkg.name}</h3>
            <div class="package-price">${formatCurrency(pkg.price)}</div>
            <div class="package-description">${pkg.description}</div>
            <ul class="inclusions-list">
                ${pkg.inclusions.map(inc => `<li>${inc}</li>`).join('')}
            </ul>
            <button class="select-package-btn" onclick="selectPackage('${pkg.id}')">
                Select Package
            </button>
        `;
        container.appendChild(card);
    });
}

function selectPackage(packageId) {
    window.location.href = `booking-details.html?pkg=${packageId}`;
}