let consentLensTriggered = false;

async function analyzePage(userId = null, siteUrl = "Unknown Site") {

    if (consentLensTriggered) return;
    consentLensTriggered = true;

    const policyUrl = findPrivacyPolicyLink();

    if (!policyUrl) {
        console.log("No privacy policy link found.");
        consentLensTriggered = false;
        return;
    }


    // Ask background script to fetch policy (bypass CORS)
    chrome.runtime.sendMessage(
        { action: "fetchPolicy", url: policyUrl },
        async function (response) {

            if (!response || !response.success) {
                console.error("Policy fetch failed:", response?.error);
                consentLensTriggered = false;
                return;
            }

            const policyText = response.text;
            if (!policyText || policyText.length < 100) {
                console.log("Policy text too small, skipping analysis.");
                consentLensTriggered = false;
                return;
            }


            // Send policy text to backend
            const backendResponse = await fetch("http://127.0.0.1:8000/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: policyText.slice(0, 5000),
                    user_id: userId,
                    site_url: siteUrl
                })
            });

            const data = await backendResponse.json();
            console.log("Backend response:", data);
            showOverlay(data.score, data.decision, data.reasons);
        }
    );
}


function showOverlay(score, decision, reasons) {

    if (document.getElementById("consentlens-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "consentlens-overlay";

    const reasonsHTML = reasons && reasons.length
        ? reasons.map(r => `<li>${r}</li>`).join("")
        : "<li>No major risks detected</li>";

    overlay.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');

            #consentlens-card {
                position: fixed;
                bottom: -600px;
                right: 30px;
                width: 380px;
                font-family: 'Outfit', 'Segoe UI', sans-serif;
                background: rgba(13, 13, 18, 0.7);
                backdrop-filter: blur(24px) saturate(180%);
                -webkit-backdrop-filter: blur(24px) saturate(180%);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 28px;
                color: #ffffff;
                z-index: 2147483647;
                transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                box-shadow: 
                    0 20px 50px rgba(0, 0, 0, 0.5),
                    0 0 40px rgba(124, 92, 255, 0.15),
                    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
                padding: 0;
                overflow: hidden;
            }

            .cl-header {
                padding: 20px 24px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: linear-gradient(to bottom, rgba(255,255,255,0.03), transparent);
                border-bottom: 1px solid rgba(255,255,255,0.05);
            }

            .cl-logo-group {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .cl-logo {
                width: 32px;
                height: 32px;
                background: linear-gradient(135deg, #7c5cff, #00ffd5);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(124, 92, 255, 0.3);
            }

            .cl-title {
                font-size: 16px;
                font-weight: 700;
                letter-spacing: -0.02em;
                background: linear-gradient(90deg, #fff, rgba(255,255,255,0.7));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            #close-consentlens {
                width: 32px;
                height: 32px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                color: #888;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 18px;
            }

            #close-consentlens:hover {
                background: rgba(255,255,255,0.1);
                color: #fff;
                transform: rotate(90deg);
            }

            .cl-content {
                padding: 24px;
            }

            .cl-score-ring {
                position: relative;
                width: 140px;
                height: 140px;
                margin: 0 auto 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }

            #consent-score-value {
                font-size: 48px;
                font-weight: 700;
                line-height: 1;
                margin-top: 5px;
            }

            .cl-score-label {
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                color: rgba(255,255,255,0.4);
            }

            .cl-analysis-box {
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.05);
                border-radius: 20px;
                padding: 20px;
                margin-top: 24px;
            }

            .cl-decision-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }

            .cl-decision-label {
                font-size: 11px;
                font-weight: 600;
                color: rgba(255,255,255,0.5);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .cl-decision-badge {
                padding: 4px 12px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.02em;
                background: rgba(0, 255, 213, 0.1);
                border: 1px solid rgba(0, 255, 213, 0.2);
                color: #00ffd5;
            }

            .cl-why-title {
                font-size: 12px;
                font-weight: 600;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .cl-reasons {
                list-style: none !important;
                padding: 0 !important;
                margin: 0 !important;
            }

            .cl-reasons li {
                font-size: 12px;
                color: rgba(255,255,255,0.6);
                margin-bottom: 8px;
                padding-left: 18px;
                position: relative;
                line-height: 1.4;
            }

            .cl-reasons li::before {
                content: '';
                position: absolute;
                left: 0;
                top: 7px;
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: #7c5cff;
                box-shadow: 0 0 8px #7c5cff;
            }

            svg.cl-progress-ring {
                position: absolute;
                top: 0;
                left: 0;
                transform: rotate(-90deg);
            }
        </style>

        <div id="consentlens-card">
            <div class="cl-header">
                <div class="cl-logo-group">
                    <div class="cl-logo">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            <path d="M9 12l2 2 4-4"></path>
                        </svg>
                    </div>
                    <span class="cl-title">ConsentLens</span>
                </div>
                <button id="close-consentlens">×</button>
            </div>

            <div class="cl-content">
                <div class="cl-score-ring">
                    <svg class="cl-progress-ring" width="140" height="140">
                        <circle stroke="rgba(255,255,255,0.05)" stroke-width="8" fill="transparent" r="62" cx="70" cy="70"/>
                        <circle id="cl-progress-bar" stroke="#00ffd5" stroke-width="8" stroke-dasharray="389.5" stroke-dashoffset="389.5" stroke-linecap="round" fill="transparent" r="62" cx="70" cy="70" style="filter: drop-shadow(0 0 8px rgba(0, 255, 213, 0.4)); transition: stroke-dashoffset 1s ease;"/>
                    </svg>
                    <span class="cl-score-label">Risk Score</span>
                    <span id="consent-score-value">0</span>
                </div>

                <div class="cl-analysis-box">
                    <div class="cl-decision-row">
                        <span class="cl-decision-label">AI Decision</span>
                        <span class="cl-decision-badge" id="cl-badge">${decision}</span>
                    </div>
                    
                    <div class="cl-why-title">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c5cff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                        Analysis Details
                    </div>
                    <ul class="cl-reasons">${reasonsHTML}</ul>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
        const card = document.getElementById("consentlens-card");
        if (card) card.style.bottom = "30px";
    }, 50);

    document.getElementById("close-consentlens").addEventListener("click", () => {
        overlay.remove();
        consentLensTriggered = false;
    });

    let currentScore = 0;
    const scoreElement = document.getElementById("consent-score-value");
    const progressBar = document.getElementById("cl-progress-bar");
    const circum = 2 * Math.PI * 62;

    const scoreInterval = setInterval(() => {
        if (currentScore >= score) {
            clearInterval(scoreInterval);
        } else {
            currentScore++;
            if (scoreElement) scoreElement.textContent = currentScore;
        }
    }, 10);

    setTimeout(() => {
        if (progressBar) {
            const offset = circum - (score / 100) * circum;
            progressBar.style.strokeDashoffset = offset;

            // Color based on score
            if (score >= 70) {
                progressBar.style.stroke = "#00ffd5";
            } else if (score >= 40) {
                progressBar.style.stroke = "#f1c40f";
            } else {
                progressBar.style.stroke = "#ff4d4d";
            }
        }
    }, 300);
}


function findPrivacyPolicyLink() {
    const links = document.querySelectorAll("a");
    for (let link of links) {
        if (link.innerText.toLowerCase().includes("privacy") && link.href.startsWith('http')) {
            return link.href;
        }
    }
    return null;
}

function detectConsentBanner() {
    const keywords = ["accept", "agree", "cookies", "privacy"];
    const elements = document.querySelectorAll("button, a");

    for (let el of elements) {
        const text = el.innerText?.toLowerCase();
        if (text && keywords.some(k => text.includes(k))) {
            return true;
        }
    }
    return false;
}

const observer = new MutationObserver(() => {
    if (!consentLensTriggered && detectConsentBanner()) {
        observer.disconnect();
        analyzePage();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Listener for automatic sync from Dashboard
window.addEventListener("message", (event) => {
    if (event.data.type === "CONSENTLENS_SYNC_ID") {
        const userId = event.data.userId;
        chrome.storage.local.set({ "consentlens_user_id": userId }, () => {
            console.log("ConsentLens User ID synchronized:", userId);
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "manualScan") {
        console.log("Manual scan requested via popup");
        const existing = document.getElementById("consentlens-overlay");
        if (existing) existing.remove();

        consentLensTriggered = false;
        analyzePage(request.user_id, request.site_url);
        sendResponse({ success: true });
    }
});
