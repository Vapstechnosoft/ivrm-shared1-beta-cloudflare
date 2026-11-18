import { format } from 'date-fns';

export const printPFForm5 = (reportData: any, institution: any, reportMonth: string, reportYear: string) => {
    const printWindow = window.open('', '', 'width=1200,height=800');
    if (!printWindow) {
        alert('Please allow popups to print the report');
        return;
    }

    const dataList = reportData?.alldata || reportData?.pfreportdetails || [];

    const tableRows = dataList
        .map((record: any, index: number) => {
            const empName =
                `${record.hrmE_EmployeeFirstName || ''} ${record.hrmE_EmployeeMiddleName || ''} ${record.hrmE_EmployeeLastName || ''}`
                    .trim()
                    .toUpperCase();

            const stopPensionDate = record.hrmE_PensionStoppedDate ? format(new Date(record.hrmE_PensionStoppedDate), 'dd-MM-yyyy') : '-';

            const reason = record.hrmE_RetiredFlg ? 'Stop Pension' : record.hrmE_LeavingReason || '-';

            return `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td class="text-center">${record.hrmE_PFAccNo || '-'}</td>
                <td class="text-center">${empName}</td>
                <td class="text-center">${(record.fatherHusbandName || '-').toUpperCase()}</td>
                <td class="text-center">${stopPensionDate}</td>
                <td class="text-center">${reason}</td>
                <td class="text-center">${record.remarks || '-'}</td>
            </tr>
        `;
        })
        .join('');

    printWindow.document.write(`
        <html>
        <head>
            <title>PF Form 5 (P.S.)</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    padding: 20px; 
                    font-size: 12px;
                    color: #000;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .text-left { text-align: left; }
                .font-bold { font-weight: bold; }
                .text-blue { color: #2563eb; }
                .border-bottom { border-bottom: 1px solid #000; }
                
                h4 { margin: 2px 0; font-size: 16px; }
                h6 { margin: 2px 0; font-size: 11px; font-weight: bold; }
                
                .header-container { margin-bottom: 20px; text-align: center; }
                
                .info-table {
                    width: 100%;
                    margin-bottom: 15px;
                    border-collapse: collapse;
                }
                .info-table td {
                    padding: 5px;
                    vertical-align: top;
                }
                .info-label { font-weight: bold; width: 30%; }
                
                table.data-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 15px;
                    margin-bottom: 20px;
                }
                table.data-table th, table.data-table td { 
                    border: 1px solid #000; 
                    padding: 8px; 
                }
                table.data-table th { 
                    font-weight: bold;
                    font-size: 11px;
                }
                
                .footer-section { margin-top: 40px; }
                .note-text { 
                    font-size: 11px; 
                    line-height: 1.5; 
                    margin-bottom: 30px;
                    text-align: justify;
                }
                
                .signature-container {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 80px;
                }
                
                .sig-box {
                    border-top: 1px solid #000;
                    padding-top: 10px;
                    text-align: center;
                    min-width: 150px;
                    font-weight: bold;
                }

                @media print {
                    body { margin: 0; padding: 15px; }
                    .text-blue { color: #000 !important; }
                }
            </style>
        </head>
        <body>
            <div class="header-container">
                <h4 class="text-blue">FORM NO. 5(P.S.)</h4>
                <h4 class="text-blue">The Employees' Provident Fund Scheme, 1952[ Paragraph 36 (2) (a)]</h4>
                <h6 class="text-blue">AND</h6>
                <h4 class="text-blue">The Employees' Pension Fund Scheme, 1995[ Para 20 (4)]</h4>
            </div>
            
            <hr style="margin: 10px 0; border: 0; border-top: 1px solid #000;" />
            
            <div style="margin: 20px 0;">
                <p>
                    Return of Members of Leaving Service during the month of <span class="border-bottom font-bold">${reportMonth} - ${reportYear}</span>
                </p>
            </div>

            <table class="info-table">
                <tr>
                    <td style="width: 60%;">
                        <table style="width: 100%;">
                            <tr>
                                <td class="info-label">Name of Establishment :</td>
                                <td class="border-bottom text-left">St. James' School</td>
                            </tr>
                            <tr>
                                <td class="info-label">Address of the Factory/ Establishment :</td>
                                <td class="border-bottom text-left">
                                    165, Acharya Jagadish Chandra Bose Road, Entally, Kolkata, West Bengal 700014, Kolkata - 700014.
                                </td>
                            </tr>
                        </table>
                    </td>
                    <td style="width: 40%;">
                        <table style="width: 100%;">
                            <tr>
                                <td class="info-label" style="width: 60%;">Code No. of Factory/ Establishment :</td>
                                <td class="border-bottom text-left">WB/19651</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>

            <table class="data-table">
                <thead>
                    <tr>
                        <th>SL.No</th>
                        <th>Account No</th>
                        <th>Name of the Member<br/>(in BLOCK letters)</th>
                        <th>Father's Name or Husband's Name<br/>in case of married women</th>
                        <th>Date of Stop Pension</th>
                        <th>Reason</th>
                        <th>Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>

            <div class="footer-section">
                <div class="note-text">
                    <strong>Note :</strong> Please state whether the member is (a) retiring according to para 69 (1) (a) or (b) of the scheme; (b) leaving India for permanent settlement abroad; (c) retrenched; (d) ordinarily dismissed for serious and willful misconduct; (e) discharged; (f) resigning from or leaving service; (g) taking up employment elsewhere (the name and address of the new employer should be stated); (h) dead; (i) attained age of 58 years.
                </div>
                
                <div class="signature-container">
                    <div class="sig-box">Date</div>
                    <div class="sig-box" style="min-width: 300px;">Signature of the employer with Official Seal</div>
                </div>
            </div>
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 500);
};
