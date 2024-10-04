document.addEventListener('DOMContentLoaded', function() {
    const hat = document.getElementById('hat-image');
    let isDragging = false;
    let isResizing = false;
    let startX, startY, startWidth, startHeight, startAngle = 0;

    // Create resizer element
    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    hat.parentElement.appendChild(resizer);

    // Dragging
    hat.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);

    function startDragging(e) {
        if (e.target === resizer) return;
        isDragging = true;
        startX = e.clientX - hat.offsetLeft;
        startY = e.clientY - hat.offsetTop;
    }

    function drag(e) {
        if (isDragging) {
            hat.style.left = (e.clientX - startX) + 'px';
            hat.style.top = (e.clientY - startY) + 'px';
            updateResizerPosition();
        } else if (isResizing) {
            const width = startWidth + (e.clientX - startX);
            const height = startHeight + (e.clientY - startY);
            hat.style.width = width + 'px';
            hat.style.height = height + 'px';
            updateResizerPosition();
        }
    }

    function stopDragging() {
        isDragging = false;
        isResizing = false;
    }

    // Resizing
    resizer.addEventListener('mousedown', startResizing);

    function startResizing(e) {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(document.defaultView.getComputedStyle(hat).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(hat).height, 10);
        e.stopPropagation();
    }

    function updateResizerPosition() {
        const rect = hat.getBoundingClientRect();
        resizer.style.left = (rect.width - 5) + 'px';
        resizer.style.top = (rect.height - 5) + 'px';
    }

    // Rotating
    document.addEventListener('keydown', rotate);

    function rotate(e) {
        if (e.key === 'r' || e.key === 'R') {
            startAngle += 15;
            hat.style.transform = `rotate(${startAngle}deg)`;
        }
    }

    // Exporting
    document.getElementById('export-button').addEventListener('click', function() {
        html2canvas(document.getElementById('profile-picture')).then(function(canvas) {
            const link = document.createElement('a');
            link.download = 'profile-picture.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    });

    // Initial positioning of resizer
    updateResizerPosition();
});