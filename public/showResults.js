import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirebaseConfig } from "./firebaseConfig.js"

// Initializing database
const app = initializeApp(getFirebaseConfig());
const auth = getAuth();
const db = getDatabase(app);
let uid = null;

// Wait for authentication
onAuthStateChanged(auth, (user) => {
    if (user) {
        uid = user.uid;
        console.log("User authenticated with UID:", uid);
        const dbRef = ref(db);
        get(child(dbRef, `values/${uid}/x`)).then((snapshotX) => {
            if (snapshotX.exists()) {
                get(child(dbRef, `values/${uid}/y`)).then((snapshotY) => {
                    get(child(dbRef, `values/${uid}/time`)).then((snapshotTime) => {
                        // Setting up the HTML elements
                        const noDataMessage = document.getElementById('noDataMessage');
                        const main = document.getElementById('main');
                        let downloadBtn = document.createElement('button');
                        downloadBtn.innerText = 'Download CSV';
                        let plotDisplacement = document.createElement('div');
                        plotDisplacement.id = 'plotDisplacement';
                        let plotAcceleration = document.createElement('div');
                        plotAcceleration.id = 'plotAcceleration';

                        // Removing the no data message
                        main.removeChild(noDataMessage);

                        // Reading the data from the database
                        let x = snapshotX.val()
                        let y = snapshotY.val()
                        let time = snapshotTime.val()

                        // Preparing the csv file
                        let csvContent = 'x,y,time\n';
                        for (let i = 0; i < x.length; i++) {
                            csvContent += `${x[i]},${y[i]},${time[i]}\n`;
                        }

                        // Spawning the download button
                        main.appendChild(downloadBtn);

                        // Downloading on button click
                        downloadBtn.onclick = function() {
                            var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            var link = document.createElement("a");
                            var url = URL.createObjectURL(blob);
                            link.setAttribute("href", url);
                            link.setAttribute("download", "VibraPlotMeasurement.csv");
                            link.style.visibility = 'hidden';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link)
                        }

                        // Defining arrays for storing the data
                        let xDisplacement = [];
                        xDisplacement[0] = 0;
                        let yDisplacement = [];
                        yDisplacement[0] = 0;
                        let xAcceleration = [];
                        xAcceleration[0] = 0;
                        let yAcceleration = [];
                        yAcceleration[0] = 0;

                        // Preparing the data for plotting
                        for (let i = 1; i < x.length; i++) {
                            // Calculating the displacements
                            xDisplacement[i] = x[i] - x[0];
                            yDisplacement[i] = y[i] - y[0];

                            // Calculating the accelerations
                            xAcceleration[i] = (xDisplacement[i] - xDisplacement[i - 1]) / (time[i] - time[i - 1]);
                            yAcceleration[i] = (yDisplacement[i] - yDisplacement[i - 1]) / (time[i] - time[i - 1]);
                        }

                        // Preparing the plots
                        var traceDisplacementX = {
                            x: snapshotTime.val(),
                            y: xDisplacement,
                            mode: 'lines',
                            name: 'X Displacement',
                        };

                        var traceDisplacementY = {
                            x: snapshotTime.val(),
                            y: yDisplacement,
                            mode: 'lines',
                            name: 'Y Displacement',
                        };

                        var traceAccelerationX = {
                            x: snapshotTime.val(),
                            y: xAcceleration,
                            mode: 'lines',
                            name: 'X Acceleration',
                        };

                        var traceAccelerationY = {
                            x: snapshotTime.val(),
                            y: yAcceleration,
                            mode: 'lines',
                            name: 'Y Acceleration',
                        };

                        var layoutDisplacement = {
                            title: 'Displacement',
                            xaxis: {
                                title: 'Time (ms)',
                            },
                            yaxis: {
                                title: 'Displacement (px)',
                            },
                        }

                        var layoutAcceleration = {
                            title: 'Acceleration',
                            xaxis: {
                                title: 'Time (ms)',
                            },
                            yaxis: {
                                title: 'Acceleration (px/s²)',
                            },
                        }

                        var dataDisplacement = [traceDisplacementX, traceDisplacementY];
                        var dataAcceleration = [traceAccelerationX, traceAccelerationY];

                        // Creating the plots
                        main.appendChild(plotDisplacement);
                        main.appendChild(plotAcceleration);

                        Plotly.newPlot('plotDisplacement', dataDisplacement, layoutDisplacement);
                        Plotly.newPlot('plotAcceleration', dataAcceleration, layoutAcceleration);
                    });
                });
            }
        }).catch((error) => {
            console.error(error);
        });
    }
});