import {
    daysAwayText, calcDaysAway, minDate, newID,
    storage, loadCardData, checkListener, tripList,
    moreTrips, pullData, getDate
} from './app'

// creates a new location to store data in the main array
// returns and 1st array for the city added
function newStorageItem(mainStorageArray, cityName, tripDate) {
    // get new storage position
    let x = mainStorageArray.length;
    mainStorageArray[x] = {
        "id": newID(cityName), "data": {
            "cities": [
                {
                    "name": cityName.toLowerCase(),
                    "date": tripDate,
                    "imageCitySearched": "",
                    "weather": [{ "icon": "", "high": "", "low": "", "desc": "" }],
                    "flight": {
                        "depart": { "code": "", "time": "", "info": "" },
                        "arrive": { "code": "", "time": "", "info": "" }
                    },
                    "hotel": { "name": "", "address": "" }
                },
                {
                    "name": "next location",
                    "date": "",
                    "imageCitySearched": "",
                    "weather": [{ "icon": "new.svg", "high": "", "low": "", "desc": "???" }],
                    "flight": {
                        "depart": { "code": "", "time": "", "info": "" },
                        "arrive": { "code": "", "time": "", "info": "" }
                    },
                    "hotel": { "name": "", "address": "" }
                },
                {
                    "name": "final location",
                    "date": "",
                    "imageCitySearched": "",
                    "weather": [{ "icon": "new.svg", "high": "", "low": "", "desc": "???" }],
                    "flight": {
                        "depart": { "code": "", "time": "", "info": "" },
                        "arrive": { "code": "", "time": "", "info": "" }
                    },
                    "hotel": { "name": "", "address": "" }
                }
            ]
        }
    };
    return mainStorageArray[x]
}

function createCard(tripArray) {
    let unknown = "";
    let daysAway = daysAwayText(tripArray.data.cities[0].name, calcDaysAway(tripArray.data.cities[0].date));
    if (tripArray.data.cities[1].name === "next location" || tripArray.data.cities[1].name.length < 3) unknown = "unknown";
    const template = `
    <div class="archivable" onclick="return Client.archiveCard(event)">Click here to archive/unarchive this
                trip!
            </div>
    <div class="card-trip-info container">
                <div class="shade">
                    <div class="locations">
                        <input class="upcoming-location city quick-edit active" onClick="this.select()" onkeypress="return Client.enterKeyPressed(event)" value="${tripArray.data.cities[0].name}" disabled="true" title="Use EDIT below to add more locations (max total of 3)">
                        </input>
                        <input class="following-location city" onClick="this.select()" disabled="true" title="Enter 2nd location here" value="${tripArray.data.cities[1].name}">
                            <input class="following-location city ${unknown}" onClick="this.select()" disabled="true" title="Enter final location here" value="${tripArray.data.cities[2].name}">
        </div>
                            <div class="weather">
                                <input class="date quick-edit" type="date" value="${tripArray.data.cities[0].date}" disabled="true"
                                    onchange="Client.clearDaysAway()" min="${minDate}"></input>
                                <div class="trip-date-weather">
                                    <div class="icon"><img class="weather-icon"></div>
                                        <div class="hi-low">
                                            <div class="temp-high">-</div>
                                            <div class="temp-low">-</div>
                                        </div>
                                    </div>
                                    <div class="desc">-- °--</div>
                                </div>
                            </div>
                            <div class="weather-forecast container"></div>
                            <div class="upcoming-trip-days">${daysAway}</div>
</div>
                        <div class="card-trip-info-details container">
                            <div class="flights" title="Use EDIT below to enter details">
                                <div class="depart">
                                    <fieldset class="departure">
                                        <legend>departure</legend>
                                        <input class="airport-code quick-edit" maxlength="3" placeholder="XYZ" pattern="[A-Za-z]{3}"
                                            title="AIRPORT Code" disabled="true" onClick="this.select()">
                                            <input type="text" class="flight-time quick-edit" maxlength="5" pattern="([0-9]|0[0-9]|1[0-9]|2[0-3]):?[0-5][0-9]$" placeholder="HHMM" title="24hr-time" disabled="true" onClick="this.select()">
                                                <span class="flight-text"></span>
                                                <input type="text" class="flight-number quick-edit" placeholder="Flight info" maxlength="20"
                                                    disabled="true" title="Example: SQ11 Singapore Air" onClick="this.select()">
            </fieldset>
        </div>
                                            <div class="arrive">
                                                <fieldset class="arrival">
                                                    <legend>arrival</legend>
                                                    <input class="airport-code quick-edit" maxlength="3" placeholder="XYZ" pattern="[A-Za-z]{3}"
                                                        title="AIRPORT Code" disabled="true" onClick="this.select()">
                                                        <input type="text" class="flight-time quick-edit" maxlength="5" pattern="([0-9]|0[0-9]|1[0-9]|2[0-3]):?[0-5][0-9]$"
                                                            max="2359" placeholder="HHMM" title="24hr-time" disabled="true" onClick="this.select()">
                                                            <span class="flight-text"></span>
                                                            <input type="text" class="flight-number quick-edit" placeholder="Flight info" maxlength="20"
                                                                disabled="true" title="Example: SQ11 Singapore Air" onClick="this.select()">
            </fieldset>
        </div>
    </div>
                                                    <fieldset class="hotel-list" title="Use EDIT below to enter details">
                                                        <legend>lodging</legend>
                                                        <div class="hotel">
                                                            <input class="hotels-name quick-edit" placeholder="Hotel Name" disabled="true" maxlength="25" onClick="this.select()">
                                                                <input class="hotels-address quick-edit" placeholder="Hotel Address" disabled="true" maxlength="50" onClick="this.select()">
        </div>
    </fieldset>

                                                            <div class="hotel-list-notes" title="Use EDIT below to enter/modify details">
                                                                <fieldset class="list">
                                                                    <legend onclick="return Client.addSpecifics(event, 'list')">packing list</legend>
                                                                    <div class="list-container quick-edit">
                                                                        <ul class="list-items">
                                                                        </ul>
                                                                    </div>
                                                                    <div class="btn" onclick="return Client.addSpecifics(event, 'list')">packing list</div>
                                                                </fieldset>
                                                                <fieldset class="notes">
                                                                    <legend onclick="return Client.addSpecifics(event, 'notes')">notes</legend>
                                                                    <textarea class="trip-notes quick-edit" name="notes" cols="30" rows="10" wrap="hard"
                                                                        placeholder="Add any notes to this trip here (max 250 characters)" disabled="true"
                                                                        maxlength="250"></textarea>
                                                                    <div class="btn" onclick="return Client.addSpecifics(event, 'notes')">notes</div>
                                                                </fieldset>
                                                            </div>
                                                        </div>
                                                        <span class="delete-trip"></span><span class="edit-trip"></span>
   `
    const sectionCard = document.createElement('section');
    sectionCard.classList.add('card');
    if (tripArray.archived) sectionCard.classList.add('archived');
    sectionCard.setAttribute("data-id", tripArray.id);
    sectionCard.innerHTML = template;
    const newLocations = sectionCard.querySelector('.locations');
    newLocations.addEventListener('mousedown', e => checkListener(e));
    document.body.style.cursor = "waiting";
    return sectionCard;
}

// upon loading of page, the data from local storage will be used to add back active cards
function repopulatePage(mainStorageArray) {
    for (let i = 0; i < mainStorageArray.length; i++) {
        let storedCard = createCard(mainStorageArray[i]);
        tripList.insertBefore(storedCard, moreTrips);
        storedCard.focus();
        pullData(mainStorageArray[i].data.cities[0].name, storedCard);
        // updatePackingLists();
    }
    document.body.style.cursor = "auto";
    document.body.scrollTo(0, 0);

}


export { newStorageItem, createCard, repopulatePage }