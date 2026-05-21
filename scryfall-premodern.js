
console.log('[Scryfall Premodern] Content script loaded');

async function addPremodernLegality() {
    // First, we need to obtain the card ID from the page
    let cardID = obtainCardID();
    if (!cardID) {
        console.log('Card ID not found, cannot fetch data');
        return false;
    }
    // Next, we fetch the card data from Scryfall's API
    let legality = await fetchCardLegality(cardID);
    console.log('Fetched legality:', legality);
    if (!legality) return false;

    // Finally, we modify the DOM to add the new legality information
    let legalityList = document.querySelector('.card-legality');
    if (legalityList) {
        //TODO: Consider adding a new row if the last one is full
        let rows = document.querySelectorAll('.card-legality-row');
        console.log(rows);
        if (rows.length === 0) return false;
        let lastRow = rows[rows.length - 1];

        let newItem = document.createElement('div');
        newItem.className = 'card-legality-item';

        let dt = document.createElement('dt');
        dt.textContent = 'Premodern';

        let dd = document.createElement('dd');
        dd.className = legality;
        dd.textContent = legality === 'not-legal' ? 'Not Legal' : legality;

        newItem.appendChild(dt);
        newItem.appendChild(dd);

        lastRow.appendChild(newItem);
        return true;
    }
    return false;
}

function obtainCardID() {
    let cardInfo = document.querySelector('meta[name="scryfall:card:id"]');
    console.log('Card info element:', cardInfo);
    if (cardInfo) {
        return cardInfo.getAttribute('content');
    }
    //Fallback: try to extract from another source
    cardInfo = document.querySelector('button.deckbuilder-card-add-button');
    console.log('Fallback card info element:', cardInfo);
    if (cardInfo) {
        return cardInfo.getAttribute('data-card-id');
    }
    return null;
}

async function fetchCardLegality(cardID) {
    let apiURL = `https://api.scryfall.com/cards/${cardID}`;
    return fetch(apiURL)
        .then(response => response.json())
        .then(data => {
            console.log('Card data:', data);
            if (data.legalities && data.legalities.premodern) {
                let legality = data.legalities.premodern;
                if (legality === 'not_legal') {
                    return 'not-legal';
                }
                return legality;
            }
            return null;
        })
        .catch(error => {
            console.error('Error fetching card data:', error);
            return null;
        });
}

// Waits for the page to load before trying to modify the DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", addPremodernLegality);
} else {
    addPremodernLegality();
}