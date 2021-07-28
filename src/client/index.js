// import functions
import {
    archiveCard, enterKeyPressed, clearDaysAway, calcDaysAway,
    editModeStatus, addSpecifics, editPackingList,
    enterDestination, minDate, tripList, moreTrips, pullData
} from './js/app';
import { newStorageItem, createCard, repopulatePage } from './js/createCard';
import { getDate } from './js/date';

// import styles
import "./styles/main.scss";

// Service Worker
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker.register('/service-worker.js').then(registration => {
//             console.log('SW registered: ', registration);
//         }).catch(registrationError => {
//             console.log('SW registration failed: ', registrationError);
//         });
//     });
// }

export {
    minDate, getDate, newStorageItem, tripList, moreTrips,
    archiveCard, enterKeyPressed, clearDaysAway, calcDaysAway,
    editModeStatus, addSpecifics, editPackingList, createCard,
    enterDestination, pullData, repopulatePage
}