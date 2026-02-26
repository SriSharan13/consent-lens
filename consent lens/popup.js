window.addEventListener('DOMContentLoaded', async () => {
    const statusText = document.getElementById('status-text');
    const scanBtn = document.getElementById('scan-now');

    // 1. Check if on a scanable page
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url.startsWith('http')) {
        statusText.textContent = "Protected Page";
        statusText.style.color = "#ff4d4d";
        if (scanBtn) scanBtn.disabled = true;
        return;
    }

    // 2. Click Handler
    scanBtn.addEventListener('click', async () => {
        try {
            // Get saved User ID
            const result = await chrome.storage.local.get(['consentlens_user_id']);
            const userId = result.consentlens_user_id;

            if (!userId) {
                statusText.textContent = "Login Required";
                statusText.style.color = "#f1c40f";
                return;
            }

            scanBtn.disabled = true;
            scanBtn.innerHTML = '<span class="animate-pulse">Analyzing...</span>';
            statusText.textContent = "Scanning Policy...";

            chrome.tabs.sendMessage(tab.id, {
                action: "manualScan",
                user_id: userId,
                site_url: new URL(tab.url).hostname
            }, (response) => {
                if (chrome.runtime.lastError) {
                    statusText.textContent = "Refresh Page";
                    statusText.style.color = "#ff4d4d";
                    scanBtn.disabled = false;
                    scanBtn.textContent = "Try Again";
                } else {
                    statusText.textContent = "Syncing...";
                    setTimeout(() => {
                        statusText.textContent = "Complete!";
                        window.close();
                    }, 1000);
                }
            });

        } catch (e) {
            console.error("Popup Error:", e);
            statusText.textContent = "Error";
            if (scanBtn) scanBtn.disabled = false;
        }
    });
});
