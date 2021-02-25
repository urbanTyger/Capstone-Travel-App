// variables
const editTrip = document.querySelector('.edit-trip');
const deleteTrip = document.querySelector('.delete-trip');
const tripList = document.getElementById('trip-list');
const addTrips = document.querySelectorAll('.add-trip');
let quickEdits = document.querySelectorAll('.quick-edit');
let packingLists = document.querySelectorAll('.list-items');
const moreTrips = document.querySelector('.more-trips');
const newTripForm = document.querySelector('.new-trip-form');
const newCity = document.querySelector('.new-city');
const newTripDate = document.querySelector('.new-trip-date');
const checkTrip = document.querySelector('.check-trip');
const potentialWeather = document.querySelector('.potential-weather');
const footerArchive = document.querySelector('.footer-archive');
const currentTrips = document.querySelector('.footer-current-trips');
const archiveTitle = document.querySelector('.title-archive');
let locations = document.querySelectorAll('.locations');
let cities = document.querySelectorAll('.city');

// track if the user is currently editing a card
let editMode = false;
// track the active card 
let activeCard = {};
// track if the weather is already being requested before showing new data
let pullingWeatherAPI = false;

const minDate = calcMinDate(1);
newTripDate.setAttribute("min", minDate);

// calculate a date by numDays away from today
// used to set the earliest date selectable by calendar
function calcMinDate(numDays) {
    let min = new Date();
    min.setDate(min.getDate() + numDays);
    return formatDate(min);
}

// array for the packing list
const recommendedPacking = [
    "<li class=\"checked\">Clothing</li>",
    "<li>Toiletries</li>",
    "<li>Underwear/socks</li>",
    "<li>Rain gear</li>",
    "<li>Medicine</li>",
    "<li>Books/Kindle</li>",
    "<li>Camera/Film/SD cards</li>",
    "<li>Emergency Information</li>",
    "<li>Copies of confirmation numbers/codes</li>",
    "<li>Passports/Identification</li>"
]

// storage items and functions
let storage = [{
    "id": "Europe",
    "data": {
        "cities": [
            {
                "name": "madrid", "date": "2021-02-10", "imageURL": "https://pixabay.com/get/ga616dd33302019d1865fbaee6a4fa4db51c8ad0cd8b792b140f28d0ca2d608d44ac38889c7d4dbb332b8229aae7c36a2c84d8e98fc0418d11131c33ca40a7025_1280.jpg", "imageCitySearched": "",
                "weather": [
                    { "icon": "a01.svg", "high": "65", "low": "60", "desc": "warm" },
                ],
                "flight": {
                    "depart": { "code": "UZH", "time": "0705", "info": "UZ35 Spanish Air" },
                    "arrive": { "code": "LON", "time": "1900", "info": "ZU35 Spanish Air" }
                },
                "hotel": { "name": "The Madrid Hotel", "address": "Spain Street" }
            },
            {
                "name": "paris", "date": "2021-03-03", "imageURL": "https://pixabay.com/get/g0dad55f9bc6f3e69a5eec8bb0b3ed09808ba78765f208237b9853c3382d6b2bf19d9821065209f6d235b435e1527fae99ec6cd60a7b54920138709a1548d6385_1280.jpg", "imageCitySearched": "",
                "weather": [
                    { "icon": "a01.svg", "high": "22", "low": "0", "desc": "okay" },
                ],
                "flight": {
                    "depart": { "code": "ZZZ", "time": "1900", "info": "sooo" },
                    "arrive": { "code": "UZH", "time": "2350", "info": "addd" }
                },
                "hotel": { "name": "The Paris Hotel", "address": "Paris Street" }
            }, {
                "name": "london", "date": "2021-12-12", "imageURL": "https://pixabay.com/get/g3069f0e731c9b2dd1c41547969f844387582fdfc9e3f8b4264a0821fad7c340569cac216a3a0a926006413fc38cf046d115c2919eda9547b50b7ff48e1c44f68_1280.jpg", "imageCitySearched": "",
                "weather": [
                    { "icon": "c01.svg", "high": "35", "low": "0", "desc": "Slightly Cloudy all day", "validDate": "" },
                ],
                "flight": {
                    "depart": { "code": "UZD", "time": "1000", "info": "nada" },
                    "arrive": { "code": "ZZZ", "time": "1100", "info": "dada" }
                },
                "hotel": { "name": "The UK Hotel", "address": "London Street" }
            }
        ],
        "checklist": "",
        "notes": ""
    }
}]

// save onscreen data from array to the local storage
// takes and object and converts to string for local storage 
function setLocalStorage(databaseArray) {
    let storageData = JSON.stringify(databaseArray);
    localStorage.setItem("database", storageData)
}

// gets the local storage string and converts to an object that can be used to store data
function getLocalStorage() {
    storage = JSON.parse(localStorage.getItem("database"));
}

// initial creation of the local storage string if not existing
if (!localStorage.getItem("database")) setLocalStorage(storage);
getLocalStorage();

// used as "unique" identifier
let storageCityName = "";

// **** event listeners ****
loadAllListeners();

function loadAllListeners() {

    locations.forEach(location => location.addEventListener('mousedown', e => checkListener(e)));

    footerArchive.addEventListener('click', () => {
        const cards = document.querySelectorAll('.card');
        const archived = document.querySelectorAll('.archived');

        archiveTitle.style.display = "inline-block";
        moreTrips.style.visibility = "hidden";
        cards.forEach(card => card.style.display = "none")
        archived.forEach(archive => archive.style.display = "block")

    })

    currentTrips.addEventListener('click', () => {
        const cards = document.querySelectorAll('.card');
        const archived = document.querySelectorAll('.archived');

        archiveTitle.style.display = "none";
        moreTrips.style.visibility = "visible";
        cards.forEach(card => card.style.display = "block")
        archived.forEach(archive => archive.style.display = "none")
    })

    newTripForm.addEventListener('submit', (e) => {
        e.preventDefault();
        Client.createCard(newCity.value.trim(), newTripDate.value);
        newTripForm.reset();
        potentialWeather.innerHTML = "";
    })

    checkTrip.addEventListener('click', () => {
        if (!newTripDate.value) newTripDate.value = Client.getDate();
        if (newCity.value.length < 3) { alert("Please enter a city of 3 or more characters"); return; }
        let datesToAPI = checkDateRange(newTripDate.value);
        datesToAPI.city = newCity.value;
        fetch('http://localhost:5000/historicweather', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            body: JSON.stringify(datesToAPI)
        })
            .then(res => res.json())
            .then(message => {
                if (message.error) {
                    throw message;
                } else {
                    showHistoric(message);
                }
            })
            .catch(err => {
                alert(`There was a problem:
        Message: ${err.error}.
        - Please check the city entered -
            `)
                return;
            });
    })

    tripList.addEventListener('click', (e) => {
        activeCard = getInfo(e);
        if (e.target.classList.contains("delete-trip")) {
            if (confirmResponse(activeCard.getAttribute('data-id').split('-')[0])) {
                activeCard.classList.add('fly-away')
                setTimeout(() => activeCard.style.display = "none", 400);
                deleteData(activeCard);
            }
        } else if (e.target.classList.contains("edit-trip")) {
            editModeStatus(activeCard, e);
        }
    })
}

// function calls to populate packing lists
updatePackingLists();

// functions

// after card is created, load all data before showing to user
function loadCardData(city, newCard) {
    // get lat&lon from geonames
    fetch('http://localhost:5000/geolocation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(city)
    })
        .then(res => res.json())
        .then(coordinates => {
            let location = {};
            location.lng = parseFloat(coordinates.geonames[0].lng);
            location.lat = parseFloat(coordinates.geonames[0].lat);
            fetch('http://localhost:5000/weatherforecast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
                body: JSON.stringify(location)
            })
                .then(data => data.json())
                .then(forecast => {
                    if (calcDaysAway(city.date) < 8) fillForecast(city, forecast);
                    fetch('http://localhost:5000/backgroundurl', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        mode: 'cors',
                        body: JSON.stringify(city)
                    })
                        .then(res => res.json())
                        .then(message => {
                            city.imageURL = message.hits[Math.floor(Math.random() * message.hits.length)].largeImageURL;
                            city.imageCitySearched = city.name.toLowerCase();
                        }).then(() => {
                            tripList.insertBefore(newCard, moreTrips);
                            newCard.scrollIntoView();
                            newCard.focus();
                            pullData(city.name, newCard);
                            updatePackingLists();
                            setLocalStorage(storage);
                            document.body.style.cursor = "auto";
                        }).catch(err => alert(`There was an error finding the background image. Please try another city name instead of "${city.name.toUpperCase()}"`, err))

                });

        }).catch(err => alert("There was an error finding the city. Please try again.", err))
}

// fill in a future forecast for the current city requested
// if within a week of trip starting date
function fillForecast(cityArray, forecast) {
    let offset = 0;
    for (let x = 0; x < forecast.data.length; x++) {
        if (forecast.data[x].valid_date === cityArray.date) {
            offset = x;
            break;
        }
    }
    for (let i = 0; i < 5; i++) {
        cityArray.weather[i] = {
            "high": forecast.data[i + offset].max_temp.toFixed(0) + "°C",
            "low": forecast.data[i + offset].min_temp.toFixed(0) + "°C",
            "icon": `${forecast.data[i + offset].weather.icon.slice(0, 3)}.svg`,
            "desc": forecast.data[i + offset].weather.description,
            "validDate": forecast.data[i + offset].valid_date,
            "city_name": forecast.city_name,
            "country_code": forecast.country_code
        }
    }
}

// create a unique ID for each trip
function newID(city) {
    const letters = "0123456789ABCDEF";
    let id = city.split(',')[0] + "-";
    // of 8 letter or digits
    for (let i = 0; i < 8; i++)
        id += letters[(Math.floor(Math.random() * 16))];

    return id;
}

// add a new trip from clicking top button
function enterDestination() {
    moreTrips.scrollIntoView({ block: "end" });
    document.querySelector('.new-city').focus();
}

// archive the current card
function archiveCard(e) {
    e.target.closest('.card').classList.toggle('archived');
}

// set the current clicked city as active
function checkListener(e) {
    let cardCities = e.target.closest('.card');
    cardCities = cardCities.getElementsByClassName('city');
    if (e.target.classList.contains('active') || e.target.nodeName != 'INPUT') return;
    else if (editMode) {
        alert("Only the active city can be modified. Please exit edit mode, choose the city to edit, and then use edit mode to make changes.");
        // let myEvent = document.createEvent("mouseEvent");
        // myEvent.initEvent('mousedown', true, true)
        // editModeStatus(activeCard, e);
        // saveData(activeCard);
        // let resetEditButton = activeCard.querySelector('.edit-done')
        // resetEditButton.classList.remove('edit-done');
        // e.target.dispatchEvent(myEvent);
        // // editModeStatus(activeCard, e);
        // return;
    } else {
        for (let i = 0; i < cardCities.length; i++) {
            cardCities[i].classList.remove('active');
            cardCities[i].classList.remove('quick-edit');
        }
        e.target.classList.add('quick-edit');
        e.target.classList.toggle('active');
        let cityName = getFieldCityName(e).toLowerCase();
        storageCityName = cityName;
        pullData(cityName, getInfo(e));
    }

}

function getFieldCityName(e) {
    let cityName = '';
    if (e.target.nodeName === 'INPUT') {
        cityName = e.target.value;
    }
    return cityName;
}

// find which object location the city is stored for this card
function pullData(cityName, card) {
    let cardLocation = cardStorageLocation(card);
    let cityLocation = cityStorageLocation(storage[cardLocation].data.cities, cityName)
    showActiveCityInfo(storage[cardLocation].data.cities[cityLocation], card)
}

// find the array for the specific city
function cityStorageLocation(data, city) {
    return data.findIndex((item) => item.name == city);
}

// show the current information for the active city
function showActiveCityInfo(data, card) {
    let highTemp = card.getElementsByClassName('temp-high')[0];
    let lowTemp = card.getElementsByClassName('temp-low')[0];
    let weatherIcon = card.getElementsByClassName('weather-icon')[0];
    let date = card.getElementsByClassName('date')[0];
    let desc = card.getElementsByClassName('desc')[0];
    let airportCodes = card.getElementsByClassName('airport-code');
    let flightTimes = card.getElementsByClassName('flight-time');
    let flightInfo = card.getElementsByClassName('flight-number');
    let hotelName = card.getElementsByClassName('hotels-name')[0];
    let hotelAddress = card.getElementsByClassName('hotels-address')[0];
    let upcomingInfo = card.getElementsByClassName('upcoming-trip-days')[0];
    let cardTripInfo = card.getElementsByClassName('card-trip-info')[0];
    let weatherForecast = card.getElementsByClassName('weather-forecast')[0];
    let forecastCard = card.getElementsByClassName('forecast-card');
    let tripNotes = card.getElementsByClassName('trip-notes')[0];
    let listItems = card.getElementsByClassName('list-items')[0];

    weatherForecast.style.opacity = "0";
    weatherForecast.style.pointerEvents = "none";
    //clear weather
    highTemp.innerHTML = `---`;
    lowTemp.innerHTML = `---`;
    weatherIcon.setAttribute("src", `icons/weather/${data.weather[0].icon}`)
    desc.innerHTML = "---";
    //fill information
    date.value = data.date;
    upcomingInfo.innerHTML = daysAwayText(data.name, calcDaysAway(data.date));
    airportCodes[0].value = data.flight.depart.code;
    airportCodes[1].value = data.flight.arrive.code;
    flightTimes[0].value = data.flight.depart.time;
    flightTimes[1].value = data.flight.arrive.time;
    flightInfo[0].value = data.flight.depart.info;
    flightInfo[1].value = data.flight.arrive.info;
    hotelName.value = data.hotel.name;
    hotelAddress.value = data.hotel.address;
    if (storage[cardStorageLocation(card)].data.notes) tripNotes.value = storage[cardStorageLocation(card)].data.notes;
    if (storage[cardStorageLocation(card)].data.checklist) listItems.innerHTML = storage[cardStorageLocation(card)].data.checklist;
    if (data.imageURL) {
        cardTripInfo.style.backgroundImage = `url(${data.imageURL})`;
    } else {
        cardTripInfo.style.backgroundImage = "";
    }
    if (data.date) {
        if (data.date === data.weather[0].validDate || calcDaysAway(data.date) < 0) {
            highTemp.innerHTML = `${data.weather[0].high}` || 0;
            lowTemp.innerHTML = `${data.weather[0].low}` || 0;
            weatherIcon.setAttribute("src", `icons/weather/${data.weather[0].icon}`)
            desc.innerHTML = data.weather[0].desc;

            if (calcDaysAway(data.date) >= 0 && calcDaysAway(data.date) < 8) {
                let placeHolderElement = "";
                weatherForecast.innerHTML = "";
                for (let i = 1; i < 4; i++) {
                    placeHolderElement += `
                            <div class="forecast-card">
                            <div class="date">${data.weather[i].validDate.slice(5,)}</div>
                            <img class="icon" src="icons/weather/${data.weather[i].icon}" title="${data.weather[i].city_name}-${data.weather[i].country_code}: ${data.weather[i].desc}"></img>
                            <div class="high">${data.weather[i].high}</div>
                            <div class="low">${data.weather[i].low}</div>
                            </div>`;
                }
                weatherForecast.innerHTML = placeHolderElement;
                weatherForecast.style.opacity = "1";
                weatherForecast.style.pointerEvents = "auto";
                for (let i = 0; i < 3; i++)  forecastCard[i].style.opacity = "1";
            }
        } else {
            getValidWeather(data, card);
        }
    }
}

// based on the destination date, the historic or forecast weather is pulled from the API
function getValidWeather(data, card) {
    if (!pullingWeatherAPI) {
        document.body.style.cursor = "waiting";
        pullingWeatherAPI = true;
        if (calcDaysAway(data.date) < 8 && calcDaysAway(data.date) >= 0) {
            fetch('http://localhost:5000/geolocation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(coordinates => {
                    let location = {};

                    location.lng = coordinates.geonames[0].lng;
                    location.lat = coordinates.geonames[0].lat;
                    fetch('http://localhost:5000/weatherforecast', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        mode: 'cors',
                        body: JSON.stringify(location)
                    })
                        .then(data => data.json())
                        .then(forecast => {
                            fillForecast(data, forecast);
                            verifyDataPull(data.name, card);
                            pullingWeatherAPI = false;
                            document.body.style.cursor = "auto";
                            return;
                        })
                        .catch(err => alert("There was a problem...", err))
                }).catch(err => alert("Please check city name as it could not be found..."))
        } else { // fetch historical data
            let datesToAPI = checkDateRange(data.date);
            datesToAPI.city = `${data.name.replace(/\s/g, "")}`;
            fetch('http://localhost:5000/historicweather', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
                body: JSON.stringify(datesToAPI)
            })
                .then(res => res.json())
                .then(forecast => {
                    if (forecast.error) {
                        throw forecast;
                    } else {
                        data.weather[0].validDate = data.date;
                        data.weather[0].high = "--";
                        data.weather[0].low = "--";
                        data.weather[0].icon = `${forecast.data[0].weather.icon.slice(0, 3)}.svg`;
                        data.weather[0].desc = "Typically " + forecast.data[0].weather.description + " / " + forecast.data[0].temp.toFixed(0) + "°C";
                    }
                })
                .then(() => {
                    verifyDataPull(data.name, card);
                    pullingWeatherAPI = false;
                    document.body.style.cursor = "auto";
                })
                .catch(err => {
                    alert(`There was a problem:
                            Message: ${err.error}.
                            - Please check the city entered as sometimes the country is needed as ISO (i.e: UK = GB)-
                            `)
                    return;
                });
        }
    }


}

// check to see if user is still on the city getting new data, before showing to user
function verifyDataPull(cityName, card) {
    if (cityName === card.getElementsByClassName('active')[0].value.toLowerCase()) pullData(cityName, card)
}

// historic weather
function showHistoric(data) {
    potentialWeather.innerHTML = `Typical Weather for ${data.city_name}, ${data.country_code}
        <br> <br>
            The average temperature is ${data.data[0].temp.toFixed(0)}°C and ${data.data[0].weather.description}`
}

// get range of dates for API request
function checkDateRange(date) {
    let dates = { "start": "", "end": "" }
    let result = new Date(date);
    result.setDate(result.getDate() - 365);
    dates.start = formatDate(result);
    result.setDate(result.getDate() + 1);
    dates.end = formatDate(result);
    return (dates);
}

// format the date into the required by APIs
function formatDate(date) {
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    return `${date.getFullYear()}-${month}-${day}`;
}

// pull a background image and choose randomly one to set as location background
function getBackgroundURL(city) {
    document.body.style.cursor = "waiting";
    const cityImage = city.imageCitySearched.toLowerCase();
    if (cityImage && cityImage === city.name.toLowerCase() || city.name === "next location" || city.name === "final location") return;
    fetch('http://localhost:5000/backgroundurl', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(city)
    })
        .then(res => res.json())
        .then(message => {
            if (message.error) {
                throw message;
            } else {
                city.imageURL = message.hits[Math.floor(Math.random() * message.hits.length)].largeImageURL;
                city.imageCitySearched = city.name;
                verifyDataPull(city.name, activeCard);
            }
        })
        .catch(err => {
            alert(`Cannot pull background image. 
        Message: ${err.error}.
        Could not find "${city.name.toUpperCase()}".
        
        - Please check the city entered -
        
       `)
            return;
        });
    document.body.style.cursor = "auto";
}

function updatePackingLists() {
    packingLists = [];
    quickEdits = [];
    cities = [];
    quickEdits = document.querySelectorAll('.quick-edit');
    cities = document.querySelectorAll('.city');
    packingLists = document.querySelectorAll('.list-items');
    packingLists.forEach(packingList => {
        if (packingList.innerHTML.trim() === "") {
            packingList.innerHTML = recommendedPacking.join('');
        }
        packingList.addEventListener('click', e => {
            editPackingList(e);
        });
    })
}

// remove card from screen and delete from object and local storage
function deleteData(card) {
    if (storage) {
        storage.splice(cardStorageLocation(card), 1);
    }
    setLocalStorage(storage);
}

// get the correct card of the target clicked
function getInfo(e) {
    const thisCard = e.target.closest('.card');
    if (!thisCard) return;
    const activeLocation = thisCard.getAttribute('data-id');
    return thisCard;
}

// allow fields on the active card to be edited
function editModeStatus(activeCard, e) {
    if (!editMode) {
        editMode = true;
        quickEdits = document.querySelectorAll('.quick-edit');
        storageCityName = activeCard.getElementsByClassName('active')[0].value;
        activeCard.classList.add('active-edit');
        e.target.classList.add('edit-done');
        quickEdits.forEach((quickEdit) => {
            quickEdit.contentEditable = true
            quickEdit.setAttribute("onkeypress", "return Client.enterKeyPressed(event)");
            if (quickEdit.classList.contains("date") || quickEdit.nodeName === 'INPUT' || quickEdit.classList.contains("trip-notes")) {
                quickEdit.removeAttribute("disabled", "true");
            }
        });
    } else {
        document.body.style.cursor = "progress";
        let cityNames = activeCard.getElementsByClassName('city');
        let cities = [];
        for (let i = 0; i < 3; i++) { cities[i] = cityNames[i].value; }
        cities.forEach(city => {
            if (city.length < 3) {
                alert(`Please enter a name longer than 3 characters\n\nName Entered: "${city}"\n\nThen a third city will be possible`);
            }
        });
        editMode = false;
        activeCard.classList.remove('active-edit');
        if (e.type === "keypress") {
            let resetEditButton = activeCard.querySelector('.edit-done')
            resetEditButton.classList.remove('edit-done');
        } else {
            e.target.classList.remove('edit-done');
        }
        quickEdits.forEach((quickEdit) => {
            quickEdit.contentEditable = false;
            quickEdit.removeAttribute("onkeypress", "return Client.enterKeyPressed(event)");
            if (quickEdit.classList.contains("date") || quickEdit.nodeName === 'INPUT' || quickEdit.classList.contains("trip-notes")) {
                quickEdit.setAttribute("disabled", "true");
            }
        });
        saveData(activeCard);
    }
    document.body.style.cursor = "auto";

}

// store the data in the current object variable and local storage
function saveData(card) {
    let activeCityName = card.getElementsByClassName('active')[0];
    activeCityName = activeCityName.value;
    let cardLocation = cardStorageLocation(card);
    let cityLocation = cityStorageLocation(storage[cardLocation].data.cities, storageCityName.toLowerCase());
    let date = card.getElementsByClassName('date')[0];
    let airportCodes = card.getElementsByClassName('airport-code');
    let flightTimes = card.getElementsByClassName('flight-time');
    let flightInfo = card.getElementsByClassName('flight-number');
    let hotelName = card.getElementsByClassName('hotels-name')[0];
    let hotelAddress = card.getElementsByClassName('hotels-address')[0];
    let listItems = card.getElementsByClassName('list-items')[0];
    let tripNotes = card.getElementsByClassName('trip-notes')[0];
    let upcomingInfo = card.getElementsByClassName('upcoming-trip-days')[0];
    // shared information will all cities per card
    storage[cardLocation].data.checklist = listItems.innerHTML;

    storage[cardLocation].data.notes = tripNotes.value ?? "";

    if (storageCityName != activeCityName || date.value != storage[cardLocation].data.cities[cityLocation].weather[0].validDate) {
        if (storage[cardLocation].data.cities[cityLocation].weather[0].validDate) storage[cardLocation].data.cities[cityLocation].weather[0].validDate = "";
    }
    storageCityName = activeCityName;
    storage[cardLocation].data.cities[cityLocation].name = activeCityName.toLowerCase();
    storage[cardLocation].data.cities[cityLocation].date = date.value;
    storage[cardLocation].data.cities[cityLocation].flight = {
        "depart": { "code": airportCodes[0].value, "time": flightTimes[0].value, "info": flightInfo[0].value },
        "arrive": { "code": airportCodes[1].value, "time": flightTimes[1].value, "info": flightInfo[1].value }
    };
    storage[cardLocation].data.cities[cityLocation].hotel = { "name": hotelName.value, "address": hotelAddress.value };
    getBackgroundURL(storage[cardLocation].data.cities[cityLocation]);
    let nextCityName = card.getElementsByClassName('city')[1].value.toLowerCase();
    let finalCityName = card.getElementsByClassName('city')[2];
    if (nextCityName.slice(0, 4) != "next" && nextCityName.length >= 3) {
        finalCityName.classList.remove('unknown');
    }
    upcomingInfo.innerHTML = daysAwayText(activeCityName, calcDaysAway(date.value));
    sortCards(storage[cardLocation].data.cities, storage[cardLocation].data.cities[cityLocation], card)
    setLocalStorage(storage);
}

// TODO add sorting to each trip-card itself based on first date
// sort the cities on each card by date and "refresh" the view of the card
function sortCards(cities, specificCityArray, card) {
    let city = card.getElementsByClassName('city');
    let activeCity = card.getElementsByClassName('active')[0];
    let activeCityName = activeCity.value;

    cities.sort(function (a, b) {
        if (!a.date || !b.date) return 0;
        if (a.name === "next location" || a.name.length < 3) return 0;
        if (a.name === "final location" || a.name.length < 3) return 0;
        if (a.date < b.date) {
            return -1;
        }
        if (a.date > b.date) {
            return 1;
        }
        // names must be equal
        return 0;
        // return a.date - b.date
    })

    let myEvent = document.createEvent("mouseEvent");
    myEvent.initEvent('mousedown', true, true)

    for (let i = 0; i < 3; i++) {
        city[i].value = cities[i].name;
    }
    checkToArchive(cities, card);
    for (let i = 0; i < 3; i++) {
        if (cities[i].name.toLowerCase() === activeCityName.toLowerCase()) city[i].dispatchEvent(myEvent);
    }
    showActiveCityInfo(specificCityArray, card);
    //verifyDataPull(specificCityArray.name, card)
}

// TODO set unique id's for cities instead of using names
function setCityID(activeCard) {
    // activeCard.getAttribute('data-id')
    let cardLocation = cardStorageLocation(activeCard);

    let fields = activeCard.getElementsByClassName('city');
    let cities = [fields[0].innerText, fields[1].value, fields[2].value];
    cities.forEach((city, index) => {
        let cityLocation = cityStorageLocation(storage[cardLocation].data.cities, city)
        fields[index].setAttribute("data-id", storage[cardLocation].data.cities[cityLocation].ID)
    })

}

// verify if the 1st city is more than a week after trip has started to archive
function checkToArchive(citiesArray, card) {
    if (calcDaysAway(citiesArray[0].date) < -7) card.getElementsByClassName('archivable')[0].style.display = "block";
    else card.getElementsByClassName('archivable')[0].style.display = "none";
}

// get the array index of the current card information
function cardStorageLocation(card) {
    return storage.findIndex((item) => item.id == card.getAttribute('data-id'));
}

// for delete function confirmation before removing from memory
function confirmResponse(card) {
    return confirm(`Do you really want to delete the trip to ${card}?

    This cannot be undone!`);
}

function enterKeyPressed(event) {
    if (event.key === "Enter") {
        if (event.target.classList.contains('trip-notes')) return;
        event.preventDefault();
        editModeStatus(activeCard, event);
        document.activeElement.blur();
    }
}

// clear the text for the days to trip
function clearDaysAway() {
    activeCard.getElementsByClassName('upcoming-trip-days')[0].innerHTML = "";

}

// calculate the days to the trip from today
function calcDaysAway(date) {
    let today = Date.parse(Client.getDate());
    const tripDate = Date.parse(date);
    const daysAway = Math.ceil(((tripDate - today) / 86400000).toFixed(1));
    return daysAway;
}

// custom text depending on number of days to each trip
function daysAwayText(city, daysAway) {
    let ending = "??";
    city = city.split(',')[0];
    if (daysAway < 0) {
        return "";
    } else if (daysAway > 31) {
        ending = 'more than a MONTH away.'
    } else if (daysAway === 1) {
        ending = `${daysAway} day away. Are your bags packed?`;
    } else if (daysAway === 0) {
        ending = 'today! Enjoy your trip!';
    } else if (daysAway === 7) {
        ending = 'a week away.';
    } else if (daysAway < 7) {
        ending = `${daysAway} days away.`
    } else {
        ending = `${daysAway} days away.`
    }
    if (!isNaN(daysAway)) return `Your trip to ${city.slice(0, 1).toUpperCase() + city.slice(1,)} is ${ending}`;
    else return "";
}

// activate and disable notes/list items on edit
function addSpecifics(event, item) {
    event.target.closest(`.${item}`).classList.toggle(`active-${item}`);
}

// to check/uncheck the packing list
function editPackingList(event) {
    let itemClicked = event.target;
    let packingCard = event.target.closest('.card');
    let active = itemClicked.closest('.list-container');
    if (active.getAttribute('contentEditable') == "true") {
        return;
    } else {
        if (itemClicked.nodeName === 'LI') {
            itemClicked.classList.toggle('checked');
        }
    }
    saveData(packingCard);
}

export {
    daysAwayText, minDate, newID, storage, loadCardData,
    enterKeyPressed, clearDaysAway, calcDaysAway, editModeStatus,
    addSpecifics, editPackingList, enterDestination,
    archiveCard, checkListener
}