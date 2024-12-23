const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const saveImageButton = document.getElementById('saveImage');
const exportButton = document.getElementById('export');
const log = document.getElementById('log');

// Attendance Log
const attendanceLog = [];

// Load face-api.js models
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models')
]).then(startVideo);

// Start webcam
function startVideo() {
    navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
        })
        .catch((err) => console.error('Error accessing camera:', err));
}

// Mark attendance
captureButton.addEventListener('click', async () => {
    const labeledDescriptors = await loadLabeledImages();
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
    detections.forEach(detection => {
        const match = faceMatcher.findBestMatch(detection.descriptor);
        const timestamp = new Date().toLocaleString();
        attendanceLog.push(`${match.toString()} - ${timestamp}`);
        const li = document.createElement('li');
        li.textContent = `${match.toString()} - ${timestamp}`;
        log.appendChild(li);
    });
});

// Save captured image
saveImageButton.addEventListener('click', () => {
    // Create a canvas element to capture the video frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas to a data URL (base64 image format)
    const imageData = canvas.toDataURL('image/jpeg');

    // Create a download link
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `captured_image_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Export attendance as CSV
exportButton.addEventListener('click', () => {
    const csvContent = "data:text/csv;charset=utf-8," + attendanceLog.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'attendance_log.csv');
    document.body.appendChild(link);
    link.click();
});

// Load labeled images for recognition
function loadLabeledImages() {
    const labels = ['Person1', 'Person2']; // Replace with actual labels
    return Promise.all(
        labels.map(async label => {
            const descriptions = [];
            for (let i = 1; i <= 3; i++) {
                const img = await faceapi.fetchImage(`/labeled_images/${label}/${i}.jpg`);
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                descriptions.push(detections.descriptor);
            }
            return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
    );
}
