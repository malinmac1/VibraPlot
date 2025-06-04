// Web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDN50CjQks0GbgXz6I3hPOpFcgfGjvlxSc",
    authDomain: "vibraplot.firebaseapp.com",
    databaseURL: "https://vibraplot-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "vibraplot",
    storageBucket: "vibraplot.appspot.com",
    messagingSenderId: "54044494362",
    appId: "1:54044494362:web:5286179047790c043fdfa3",
    measurementId: "G-XY2VRZ77ZV"
};

// Exporting coniguration to other scripts
export function getFirebaseConfig() {
    return firebaseConfig;
}