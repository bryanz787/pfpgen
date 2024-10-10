document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const hatContainer = document.getElementById("hat-container");
    const hat = document.getElementById("hat");
    const clear = document.getElementById("clear");
    const canvasContainer = document.getElementById("canvas-container"); // Assuming this is the parent of the canvas

    // Set the canvas container to be visible
    canvasContainer.style.display = "block"; // Show the canvas container
    canvas.style.display = "block"; // Show the canvas

    hat.onload = function () {
        // Initialize hat position and size here
        initializeHat();
    };

    let isDragging = false;
    let isResizing = false;
    let isRotating = false;
    let startX,
        startY,
        startWidth,
        startHeight,
        startAngle = 0;
    let currentAngle = 0;
    let flipped = false;
    let activeHandle = null;

    // Initialize hat position and size
    function initializeHat() {
        const aspectRatio = hat.naturalWidth / hat.naturalHeight;
        const initialWidth = 100; // You can adjust this value as needed
        const initialHeight = initialWidth / aspectRatio;

        // Set the hat container dimensions
        hatContainer.style.width = initialWidth + "px";
        hatContainer.style.height = initialHeight + "px";

        // Calculate the center position based on the canvas size
        const canvasRect = canvas.getBoundingClientRect();
        const centerX = canvasRect.width / 2 - initialWidth / 2;
        const centerY = canvasRect.height / 2 - initialHeight / 2;

        // Position the hat at the center of the canvas
        hatContainer.style.left = centerX + "px";
        hatContainer.style.top = centerY + "px";
    }

    initializeHat();

    // Dragging
    hatContainer.addEventListener("mousedown", startDragging);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDragging);

    function startDragging(e) {
        if (
            e.target.classList.contains("resize-handle") ||
            e.target === document.getElementById("rotate-handle")
        )
            return;
        isDragging = true;
        startX = e.clientX - hatContainer.offsetLeft;
        startY = e.clientY - hatContainer.offsetTop;
    }

    function drag(e) {
        if (isDragging) {
            hatContainer.style.left = e.clientX - startX + "px";
            hatContainer.style.top = e.clientY - startY + "px";
        }
    }

    function stopDragging() {
        isDragging = false;
        isResizing = false;
    }

    // Resizing
    const resizeHandles = document.querySelectorAll(".resize-handle");
    resizeHandles.forEach((handle) => {
        handle.addEventListener("mousedown", startResizing);
    });

    function startResizing(e) {
        isResizing = true;
        activeHandle = e.target;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(
            document.defaultView.getComputedStyle(hatContainer).width,
            10
        );
        startHeight = parseInt(
            document.defaultView.getComputedStyle(hatContainer).height,
            10
        );
        startLeft = hatContainer.offsetLeft;
        startTop = hatContainer.offsetTop;
        document.addEventListener("mousemove", resize);
        document.addEventListener("mouseup", stopResizing);
        e.preventDefault();
        e.stopPropagation();
    }

    function resize(e) {
        if (!isResizing) {
            return;
        }

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const aspectRatio = startWidth / startHeight;
        let newWidth, newHeight, newLeft, newTop;

        switch (activeHandle.id) {
            case "resize-se":
                newWidth = startWidth + dx;
                newHeight = newWidth / aspectRatio;
                break;
            case "resize-sw":
                newWidth = startWidth - dx;
                newHeight = newWidth / aspectRatio;
                newLeft = startLeft + dx;
                break;
            case "resize-ne":
                newWidth = startWidth + dx;
                newHeight = newWidth / aspectRatio;
                newTop = startTop + startHeight - newHeight;
                break;
            case "resize-nw":
                newWidth = startWidth - dx;
                newHeight = newWidth / aspectRatio;
                newLeft = startLeft + dx;
                newTop = startTop + startHeight - newHeight;
                break;
        }

        // Apply new dimensions and position
        hatContainer.style.width = `${newWidth}px`;
        hatContainer.style.height = `${newHeight}px`;
        if (newLeft !== undefined) hatContainer.style.left = `${newLeft}px`;
        if (newTop !== undefined) hatContainer.style.top = `${newTop}px`;

        e.preventDefault();
    }

    function stopResizing() {
        isResizing = false;
        activeHandle = null;
        document.removeEventListener("mousemove", resize);
        document.removeEventListener("mouseup", stopResizing);
    }

    // Rotating
    const rotateHandle = document.getElementById("rotate-handle");
    rotateHandle.addEventListener("mousedown", startRotating);

    function startRotating(e) {
        isRotating = true;
        const rect = hatContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        startAngle =
            Math.atan2(e.clientY - centerY, e.clientX - centerX) - currentAngle;
        document.addEventListener("mousemove", rotate);
        document.addEventListener("mouseup", stopRotating);
        e.preventDefault();
        e.stopPropagation();
    }

    function rotate(e) {
        if (isRotating) {
            const rect = hatContainer.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
            currentAngle = angle - startAngle;
            hatContainer.style.transform = `rotate(${currentAngle}rad) scaleX(${flipped ? -1 : 1
                })`;
        }
    }

    function stopRotating() {
        isRotating = false;
        document.removeEventListener("mousemove", rotate);
        document.removeEventListener("mouseup", stopRotating);
    }

    // Flipping
    document.getElementById("flipBtn").addEventListener("click", function () {
        flipped = !flipped;
        hatContainer.style.transform = `rotate(${currentAngle}rad) scaleX(${flipped ? -1 : 1
            })`;
    });

    // Modify the export function
    document.getElementById("exportBtn").addEventListener("click", function () {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext("2d");

        // Draw the main canvas content
        tempCtx.drawImage(canvas, 0, 0);

        // Get the hat's actual rendered dimensions
        const hatWidth = parseInt(hatContainer.style.width, 10);
        const hatHeight = parseInt(hatContainer.style.height, 10);

        // Calculate hat position relative to canvas
        const hatX = hatContainer.offsetLeft;
        const hatY = hatContainer.offsetTop;

        // Calculate center position of the hat
        const hatCenterX = hatX + hatWidth / 2;
        const hatCenterY = hatY + hatHeight / 2;

        // Save context state
        tempCtx.save();

        // Translate to hat center
        tempCtx.translate(hatCenterX, hatCenterY);

        // Flip if necessary (before rotation)
        tempCtx.scale(flipped ? -1 : 1, 1);

        // Rotate
        tempCtx.rotate(currentAngle);

        // Draw hat at the center with the correct offsets
        tempCtx.drawImage(hat, -hatWidth / 2, -hatHeight / 2, hatWidth, hatHeight);

        // Restore context state
        tempCtx.restore();

        // Create download link
        const link = document.createElement("a");
        link.download = "profile-picture.png";
        link.href = tempCanvas.toDataURL("image/png");
        link.click();
    });


    // Load initial image
    const imageInput = document.getElementById("imageInput");
    imageInput.addEventListener("change", function (e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                // Calculate the aspect ratio
                const aspectRatio = img.width / img.height;

                // Set canvas size to maintain aspect ratio and image quality
                if (aspectRatio > 1) {
                    canvas.width = Math.min(img.width, 800);
                    canvas.height = canvas.width / aspectRatio;
                } else {
                    canvas.height = Math.min(img.height, 800);
                    canvas.width = canvas.height * aspectRatio;
                }

                // Adjust canvas-container size
                const canvasContainer = document.getElementById("canvas-container");
                canvasContainer.style.width = canvas.width + "px";
                canvasContainer.style.height = canvas.height + "px";

                // Draw image on canvas
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Reset hat position and size
                initializeHat();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    clear.addEventListener("click", function (e) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        initializeHat();
        imageInput.value = ""; // Clear the file input
    });

    // Prevent default selection behavior on the hat container
    hatContainer.addEventListener("mousedown", function (e) {
        if (!e.target.classList.contains("resize-handle")) {
            e.preventDefault();
        }
    });
});
