let currentCardID = null;
let lastURL = location.href;

function obtainCardID() {
    let cardInfo = document.querySelector('meta[name="scryfall:card:id"]');
    if (cardInfo) {
        return cardInfo.getAttribute('content');
    }
    //Fallback: try to extract ID from another source
    cardInfo = document.querySelector('button.deckbuilder-card-add-button');
    if (cardInfo) {
        return cardInfo.getAttribute('data-card-id');
    }
    return null;
}

async function fetchCardLegality(cardID) {
    let data = await browser.runtime.sendMessage({
        type: "fetch-card",
        cardID
    });
    if (data.error) {
        console.error("Error fetching card data:", data.error);
        return null;
    }
    let legality = data.legalities.premodern ?? null;
    if (legality === 'not_legal') {
        return 'not-legal';
    }
    return legality;
}

function createPlaceholder() {

    document.querySelector('.card-legality-item.premodern-extension')?.remove();

    let rows = document.querySelectorAll('.card-legality-row');

    if (rows.length === 0) return false;
    let lastRow = rows[rows.length - 1];

    let newItem = document.createElement('div');
    newItem.className = 'card-legality-item premodern-extension';

    let dt = document.createElement('dt');
    dt.textContent = 'Premodern';

    let dd = document.createElement('dd');
    dd.className = "premodern-box";
    dd.style.backgroundColor = "#f7c94c";
    dd.textContent = "...";

    newItem.appendChild(dt);
    newItem.appendChild(dd);

    lastRow.appendChild(newItem);
}

function updateUI(legality) {
    let placeholder = document.querySelector('.premodern-box');
    if (placeholder) {
        if (legality) {
            placeholder.classList.add(legality);
            placeholder.style.backgroundColor = null;
            placeholder.textContent = legality === 'not-legal' ? 'Not Legal' : legality;
        }
        else {
            placeholder.textContent = "Unavailable";
        }
    }
}


async function init(){
    const cardID = obtainCardID();

    if (!cardID){
        updateUI(null);
        return;
    }

    if (cardID === currentCardID)
        return;

    currentCardID = cardID;

    createPlaceholder();

    const requestCardID = cardID;

    const data = await fetchCardLegality(cardID);

    if (requestCardID !== currentCardID)
        return;

    updateUI(data);
}

init();

new MutationObserver(() => {

    const currentURL = location.href;

    if (currentURL !== lastURL) {

        lastURL = currentURL;

        init();
    }

}).observe(document.body, { subtree: true, childList: true });