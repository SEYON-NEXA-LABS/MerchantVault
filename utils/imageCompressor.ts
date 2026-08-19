/**
 * Browser-Side Image Compressor Utility
 * Resizes heavy DSLR/camera images and converts them to next-gen WebP format
 * in the browser BEFORE uploading to Supabase Storage.
 */

export interface CompressionResult {
  blob: Blob;
  originalSizeKB: number;
  compressedSizeKB: number;
  savingsPercentage: number;
  webpFileName: string;
}

export async function compressImageBeforeUpload(
  file: File,
  maxWidth = 1200,
  quality = 0.8
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    // If already a small file under 200KB or SVG, pass through
    if (file.size <= 200 * 1024 || file.type.includes("svg")) {
      const sizeKB = Math.round(file.size / 1024);
      return resolve({
        blob: file,
        originalSizeKB: sizeKB,
        compressedSizeKB: sizeKB,
        savingsPercentage: 0,
        webpFileName: file.name
      });
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return resolve({
          blob: file,
          originalSizeKB: Math.round(file.size / 1024),
          compressedSizeKB: Math.round(file.size / 1024),
          savingsPercentage: 0,
          webpFileName: file.name
        });
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve({
              blob: file,
              originalSizeKB: Math.round(file.size / 1024),
              compressedSizeKB: Math.round(file.size / 1024),
              savingsPercentage: 0,
              webpFileName: file.name
            });
          }

          const originalSizeKB = Math.round(file.size / 1024);
          const compressedSizeKB = Math.round(blob.size / 1024);
          const savingsPercentage = Math.max(
            0,
            Math.round(((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100)
          );

          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const webpFileName = `${baseName}.webp`;

          resolve({
            blob,
            originalSizeKB,
            compressedSizeKB,
            savingsPercentage,
            webpFileName
          });
        },
        "image/webp",
        quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };
  });
}
