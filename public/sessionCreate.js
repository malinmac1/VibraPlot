import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirebaseConfig } from "./firebaseConfig.js";

//Creating buttons
let reset = document.createElement('button');
reset.innerText = "Reset session";

let next = document.createElement('button');
next.innerText = "Next";

// Initializing Firebase app
const firebaseConfig = getFirebaseConfig();
initializeApp(firebaseConfig);

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        const uid = user.uid;

        // Spawning buttons
        const main = document.getElementById('main');
        main.appendChild(reset);
        main.appendChild(next);

        // Proceeding with button actions
        reset.addEventListener('click', () => {
            // Resetting session
            fetch('https://us-central1-vibraplot.cloudfunctions.net/delete?uid=' + uid)
            fetch('https://us-central1-vibraplot.cloudfunctions.net/schedule?uid=' + uid)
        })

        // Proceeding to the next step
        next.addEventListener('click', () => {
            window.location.href = 'measurement.html';
        })
    }
    else{
        // Proceeding with anonymous sign-in
        function signIn() {
            signInAnonymously(auth)
                .then(() => {
                    // Signed in successfully, checking uid again
                    const uid = auth.currentUser.uid;

                    // Sending uid to Cloud Functions for management
                    fetch('https://us-central1-vibraplot.cloudfunctions.net/schedule?uid=' + uid)
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    alert("Error signing in anonymously: " + errorCode + errorMessage + " Please try again later.");
                });
        }
        signIn();
    }
});