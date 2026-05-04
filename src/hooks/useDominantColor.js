import { useState, useEffect } from 'react';

const cache = new Map();

export function useDominantColor(imageUrl) {
  const [color, setColor] = useState(null);

  useEffect(() => {
    if (!imageUrl) return;
    if (cache.has(imageUrl)) { setColor(cache.get(imageUrl)); return; }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 16, 16);
        const { data } = ctx.getImageData(0, 0, 16, 16);

        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 100) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }
        if (count > 0) {
          const result = `rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`;
          cache.set(imageUrl, result);
          setColor(result);
        }
      } catch {
        // CORS blocked — fall back to gradient
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  return color;
}
