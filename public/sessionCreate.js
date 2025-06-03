import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        const uid = user.uid;
        console.log("User is already signed in with UID:", uid);
    } else {
        // User is signed out
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
});