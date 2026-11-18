'use client';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

type Props = {
    cash: number;
    bank: number;
    online: number;
    rtgs: number;
    card: number;
    ecs: number;
    cashRefund: number;
    bankRefund: number;
    defaulters: number;
};

export function FeeMonthEndChart({ cash, bank, online, rtgs, card, ecs, cashRefund, bankRefund, defaulters }: Props) {
    const data = [
        { name: 'Cash', Count: cash },
        { name: 'Bank', Count: bank },
        { name: 'Online', Count: online },
        { name: 'RTGS', Count: rtgs },
        { name: 'Card', Count: card },
        { name: 'ECS', Count: ecs },
        { name: 'CashRefund', Count: cashRefund },
        { name: 'BankRefund', Count: bankRefund },
        { name: 'Defaulters', Count: defaulters }
    ];

    return (
        <div className='mt-6 border p-4'>
            <ResponsiveContainer width='100%' height={300}>
                <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='name' />
                    <YAxis interval={1} />
                    <Legend />
                    <Bar dataKey='Count' fill='#FFD700' /> {/* gold */}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function ExportToExcelData(
    reportData: any,
    formattedDate: string,
    _schoolLogoUrl?: string,
    monthlabel?: string,
    iename?: string,
    academicYearLabel?: string,
    designation?: string,
    schoolName?: string
) {
    if (!reportData) {
        toast.error('No data to export');
        return;
    }

    const monthUpper = (monthlabel || '').toUpperCase();
    const instName = schoolName || process.env.NEXT_PUBLIC_SCHOOL_NAME || 'SCHOOL / INSTITUTION';
    const reportTitle = `SCHOOL FEES ${monthUpper ? `${monthUpper} ` : ''}MONTH REPORT`;
    const ieDesignation = designation || 'Implementation Engineer';
    const ieNameVal = iename || reportData.iename || '-';
    const academicYearVal = academicYearLabel || reportData.academicYear || '-';

    const smsCount = Number(reportData.smsCount || 0);
    const emailCount = Number(reportData.emailCount || 0);
    const cashCount = Number(reportData.cashCount || 0);
    const bankCount = Number(reportData.bankCount || 0);
    const onlineCount = Number(reportData.onlineCount || 0);
    const rtgsCount = Number(reportData.rtgs || 0);
    const cardCount = Number(reportData.cardCount || 0);
    const ecsCount = Number(reportData.ecs || 0);
    const refundCount = Number(reportData.refund || 0);
    const refundBankCount = Number(reportData.refundBank || 0);
    const defaultersCount = Number(reportData.defaulters || 0);

    const totalCount =
        cashCount + bankCount + onlineCount + rtgsCount + cardCount + ecsCount + refundCount + refundBankCount + defaultersCount;

    // Build worksheet data row-by-row
    const worksheetData: (string | number)[][] = [
        // Title Rows
        [instName, '', '', '', ''],
        [reportTitle, '', '', '', ''],
        ['', '', '', '', ''],

        // Info Section (Rows 3, 4, 5)
        ['Name :', ieNameVal, 'Date :', formattedDate, ''],
        ['Designation :', ieDesignation, 'Academic Year :', academicYearVal, ''],
        ['Total SMS :', smsCount, 'Total Email :', emailCount, ''],
        ['', '', '', '', ''],

        // Table Header (Row 7)
        ['SL.NO', 'Name', 'Count', 'Kiosk', 'Portal and Dashboard'],

        // Data Rows (Rows 8 to 16)
        [1, 'Fee Collection By Cash', cashCount, 0, 0],
        [2, 'Fee Collection By Bank', bankCount, 0, 0],
        [3, 'Fee Collection By Online', onlineCount, 0, 0],
        [4, 'Fee Collection By RTGS', rtgsCount, 0, 0],
        [5, 'Fee Collection By Card', cardCount, 0, 0],
        [6, 'Fee Collection By ECS', ecsCount, 0, 0],
        [7, 'Fee Refund By Cash', refundCount, 0, 0],
        [8, 'Fee Refund By Bank', refundBankCount, 0, 0],
        [9, 'Fee Defaulters', defaultersCount, 0, 0],

        // Total Row (Row 17)
        ['Total', '', totalCount, 0, 0],
        ['', '', '', '', ''],

        // Footer / Signatures (Rows 19 to 22)
        ['', '', '', '', ''],
        ['Implementation Engineer: _______________', '', '', 'Nodal Officer: _______________', ''],
        ['', '', '', '', ''],
        ['End User: _______________', '', '', 'Seal', '']
    ];

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Explicit column widths
    ws['!cols'] = [
        { wch: 18 }, // Col A: SL.NO / Info labels
        { wch: 34 }, // Col B: Name / Particulars / Info values
        { wch: 18 }, // Col C: Count / Info labels
        { wch: 20 }, // Col D: Kiosk / Signatures
        { wch: 26 } // Col E: Portal and Dashboard
    ];

    // Merges
    ws['!merges'] = [
        // Title merges across columns A to E
        { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },

        // Info table D-E merges for values
        { s: { r: 3, c: 3 }, e: { r: 3, c: 4 } },
        { s: { r: 4, c: 3 }, e: { r: 4, c: 4 } },
        { s: { r: 5, c: 3 }, e: { r: 5, c: 4 } },

        // Total row A-B merge
        { s: { r: 17, c: 0 }, e: { r: 17, c: 1 } },

        // Signatures merges
        { s: { r: 20, c: 0 }, e: { r: 20, c: 1 } },
        { s: { r: 20, c: 3 }, e: { r: 20, c: 4 } },
        { s: { r: 22, c: 0 }, e: { r: 22, c: 1 } },
        { s: { r: 22, c: 3 }, e: { r: 22, c: 4 } }
    ];

    // Apply fine-tuned cell styles
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:E23');
    const thinBorder = {
        top: { style: 'thin', color: { rgb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { rgb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { rgb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { rgb: 'FFCBD5E1' } }
    };
    const darkBorder = {
        top: { style: 'thin', color: { rgb: 'FF000000' } },
        bottom: { style: 'thin', color: { rgb: 'FF000000' } },
        left: { style: 'thin', color: { rgb: 'FF000000' } },
        right: { style: 'thin', color: { rgb: 'FF000000' } }
    };

    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };

            // Title row 1 (School Name)
            if (R === 0) {
                ws[cellAddress].s = {
                    font: { name: 'Calibri', sz: 14, bold: true, color: { rgb: 'FF1E293B' } },
                    alignment: { horizontal: 'center', vertical: 'center' }
                };
            }
            // Title row 2 (Report Name)
            else if (R === 1) {
                ws[cellAddress].s = {
                    font: { name: 'Calibri', sz: 12, bold: true, color: { rgb: 'FF1E3A8A' } },
                    alignment: { horizontal: 'center', vertical: 'center' }
                };
            }
            // Info table rows (Rows 3, 4, 5)
            else if (R >= 3 && R <= 5) {
                const isLabelCol = C === 0 || C === 2;
                ws[cellAddress].s = {
                    font: { name: 'Calibri', sz: 10, bold: isLabelCol, color: { rgb: 'FF0F172A' } },
                    alignment: {
                        horizontal: isLabelCol ? 'left' : C === 1 && R === 5 ? 'center' : 'left',
                        vertical: 'center'
                    },
                    fill: isLabelCol ? { fgColor: { rgb: 'FFF1F5F9' } } : undefined,
                    border: thinBorder
                };
            }
            // Table Header row (Row 7)
            else if (R === 7) {
                ws[cellAddress].s = {
                    font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFFFF' } },
                    alignment: { horizontal: C === 1 ? 'left' : 'center', vertical: 'center' },
                    fill: { fgColor: { rgb: 'FF1E3A8A' } },
                    border: darkBorder
                };
            }
            // Table Data rows (Rows 8 to 16)
            else if (R >= 8 && R <= 16) {
                const isEven = R % 2 === 0;
                ws[cellAddress].s = {
                    font: { name: 'Calibri', sz: 10, color: { rgb: 'FF1E293B' } },
                    alignment: {
                        horizontal: C === 0 ? 'center' : C === 1 ? 'left' : 'center',
                        vertical: 'center'
                    },
                    fill: isEven ? { fgColor: { rgb: 'FFF8FAFC' } } : undefined,
                    border: thinBorder
                };
            }
            // Total Row (Row 17)
            else if (R === 17) {
                ws[cellAddress].s = {
                    font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FF0F172A' } },
                    alignment: {
                        horizontal: C === 0 || C === 1 ? 'center' : 'center',
                        vertical: 'center'
                    },
                    fill: { fgColor: { rgb: 'FFE2E8F0' } },
                    border: {
                        top: { style: 'thin', color: { rgb: 'FF000000' } },
                        bottom: { style: 'double', color: { rgb: 'FF000000' } },
                        left: { style: 'thin', color: { rgb: 'FFCBD5E1' } },
                        right: { style: 'thin', color: { rgb: 'FFCBD5E1' } }
                    }
                };
            }
            // Signatures (Rows 20, 22)
            else if (R === 20 || R === 22) {
                ws[cellAddress].s = {
                    font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: 'FF334155' } },
                    alignment: { horizontal: 'left', vertical: 'center' }
                };
            }
        }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fee Month End Report');

    const cleanDate = formattedDate.replace(/[\s,]+/g, '_');
    const cleanMonth = monthUpper ? `${monthUpper}_` : '';
    XLSX.writeFile(wb, `Fee_Month_End_Report_${cleanMonth}${cleanDate}.xlsx`);
}

export function ExporttoPrint(htmlContent: string) {
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(`
        <html>
            <head>
                <title>Fee Month End Report</title>

                <style>
                   @page {
    size: A4 landscape;
    margin: 12mm;
}

html, body {
    margin: 0;
    padding: 0;
    background: white;
    font-family: Arial, sans-serif;
}

/* REMOVE flex from body */
body {
    width: 100%;
}

/* Center the printable content */
.print-container {
    width: 100%;
    max-width: 297mm;
    margin: 0 auto;     /* ✅ THIS centers horizontally */
    box-sizing: border-box;
}

/* Tables */
table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
}

th, td {
    border: 1px solid #000;
    padding: 6px;
}

/* Logo */
img {
    display: block;
    margin: 0 auto;
    max-height: 100px;
}

/* Page break helper */
.page-break {
    page-break-before: always;
}

/* Hide buttons */
button {
    display: none !important;
}

                </style>
            </head>

            <body>
                <div class="print-container">
                    ${htmlContent}
                </div>
            </body>
        </html>
    `);

    printWindow.document.close();

    // ✅ Wait for images to load
    const waitForImages = () => {
        const images = printWindow.document.images;
        let loaded = 0;

        if (images.length === 0) {
            triggerPrint();
            return;
        }

        for (const img of images) {
            img.onload = img.onerror = () => {
                loaded++;
                if (loaded === images.length) {
                    triggerPrint();
                }
            };
        }
    };

    const triggerPrint = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    waitForImages();
}
