// Printable Token Helper & Barcode/QR Code Generator

/**
 * Generates an SVG pseudo-QR code matrix for token verification
 */
export function generateTokenQR(tokenNumber, deptCode) {
  // Deterministic SVG QR pattern based on token characters
  const seed = (tokenNumber + deptCode).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const size = 21; // 21x21 modules standard QR version 1 layout
  const cells = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // 3 Corner finder patterns
      const isTopLeft = (r < 7 && c < 7);
      const isTopRight = (r < 7 && c >= size - 7);
      const isBottomLeft = (r >= size - 7 && c < 7);

      if (isTopLeft || isTopRight || isBottomLeft) {
        // Draw standard QR finder boxes
        const inBox = (r === 0 || r === 6 || c === 0 || c === 6 ||
                       r === size - 1 || r === size - 7 || c === size - 1 || c === size - 7);
        const inCenter = (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
                         (r >= 2 && r <= 4 && c >= size - 5 && c <= size - 3) ||
                         (r >= size - 5 && r <= size - 3 && c >= 2 && c <= 4);
        const isBorder = (r === 1 || r === 5 || c === 1 || c === 5 ||
                          (r === 1 && c >= size - 6) || (r === 5 && c >= size - 6) || (c === size - 6 && r <= 5) || (c === size - 2 && r <= 5) ||
                          (r === size - 6 && c <= 5) || (r === size - 2 && c <= 5) || (c === 5 && r >= size - 6) || (c === 1 && r >= size - 6));

        if (inCenter || inBox) {
          cells.push({ r, c, fill: "#0f172a" });
        }
      } else {
        // Pseudo-random data bits influenced by token
        const pseudoVal = Math.sin(seed * (r + 1) * (c + 1)) * 10000;
        if ((Math.abs(Math.floor(pseudoVal)) % 2) === 0) {
          cells.push({ r, c, fill: "#0f172a" });
        }
      }
    }
  }

  return { size, cells };
}

/**
 * Triggers standard browser print dialog for e-token slip
 */
export function printTokenSlip() {
  window.print();
}
