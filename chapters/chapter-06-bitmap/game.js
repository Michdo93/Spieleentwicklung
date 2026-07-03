/**
 * Chapter 06 · Bitmap
 * Portierung von A3GPU206_Bitmap/BitmapExample.as
 *
 * AS3 lädt ein Bild per Loader/URLRequest, schneidet es mit
 * BitmapData.copyPixels() in ein Raster aus Einzelteilen und platziert
 * jedes Teil mit einem kleinen Abstand — quasi eine "zersplitterte" Vorschau.
 * Canvas-Äquivalent: Image laden, dann drawImage() mit Quell-Rechteck
 * (das ist copyPixels() in der Canvas-Welt).
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;

const cols = 6, rows = 4;
const gap = 5;
const offsetX = 20, offsetY = 20;

const img = new Image();
img.src = "assets/testimage.jpg";
img.onload = () => {
  const pieceWidth = img.width / cols;
  const pieceHeight = img.height / rows;

  ctx.fillStyle = "#05070a";
  ctx.fillRect(0, 0, W, H);

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const dx = x * (pieceWidth + gap) + offsetX;
      const dy = y * (pieceHeight + gap) + offsetY;
      // entspricht: bitmapData.copyPixels(image, new Rectangle(x*pw, y*ph, pw, ph), new Point(0,0))
      ctx.drawImage(
        img,
        x * pieceWidth, y * pieceHeight, pieceWidth, pieceHeight, // Quelle
        dx, dy, pieceWidth, pieceHeight                            // Ziel
      );
    }
  }
};
