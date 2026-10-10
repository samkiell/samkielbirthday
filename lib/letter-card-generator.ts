export interface LetterCardData {
  code?: string;
  name: string;
  message: string;
  relationship?: string;
  createdAt?: string;
  theme?: "dark" | "light";
}

// Alias for semantic clarity
export type WishCardData = LetterCardData;

/**
 * Draws an elegant, detailed fountain pen resting on paper ("pen dropped, as per done writing").
 */
function drawFountainPen(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angleRad: number,
  isDark: boolean
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleRad);

  // 1. Soft realistic drop shadow under resting pen
  ctx.save();
  ctx.shadowColor = isDark ? "rgba(0, 0, 0, 0.65)" : "rgba(32, 26, 18, 0.18)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.45)" : "rgba(20, 16, 10, 0.15)";
  ctx.beginPath();
  ctx.roundRect(-105, -5, 230, 10, 5);
  ctx.fill();
  ctx.restore();

  // 2. Pen Barrel (rich lacquered finish with subtle specular highlight)
  const barrelGrad = ctx.createLinearGradient(0, -7.5, 0, 7.5);
  if (isDark) {
    barrelGrad.addColorStop(0, "#23332A");
    barrelGrad.addColorStop(0.35, "#345543");
    barrelGrad.addColorStop(1, "#18241E");
  } else {
    barrelGrad.addColorStop(0, "#1B3326");
    barrelGrad.addColorStop(0.35, "#2C523F");
    barrelGrad.addColorStop(1, "#15261D");
  }
  ctx.fillStyle = barrelGrad;
  ctx.beginPath();
  ctx.roundRect(-102, -7, 134, 14, [6, 0, 0, 6]);
  ctx.fill();

  // Gold end finial
  ctx.fillStyle = "#C8A14E";
  ctx.beginPath();
  ctx.roundRect(-105, -5.5, 4, 11, [2, 0, 0, 2]);
  ctx.fill();

  // 3. Center Gold Band / Ring
  const goldGrad = ctx.createLinearGradient(0, -7.5, 0, 7.5);
  goldGrad.addColorStop(0, "#E6C66D");
  goldGrad.addColorStop(0.45, "#FFF1BF");
  goldGrad.addColorStop(1, "#B88E33");
  ctx.fillStyle = goldGrad;
  ctx.fillRect(32, -7.5, 7, 15);

  // 4. Section / Grip (sculpted matte charcoal resin grip)
  const gripGrad = ctx.createLinearGradient(0, -6.5, 0, 6.5);
  gripGrad.addColorStop(0, "#2B2A28");
  gripGrad.addColorStop(0.5, "#3D3B38");
  gripGrad.addColorStop(1, "#1C1B19");
  ctx.fillStyle = gripGrad;
  ctx.beginPath();
  ctx.moveTo(39, -7);
  ctx.lineTo(72, -5);
  ctx.lineTo(72, 5);
  ctx.moveTo(72, 5);
  ctx.lineTo(39, 7);
  ctx.closePath();
  ctx.fill();

  // 5. Nib Collar (polished gold ring)
  ctx.fillStyle = goldGrad;
  ctx.fillRect(72, -5.5, 3.5, 11);

  // 6. Classic Fountain Pen Nib (spade/arrowhead shaped dual-tone gold nib)
  const nibGrad = ctx.createLinearGradient(75, 0, 118, 0);
  nibGrad.addColorStop(0, "#DFC26C");
  nibGrad.addColorStop(0.55, "#F9E8A2");
  nibGrad.addColorStop(1, "#E5C362");

  ctx.fillStyle = nibGrad;
  ctx.beginPath();
  ctx.moveTo(75.5, -5.2);
  ctx.quadraticCurveTo(86, -7.2, 94, -5.8);
  ctx.lineTo(118, 0);
  ctx.lineTo(94, 5.8);
  ctx.quadraticCurveTo(86, 7.2, 75.5, 5.2);
  ctx.closePath();
  ctx.fill();

  // Nib central ink slit
  ctx.strokeStyle = isDark ? "#12110E" : "#2E2413";
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(88, 0);
  ctx.lineTo(118, 0);
  ctx.stroke();

  // Breather hole
  ctx.fillStyle = isDark ? "#12110E" : "#2E2413";
  ctx.beginPath();
  ctx.arc(88, 0, 1.4, 0, Math.PI * 2);
  ctx.fill();

  // Nib wing scrollwork engraving
  ctx.strokeStyle = "rgba(160, 120, 40, 0.45)";
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(78, -3.2);
  ctx.quadraticCurveTo(88, -4.8, 98, -2.8);
  ctx.moveTo(78, 3.2);
  ctx.quadraticCurveTo(88, 4.8, 98, 2.8);
  ctx.stroke();

  // 7. Fresh ink drop at the nib point ("done writing")
  ctx.fillStyle = isDark ? "rgba(111, 195, 158, 0.75)" : "rgba(31, 77, 58, 0.75)";
  ctx.beginPath();
  ctx.arc(125, 1.5, 2.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Generates an editorial square PNG card from a birthday wish using Canvas.
 * Downloads in square format (1080x1080) with downloader's current theme color.
 */
export async function generateLetterCard(
  data: LetterCardData
): Promise<{ blob: Blob; dataUrl: string }> {
  // Ensure web fonts are ready before rendering
  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.load('italic 400 36px "Newsreader"');
      await document.fonts.load('600 24px "Newsreader"');
      await document.fonts.ready;
    } catch {
      // Fallback
    }
  }

  // Square canvas (1080x1080)
  const width = 1080;
  const height = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to create canvas rendering context");
  }

  // Detect downloader's active theme
  const isDark =
    data.theme === "dark" ||
    (!data.theme &&
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"));

  // Palette matched to the downloader's theme
  const colors = isDark
    ? {
        bg: "#0F0E0C",
        outerBorder: "#272521",
        innerBorder: "#1E1C18",
        accent: "#4E9B7B",
        hairline: "#24221E",
        ink: "#F5F2EC",
        muted: "#8F8A7E",
        quote: "rgba(78, 155, 123, 0.22)",
        pillBg: "rgba(78, 155, 123, 0.15)",
        pillBorder: "rgba(78, 155, 123, 0.4)",
        pillText: "#6FC39E",
      }
    : {
        bg: "#F6F3EE",
        outerBorder: "#DDD6C8",
        innerBorder: "#E8E2D5",
        accent: "#1F4D3A",
        hairline: "#DDD6C8",
        ink: "#17150F",
        muted: "#6B665C",
        quote: "rgba(31, 77, 58, 0.22)",
        pillBg: "rgba(31, 77, 58, 0.08)",
        pillBorder: "rgba(31, 77, 58, 0.3)",
        pillText: "#1F4D3A",
      };

  // 1. Paper Background
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);

  // 2. Editorial Double Border Frame
  ctx.strokeStyle = colors.outerBorder;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  ctx.strokeStyle = colors.innerBorder;
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  // Corner accents
  const drawCorner = (x: number, y: number, dx: number, dy: number) => {
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + dx * 20, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * 20);
    ctx.stroke();
  };
  drawCorner(58, 58, 1, 1);
  drawCorner(width - 58, 58, -1, 1);
  drawCorner(58, height - 58, 1, -1);
  drawCorner(width - 58, height - 58, -1, -1);

  // Content horizontal margins
  const contentLeft = 84;
  const contentRight = width - 84;
  const contentWidth = contentRight - contentLeft;

  // 3. Top Header
  ctx.font = "600 13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.fillStyle = colors.accent;
  ctx.textBaseline = "middle";
  ctx.fillText("samkiel · chapter 20", contentLeft, 96);

  // Header Date
  const dateStr = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "October 11, 2026";

  ctx.font = "400 13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.fillStyle = colors.muted;
  ctx.textAlign = "right";
  ctx.fillText(dateStr, contentRight, 96);
  ctx.textAlign = "left";

  // Header Hairline Divider
  ctx.strokeStyle = colors.hairline;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(contentLeft, 126);
  ctx.lineTo(contentRight, 126);
  ctx.stroke();

  // 4. Message Text (Word Wrapping & Premium Editorial Typography)
  const maxTextWidth = contentWidth - 48;
  const msgLen = data.message.length;
  const fontSize = msgLen > 220 ? 32 : msgLen > 140 ? 36 : msgLen > 70 ? 42 : 46;
  const lineHeight = Math.round(fontSize * 1.5);
  ctx.font = `italic 400 ${fontSize}px "Newsreader", "Fraunces", Georgia, serif`;

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

  // Vertical placement inside square card
  // Header ends at 126; pen + footer begins at 840. Available space ~ 714px.
  const textBlockHeight = lines.length * lineHeight;
  const availableHeight = 720;
  const textStartY = 160 + Math.max(20, (availableHeight - textBlockHeight - 110) / 2);

  // Quotation mark ornament
  ctx.font = 'italic 400 64px "Newsreader", Georgia, serif';
  ctx.fillStyle = colors.quote;
  ctx.fillText("“", contentLeft, textStartY - 18);

  // Render wrapped editorial message lines
  ctx.font = `italic 400 ${fontSize}px "Newsreader", "Fraunces", Georgia, serif`;
  ctx.fillStyle = colors.ink;
  ctx.textBaseline = "middle";

  lines.forEach((line, i) => {
    ctx.fillText(line, contentLeft + 36, textStartY + i * lineHeight);
  });

  // 5. Dropped Fountain Pen Design ("as per done writing")
  // Rest gently between message text and footer line
  const penY = Math.min(880, Math.max(textStartY + textBlockHeight + 50, 780));
  const penX = contentLeft + 160;
  drawFountainPen(ctx, penX, penY, -0.22, isDark); // tilted ~-12.6 degrees

  // 6. Footer Area
  const footerLineY = 940;
  ctx.strokeStyle = colors.hairline;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(contentLeft, footerLineY);
  ctx.lineTo(contentRight, footerLineY);
  ctx.stroke();

  const footerY = 988;

  // Author Name
  ctx.font = '600 24px "Newsreader", "Fraunces", Georgia, serif';
  ctx.fillStyle = colors.ink;
  ctx.textBaseline = "middle";
  const authorName = data.name.trim() || "anonymous";
  ctx.fillText(authorName, contentLeft, footerY);

  const authorWidth = ctx.measureText(authorName).width;

  // Relationship Tag (if present)
  if (data.relationship) {
    const tagText = data.relationship.toLowerCase();
    ctx.font = "600 11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    const tagMetrics = ctx.measureText(tagText);
    const pillWidth = tagMetrics.width + 18;
    const pillHeight = 24;
    const pillX = contentLeft + authorWidth + 14;
    const pillY = footerY - pillHeight / 2;

    ctx.fillStyle = colors.pillBg;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 12);
    ctx.fill();

    ctx.strokeStyle = colors.pillBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 12);
    ctx.stroke();

    ctx.fillStyle = colors.pillText;
    ctx.fillText(tagText, pillX + 9, footerY);
  }

  // Footer site URL
  ctx.font = "400 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.fillStyle = colors.muted;
  ctx.textAlign = "right";
  const footerUrl = data.code
    ? `birthday.samkiel.dev/wish/${data.code}`
    : "birthday.samkiel.dev";
  ctx.fillText(footerUrl, contentRight, footerY);
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
 * Downloads a wish directly as a square PNG file using the downloader's active theme.
 */
export async function downloadLetterAsPng(data: LetterCardData): Promise<void> {
  const { blob } = await generateLetterCard(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const cleanName = data.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase() || "wish";
  a.href = url;
  a.download = `samkiel-wish-${cleanName}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Shares a wish via native Web Share API with image file fallback to download.
 */
export async function shareLetterAsPng(data: LetterCardData): Promise<void> {
  const { blob } = await generateLetterCard(data);
  const cleanName = data.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase() || "wish";
  const file = new File([blob], `samkiel-wish-${cleanName}.png`, { type: "image/png" });

  if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: `birthday wish from ${data.name} for samkiel`,
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
