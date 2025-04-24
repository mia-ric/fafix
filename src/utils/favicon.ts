
export function drawFavicon(img: HTMLImageElement, eventCount: number) {
    const size = 32;
    const radius = 11;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return null;
    }

    // Draw Favicon
    ctx.drawImage(img, 0, 0, size, size);

    if (eventCount > 0) {
        ctx.beginPath();
        ctx.arc(size - radius, size - radius, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#e11d48';
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(eventCount > 99 ? 99 : eventCount), size - radius, size - radius);
    }

    return canvas.toDataURL('image/png');
};
