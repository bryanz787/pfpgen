const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const uploadButton = document.getElementById("upload-button");
const fileInput = document.getElementById("file-input");
const flipButton = document.getElementById("flip-hat");
const resetButton = document.getElementById("reset");
const exportButton = document.getElementById("export");
const scaleSliders = document.querySelectorAll("#scale-slider");
const rotateSliders = document.querySelectorAll("#rotate-slider");
const sliderContainerDesktop = document.getElementById("slider-container-desktop");
const sliderContainerMobile = document.getElementById("slider-container-mobile");
const guiContainer = document.getElementById("gui-container");

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
let hatScale = 1;
let hatRotation = 0;

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

scaleSliders.forEach(slider => { 
    changeSliderColor(slider);
});
rotateSliders.forEach(slider => {
    changeSliderColor(slider);
});

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
            ctx.translate(hatX + (hatWidth * hatScale) / 2, hatY + (hatHeight * hatScale) / 2);
            ctx.rotate(hatRotation * Math.PI / 180);
            
            if (flipped) {
                ctx.scale(-1, 1);
            }
            
            ctx.drawImage(hatImg, -hatWidth * hatScale / 2, -hatHeight * hatScale / 2, hatWidth * hatScale, hatHeight * hatScale);
            
            ctx.restore();
        }
    }
}

function isMouseOnHat(mouseX, mouseY) {
    // Adjust mouse coordinates for potential canvas scaling
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    mouseX *= scaleX;
    mouseY *= scaleY;

    return (
        mouseX >= hatX &&
        mouseX <= hatX + hatWidth * hatScale &&
        mouseY >= hatY &&
        mouseY <= hatY + hatHeight * hatScale
    );  
}

function stopDragging() {
    isDragging = false;
    isHatDragging = false;
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

canvas.addEventListener("touchstart", (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const offsetX = (touch.clientX - rect.left) * scaleX;
    const offsetY = (touch.clientY - rect.top) * scaleY;

    if (isMouseOnHat(offsetX, offsetY)) {
        isHatDragging = true;
        isDragging = false;

        hatStartX = offsetX - hatX;
        hatStartY = offsetY - hatY;
    } else if (img) {
        isDragging = true;
        isHatDragging = false;
        
        startX = offsetX - imgX;
        startY = offsetY - imgY;
    }
});

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

        newHatX = Math.max(-hatWidth * hatScale, Math.min(newHatX, canvas.width));
        newHatY = Math.max(-hatHeight * hatScale, Math.min(newHatY, canvas.height));

        hatX = newHatX;
        hatY = newHatY;
        drawCanvas();
    }
});

canvas.addEventListener("touchmove", (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const offsetX = (touch.clientX - rect.left) * scaleX;
    const offsetY = (touch.clientY - rect.top) * scaleY;

    if (isDragging) {
        let newImgX = offsetX - startX;
        let newImgY = offsetY - startY;

        newImgX = Math.max(Math.min(newImgX, 0), canvas.width - scaledWidth);
        newImgY = Math.max(Math.min(newImgY, 0), canvas.height - scaledHeight);

        imgX = newImgX;
        imgY = newImgY;

        drawCanvas();
    }

    if (isHatDragging) {
        let newHatX = offsetX - hatStartX;
        let newHatY = offsetY - hatStartY;

        newHatX = Math.max(-hatWidth * hatScale, Math.min(newHatX, canvas.width));
        newHatY = Math.max(-hatHeight * hatScale, Math.min(newHatY, canvas.height));

        hatX = newHatX;
        hatY = newHatY;
        drawCanvas();
    }
});

canvas.addEventListener("mouseup", stopDragging);

canvas.addEventListener("touchend", stopDragging);

canvas.addEventListener("mouseleave", stopDragging);

canvas.addEventListener("touchcancel", stopDragging);

/* Flip the hat */
flipButton.addEventListener("click", () => {
    flipped = !flipped;
    drawCanvas();
});

/* Reset canvas */
resetButton.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    img = null;

    hatRotation = 0;
    hatScale = 1;
    flipped = false;
    hatWidth = 200;
    hatHeight = (hatImg.height * hatWidth) / hatImg.width;
    hatX = canvas.width / 2 - hatWidth / 2;
    hatY = canvas.height / 2 - hatHeight / 2;

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

// Add this event listener for the scale slider
scaleSliders.forEach(slider => {
    slider.addEventListener("input", (event) => {
        hatScale = parseFloat(event.target.value);
        changeSliderColor(slider);
        drawCanvas();
    });
});

// Add this event listener for the scale slider
rotateSliders.forEach(slider => {
    slider.addEventListener("input", (event) => {
        hatRotation = parseFloat(event.target.value);
        changeSliderColor(slider);
        drawCanvas();
    });
});

// Replace the existing adjustUploadGuiSize function with this one
function adjustUploadGuiSize() {
    const uploadGui = document.getElementById('upload-gui');
    if (!uploadGui) return;

    const aspectRatio = document.documentElement.clientHeight / document.documentElement.clientWidth;
    const isMobile = aspectRatio > 1.51 || document.documentElement.clientWidth < 768;

    if (isMobile) {
        sliderContainerDesktop.classList.add("hidden");
        sliderContainerMobile.classList.remove("hidden");

        const scaleValue = document.documentElement.clientWidth * 0.8 / 600;
        guiContainer.style.transform = `scale(${scaleValue})`;
        uploadGui.style.minHeight = `820px`;     
    } else {
        sliderContainerDesktop.classList.remove("hidden");
        sliderContainerMobile.classList.add("hidden");

        const maxHeight = document.documentElement.clientHeight * 0.8;
        if (maxHeight < 820) {
            const scaleValue = maxHeight / 820;
            uploadGui.style.transform = `scale(${scaleValue})`;
            uploadGui.style.minHeight = `820px`;
        }
    }
}
  
// Call the function on page load and window resize
document.addEventListener('DOMContentLoaded', adjustUploadGuiSize);
window.addEventListener('resize', adjustUploadGuiSize);

function changeSliderColor(slider) {
    const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.background = `linear-gradient(to right, #4BCF3A 0%, #4BCF3A ${value}%, #052700 ${value}%, #052700 100%)`;
}
