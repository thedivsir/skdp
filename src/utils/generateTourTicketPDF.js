import html2canvas from "html2canvas";
import jsPDF from "jspdf";

async function generateTourTicketPDF(element, ticketNumber) {
  if (!element) {
    throw new Error("Tour ticket element is not available.");
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

  // Trim blank rows from bottom (same as registration receipt)
  const ctx = canvas.getContext("2d");
  const bgColor = { r: 255, g: 253, b: 248 };
  const tolerance = 8;

  function isBlankRow(y) {
    const data = ctx.getImageData(0, y, canvas.width, 1).data;
    for (let x = 0; x < canvas.width; x++) {
      const i = x * 4;
      if (
        Math.abs(data[i] - bgColor.r) > tolerance ||
        Math.abs(data[i + 1] - bgColor.g) > tolerance ||
        Math.abs(data[i + 2] - bgColor.b) > tolerance
      ) {
        return false;
      }
    }
    return true;
  }

  let lastContentRow = canvas.height - 1;
  while (lastContentRow > 0 && isBlankRow(lastContentRow)) {
    lastContentRow--;
  }

  const croppedHeight = Math.min(lastContentRow + 20, canvas.height);
  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = canvas.width;
  croppedCanvas.height = croppedHeight;
  const croppedCtx = croppedCanvas.getContext("2d");
  croppedCtx.drawImage(canvas, 0, 0);

  const image = croppedCanvas.toDataURL("image/png", 1);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 5;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  const imageWidth = usableWidth;
  const imageHeight = (croppedCanvas.height * imageWidth) / croppedCanvas.width;

  const finalHeight = Math.min(imageHeight, usableHeight);
  const yOffset = margin;

  pdf.addImage(
    image,
    "PNG",
    margin,
    yOffset,
    imageWidth,
    finalHeight,
    undefined,
    "FAST"
  );

  pdf.save(`${ticketNumber || "tour-ticket"}.pdf`);
}

export default generateTourTicketPDF;
