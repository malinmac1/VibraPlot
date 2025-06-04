import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirebaseConfig } from "./firebaseConfig.js";

// Initializing Firebase app
const firebaseConfig = getFirebaseConfig();
initializeApp(firebaseConfig);

console.log("Initializing Firebase Auth...");
const auth = getAuth();
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        const uid = user.uid;
        console.log("User is already signed in with UID:", uid);
    }
    else{
        // Proceeding with anonymous sign-in
        console.log("User is not signed in, signing in anonymously...");
        signInAnonymously(auth)
            .then(() => {
                // Signed in successfully, checking uid again
                onAuthStateChanged(auth, (user) => {
                    // User is signed in
                    const uid = user.uid;
                    console.log("User signed in with UID:", uid);
                });
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error("Error signing in anonymously:", errorCode, errorMessage);
            });
    }
});