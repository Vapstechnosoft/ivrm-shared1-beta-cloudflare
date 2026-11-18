import * as XLSX from 'xlsx';
export function printTable(columns: string[] | any[], rows: any[], title?: string) {
    const printWindow = window.open('', '', 'width=1200,height=800');
    if (!printWindow) return;

    // Handle different column formats
    let columnLabels: string[];
    let columnKeys: string[];

    if (Array.isArray(columns) && columns.length > 0 && typeof columns[0] === 'object') {
        // If columns is array of objects {key: string, label: string}
        columnLabels = columns.map((col) => col.label || col.key);
        columnKeys = columns.map((col) => col.key);
    } else {
        // If columns is array of strings
        columnLabels = columns as string[];
        columnKeys = columns as string[];
    }

    const tableHead = columnLabels.map((label) => `<th>${label}</th>`).join('');

    const tableRows = rows
        .map(
            (row) =>
                `<tr>
            ${columnKeys.map((key) => `<td>${row[key] ?? ''}</td>`).join('')}
        </tr>`
        )
        .join('');

    // Set the title for the print window
    const printTitle = title || 'Termwise Fee Report';

    printWindow.document.write(`
        <html>
        <head>
            <title>${printTitle}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h2 { text-align: center; margin-bottom: 10px; }
                .student-info { 
                    text-align: center; 
                    margin-bottom: 20px;
                    font-size: 14px;
                    color: #333;
                }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #333; padding: 6px; font-size: 12px; }
                th { background: #eaeaea; }
                tr:nth-child(even) td { background: #fafafa; }
                .sum-row { font-weight: bold; background: #f3f3f3 !important; }
                .date-row { background: #e8f4ff !important; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <h2>Fee Group Wise Students Report</h2>
            ${title ? `<div class="student-info">${title}</div>` : ''}
            <table>
                <thead>
                    <tr>${tableHead}</tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}

export function exportToExcel(groupedData: any[], fileName: string) {
    if (!groupedData || groupedData.length === 0) {
        console.warn('No data to export');
        return;
    }

    const workbook = XLSX.utils.book_new();

    // Process each group and create a separate sheet per class/section
    groupedData.forEach((group) => {
        const sheetName = `${group.className}${group.sectionName !== 'No Section' ? `_${group.sectionName}` : ''}`.slice(0, 31); // Excel sheet name max 31 chars

        // Prepare data for this group
        const dataForExcel: any[] = [];

        // Add header rows (title and group info)
        dataForExcel.push({
            A: `Class: ${group.className}${group.sectionName !== 'No Section' ? ` - Division ${group.sectionName}` : ''}`,
            B: '',
            C: '',
            D: '',
            E: '',
            F: '',
            G: ''
        });

        dataForExcel.push({
            A: `Total Students: ${group.students.length}`,
            B: '',
            C: '',
            D: '',
            E: '',
            F: '',
            G: ''
        });

        // Empty row as separator
        dataForExcel.push({ A: '', B: '', C: '', D: '', E: '', F: '', G: '' });

        // Table headers
        dataForExcel.push({
            A: 'Sl No',
            B: 'Admission No',
            C: 'Student Name',
            D: 'Term',
            E: 'Due amount till Date',
            F: 'Fine amount till Date',
            G: 'Total due amount'
        });

        // Add student data
        group.students.forEach((row: any, idx: number) => {
            // const currentDate = new Date().toLocaleDateString();
            dataForExcel.push({
                A: idx + 1,
                B: row.amsT_AdmNo || '-',
                C: row.studentName || '-',
                D: row.fmT_Name || '-',
                E: `₹${(row.balance || 0).toLocaleString()}`,
                F: `₹${(row.fine || 0).toLocaleString()}`,
                G: `₹${(row.totalDue || 0).toLocaleString()}`
            });
        });

        // Calculate group totals
        const groupTotals = {
            totalBalance: group.students.reduce((sum: number, s: any) => sum + (s.balance || 0), 0),
            totalFine: group.students.reduce((sum: number, s: any) => sum + (s.fine || 0), 0),
            totalDue: group.students.reduce((sum: number, s: any) => sum + (s.totalDue || 0), 0)
        };

        // Empty row before totals
        dataForExcel.push({ A: '', B: '', C: '', D: '', E: '', F: '', G: '' });

        // Add group totals row
        dataForExcel.push({
            A: 'Group Total:',
            B: '',
            C: '',
            D: '',
            E: `₹${groupTotals.totalBalance.toLocaleString()}`,
            F: `₹${groupTotals.totalFine.toLocaleString()}`,
            G: `₹${groupTotals.totalDue.toLocaleString()}`
        });

        // Convert to worksheet
        const worksheet = XLSX.utils.json_to_sheet(dataForExcel, { header: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], skipHeader: true });

        // Set column widths
        worksheet['!cols'] = [
            { wch: 10 }, // Sl No
            { wch: 15 }, // Admission No
            { wch: 25 }, // Student Name
            { wch: 15 }, // Term
            { wch: 20 }, // Due amount
            { wch: 20 }, // Fine amount
            { wch: 20 } // Total due amount
        ];

        // Apply styling (bold for headers)
        const headerRow = 3; // Row index for headers (0-based)
        for (let col = 0; col < 7; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: col });
            if (!worksheet[cellAddress]) continue;
            worksheet[cellAddress].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: 'E0E0E0' } }
            };
        }

        // Bold for group total row
        const totalRow = dataForExcel.length - 1;
        for (let col = 0; col < 7; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: totalRow, c: col });
            if (!worksheet[cellAddress]) continue;
            worksheet[cellAddress].s = {
                ...worksheet[cellAddress].s,
                font: { bold: true },
                fill: { fgColor: { rgb: 'F0F0F0' } }
            };
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    // If there's only one group, create a single sheet with all groups
    if (groupedData.length === 1) {
        XLSX.writeFile(workbook, `${fileName.replace(/[^a-z0-9]/gi, '_')}.xlsx`);
        return;
    }

    // For multiple groups, create a summary sheet and download
    XLSX.writeFile(workbook, `${fileName.replace(/[^a-z0-9]/gi, '_')}.xlsx`);
}

// Alternative: Single sheet with all groups (if you prefer one sheet instead of multiple)
export function exportToExcelSingleSheet(groupedData: any[], fileName: string) {
    if (!groupedData || groupedData.length === 0) {
        console.warn('No data to export');
        return;
    }

    const allData: any[] = [];
    let globalSlNo = 1;

    groupedData.forEach((group) => {
        // Add group header
        allData.push({
            '': `CLASS: ${group.className}${group.sectionName !== 'No Section' ? ` - DIVISION ${group.sectionName}` : ''}`,
            'Admission No': '',
            'Student Name': '',
            Term: '',
            'Due Amount': '',
            'Fine Amount': '',
            'Total Due': ''
        });

        allData.push({
            '': `Total Students: ${group.students.length}`,
            'Admission No': '',
            'Student Name': '',
            Term: '',
            'Due Amount': '',
            'Fine Amount': '',
            'Total Due': ''
        });

        allData.push({});

        // Add table headers
        allData.push({
            '': 'Sl No',
            'Admission No': 'Admission No',
            'Student Name': 'Student Name',
            Term: 'Term',
            'Due Amount': 'Due amount till Date',
            'Fine Amount': 'Fine amount till Date',
            'Total Due': 'Total due amount'
        });

        // Add student data
        group.students.forEach((row: any) => {
            allData.push({
                '': globalSlNo++,
                'Admission No': row.amsT_AdmNo || '-',
                'Student Name': row.studentName || '-',
                Term: row.fmT_Name || '-',
                'Due Amount': `₹${(row.balance || 0).toLocaleString()}`,
                'Fine Amount': `₹${(row.fine || 0).toLocaleString()}`,
                'Total Due': `₹${(row.totalDue || 0).toLocaleString()}`
            });
        });

        // Calculate group totals
        const groupTotals = {
            totalBalance: group.students.reduce((sum: number, s: any) => sum + (s.balance || 0), 0),
            totalFine: group.students.reduce((sum: number, s: any) => sum + (s.fine || 0), 0),
            totalDue: group.students.reduce((sum: number, s: any) => sum + (s.totalDue || 0), 0)
        };

        // Add empty row
        allData.push({});

        // Add group total
        allData.push({
            '': 'Group Total:',
            'Admission No': '',
            'Student Name': '',
            Term: '',
            'Due Amount': `₹${groupTotals.totalBalance.toLocaleString()}`,
            'Fine Amount': `₹${groupTotals.totalFine.toLocaleString()}`,
            'Total Due': `₹${groupTotals.totalDue.toLocaleString()}`
        });

        // Add spacer between groups
        allData.push({});
        allData.push({});
    });

    const worksheet = XLSX.utils.json_to_sheet(allData);

    // Set column widths
    worksheet['!cols'] = [
        { wch: 30 }, // Group header column
        { wch: 15 }, // Admission No
        { wch: 25 }, // Student Name
        { wch: 15 }, // Term
        { wch: 20 }, // Due Amount
        { wch: 20 }, // Fine Amount
        { wch: 20 } // Total Due
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fee Due Report');
    XLSX.writeFile(workbook, `${fileName.replace(/[^a-z0-9]/gi, '_')}.xlsx`);
}
