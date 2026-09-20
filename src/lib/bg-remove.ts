export function removeBackground(
  imageSource: string,
  threshold: number = 30
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(imageSource);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const bgColor = detectBackgroundColor(data, canvas.width, canvas.height);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const distance = Math.sqrt(
          (r - bgColor.r) ** 2 + (g - bgColor.g) ** 2 + (b - bgColor.b) ** 2
        );

        if (distance < threshold) {
          const edgeDist = distanceFromEdge(
            i / 4, canvas.width, canvas.height
          );
          const fadeFactor = Math.min(edgeDist / 5, 1);
          data[i + 3] = Math.round((distance / threshold) * 255 * fadeFactor);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(imageSource);
    img.src = imageSource;
  });
}

function detectBackgroundColor(
  data: Uint8ClampedArray,
  width: number,
  height: number
): { r: number; g: number; b: number } {
  const corners = [
    { x: 0, y: 0 },
    { x: width - 1, y: 0 },
    { x: 0, y: height - 1 },
    { x: width - 1, y: height - 1 },
    { x: Math.floor(width / 2), y: 0 },
    { x: Math.floor(width / 2), y: height - 1 },
    { x: 0, y: Math.floor(height / 2) },
    { x: width - 1, y: Math.floor(height / 2) },
  ];

  const samples: { r: number; g: number; b: number }[] = [];

  for (const { x, y } of corners) {
    for (let dx = 0; dx < 5; dx++) {
      for (let dy = 0; dy < 5; dy++) {
        const px = Math.min(x + dx, width - 1);
        const py = Math.min(y + dy, height - 1);
        const idx = (py * width + px) * 4;
        samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
      }
    }
  }

  const avgR = Math.round(samples.reduce((s, c) => s + c.r, 0) / samples.length);
  const avgG = Math.round(samples.reduce((s, c) => s + c.g, 0) / samples.length);
  const avgB = Math.round(samples.reduce((s, c) => s + c.b, 0) / samples.length);

  return { r: avgR, g: avgG, b: avgB };
}

function distanceFromEdge(
  pixelIndex: number,
  width: number,
  height: number
): number {
  const x = pixelIndex % width;
  const y = Math.floor(pixelIndex / width);
  return Math.min(x, y, width - 1 - x, height - 1 - y);
}
