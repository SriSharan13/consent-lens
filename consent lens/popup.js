document.addEventListener('DOMContentLoaded', function () {
    const dashboardBtn = document.getElementById('open-dashboard');

    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', function () {
            // Redirect to the local dashboard
            // We use chrome.tabs.create to open it in a new tab
            chrome.tabs.create({ url: 'http://localhost:3000' });
        });
    }
});
