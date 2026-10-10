import { NextResponse } from "next/server";
import { getApprovedWishes } from "@/lib/wishes-service";
import { recordServerEvent } from "@/lib/analytics-service";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#F6F3EE",
    color: "#17150F",
    padding: 40,
    fontFamily: "Helvetica",
  },
  coverPage: {
    backgroundColor: "#F6F3EE",
    color: "#17150F",
    padding: 60,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    height: "100%",
    fontFamily: "Helvetica",
  },
  coverTitle: {
    fontSize: 32,
    marginBottom: 8,
    color: "#1F4D3A",
    fontWeight: "bold",
  },
  coverSub: {
    fontSize: 16,
    color: "#6B665C",
    marginBottom: 24,
    fontStyle: "italic",
  },
  coverMeta: {
    fontSize: 11,
    color: "#6B665C",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  pageTitle: {
    fontSize: 18,
    color: "#1F4D3A",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD6C8",
    fontWeight: "bold",
  },
  wishCard: {
    marginBottom: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#DDD6C8",
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  wishMessage: {
    fontSize: 11,
    lineHeight: 1.5,
    color: "#17150F",
    marginBottom: 8,
  },
  wishFooter: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#EEE8DD",
    paddingTop: 6,
  },
  wishAuthor: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1F4D3A",
  },
  wishTag: {
    fontSize: 9,
    color: "#6B665C",
  },
  wishDate: {
    fontSize: 9,
    color: "#6B665C",
  },
});

function WishesPdfDocument({ wishes }: { wishes: Array<{ id: string; name: string; message: string; relationship?: string; createdAt: string }> }) {
  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverTitle}>Two Decades In. Still Becoming.</Text>
        <Text style={styles.coverSub}>Letters for samkiel at Twenty</Text>
        <Text style={styles.coverMeta}>October 11, 2026 · birthday.samkiel.dev</Text>
      </Page>

      {/* Wishes Content Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageTitle}>Letters for this chapter</Text>

        {wishes.map((w) => (
          <View key={w.id} style={styles.wishCard} wrap={false}>
            <Text style={styles.wishMessage}>{w.message}</Text>
            <View style={styles.wishFooter}>
              <View style={{ display: "flex", flexDirection: "row", gap: 6 }}>
                <Text style={styles.wishAuthor}>{w.name}</Text>
                {w.relationship ? (
                  <Text style={styles.wishTag}>({w.relationship})</Text>
                ) : null}
              </View>
              <Text style={styles.wishDate}>
                {new Date(w.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function GET() {
  try {
    await recordServerEvent("pdf_download");
    const { wishes } = await getApprovedWishes(1, 100);
    const pdfBuffer = await renderToBuffer(
      <WishesPdfDocument wishes={wishes} />
    );

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="letters-for-samkiel.pdf"',
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
