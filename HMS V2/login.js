document.addEventListener('DOMContentLoaded', function() {
    seedInitialData();
    
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const roleSelect = document.getElementById('role');
    const demoAccounts = document.getElementById('demoAccounts');
    
    const users = readCollection('hwh_users');
    
    demoAccounts.innerHTML = '';
    users.forEach(user => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'demo-account-btn';
        button.textContent = `${user.username} (${user.role})`;
        button.onclick = () => {
            usernameInput.value = user.username;
            passwordInput.value = user.password;
            roleSelect.value = user.role;
        };
        demoAccounts.appendChild(button);
    });
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const role = roleSelect.value;
        
        const user = users.find(u => 
            u.username === username && 
            u.password === password && 
            (!role || u.role === role) &&
            u.isActive
        );
        
        if (user) {
            const session = {
                userId: user.id,
                username: user.username,
                role: user.role,
                name: user.name,
                patientId: user.patientId,
                token: Math.random().toString(36).substr(2),
                expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            };
            
            sessionStorage.setItem('hwh_session', JSON.stringify(session));
            showToast('Login successful!', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showToast('Invalid credentials or role mismatch', 'error');
        }
    });
});