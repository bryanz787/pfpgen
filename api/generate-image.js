const { createCanvas, loadImage } = require('canvas');

module.exports = async (req, res) => {
  try {
    const { imageDataUrl, hatDataUrl, hatX, hatY, hatWidth, hatHeight } = JSON.parse(req.body);

    // Create canvas
    const canvas = createCanvas(500, 500);
    const ctx = canvas.getContext('2d');

    // Load and draw base image
    const baseImage = await loadImage(imageDataUrl);
    ctx.drawImage(baseImage, 0, 0, 500, 500);

    // Load and draw hat
    const hatImage = await loadImage(hatDataUrl);
    ctx.drawImage(hatImage, hatX, hatY, hatWidth, hatHeight);

    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/png');

    // Set response headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename=profile-picture.png');

    // Send the image buffer
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
};
