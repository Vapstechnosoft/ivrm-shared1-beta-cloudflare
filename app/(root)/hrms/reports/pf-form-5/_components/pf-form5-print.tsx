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
            const fatherHusbandName = record.fatherHusbandName || record.hrmE_FatherName || '';

            // Age/Date of Birth
            const dob = record.hrmE_DOB ? format(new Date(record.hrmE_DOB), 'dd-MM-yyyy') : '';
            const age = record.hrmE_Age ? `${record.hrmE_Age} Years` : '';
            const ageDob = dob && age ? `${dob} (${age})` : dob || age || '';

            // Sex
            const sex = record.ivrmmG_GenderName || '';

            // Date of Eligibility for Service
            const eligibilityDate = record.hrmE_PFDate ? format(new Date(record.hrmE_PFDate), 'dd-MM-yyyy') : '';

            // Total Period of Previous Service
            const totalService = record.totalServicePeriod || '';

            // Remarks
            const remarks = record.remark || record.remarks || '';

            return `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td class="text-left">${record.hrmE_PFAccNo || ''}</td>
                <td class="text-left">${empName}</td>
                <td class="text-left">${fatherHusbandName}</td>
                <td class="text-center">${ageDob}</td>
                <td class="text-center">${sex}</td>
                <td class="text-center">${eligibilityDate}</td>
                <td class="text-left">${totalService}</td>
                <td class="text-left">${remarks}</td>
            </tr>
        `;
        })
        .join('');

    const codeNo = reportData?.payrollStandard?.[0]?.hrC_PFAccNoPrefix || reportData?.payrollstandard?.[0]?.hrC_PFAccNoPrefix || '';
    const address = `${reportData?.currentInstuteAddress || institution?.mI_Address1}, ${institution?.ivrmmcT_Name || ''} - ${institution?.mI_Pincode || ''}.`;

    printWindow.document.write(`
        <html>
        <head>
            <title>PF Form 5</title>
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
                .footer-text { margin-bottom: 10px; line-height: 1.4; color: #333; font-size: 10px; }
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
                    <h4>Form 5</h4>
                </div>
                <div class="text-center">
                    <h4>The Employees' Provident Fund Scheme, 1952</h4>
                    <h6> Paragraph 36 (2) (a) and (b)</h6>
                    <h4> Employees' Pension Scheme, 1995</h4>
                    <h6> Paragraph 20 (4)</h6>
                </div>
                <hr style="margin: 15px 0;" />
                
                <div style="margin-bottom: 15px; line-height: 1.5;">
                    <p>
                        Return of Employees' qualifying for membership of the Employees' Provident Fund, Employees' Pension Scheme &
                        Employees' Deposit Linked Insurance Fund for the first time during the month of <span class="border-bottom font-bold">${reportMonth} - ${reportYear}</span>
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
                        <th class="text-center">Age/Date of Birth</th>
                        <th class="text-center">Sex</th>
                        <th class="text-center">Date of Eligibility for Service</th>
                        <th class="text-center">Total Period of Previous Service<br/>(excluding period of breaks)<br/>as on the date of joining the Fund</th>
                        <th class="text-center">Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>

            <div class="footer-section">
                <div class="signature-box">
                    <div class="signature-line">Signature of the employer with Official Seal</div>
                </div>
                <div style="clear: both;"></div>
                
                <div class="footer-text" style="margin-top: 20px;">
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
