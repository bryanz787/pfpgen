const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageInput = document.getElementById('imageInput');
const hatContainer = document.getElementById('hat-container');
const hat = document.getElementById('hat');
const exportBtn = document.getElementById('exportBtn');
const flipBtn = document.getElementById('flipBtn');
const canvasContainer = document.getElementById('canvas-container');

let isDragging = false;
let isResizing = false;
let isRotating = false;
let startX, startY;
let startWidth, startHeight;
let startLeft, startTop;
let resizeHandle;
let originalWidth, originalHeight, originalAspectRatio;
let rotation = 0;
let startRotation = 0;
let isFlipped = false;

// Add resize handles
const resizeHandles = ['nw', 'ne', 'sw', 'se'];
resizeHandles.forEach(handle => {
    const div = document.createElement('div');
    div.className = 'resize-handle';
    div.id = `resize-${handle}`;
    hatContainer.appendChild(div);
});

// Add rotation handle
const rotateHandle = document.createElement('div');
rotateHandle.id = 'rotate-handle';
hatContainer.appendChild(rotateHandle);

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);
            canvasContainer.style.width = `${img.width}px`;
            canvasContainer.style.height = `${img.height}px`;
        };
        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
});

hat.addEventListener('load', () => {
    originalWidth = hat.naturalWidth;
    originalHeight = hat.naturalHeight;
    originalAspectRatio = originalWidth / originalHeight;
    hatContainer.style.width = `${originalWidth}px`;
    hatContainer.style.height = `${originalHeight}px`;
});

hatContainer.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('resize-handle')) {
        isResizing = true;
        resizeHandle = e.target.id.split('-')[1];
    } else if (e.target.id === 'rotate-handle') {
        isRotating = true;
        startRotation = rotation;
    } else {
        isDragging = true;
    }
    startX = e.clientX;
    startY = e.clientY;
    startWidth = hatContainer.offsetWidth;
    startHeight = hatContainer.offsetHeight;
    startLeft = hatContainer.offsetLeft;
    startTop = hatContainer.offsetTop;
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        hatContainer.style.left = `${startLeft + dx}px`;
        hatContainer.style.top = `${startTop + dy}px`;
    } else if (isResizing) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        let newWidth, newHeight;

        if (resizeHandle.includes('e')) {
            newWidth = startWidth + dx;
            newHeight = newWidth / originalAspectRatio;
        } else if (resizeHandle.includes('w')) {
            newWidth = startWidth - dx;
            newHeight = newWidth / originalAspectRatio;
            hatContainer.style.left = `${startLeft + startWidth - newWidth}px`;
        } else if (resizeHandle.includes('s')) {
            newHeight = startHeight + dy;
            newWidth = newHeight * originalAspectRatio;
        } else if (resizeHandle.includes('n')) {
            newHeight = startHeight - dy;
            newWidth = newHeight * originalAspectRatio;
            hatContainer.style.top = `${startTop + startHeight - newHeight}px`;
        }

        const minSize = 20;
        if (newWidth >= minSize && newHeight >= minSize) {
            hatContainer.style.width = `${newWidth}px`;
            hatContainer.style.height = `${newHeight}px`;
        }
    } else if (isRotating) {
        const centerX = hatContainer.offsetLeft + hatContainer.offsetWidth / 2;
        const centerY = hatContainer.offsetTop + hatContainer.offsetHeight / 2;
        const startAngle = Math.atan2(startY - centerY, startX - centerX);
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
        rotation = (startRotation + angleDiff + 360) % 360;
        hatContainer.style.transform = `rotate(${rotation}deg) scaleX(${isFlipped ? -1 : 1})`;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    isResizing = false;
    isRotating = false;
});

flipBtn.addEventListener('click', () => {
    isFlipped = !isFlipped;
    hatContainer.style.transform = `rotate(${rotation}deg) scaleX(${isFlipped ? -1 : 1})`;
});

exportBtn.addEventListener('click', () => {
    // Temporarily hide resize handles, rotate handle, and remove border
    const handles = document.querySelectorAll('.resize-handle, #rotate-handle');
    handles.forEach(handle => handle.style.display = 'none');
    hatContainer.classList.remove('hat-border');

    html2canvas(canvasContainer, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
    }).then(function(canvas) {
        // Restore resize handles, rotate handle, and border
        handles.forEach(handle => handle.style.display = '');
        hatContainer.classList.add('hat-border');

        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'profile_picture.png';
        link.href = dataURL;
        link.click();
    });
});