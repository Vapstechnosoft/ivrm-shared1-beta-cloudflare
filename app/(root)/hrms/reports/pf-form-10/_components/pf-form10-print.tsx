import { format } from 'date-fns';

export const printPFForm10 = (reportData: any, institution: any, reportMonth: string, reportYear: string) => {
    const printWindow = window.open('', '', 'width=1200,height=800');
    if (!printWindow) {
        alert('Please allow popups to print the report');
        return;
    }

    const dataList = reportData?.alldata || reportData?.pfreport || [];

    const tableRows = dataList.length === 0 ? `
        <tr>
            <td colspan="7" class="text-center" style="padding: 20px; color: #666;">No records found</td>
        </tr>
    ` : dataList
        .map((record: any, index: number) => {
            const empName =
                `${record.hrmE_EmployeeFirstName || ''} ${record.hrmE_EmployeeMiddleName || ''} ${record.hrmE_EmployeeLastName || ''}`
                    .trim()
                    .toUpperCase();
            const dol = record.hrmE_DOL ? format(new Date(record.hrmE_DOL), 'dd-MM-yyyy') : '';
            const fatherOrHusband = record.hrmE_FatherName || record.fatherHusbandName || '';

            return `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td class="text-center">${record.hrmE_PFAccNo || ''}</td>
                <td class="text-left">${empName}</td>
                <td class="text-left">${fatherOrHusband}</td>
                <td class="text-center">${dol}</td>
                <td class="text-left">${record.hrmE_LeavingReason || ''}</td>
                <td class="text-left">${record.remarks || ''}</td>
            </tr>
        `;
        })
        .join('');

    const codeNo = reportData?.payrollStandard?.[0]?.hrC_PFAccNoPrefix || reportData?.payrollstandard?.[0]?.hrC_PFAccNoPrefix || 'PF';
    const address = `${reportData?.currentInstuteAddress || institution?.mI_Address1}, ${institution?.ivrmmcT_Name || ''} - ${institution?.mI_Pincode || ''}.`;

    printWindow.document.write(`
        <html>
        <head>
            <title>PF Form 10</title>
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
                .footer-text { margin-bottom: 10px; line-height: 1.4; color: #333; font-size: 11px; }
                .signature-box { 
                    margin-top: 40px; 
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
                    <h4>Form 10</h4>
                </div>
                <div class="text-center">
                    <h4>The Employees' Provident Fund Scheme, 1952[ Paragraph 36 (2) (a)]</h4>
                    <h6> AND</h6>
                    <h4>The Employees' Pension Fund Scheme, 1995[ Para 20 (4)]</h4>
                </div>
                <hr style="margin: 15px 0;" />
                
                <div style="margin-bottom: 15px; line-height: 1.5;">
                    <p>
                        Return of the members leaving service during the month of <span class="border-bottom font-bold">${reportMonth} - ${reportYear}</span>
                    </p>
                    <p>
                        To be sent to the Commissioner with Form 2 (EPF & EPS)
                    </p>
                </div>

                <table class="info-table">
                    <tr>
                        <td style="width: 65%;">
                            <table style="width: 100%;">
                                <tr>
                                    <td style="width: 35%;" class="info-label">Name of Establishment :</td>
                                    <td class="border-bottom text-left">${institution?.mI_Name || ''}</td>
                                </tr>
                                <tr>
                                    <td class="info-label">Address of the Factory/ Establishment :</td>
                                    <td class="border-bottom text-left">${address}</td>
                                </tr>
                            </table>
                        </td>
                        <td style="width: 35%;">
                            <table style="width: 100%;">
                                <tr>
                                    <td style="width: 60%;" class="info-label">Code No. of Factory/ Establishment :</td>
                                    <td class="border-bottom text-left">${codeNo}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </div>

            <table class="data-table">
                <thead>
                    <tr>
                        <th class="text-center">S. No</th>
                        <th class="text-center">Account No.</th>
                        <th class="text-center">Name of the Member<br/>(in BLOCK letters)</th>
                        <th class="text-center">Father's Name or Husband's Name<br/>in case of married women</th>
                        <th class="text-center">Date of Leaving Service</th>
                        <th class="text-center">Reason for Leaving Service</th>
                        <th class="text-center">Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>

            <div class="footer-section">
                <div class="footer-text">
                    <p>Date :</p>
                    <p>
                        Please state whether the member is (a) retiring according to para 69 (1) (a) or (b) of the scheme; (b) leaving India for permanent settlement abroad; (c) retrenched; (d) ordinarily
                        dismissed for serious and willful misconduct; (e) discharged; (f) resigning from or leaving service; (g) taking up employment elsewhere (the name and address of the new
                        employer should be stated) ; (h) dead.
                    </p>
                    <p>
                        (1) A request for deduction from the account of a member dismissed for serious and willful misconduct should be reported by the following &ldquo;certified that the member
                        mentioned at Sr. No. &nbsp;________________________  &nbsp; Shri. &nbsp;________________________
                        was dismissed from the service for willful misconduct. I recommend that the employer's
                        contribution for &nbsp;________________________&nbsp; should be forfeited from his account in the fund. A copy of order of dismissal is enclosed.&rdquo;
                    </p>
                    <p>
                        (2) In case of discharge from service, the following certificate should be filled.
                        Certified that the member mentioned in Sr. No.&nbsp; ________________________  &nbsp; Shri. &nbsp;________________________
                        was paid/ unpaid retrenchment compensation of Rs.&nbsp;____________________________ &nbsp;
                        under the Industrial Disputes Act, 1947
                    </p>
                    <p>
                        Certified that the difference between the total of the contribution shown under cols. 3, 4a and 4b of the above table and that arrived at on the total wages
                        shown in col. 2 at the prescribed rate is solely due to rounding off of contribution to the nearest rupee under the rules.
                    </p>
                </div>

                <div class="signature-box">
                    <div class="signature-line">Signature of the employer with Official Seal</div>
                </div>
                <div style="clear: both;"></div>
                
                <div class="footer-text" style="color: #555; margin-top: 15px;">
                    <p>
                        Note: Please furnish details of the membership in remarks column if the employee was a member of Employees'
                        Provident Fund and Employees' Pension scheme before joining yourself/ factory.
                        i.e. Account No. and/ or the name and particulars of the last employer.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 250);
};
