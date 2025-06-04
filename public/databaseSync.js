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
function writeValueToDB(x, y, idx) {
    set(ref(db, `values/${uid}/x/${idx}`), x);
    set(ref(db, `values/${uid}/y/${idx}`), y);
}

function clearValuesInDB() {
    remove(ref(db, `values/${uid}`));
    index = 0;
}

// Wait for authentication
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is signed in with UID: " + user.uid);
        uid = user.uid;
        const video = document.getElementById('videoInput');
        function handleData() {
            // Function for writing initial values to the database
            function writeInitialValues() {
                clearValuesInDB();
                console.log("Values cleared in database on change of " + uid);
                writeValueToDB(xValue, yValue, 0);
                console.log("Values x: " + xValue + " and y: " + yValue + " written to database");
            }

            // Clear values on rectangle values change
            ['left', 'width', 'bottom', 'height', 'frequency'].forEach(id => {
                document.getElementById(id).addEventListener('change', writeInitialValues);
            });

            // Check if the measurement has started
            document.addEventListener('measurementStarted', () => {
                    // Start the interval for writing values to the database
                    plotInterval = setInterval(() => {writeValueToDB(xValue, yValue, index); index++; console.log("Values x: " + xValue + " and y: " + yValue + " written to database");}, 1000 / frequency);
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