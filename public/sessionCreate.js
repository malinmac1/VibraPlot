import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";

console.log("Initializing Firebase Auth...");
const auth = getAuth();
let signedIn = false;
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        const uid = user.uid;
        console.log("User is already signed in with UID:", uid);
        signedIn = true;
    }
});
if (!signedIn) {
    console.log("User is not signed in, signing in anonymously...");
    signInAnonymously(auth)
        .then(() => {
            // Signed in successfully, checking uid again
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    // User is signed in
                    const uid = user.uid;
                    console.log("User signed in with UID:", uid);
                    signedIn = true;
                }
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error signing in anonymously:", errorCode, errorMessage);
        });
}