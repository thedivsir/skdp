import html2canvas from "html2canvas";
import jsPDF from "jspdf";

async function generateRegistrationPDF(element, registrationNumber) {
  if (!element) {
    throw new Error("Registration receipt element is not available.");
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#fffdf8",
    logging: false,
    imageTimeout: 15000,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  // Remove unnecessary blank space from the bottom.
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const pixels = ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  ).data;

  // Background color: #fffdf8
  const bg = { r: 255, g: 253, b: 248 };
  const threshold = 15;
  let lastContentRow = -1;

  for (let y = canvas.height - 1; y >= 0; y--) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;

      const difference =
        Math.abs(pixels[i] - bg.r) +
        Math.abs(pixels[i + 1] - bg.g) +
        Math.abs(pixels[i + 2] - bg.b);

      if (difference > threshold) {
        lastContentRow = y;
        break;
      }
    }

    if (lastContentRow !== -1) break;
  }

  // Keep a small amount of padding below the receipt content.
  const bottomPadding = 40;
  const croppedHeight =
    lastContentRow === -1
      ? canvas.height
      : Math.min(canvas.height, lastContentRow + bottomPadding);

  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = canvas.width;
  croppedCanvas.height = croppedHeight;

  const croppedContext = croppedCanvas.getContext("2d");
  croppedContext.fillStyle = "#fffdf8";
  croppedContext.fillRect(
    0,
    0,
    croppedCanvas.width,
    croppedCanvas.height
  );

  croppedContext.drawImage(
    canvas,
    0,
    0,
    canvas.width,
    croppedHeight,
    0,
    0,
    canvas.width,
    croppedHeight
  );

  // Create exactly one A4 PDF page.
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const margin = 5;
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - margin * 2;

  // Fit the complete receipt inside the single page.
  const scale = Math.min(
    availableWidth / croppedCanvas.width,
    availableHeight / croppedCanvas.height
  );

  const imageWidth = croppedCanvas.width * scale;
  const imageHeight = croppedCanvas.height * scale;

  const x = (pageWidth - imageWidth) / 2;
  const y = margin;

  const image = croppedCanvas.toDataURL("image/png");

  pdf.addImage(
    image,
    "PNG",
    x,
    y,
    imageWidth,
    imageHeight,
    undefined,
    "FAST"
  );

  pdf.save(`${registrationNumber || "registration"}.pdf`);
}

export default generateRegistrationPDF;