export async function generatePdf(el) {
    const [{ jsPDF }, html2canvas] = await Promise.all([
        import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
            .then(m => m.jspdf),
        import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
            .then(m => m.default)
    ]);

    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#fff' });
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const imgProps = pdf.getImageProperties(canvas);
    const pdfW = 190;
    const pdfH = (imgProps.height * pdfW) / imgProps.width;

    pdf.addImage(canvas, 'PNG', 10, 10, pdfW, pdfH);
    pdf.save(`CAM_Report_${Date.now()}.pdf`);
}