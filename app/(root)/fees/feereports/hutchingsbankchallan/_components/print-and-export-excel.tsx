import * as XLSX from 'xlsx';
import type { IHutchingsBankChallanItem } from '@/types/fees/reports/hutchings_bank_challan';

export function printTable(tableId: string, title = 'Student Challan List') {
    const printWindow = window.open('', '', 'width=1200,height=800');
    if (!printWindow) return;

    const table = document.getElementById(tableId);
    if (!table) return;

    const clonedTable = table.cloneNode(true) as HTMLElement;

    // Remove action buttons column/elements in print view
    const noPrintElements = clonedTable.querySelectorAll('.no-print');
    noPrintElements.forEach((el) => el.remove());

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: 'Inter', 'Arial', sans-serif; padding: 20px; color: #1e293b; }
                h2 { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #0284c7; text-transform: uppercase; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
                th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
                th { background-color: #0284c7; color: white; font-weight: 600; text-transform: uppercase; font-size: 12px; }
                tr:nth-child(even) { background-color: #f8fafc; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
            </style>
        </head>
        <body>
            <h2>Hutchings High School & Junior College</h2>
            <h3 style="text-align: center; color: #475569; font-weight: 500; margin-top: -12px;">${title}</h3>
            ${clonedTable.outerHTML}
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 250);
}

export function exportToExcel(data: IHutchingsBankChallanItem[], fileName = 'Student_Challan_List') {
    if (!data || data.length === 0) return;

    const worksheetData = data.map((item, index) => ({
        'SLNO': item.slNo || index + 1,
        'Student Name': item.studentName || '',
        'Class Name': item.className || '',
        'Section Name': item.sectionName || '',
        'Adm No.': item.admNo || '',
        'Challan No.': item.challanNo || '',
        'Download Date': item.downloadDate || '',
        'Amount': item.amount || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Challan List');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
