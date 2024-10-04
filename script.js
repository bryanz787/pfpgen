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

document.addEventListener('DOMContentLoaded', function() {
    const hat = document.getElementById('hat-image');
    let isDragging = false;
    let startX, startY;
    let originalX, originalY;

    // Make the hat draggable
    hat.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);

    function startDragging(e) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        originalX = hat.offsetLeft;
        originalY = hat.offsetTop;
    }

    function drag(e) {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        hat.style.left = originalX + dx + 'px';
        hat.style.top = originalY + dy + 'px';
    }

    function stopDragging() {
        isDragging = false;
    }

    // Make the hat resizable
    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    hat.parentElement.appendChild(resizer);

    let isResizing = false;
    let originalWidth, originalHeight;

    resizer.addEventListener('mousedown', startResizing);
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResizing);

    function startResizing(e) {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        originalWidth = hat.offsetWidth;
        originalHeight = hat.offsetHeight;
        e.preventDefault();
    }

    function resize(e) {
        if (!isResizing) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        hat.style.width = originalWidth + dx + 'px';
        hat.style.height = originalHeight + dy + 'px';
    }

    function stopResizing() {
        isResizing = false;
    }

    // Make the hat rotatable
    let rotation = 0;
    document.addEventListener('keydown', rotate);

    function rotate(e) {
        if (e.key === 'r' || e.key === 'R') {
            rotation += 15;
            hat.style.transform = `rotate(${rotation}deg)`;
        }
    }

    // Export functionality
    async function exportAsPNG() {
        const element = document.getElementById('profile-picture');
        if (typeof html2canvas === 'undefined') {
            console.error('html2canvas is not loaded');
            return;
        }
        try {
            const canvas = await html2canvas(element, { useCORS: true });
            const imageDataUrl = canvas.toDataURL('image/png');

            const hatImage = document.getElementById('hat-image');
            const hatCanvas = document.createElement('canvas');
            hatCanvas.width = hatImage.width;
            hatCanvas.height = hatImage.height;
            hatCanvas.getContext('2d').drawImage(hatImage, 0, 0);
            const hatDataUrl = hatCanvas.toDataURL('image/png');

            const hatRect = hatImage.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();

            const data = {
                imageDataUrl,
                hatDataUrl,
                hatX: hatRect.left - elementRect.left,
                hatY: hatRect.top - elementRect.top,
                hatWidth: hatRect.width,
                hatHeight: hatRect.height,
                hatRotation: rotation
            };

            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'profile-picture.png';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                console.error('Failed to generate image');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    document.getElementById('export-button').addEventListener('click', exportAsPNG);

    // Load html2canvas
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.onload = () => console.log('html2canvas loaded');
    script.onerror = () => console.error('Failed to load html2canvas');
    document.head.appendChild(script);
});