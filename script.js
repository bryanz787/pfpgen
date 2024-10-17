const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const uploadButton = document.getElementById("upload-button");
const fileInput = document.getElementById("file-input");
const flipButton = document.getElementById("flip-hat");
const resetButton = document.getElementById("reset");
const exportButton = document.getElementById("export");

let img = null;
let imgX = 0, imgY = 0;
let isDragging = false;
let startX = 0, startY = 0;
let scaledWidth, scaledHeight;

// Hat variables
let hatImg = new Image();
let hatX, hatY, hatWidth = 200, hatHeight;
let isHatDragging = false;
let hatStartX, hatStartY;
let flipped = false;

// Set canvas size
canvas.height = canvas.width;
ctx.fillStyle = '#074000';
ctx.fillRect(0, 0, canvas.width, canvas.height);

hatImg.src = 'src/IMG_1621.png';  // Path to hat image
hatImg.onload = () => {
    hatHeight = hatImg.height * hatWidth / hatImg.width;
    hatX = canvas.width / 2 - hatWidth / 2;
    hatY = canvas.height / 2 - hatHeight / 2;
};

/* Upload image logic */
uploadButton.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            img = new Image();
            img.onload = () => {
                scaleAndCenterImage();
                drawCanvas();
                uploadButton.classList.add('hidden');
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
        scaledWidth = canvas.width;
        scaledHeight = canvas.height / aspectRatio;
    }

    imgX = (canvas.width - scaledWidth) / 2;
    imgY = (canvas.height - scaledHeight) / 2;
}

function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#074000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (img) {
        ctx.drawImage(img, imgX, imgY, scaledWidth, scaledHeight);  

        if (hatImg) {
            ctx.drawImage(hatImg, hatX, hatY, hatWidth, hatHeight);
        }
    }
}

/* Dragging and resizing logic */
canvas.addEventListener('mousedown', (event) => {
    if (isMouseOnHat(event.offsetX, event.offsetY)) {
        isHatDragging = true;
        isDragging = false;
        hatStartX = event.offsetX - hatX;
        hatStartY = event.offsetY - hatY;
    } else if (img) {
        isDragging = true;
        isHatDragging = false;
        startX = event.offsetX - imgX;
        startY = event.offsetY - imgY;
    }
});

function isMouseOnHat(mouseX, mouseY) {
    console.log(mouseX, mouseY, hatX, hatY);
    return mouseX >= hatX && mouseX <= hatX + hatWidth &&
        mouseY >= hatY && mouseY <= hatY + hatHeight;
}

canvas.addEventListener('mousemove', (event) => {
    if (isMouseOnHat(event.offsetX, event.offsetY)) {
        canvas.style.cursor = 'move';  
    } else {
        canvas.style.cursor = 'default';  
    }

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

        drawCanvas();
    }

    if (isHatDragging) {
        let newHatX = event.offsetX - hatStartX;
        let newHatY = event.offsetY - hatStartY;

        /*
        if (newHatX > 0) {
            newHatX = 0;
        } else if (newHatX + hatWidth < canvas.width) {
            newHatX = canvas.width - hatWidth;
        }

        if (newHatY > 0) {
            newHatY = 0;
        } else if (newHatY + hatHeight < canvas.height) {
            newHatY = canvas.height - hatHeight;
        }
        */

        hatX = newHatX;
        hatY = newHatY;
        drawCanvas();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    isHatDragging = false;
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    isHatDragging = false;
});

/* Flip the hat */
flipButton.addEventListener('click', () => {
    flipped = !flipped;
    drawCanvas();
});

/* Reset canvas */
resetButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    img = null;
    uploadButton.classList.remove('hidden');
    drawCanvas();
});

/* export button */ 
exportButton.addEventListener("click", () => {
    if (img !== null) {
        const dataURL = canvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.classList.add('hidden');
        link.href = dataURL;

        link.download = 'profile-picture.png';

        link.click();
    }
})