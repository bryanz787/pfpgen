const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const uploadButton = document.getElementById("upload-button");
const fileInput = document.getElementById("file-input");
const flipButton = document.getElementById("flip-hat");
const resetButton = document.getElementById("reset");
const exportButton = document.getElementById("export");

let img = null;
let imgX = 0,
    imgY = 0;
let isDragging = false;
let startX = 0,
    startY = 0;
let scaledWidth, scaledHeight;

// Hat variables
let hatImg = new Image();
let hatX,
    hatY,
    hatWidth = 200,
    hatHeight;
let isHatDragging = false;
let hatStartX, hatStartY;
let flipped = false;

// Set canvas size
canvas.height = canvas.width;
ctx.fillStyle = "#074000";
ctx.fillRect(0, 0, canvas.width, canvas.height);

hatImg.src = "src/IMG_1621.png"; // Path to hat image
hatImg.onload = () => {
    hatHeight = (hatImg.height * hatWidth) / hatImg.width;
    hatX = canvas.width / 2 - hatWidth / 2;
    hatY = canvas.height / 2 - hatHeight / 2;
};

/* Upload image logic */
uploadButton.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            img = new Image();
            img.onload = () => {
                scaleAndCenterImage();
                drawCanvas();
                uploadButton.classList.add("hidden");
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
    ctx.fillStyle = "#074000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (img) {
        ctx.drawImage(img, imgX, imgY, scaledWidth, scaledHeight);

        if (hatImg) {
            ctx.save();

            if (flipped) {
                ctx.translate(hatX + hatWidth, hatY);
                ctx.scale(-1, 1);
                ctx.drawImage(hatImg, 0, 0, hatWidth, hatHeight);
                ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation
            } else {
                ctx.drawImage(hatImg, hatX, hatY, hatWidth, hatHeight);
            }

            // Debug rectangle
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 2;
            ctx.strokeRect(hatX, hatY, hatWidth, hatHeight);
            
            ctx.restore();
        }
    }
}

/* Dragging and resizing logic */
canvas.addEventListener("mousedown", (event) => {
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
    // Adjust mouse coordinates for potential canvas scaling
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    mouseX *= scaleX;
    mouseY *= scaleY;

    return (
        mouseX >= hatX &&
        mouseX <= hatX + hatWidth &&
        mouseY >= hatY &&
        mouseY <= hatY + hatHeight
    );  
}

canvas.addEventListener("mousemove", (event) => {
    canvas.style.cursor = isMouseOnHat(event.offsetX, event.offsetY) ? "move" : "default";

    if (isDragging) {
        let newImgX = event.offsetX - startX;
        let newImgY = event.offsetY - startY;

        newImgX = Math.max(Math.min(newImgX, 0), canvas.width - scaledWidth);
        newImgY = Math.max(Math.min(newImgY, 0), canvas.height - scaledHeight);

        imgX = newImgX;
        imgY = newImgY;

        drawCanvas();
    }

    if (isHatDragging) {
        let newHatX = event.offsetX - hatStartX;
        let newHatY = event.offsetY - hatStartY;

        newHatX = Math.max(0, Math.min(newHatX, canvas.width - hatWidth));
        newHatY = Math.max(0, Math.min(newHatY, canvas.height - hatHeight));

        hatX = newHatX;
        hatY = newHatY;
        drawCanvas();
    }
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
    isHatDragging = false;
});

canvas.addEventListener("mouseleave", () => {
    isDragging = false;
    isHatDragging = false;
});

/* Flip the hat */
flipButton.addEventListener("click", () => {
    flipped = !flipped;
    drawCanvas();
});

/* Reset canvas */
resetButton.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    img = null;
    uploadButton.classList.remove("hidden");
    drawCanvas();
});

/* export button */
exportButton.addEventListener("click", () => {
    if (img !== null) {
        const dataURL = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.classList.add("hidden");
        link.href = dataURL;

        link.download = "profile-picture.png";

        link.click();
    }
});
