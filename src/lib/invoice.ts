import jsPDF from "jspdf";

interface InvoiceData {
  orderId: string;
  date: string;
  customerName: string;
  customerEmail: string;
  productTitle: string;
  amount: number;
  storeName: string;
  storeContact?: string | null;
}

export const generateInvoicePDF = (data: InvoiceData) => {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  // Header bar
  doc.setFillColor(76, 29, 149); // violet
  doc.rect(0, 0, pageW, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("FACTURE", 14, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Dukaio", pageW - 14, 18, { align: "right" });

  // Invoice meta
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(10);
  doc.text(`N° de commande : ${data.orderId.slice(0, 8).toUpperCase()}`, 14, 42);
  doc.text(`Date : ${new Date(data.date).toLocaleDateString("fr-FR")}`, 14, 48);

  // From / To
  doc.setFont("helvetica", "bold");
  doc.text("Vendeur", 14, 64);
  doc.text("Client", pageW / 2 + 4, 64);
  doc.setFont("helvetica", "normal");
  doc.text(data.storeName, 14, 70);
  if (data.storeContact) doc.text(String(data.storeContact), 14, 76);
  doc.text(data.customerName, pageW / 2 + 4, 70);
  doc.text(data.customerEmail, pageW / 2 + 4, 76);

  // Line item box
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 248, 250);
  doc.rect(14, 92, pageW - 28, 30, "FD");
  doc.setFont("helvetica", "bold");
  doc.text("Description", 18, 100);
  doc.text("Montant", pageW - 18, 100, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text(data.productTitle.slice(0, 60), 18, 112);
  doc.text(`${data.amount.toLocaleString("fr-FR")} FCFA`, pageW - 18, 112, { align: "right" });

  // Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total", pageW - 60, 138);
  doc.text(`${data.amount.toLocaleString("fr-FR")} FCFA`, pageW - 18, 138, { align: "right" });

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("Merci pour votre achat. Document généré automatiquement par Dukaio.", 14, 280);

  doc.save(`facture-${data.orderId.slice(0, 8)}.pdf`);
};
