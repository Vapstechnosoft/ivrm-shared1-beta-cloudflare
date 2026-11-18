export const printPFForm6A = (reportData: any[] | null, fullReportData: any, institution: any, fromDateStr: string, toDateStr: string) => {
    const printWindow = window.open('', '', 'width=1200,height=800');
    if (!printWindow) {
        alert('Please allow popups to print the report');
        return;
    }

    const tableRows = reportData
        ?.map((record: any, index: number) => {
            return `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>${record.hrmE_PFAccNo || ''}</td>
                <td>${record.hrmE_PFuAN || ''}</td>
                <td>${(`${record.hrmE_EmployeeFirstName || ''} ${record.hrmE_EmployeeMiddleName || ''} ${record.hrmE_EmployeeLastName || ''}`).trim()}</td>
                <td class="text-right">${Number(record.amountofWages || 0).toFixed(2)}</td>
                <td class="text-right">${Number(record.basicvalue || 0).toFixed(2)}</td>
                <td class="text-right">${Number(record.davalue || 0).toFixed(2)}</td>
                <td class="text-right">${Number(record.hreS_EPF || 0).toFixed(2)}</td>
                <td class="text-right">${Number(record.hreS_FPF || 0).toFixed(2)}</td>
                <td class="text-right">${Number(record.hreS_Ac21 || 0).toFixed(2)}</td>
                <td class="text-right">${Number(record.hreS_Ac22 || 0).toFixed(2)}</td>
                <td class="text-right">${Number(record.hreS_Ac5 || 0).toFixed(2)}</td>
            </tr>
        `;
        })
        .join('');

    const statRateOfContribution = (
        Number.parseFloat(fullReportData?.payrollStandard?.[0]?.hrC_EPFPer || fullReportData?.payrollstandard?.[0]?.hrC_EPFPer || '0') +
            Number.parseFloat(
                fullReportData?.payrollStandard?.[0]?.hrC_FPFPer || fullReportData?.payrollstandard?.[0]?.hrC_FPFPer || '0'
            ) || 0
    ).toFixed(2);
    const codeNo =
        fullReportData?.payrollStandard?.[0]?.hrC_PFAccNoPrefix || fullReportData?.payrollstandard?.[0]?.hrC_PFAccNoPrefix || 'PF';
    const address = `${fullReportData?.currentInstuteAddress || institution?.mI_Address1}, ${institution?.ivrmmcT_Name} - ${institution?.mI_Pincode}.`;

    printWindow.document.write(`
        <html>
        <head>
            <title>PF Form 6A</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    padding: 20px; 
                    font-size: 11px;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .text-left { text-align: left; }
                .font-bold { font-weight: bold; }
                .border-bottom { border-bottom: 1px solid #000; }
                
                h4 { margin: 5px 0; font-size: 14px; }
                h6 { margin: 5px 0; font-size: 12px; font-weight: normal; }
                
                .header-container { margin-bottom: 20px; }
                
                .info-table {
                    width: 100%;
                    margin-bottom: 15px;
                }
                .info-table td {
                    padding: 4px;
                    vertical-align: top;
                }
                .info-label { font-weight: bold; }
                
                table.data-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 10px;
                    margin-bottom: 20px;
                    font-size: 10px;
                }
                table.data-table th, table.data-table td { 
                    border: 1px solid #000; 
                    padding: 4px; 
                }
                table.data-table th { 
                    background-color: #f0f0f0; 
                    font-weight: bold;
                }
                
                .footer-section { margin-top: 30px; }
                .footer-text { margin-bottom: 10px; line-height: 1.4; }
                .signature-box { 
                    margin-top: 60px; 
                    text-align: center; 
                    float: right;
                }
                .signature-line {
                    border-top: 1px solid #000;
                    padding-top: 5px;
                    width: 250px;
                    font-weight: bold;
                }

                @media print {
                    body { margin: 0; padding: 10px; }
                }
            </style>
        </head>
        <body>
            <div class="header-container">
                <div class="text-right">
                    <h4>Form 6A</h4>
                </div>
                <div class="text-center">
                    <h4>THE EMPLOYEES' PROVIDENT FUND SCHEME, 1952(PARAGRAPH 43)</h4>
                    <h6> AND</h6>
                    <h4>THE EMPLOYEE'S PENSION SCHEME, 1995( PARAGRAPH 20 (4))</h4>
                    <h6>Annual Statement OF Contribution for the currency period from <span class="border-bottom font-bold">${fromDateStr}</span> to <span class="border-bottom font-bold">${toDateStr}</span></h6>
                </div>
                <hr style="margin: 15px 0;" />
                
                <table class="info-table">
                    <tr>
                        <td style="width: 60%;">
                            <table style="width: 100%;">
                                <tr>
                                    <td style="width: 35%;" class="info-label">Name of Establishment :</td>
                                    <td class="border-bottom text-left">${institution?.mI_Name || ''}</td>
                                </tr>
                                <tr>
                                    <td class="info-label">Address of the Factory/ Establishment :</td>
                                    <td class="border-bottom text-left">${address}</td>
                                </tr>
                                <tr>
                                    <td class="info-label">Code No. of Factory/ Establishment :</td>
                                    <td class="border-bottom text-left">${codeNo}</td>
                                </tr>
                            </table>
                        </td>
                        <td style="width: 40%;">
                            <table style="width: 100%;">
                                <tr>
                                    <td style="width: 60%;" class="info-label">Stat. Rate of Contribution :</td>
                                    <td class="border-bottom text-left">${statRateOfContribution}</td>
                                </tr>
                                <tr>
                                    <td class="info-label">No. of member voluntarily Contribution at a higher rate :</td>
                                    <td class="border-bottom text-left"></td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </div>

            <table class="data-table">
                <thead>
                    <tr>
                        <th>SL.No</th>
                        <th>PF Acc No</th>
                        <th>UAN</th>
                        <th>Employee Name</th>
                        <th>Wages</th>
                        <th>Basic</th>
                        <th>DA</th>
                        <th>EPF</th>
                        <th>FPF</th>
                        <th>Ac 21</th>
                        <th>Ac 22</th>
                        <th>Ac 5</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>

            <div class="footer-section">
                <div class="font-bold" style="margin-bottom: 10px;">
                    Reconsilation of Remittance
                </div>
                <div class="footer-text">
                    (1) Certified that the difference between the figures of total contribution and Administration charges remitted during the currency period and those shown under columns (5) to (7) above is shown due to the rounding of the amounts to the nearest rupee under the rates.
                </div>
                <div class="footer-text">
                    (2) Certified the Form 3-A duly completed of all the members listed in this statement are enclosed except those already sent during the course of currency period for the final settlement of the concerned members account vide Remarks furnished against the names of respective members above.
                </div>
                
                <div class="signature-box">
                    <div class="signature-line">Signature of the employer with Official Seal</div>
                </div>
            </div>
            
            <div style="clear: both;"></div>
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 250);
};
