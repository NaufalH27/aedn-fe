export async function compressImageBlobToWebp(
  blob: Blob,
  maxWidth = 600,
  maxHeight = 600,
  quality = 0.75
): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(blob);

    const widthScale = maxWidth / bitmap.width;
    const heightScale = maxHeight / bitmap.height;

    const scale = Math.min(1, widthScale, heightScale);

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return blob;
    }

    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const webpBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", quality);
    });

    return webpBlob ?? blob;
  } catch {
    return blob;
  }
}
