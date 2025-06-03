import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        const uid = user.uid;
    } else {
        // User is signed out
        signInAnonymously(auth)
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
            });
    }
});