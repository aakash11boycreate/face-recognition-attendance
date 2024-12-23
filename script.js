const video = document.getElementById('video');
const saveImageButton = document.getElementById('saveImage');
const labelInput = document.getElementById('label');
const log = document.getElementById('log');

// Start webcam
function startVideo() {
    navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
        })
        .catch((err) => console.error('Error accessing camera:', err));
}

// Save captured image with label
saveImageButton.addEventListener('click', () => {
    const label = labelInput.value.trim();
    if (!label) {
        alert('Please enter a label!');
        return;
    }

    // Capture image from video
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas to a data URL
    const imageData = canvas.toDataURL('image/jpeg');

    // Send the image and label to the server
    fetch('/save-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, image: imageData })
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                alert(`Image saved to folder: ${label}`);
            } else {
                alert('Error saving image.');
            }
        })
        .catch((error) => console.error('Error:', error));
});

// Start the webcam when the page loads
startVideo();
