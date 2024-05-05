//Selector for your <video> element
const video = document.querySelector('#videoInput');

//Core
window.navigator.mediaDevices.getUserMedia({video: true})
    .then(stream => {
        video.srcObject = stream;
        video.onloadedmetadata = (e) => {
            video.width = visualViewport.width / 5;
            video.height = video.width * (video.videoHeight / video.videoWidth);
            video.play();
        };
    })
    .catch(() => {
        alert('You have to allow camera access to use this feature.');
    });