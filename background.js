// Make the API work in both Chrome and Firefox
const api = typeof browser !== "undefined" ? browser : chrome;

api.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.type !== "fetch-card")
        return;

    fetch(`https://api.scryfall.com/cards/${message.cardID}`)
        .then(response => {

            if (!response.ok)
                throw new Error(`HTTP ${response.status}`);

            return response.json();
        })
        .then(data => sendResponse(data))
        .catch(error => sendResponse({
            error: error.message
        }));

    return true;
});