import * as XLSX from 'xlsx';

export function printTable(tableId: string) {
    const printWindow = window.open('', '', 'width=1200,height=800');
    if (!printWindow) return;

    const table = document.getElementById(tableId);
    if (!table) return;

    printWindow.document.write(`
        <html>
        <head>
            <title></title>
            <style>
                body { font-family: Arial; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #333; padding: 6px; font-size: 12px; }
                th { background: #eaeaea; }
                .no-print { display: none !important; }
            </style>
        </head>
        <body>
            <h3 style='text-align: center;'>Fee UserWise Daily Collection Report</h3>
            ${table.outerHTML}
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.print();
}

export function exportToExcel(data: any, fileName: string) {
    if (!data) return;

    let worksheetData: any[] = [];

    if (data.studentWise) {
        worksheetData = data.studentWise.map((item: any) => ({
            'Sl No': '',
            'Student Name': item.studentName,
            'Admission No': item.admissionNo,
            'Class Name': item.className,
            'Section Name': item.sectionName,
            Date: item.date ? item.date.split('T')[0] : '',
            'Mode Of Payment': item.modeOfPayment,
            'Bank Name': item.bankName,
            'Cheque No': item.ddOrChequeNo,
            'Head Name': item.fmhFeeName,
            Amount: item.amount || item.totalAmount || 0,
            'Receipt No': item.receiptNo,
            GeneratedBy: item.generatedBy
        }));
    } else if (data.totalCollection) {
        worksheetData = data.totalCollection.map((item: any) => ({
            'Sl No': '',
            Date: item.date ? item.date.split('T')[0] : '',
            'Mode Of Payment': item.modeOfPayment,
            'Total Amount': item.totalAmount || 0,
            'Receipt No': item.receiptNo,
            GeneratedBy: item.generatedBy
        }));
    }

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
