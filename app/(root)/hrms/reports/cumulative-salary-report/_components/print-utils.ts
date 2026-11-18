export const printCumulativeSalaryReport = (reportData: any, month: string, year: string) => {
    const printWindow = window.open('', '', 'width=1200,height=800');
    if (!printWindow) {
        alert('Please allow popups to print the report');
        return;
    }

    const records = Array.isArray(reportData) ? reportData : [];
    const currentDate = new Date();

    const uniqueEarnings = new Map();
    const uniqueDeductions = new Map();

    records.forEach((row: any) => {
        (row.earningresult || []).forEach((e: any) => {
            if (!uniqueEarnings.has(e.hrmeD_Id)) uniqueEarnings.set(e.hrmeD_Id, e);
        });
        (row.deductionresult || []).forEach((d: any) => {
            if (!uniqueDeductions.has(d.hrmeD_Id)) uniqueDeductions.set(d.hrmeD_Id, d);
        });
    });

    const earnings = Array.from(uniqueEarnings.values()).sort((a: any, b: any) => a.hrmeD_Order - b.hrmeD_Order);
    const deductions = Array.from(uniqueDeductions.values()).sort((a: any, b: any) => a.hrmeD_Order - b.hrmeD_Order);

    const earningHeaders = earnings.map((head: any) => `<th class="text-right">${head.hrmeD_Name}</th>`).join('');

    const deductionHeaders = deductions.map((head: any) => `<th class="text-right">${head.hrmeD_Name}</th>`).join('');

    const tableRows = records
        .map((record: any, index: number) => {
            const earningCells = earnings
                .map((head: any) => {
                    const val = (record.earningresult || []).find((e: any) => e.hrmeD_Id === head.hrmeD_Id);
                    return `<td class="text-right">${val ? val.hresD_Amount : 0}</td>`;
                })
                .join('');

            const deductionCells = deductions
                .map((head: any) => {
                    const val = (record.deductionresult || []).find((d: any) => d.hrmeD_Id === head.hrmeD_Id);
                    return `<td class="text-right">${val ? val.hresD_Amount : 0}</td>`;
                })
                .join('');

            return `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>${record.hrmE_EmployeeCode || ''}</td>
                <td>${record.hrmE_EmployeeFirstName || ''}</td>
                <td>${record.hrmdeS_DesignationName || ''}</td>
                <td class="text-center">${record.hreS_WorkingDays || 0}</td>
                <td class="text-right">${record.empGrossSal || 0}</td>
                ${earningCells}
                <td class="text-right font-bold">${record.grossEarning || 0}</td>
                ${deductionCells}
                <td class="text-right font-bold">${record.grossDeduction || 0}</td>
                <td class="text-right font-bold">${record.netSalary || 0}</td>
            </tr>
        `;
        })
        .join('');

    printWindow.document.write(`
        <html>
        <head>
            <title>Cumulative Salary Report</title>
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
                Cumulative Salary Report - ${month} ${year}
            </div>

            <div class="info-box">
                <div style="width: 48%">
                    
                </div>
                <div style="width: 48%; float: right;">
                    <div class="info-row" style="float: right;">
                        <span class="info-label">Date:</span>
                        <span class="info-value">${currentDate.toLocaleDateString('en-GB')}</span>
                    </div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th class="text-left" style="width: 30px">Sl.No</th>
                        <th class="text-left">Employee Code</th>
                        <th class="text-left">Employee Name</th>
                        <th class="text-left">Designation</th>
                        <th class="text-center">Working Days</th>
                        <th class="text-right">Gross Salary</th>
                        ${earningHeaders}
                        <th class="text-right">Gross Earning</th>
                        ${deductionHeaders}
                        <th class="text-right">Total Deductions</th>
                        <th class="text-right">Net Pay</th>
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
