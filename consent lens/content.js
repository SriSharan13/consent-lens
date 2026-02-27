let consentLensTriggered = false;

window.addEventListener("load", () => {
    analyzePage();
});

async function analyzePage() {

    if (consentLensTriggered) return;
    consentLensTriggered = true;

    const currentUrl = window.location.href;
    const isPolicyPage = currentUrl.toLowerCase().includes("privacy") ||
        currentUrl.toLowerCase().includes("terms") ||
        currentUrl.toLowerCase().includes("legal") ||
        currentUrl.toLowerCase().includes("financial") ||
        currentUrl.toLowerCase().includes("subscription") ||
        currentUrl.toLowerCase().includes("checkout");

    console.log("ConsentLens: Checking page...", { isPolicyPage, currentUrl });

    if (isPolicyPage) {
        // If we are already on a policy page, extract the text directly
        const pageText = document.body.innerText;
        await sendToBackend(pageText, currentUrl);
        return;
    }

    const policyUrl = findPrivacyPolicyLink();

    if (!policyUrl) {
        console.log("No privacy policy link found.");
        consentLensTriggered = false;
        return;
    }

    chrome.runtime.sendMessage(
        { action: "fetchPolicy", url: policyUrl },
        async function (response) {

            if (!response || !response.success) {
                console.error("Policy fetch failed:", response?.error);
                consentLensTriggered = false;
                return;
            }

            const policyText = response.text;
            await sendToBackend(policyText, currentUrl);
        }
    );
}

async function sendToBackend(text, site_url) {
    if (!text || text.length < 500) {
        console.log("Policy text too small.");
        consentLensTriggered = false;
        return;
    }

    try {
        const backendResponse = await fetch("http://127.0.0.1:8000/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: text.slice(0, 10000),
                site_url: site_url
            })
        });

        const data = await backendResponse.json();
        console.log("Backend response:", data);

        showOverlay(data.score, data.decision, data.reasons, data);
    } catch (error) {
        console.error("Error sending to backend:", error);
        consentLensTriggered = false;
    }
}


function showOverlay(score, decision, reasons, fullData = {}) {

    if (document.getElementById("consentlens-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "consentlens-overlay";

    const reasonsHTML = reasons && reasons.length
        ? reasons.map(r => `<li>${r}</li>`).join("")
        : "<li>No major risks detected</li>";

    const riskyClausesHTML = fullData.risky_clauses && fullData.risky_clauses.length
        ? fullData.risky_clauses.map(item => `
            <div style="margin-bottom:12px; padding:10px; background:rgba(255,100,100,0.05); border-radius:8px; border-left:3px solid #ff4d4d;">
                <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#ff4d4d; margin-bottom:4px; letter-spacing:0.5px;">Flagged Fragment</div>
                <div style="font-size:12px; font-style:italic; margin-bottom:6px; color:#aaa; line-height:1.4;">"${item.clause || item.text || ''}"</div>
                <div style="font-size:12px; color:#eee; font-weight:500;">${item.evidence || item.reason || ''}</div>
            </div>
        `).join("")
        : "";

    const autopayWarning = fullData.autopay_detected
        ? `<div style="margin-top:15px; padding:12px; background:rgba(255,100,100,0.1); border:1px solid rgba(255,100,100,0.3); border-radius:12px; color:#ff8080; font-size:13px;">
            <strong>⚠️ AUTO-PAY WARNING:</strong> This site mentions automatic billing or recurring subscriptions. Entering card details may trigger active auto-renewal.
           </div>`
        : "";

    const financialInfo = fullData.is_financial_product && fullData.financial_terms
        ? `<div style="margin-top:15px; padding:12px; background:rgba(124,92,255,0.1); border:1px solid rgba(124,92,255,0.3); border-radius:12px; font-size:13px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>APR:</span> <strong>${fullData.financial_terms.apr || 'N/A'}</strong></div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Annual Fee:</span> <strong>${fullData.financial_terms.annual_fee || 'N/A'}</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Late Fee:</span> <strong>${fullData.financial_terms.late_fee || 'N/A'}</strong></div>
           </div>`
        : "";

    overlay.innerHTML = `
        <style>
            #consentlens-card {
                position: fixed;
                bottom: -800px;
                right: 30px;
                width: 420px;
                padding: 24px;
                border-radius: 24px;
                font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
                background: rgba(13, 13, 20, 0.8);
                backdrop-filter: blur(24px) saturate(180%);
                border: 1px solid rgba(255,255,255,0.1);
                color: #eaeaf0;
                z-index: 2147483647;
                transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                box-shadow: 
                    0 20px 50px rgba(0,0,0,0.5),
                    0 0 60px rgba(124,92,255,0.1);
            }

            #consentlens-card h3 {
                font-size: 19px;
                font-weight: 700;
                margin: 0;
                background: linear-gradient(135deg, #fff 0%, #a8a8b3 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            #consentlens-card button {
                background: rgba(255,255,255,0.05);
                border: none;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                color: #aaa;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            #consentlens-card button:hover {
                background: rgba(255,255,255,0.1);
                color: #fff;
            }

            #consent-score-value {
                font-size: 42px;
                font-weight: 800;
                letter-spacing: -1px;
                background: linear-gradient(135deg, #7c5cff 0%, #00ffd5 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
        </style>

        <div id="consentlens-card">

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:10px; height:10px; background:#7c5cff; border-radius:2px;"></div>
                    <h3>ConsentLens</h3>
                </div>
                <button id="close-consentlens">×</button>
            </div>

            <div style="display:flex; justify-content:center; margin:10px 0;">
                <svg width="220" height="120" viewBox="0 0 250 140">
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#ff4d4d"/>
                            <stop offset="50%" stop-color="#f1c40f"/>
                            <stop offset="100%" stop-color="#00ffd5"/>
                        </linearGradient>
                    </defs>
                    <path d="M20 120 A105 105 0 0 1 230 120" stroke="rgba(255,255,255,0.05)" stroke-width="18" fill="none" stroke-linecap="round" />
                    <path d="M20 120 A105 105 0 0 1 230 120" stroke="url(#gaugeGradient)" stroke-width="18" fill="none" stroke-linecap="round" stroke-dasharray="330" stroke-dashoffset="330" id="gauge-progress"/>
                    <line id="consent-needle" x1="125" y1="120" x2="125" y2="35" stroke="#ffffff" stroke-width="4" stroke-linecap="round" transform="rotate(-90 125 120)" />
                </svg>
            </div>

            <div style="text-align:center; margin-top:-10px;">
                <span id="consent-score-value">0</span>
                <div style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#666; font-weight:700;">Safety Score</div>
            </div>

            <div style="text-align:center; margin:15px 0;">
                <div style="display:inline-block; padding:4px 12px; background:rgba(255,255,255,0.05); border-radius:20px; font-size:13px; font-weight:600;">
                    ${decision}
                </div>
            </div>

            ${autopayWarning}
            ${financialInfo}

            <div style="margin-top:20px; padding-top:15px; border-top:1px solid rgba(255,255,255,0.05);">
                <strong style="font-size:13px; color:#888; display:block; margin-bottom:10px;">Critical Fragments:</strong>
                ${riskyClausesHTML}
            </div>

            <div style="margin-top:15px; padding-top:15px; border-top:1px solid rgba(255,255,255,0.05);">
                <strong style="font-size:13px; color:#888; display:block; margin-bottom:8px;">Key Insights:</strong>
                <ul style="margin:0; padding-left:18px; font-size:13px; color:#ccc; line-height:1.6;">
                    ${reasonsHTML}
                </ul>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
        document.getElementById("consentlens-card").style.bottom = "30px";
    }, 50);

    document.getElementById("close-consentlens").addEventListener("click", () => {
        overlay.remove();
        consentLensTriggered = false;
    });

    // Score and Needle Animation
    let currentScore = 0;
    const scoreElement = document.getElementById("consent-score-value");
    const gaugeProgress = document.getElementById("gauge-progress");
    const needle = document.getElementById("consent-needle");

    const targetRotation = (score / 100) * 180 - 90;
    const targetDashOffset = 330 - (score / 100) * 330;

    const animationDuration = 1000;
    const startTime = performance.now();

    function animate(time) {
        let elapsed = time - startTime;
        let progress = Math.min(elapsed / animationDuration, 1);

        // Easing (outQuart)
        let ease = 1 - Math.pow(1 - progress, 4);

        let displayScore = Math.floor(score * ease);
        scoreElement.textContent = displayScore;

        let rotation = -90 + (targetRotation + 90) * ease;
        needle.setAttribute("transform", `rotate(${rotation} 125 120)`);

        let dashOffset = 330 - (330 - targetDashOffset) * ease;
        gaugeProgress.style.strokeDashoffset = dashOffset;

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}


function findPrivacyPolicyLink() {
    const links = document.querySelectorAll("a");
    const keywords = ["privacy", "terms", "conditions", "legal", "agreement", "disclosure", "cardmember"];
    for (let link of links) {
        const text = link.innerText.toLowerCase();
        if (keywords.some(k => text.includes(k))) {
            return link.href;
        }
    }
    return null;
}

