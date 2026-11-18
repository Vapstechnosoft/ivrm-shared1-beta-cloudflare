import * as XLSX from 'xlsx';
import type { IFeeChallanReportItem } from '@/types/fees/reports/reports';

export function printTable(tableId: string, title = 'Fee Challan Report') {
    const printWindow = window.open('', '', 'width=1200,height=800');
    if (!printWindow) return;

    const table = document.getElementById(tableId);
    if (!table) return;

    // Clone table to avoid mutating original DOM
    const clonedTable = table.cloneNode(true) as HTMLElement;

    // Remove no-print elements or checkbox columns if desired
    const noPrintElements = clonedTable.querySelectorAll('.no-print');
    noPrintElements.forEach((el) => el.remove());

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: 'Arial', sans-serif; padding: 20px; color: #333; }
                h2 { text-align: center; text-transform: uppercase; margin-bottom: 20px; color: #1e3a8a; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 12px; text-align: left; }
                th { background-color: #007bff; color: white; font-weight: bold; text-align: center; }
                tr:nth-child(even) { background-color: #f8fafc; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
            </style>
        </head>
        <body>
            <h2>${title}</h2>
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

export function exportToExcel(data: IFeeChallanReportItem[], fileName = 'Fee_Challan_Report') {
    if (!data || data.length === 0) return;

    const worksheetData = data.map((item, index) => ({
        'SL.No': item.slNo || index + 1,
        'Student Name': item.name || '',
        'Roll No': item.amay_rollno || '',
        'Class': item.asmcl_classname || '',
        'Section': item.asmc_sectionname || '',
        'Challan No': item.fyp_challanno || '',
        'Amount': item.fyp_tot_amount || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fee Challan Report');

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
