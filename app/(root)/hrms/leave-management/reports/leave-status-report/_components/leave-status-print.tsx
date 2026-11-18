export const printLeaveStatusReport = (reportData: any) => {
    const printWindow = window.open('', '', 'width=1200,height=800');
    if (!printWindow) {
        alert('Please allow popups to print the report');
        return;
    }

    const tableRows = reportData
        .map((record: any, index: number) => {
            // Calculate totals for this row

            return `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>${record.hrmE_EmployeeCode || ''}</td>
                <td>${record.hrmE_EmployeeName || ''} </td>
                <td>${record.hrmL_LeaveName || ''} </td>
                <td>${record.hrelS_TotalLeaves || ''}</td>
                <td>${record.hrelS_TransLeaves || 0}</td>
                <td>${record.hrelS_CBLeaves || ''}</td>
               
            </tr>
        `;
        })
        .join('');

    printWindow.document.write(`
        <html>
        <head>
            <title></title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    padding: 20px; 
                    font-size: 10px;
                }
                .header-container {
                    text-align: center;
                    border-bottom: 2px solid #ccc;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                    position: relative;
                }
                .logo {
                    position: absolute;
                    left: 0;
                    top: 0;
                    height: 80px;
                }
                .institution-name {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2e57a0;
                    text-transform: uppercase;
                    margin: 0;
                }
                .report-title {
                    text-align: center;
                    font-weight: bold;
                    text-transform: uppercase;
                    margin: 10px 0;
                    font-size: 14px;
                }
                .info-box {
                    width: 100%;
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                }
                .info-row {
                    display: flex;
                    width: 48%;
                    margin-bottom: 5px;
                }
                .info-label {
                    font-weight: bold;
                    width: 100px;
                }
                .info-value {
                    flex: 1;
                    border-bottom: 1px dotted #000;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 10px;
                    font-size: 9px;
                }
                th, td { 
                    border: 1px solid #000; 
                    padding: 4px; 
                }
                th { 
                    background-color: #f0f0f0; 
                    font-weight: bold;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .text-left { text-align: left; }
                .font-bold { font-weight: bold; }
                
                .footer {
                    margin-top: 40px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    font-size: 11px;
                }
                .signature-block {
                    margin-bottom: 30px;
                }
                .line {
                    border-bottom: 1px solid #000;
                    width: 80%;
                    margin-bottom: 5px;
                }
                .right-align {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    text-align: right;
                }

                @media print {
                    body { margin: 0; padding: 10px; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
           
            <div class="report-title">
                Leave Status Report
            </div>
            <table>
                <thead>
                    <tr>
                        <th class="text-left" style="width: 30px">Sl.No</th>
                        <th class="text-left">Employee Code</th>
                        <th class="text-left">Employee Name</th>
                        <th class="text-left">Leave Type</th>
                        <th class="text-center">Total Leaves</th>
                        
                        <th class="text-right">Leaves Used</th>
                        
                        <th class="text-right">Leave Balance</th>
                       
                    </tr>
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
    // Allow a small delay for images to load if needed
    setTimeout(() => {
        printWindow.print();
    }, 250);
};
