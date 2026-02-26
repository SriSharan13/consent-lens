chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === "fetchPolicy") {

        fetch(request.url)
            .then(res => res.text())
            .then(html => {

                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");

                // Remove unwanted elements
                doc.querySelectorAll("script, style, noscript").forEach(el => el.remove());

                const cleanText = doc.body.innerText;

                sendResponse({
                    success: true,
                    text: cleanText
                });

            })
            .catch(error => {
                sendResponse({
                    success: false,
                    error: error.toString()
                });
            });

        return true; // required for async response
    }
});