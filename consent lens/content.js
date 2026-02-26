let consentLensTriggered = false;

async function analyzePage(userId = null, siteUrl = "Unknown Site") {

    if (consentLensTriggered) return;
    consentLensTriggered = true;

    let policyUrl = window.location.href;
    const isPolicyPage = window.location.pathname.toLowerCase().includes("privacy") ||
        document.title.toLowerCase().includes("privacy");

    if (!isPolicyPage) {
        policyUrl = findPrivacyPolicyLink();
    }

    if (!policyUrl) {
        console.log("No privacy policy link found.");
        consentLensTriggered = false;
        return;
    }

    // If we are already on the policy page, we can extract text directly
    if (window.location.href === policyUrl) {
        const pageText = document.body.innerText;
        await processAnalysis(pageText, userId, siteUrl);
        return;
    }

    // Otherwise, fetch from the link
    chrome.runtime.sendMessage(
        { action: "fetchPolicy", url: policyUrl },
        async function (response) {
            if (!response || !response.success) {
                console.error("Policy fetch failed:", response?.error);
                consentLensTriggered = false;
                return;
            }
            await processAnalysis(response.text, userId, siteUrl);
        }
    );
}

async function processAnalysis(policyText, userId, siteUrl) {
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
            text: policyText.slice(0, 10000), // Increased context for better analysis
            user_id: userId,
            site_url: siteUrl
        })
    });

    const data = await backendResponse.json();
    console.log("Backend response:", data);
    showOverlay(data);
}


function showOverlay(data) {
    const { score, decision, categories, impact_translations, risky_clauses, what_if_simulator, dark_patterns, personalized_advice, reasons, summary } = data;

    if (document.getElementById("consentlens-overlay")) {
        document.getElementById("consentlens-overlay").remove();
    }

    const overlay = document.createElement("div");
    overlay.id = "consentlens-overlay";

    const categoriesHTML = Object.entries(categories || {}).map(([key, val]) => `
        <div class="cl-category-item">
            <span class="cl-cat-label">${key.replace(/_/g, ' ')}</span>
            <span class="cl-cat-rank cl-rank-${val.rank}">${val.rank}</span>
            <div class="cl-cat-details">${val.details}</div>
        </div>
    `).join("");

    const impactsHTML = (impact_translations || []).slice(0, 2).map(imp => `
        <div class="cl-impact-box">
            <div class="cl-impact-legal">"${imp.legal_text.substring(0, 60)}..."</div>
            <div class="cl-impact-real">➜ ${imp.real_world_impact}</div>
        </div>
    `).join("");

    const clausesHTML = (risky_clauses || []).slice(0, 2).map(c => `
        <div class="cl-risky-clause">
            <div class="cl-clause-text">🚨 "${c.clause.substring(0, 100)}..."</div>
            <div class="cl-clause-evidence">${c.evidence}</div>
        </div>
    `).join("");

    const simulatorHTML = (what_if_simulator || []).slice(0, 3).map(s => `
        <div class="cl-sim-row">
            <span class="cl-sim-perm">${s.permission}</span>
            <span class="cl-sim-impact">🚫 ${s.if_rejected}</span>
        </div>
    `).join("");

    const darkPatternsHTML = (dark_patterns || []).map(dp => `
        <div class="cl-dark-pattern">
            ⚠️ <strong>${dp.type}:</strong> ${dp.evidence}
        </div>
    `).join("");

    overlay.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

            #consentlens-card {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 420px;
                max-height: calc(100vh - 40px);
                font-family: 'Outfit', sans-serif;
                background: #0a0a0f;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 24px;
                color: #fff;
                z-index: 2147483647;
                box-shadow: 0 30px 60px rgba(0,0,0,0.8), 0 0 40px rgba(124, 92, 255, 0.2);
                overflow-y: auto;
                scrollbar-width: none;
                animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            }

            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

            .cl-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: #0a0a0f; z-index: 10; }
            .cl-logo-group { display: flex; align-items: center; gap: 10px; }
            .cl-logo { width: 32px; height: 32px; background: linear-gradient(135deg, #7c5cff, #00ffd5); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
            .cl-title { font-weight: 700; font-size: 18px; letter-spacing: -0.5px; }
            
            #close-cl { background: none; border: none; color: #555; cursor: pointer; font-size: 24px; }
            #close-cl:hover { color: #fff; }

            .cl-content { padding: 20px; }
            .cl-summary { font-size: 13px; color: #aaa; margin-bottom: 20px; line-height: 1.5; }

            .cl-main-score { display: flex; align-items: center; gap: 20px; background: rgba(255,255,255,0.03); padding: 20px; border-radius: 20px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.05); }
            .cl-score-circle { width: 70px; height: 70px; border-radius: 50%; border: 4px solid #7c5cff; display: flex; items-center: center; justify-content: center; font-size: 24px; font-weight: 700; color: #7c5cff; }
            .cl-recommendation { flex: 1; }
            .cl-rec-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #666; font-weight: 700; }
            .cl-rec-value { font-size: 18px; font-weight: 700; color: ${score >= 70 ? '#00ffd5' : score >= 40 ? '#f1c40f' : '#ff4d4d'}; }

            .cl-section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #7c5cff; margin: 25px 0 12px; display: flex; align-items: center; gap: 8px; }
            .cl-section-title::after { content: ''; flex: 1; height: 1px; background: rgba(124, 92, 255, 0.2); }

            .cl-categories { grid-template-columns: 1fr 1fr; display: grid; gap: 10px; }
            .cl-category-item { background: rgba(255,255,255,0.02); padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
            .cl-cat-label { font-size: 10px; color: #888; text-transform: capitalize; display: block; margin-bottom: 4px; }
            .cl-cat-rank { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; }
            .cl-rank-low { background: rgba(0,255,213,0.1); color: #00ffd5; }
            .cl-rank-medium { background: rgba(241,196,15,0.1); color: #f1c40f; }
            .cl-rank-high { background: rgba(255,77,77,0.1); color: #ff4d4d; }
            .cl-cat-details { font-size: 10px; color: #555; margin-top: 5px; line-height: 1.3; }

            .cl-impact-box { background: rgba(124, 92, 255, 0.05); padding: 12px; border-radius: 12px; margin-bottom: 8px; border-left: 3px solid #7c5cff; }
            .cl-impact-legal { font-size: 11px; color: #777; font-style: italic; margin-bottom: 4px; }
            .cl-impact-real { font-size: 12px; font-weight: 600; color: #fff; }

            .cl-risky-clause { background: rgba(255,77,77,0.05); padding: 12px; border-radius: 12px; margin-bottom: 8px; border-left: 3px solid #ff4d4d; }
            .cl-clause-text { font-size: 11px; font-weight: 600; margin-bottom: 4px; color: #ffbbbb; }
            .cl-clause-evidence { font-size: 10px; color: #888; }

            .cl-sim-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
            .cl-sim-perm { font-size: 12px; font-weight: 600; }
            .cl-sim-impact { font-size: 11px; color: #aaa; }

            .cl-dark-pattern { font-size: 11px; color: #ff9f43; background: rgba(255,159,67,0.1); padding: 10px; border-radius: 10px; margin-top: 10px; }

            .cl-advice-tabs { display: flex; gap: 5px; margin-top: 10px; }
            .cl-advice-card { background: rgba(255,255,255,0.03); padding: 15px; border-radius: 15px; margin-top: 10px; font-size: 12px; line-height: 1.5; color: #ccc; }
            .cl-advice-profile { color: #00ffd5; font-weight: 700; margin-bottom: 5px; display: block; }
        </style>

        <div id="consentlens-card">
            <div class="cl-header">
                <div class="cl-logo-group">
                    <div class="cl-logo">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4"/></svg>
                    </div>
                    <span class="cl-title">ConsentLens 2.0</span>
                </div>
                <button id="close-cl">×</button>
            </div>

            <div class="cl-content">
                <div class="cl-summary">${summary || "Analysis complete. View detailed impact below."}</div>

                <div class="cl-main-score">
                    <div class="cl-score-circle" style="border-color: ${score >= 70 ? '#00ffd5' : score >= 40 ? '#f1c40f' : '#ff4d4d'}; color: ${score >= 70 ? '#00ffd5' : score >= 40 ? '#f1c40f' : '#ff4d4d'};">
                        ${score}
                    </div>
                    <div class="cl-recommendation">
                        <div class="cl-rec-label">Consent Safety Score</div>
                        <div class="cl-rec-value">${decision}</div>
                    </div>
                </div>

                <div class="cl-section-title">Policy Categories</div>
                <div class="cl-categories">${categoriesHTML}</div>

                <div class="cl-section-title">Impact Translation</div>
                ${impactsHTML}

                <div class="cl-section-title">Risky Clauses</div>
                ${clausesHTML}

                <div class="cl-section-title">What-If Simulator</div>
                <div class="cl-simulator-box">${simulatorHTML}</div>

                ${dark_patterns && dark_patterns.length ? '<div class="cl-section-title">Dark Patterns</div>' + darkPatternsHTML : ''}

                <div class="cl-section-title">Personalized Advice</div>
                <div class="cl-advice-card">
                    <span class="cl-advice-profile">🛡️ Privacy-First Recommendation</span>
                    ${personalized_advice?.privacy_first || "Avoid optional data sharing."}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("close-cl").addEventListener("click", () => {
        overlay.remove();
        consentLensTriggered = false;
    });
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
