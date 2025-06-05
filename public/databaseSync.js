console.log("Database synchronization script loaded.");

import { getDatabase, ref, set, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirebaseConfig } from "./firebaseConfig.js";

// Initializing database
const app = initializeApp(getFirebaseConfig());
const auth = getAuth();
const db = getDatabase(app);
let uid = null;
let index = 0;

// Database functions
function writeValueToDB(x, y, time, idx) {
    Promise.all([
        set(ref(db, 'values/' + uid + '/x/' + idx), x),
        set(ref(db, 'values/' + uid + '/y/' + idx), y),
        set(ref(db, 'values/' + uid + '/time/' + idx), time)
    ]).catch(err => {
        console.error(`Error writing values:`, err);
    });
}

function clearValuesInDB() {
    remove(ref(db, 'values/' + uid));
    index = 0;
}

// Wait for authentication
onAuthStateChanged(auth, (user) => {
    if (user) {
        uid = user.uid;
        console.log("User signed in with UID:", uid);
        const video = document.getElementById('videoInput');
        function handleData() {
            // Function for writing initial values to the database
            function writeInitialValues() {
                clearValuesInDB();
                console.log("Clearing values in the database.");
                writeValueToDB(xValue, yValue, time, 0);
                console.log("Written initial values to the database: x: " + xValue + " y: " + yValue + " time: " + time);
            }

            // Clear values on rectangle values and frequency change
            document.addEventListener('rectangleChanged', writeInitialValues);
            document.getElementById(frequency).addEventListener('change', writeInitialValues);

            // Check if the measurement has started
            document.addEventListener('measurementStarted', () => {
                    // Start the interval for writing values to the database
                    plotInterval = setInterval(() => {writeValueToDB(xValue, yValue, time, index); index++; console.log("Written values to the database: x: " + xValue + " y: " + yValue + " time: " + time);}, 1000 / frequency);
            });
            document.addEventListener('measurementStopped', () => {
                // Stop the interval
                clearInterval(plotInterval);
            });

        }
        if (video.readyState >=2) {
            handleData();
        }
    }
});