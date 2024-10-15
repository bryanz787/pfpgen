const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const uploadButton = document.getElementById("upload-button");
const fileInput = document.getElementById("file-input");
const buttonContainer = document.getElementById("button-container");

let img = null;
let imgX = 0, imgY = 0;
let isDragging = false;
let startX = 0, startY = 0;
let scaledWidth, scaledHeight;

canvas.height = canvas.width;
buttonContainer.width = canvas.height;


// Set initial canvas background color
ctx.fillStyle = '#074000';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Upload button triggers file input
uploadButton.addEventListener("click", () => {
    fileInput.click();
});

// Handle file input for image upload
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            img = new Image();
            img.onload = () => {
                scaleAndCenterImage();
                drawImage();
                uploadButton.classList.toggle('hidden'); 
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

function scaleAndCenterImage() {
    const aspectRatio = img.width / img.height;

    if (aspectRatio > 1) { 
        scaledWidth = canvas.width * aspectRatio;
        scaledHeight = canvas.height;
    } else {
        scaledHeight = canvas.height * aspectRatio;
        scaledWidth = canvas.width;
    }

    imgX = (canvas.width - scaledWidth) / 2;
    imgY = (canvas.height - scaledHeight) / 2;
}

function drawImage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#074000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (img) {
        ctx.drawImage(img, imgX, imgY, scaledWidth, scaledHeight);
    } else {
        ctx.fillStyle = '#074000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        uploadButton.classList.toggle('hidden');
    }
}

canvas.addEventListener('mousedown', (event) => {
    if (img) {
        isDragging = true;
        startX = event.offsetX - imgX;
        startY = event.offsetY - imgY;
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (isDragging) {
        let newImgX = event.offsetX - startX;
        let newImgY = event.offsetY - startY;

        if (newImgX > 0) {
            newImgX = 0;
        } else if (newImgX + scaledWidth < canvas.width) {
            newImgX = canvas.width - scaledWidth;
        }

        if (newImgY > 0) {
            newImgY = 0;
        } else if (newImgY + scaledHeight < canvas.height) {
            newImgY = canvas.height - scaledHeight;
        }

        imgX = newImgX;
        imgY = newImgY;

        drawImage();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
});
