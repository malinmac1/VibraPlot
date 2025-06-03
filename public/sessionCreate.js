import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";

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
            const uid = user.uid;
            console.log("User anonymously signed in with UID:", uid);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error signing in anonymously:", errorCode, errorMessage);
        });
}