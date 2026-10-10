export interface LetterCardData {
  name: string;
  message: string;
  relationship?: string;
  createdAt?: string;
}

/**
 * Generates an editorial PNG card from a birthday letter using Canvas.
 */
export async function generateLetterCard(data: LetterCardData): Promise<{ blob: Blob; dataUrl: string }> {
  // Ensure web fonts are ready before rendering
  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Fallback to system serif/mono fonts if not resolved
    }
  }

  const canvas = document.createElement("canvas");
  const width = 1200;
  const height = 675;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to create canvas rendering context");
  }

  // 1. Warm paper background
  ctx.fillStyle = "#F6F3EE";
  ctx.fillRect(0, 0, width, height);

  // 2. Editorial double border frame
  ctx.strokeStyle = "#DDD6C8";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  ctx.strokeStyle = "#E8E2D5";
  ctx.lineWidth = 1;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  // Corner accents
  const drawCorner = (x: number, y: number, dx: number, dy: number) => {
    ctx.strokeStyle = "#1F4D3A";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + dx * 16, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * 16);
    ctx.stroke();
  };
  drawCorner(44, 44, 1, 1);
  drawCorner(width - 44, 44, -1, 1);
  drawCorner(44, height - 44, 1, -1);
  drawCorner(width - 44, height - 44, -1, -1);

  // 3. Top Header
  const contentLeft = 70;
  const contentRight = width - 70;
  const contentWidth = contentRight - contentLeft;

  // Header Brand
  ctx.font = "600 13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.fillStyle = "#1F4D3A";
  ctx.textBaseline = "middle";
  ctx.fillText("SAMKIEL · CHAPTER 20", contentLeft, 82);

  // Header Date
  const dateStr = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "October 11, 2026";

  ctx.font = "400 13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.fillStyle = "#6B665C";
  ctx.textAlign = "right";
  ctx.fillText(dateStr, contentRight, 82);
  ctx.textAlign = "left";

  // Header Hairline Divider
  ctx.strokeStyle = "#DDD6C8";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(contentLeft, 108);
  ctx.lineTo(contentRight, 108);
  ctx.stroke();

  // 4. Message Text (Word Wrapping & Centering)
  const maxTextWidth = contentWidth - 40;
  const fontSize = data.message.length > 200 ? 32 : 36;
  const lineHeight = Math.round(fontSize * 1.45);
  ctx.font = `italic 400 ${fontSize}px "Fraunces", Georgia, serif`;

  const words = data.message.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxTextWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  // Calculate vertical center between header (115) and footer (540)
  const availableHeight = 540 - 115;
  const textBlockHeight = lines.length * lineHeight;
  const startY = 115 + (availableHeight - textBlockHeight) / 2 + lineHeight / 2;

  // Quotation mark ornament
  ctx.font = "italic 400 52px Georgia, serif";
  ctx.fillStyle = "rgba(31, 77, 58, 0.25)";
  ctx.fillText("“", contentLeft, startY - 24);

  // Render wrapped message lines
  ctx.font = `italic 400 ${fontSize}px "Fraunces", Georgia, serif`;
  ctx.fillStyle = "#17150F";
  ctx.textBaseline = "middle";

  lines.forEach((line, i) => {
    ctx.fillText(line, contentLeft + 28, startY + i * lineHeight);
  });

  // 5. Footer Area
  const footerLineY = 550;
  ctx.strokeStyle = "#DDD6C8";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(contentLeft, footerLineY);
  ctx.lineTo(contentRight, footerLineY);
  ctx.stroke();

  const footerY = 595;

  // Author Name
  ctx.font = '600 22px "Fraunces", Georgia, serif';
  ctx.fillStyle = "#17150F";
  ctx.textBaseline = "middle";
  const authorName = data.name.trim() || "Anonymous";
  ctx.fillText(authorName, contentLeft, footerY);

  const authorWidth = ctx.measureText(authorName).width;

  // Relationship Tag (if present)
  if (data.relationship) {
    const tagText = data.relationship.toUpperCase();
    ctx.font = "600 11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    const tagMetrics = ctx.measureText(tagText);
    const pillWidth = tagMetrics.width + 18;
    const pillHeight = 24;
    const pillX = contentLeft + authorWidth + 14;
    const pillY = footerY - pillHeight / 2;

    // Pill background
    ctx.fillStyle = "rgba(31, 77, 58, 0.08)";
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 12);
    ctx.fill();

    // Pill border
    ctx.strokeStyle = "rgba(31, 77, 58, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 12);
    ctx.stroke();

    // Pill text
    ctx.fillStyle = "#1F4D3A";
    ctx.fillText(tagText, pillX + 9, footerY);
  }

  // Footer site URL
  ctx.font = "400 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.fillStyle = "#6B665C";
  ctx.textAlign = "right";
  ctx.fillText("birthday.samkiel.dev", contentRight, footerY);
  ctx.textAlign = "left";

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to export canvas to PNG blob"));
          return;
        }
        const dataUrl = canvas.toDataURL("image/png");
        resolve({ blob, dataUrl });
      },
      "image/png",
      1.0
    );
  });
}

/**
 * Downloads a letter directly as a PNG file.
 */
export async function downloadLetterAsPng(data: LetterCardData): Promise<void> {
  const { blob } = await generateLetterCard(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const cleanName = data.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase() || "letter";
  a.href = url;
  a.download = `samkiel-letter-${cleanName}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Shares a letter via native Web Share API with image file fallback to download.
 */
export async function shareLetterAsPng(data: LetterCardData): Promise<void> {
  const { blob } = await generateLetterCard(data);
  const cleanName = data.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase() || "letter";
  const file = new File([blob], `samkiel-letter-${cleanName}.png`, { type: "image/png" });

  if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: `Letter from ${data.name} for samkiel`,
        text: `"${data.message}" — ${data.name}`,
        files: [file],
      });
      return;
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        return;
      }
    }
  }

  // Fallback: download the PNG
  await downloadLetterAsPng(data);
}
