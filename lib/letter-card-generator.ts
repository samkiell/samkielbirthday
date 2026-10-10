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
 * Draws a minimalist editorial pen nib emblem / colophon flanked by delicate hairline rules.
 * Replaces realistic pen illustrations with a refined publisher insignia.
 */
function drawEditorialInsignia(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  accentColor: string,
  hairlineColor: string
) {
  ctx.save();

  // 1. Subtle flanking hairline rules
  const ruleLength = 70;
  const gap = 22;

  ctx.strokeStyle = hairlineColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(centerX - gap - ruleLength, centerY);
  ctx.lineTo(centerX - gap, centerY);
  ctx.moveTo(centerX + gap, centerY);
  ctx.lineTo(centerX + gap + ruleLength, centerY);
  ctx.stroke();

  // 2. Center editorial fountain pen nib icon
  ctx.translate(centerX, centerY);
  ctx.strokeStyle = accentColor;
  ctx.fillStyle = accentColor;
  ctx.lineWidth = 1.4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Base collar
  ctx.beginPath();
  ctx.moveTo(-5.5, -11);
  ctx.lineTo(5.5, -11);
  ctx.stroke();

  // Symmetrical nib outline
  ctx.beginPath();
  ctx.moveTo(-5.5, -11);
  ctx.bezierCurveTo(-7.5, -4, -6.5, 3, 0, 11);
  ctx.bezierCurveTo(6.5, 3, 7.5, -4, 5.5, -11);
  ctx.stroke();

  // Breather hole
  ctx.beginPath();
  ctx.arc(0, -0.5, 1.3, 0, Math.PI * 2);
  ctx.fill();

  // Central ink slit
  ctx.beginPath();
  ctx.moveTo(0, 0.8);
  ctx.lineTo(0, 11);
  ctx.stroke();

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
  if (typeof document !== "undefined") {
    const fontId = "editorial-card-fonts";
    if (!document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@1,6..72,400;1,6..72,500;1,6..72,600&display=swap";
      document.head.appendChild(link);
    }
    if (document.fonts) {
      try {
        await document.fonts.load('italic 400 36px "Newsreader"');
        await document.fonts.load('600 24px "Newsreader"');
        await document.fonts.ready;
      } catch {
        // Fallback
      }
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
  const cleanMessage = data.message.replace(/^["“'”]+|["“'”]+$/g, "").trim();
  const quotedMessage = `“${cleanMessage}”`;

  const msgLen = quotedMessage.length;
  const fontSize = msgLen > 240 ? 30 : msgLen > 160 ? 34 : msgLen > 80 ? 40 : 46;
  const lineHeight = Math.round(fontSize * 1.55);
  ctx.font = `italic 400 ${fontSize}px "Newsreader", "Fraunces", Georgia, serif`;

  const words = quotedMessage.split(/\s+/);
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
  const textBlockHeight = lines.length * lineHeight;
  const availableHeight = 670;
  const textStartY = 160 + Math.max(20, (availableHeight - textBlockHeight) / 2);

  // Render wrapped editorial message lines (begins with “ and ends with ”)
  ctx.font = `italic 400 ${fontSize}px "Newsreader", "Fraunces", Georgia, serif`;
  ctx.fillStyle = colors.ink;
  ctx.textBaseline = "middle";

  lines.forEach((line, i) => {
    ctx.fillText(line, contentLeft + 24, textStartY + i * lineHeight);
  });

  // 5. Editorial Nib Insignia Divider ("done writing" publisher colophon)
  const insigniaY = Math.min(880, Math.max(textStartY + textBlockHeight + 48, 770));
  drawEditorialInsignia(ctx, width / 2, insigniaY, colors.accent, colors.hairline);

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
