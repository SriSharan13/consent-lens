chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === "fetchPolicy") {

        fetch(request.url)
            .then(res => res.text())
            .then(html => {

                // Remove scripts/styles manually (since DOMParser not allowed)
                const cleanText = html
                    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
                    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
                    .replace(/<noscript[\s\S]*?>[\s\S]*?<\/noscript>/gi, "")
                    .replace(/<[^>]+>/g, " ") // remove all HTML tags
                    .replace(/\s+/g, " ")
                    .trim();

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

        return true; // keep async channel open
    }
});