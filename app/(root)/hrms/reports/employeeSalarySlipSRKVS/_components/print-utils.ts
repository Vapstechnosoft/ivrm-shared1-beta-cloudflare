import { format } from 'date-fns';

export function numberToWords(num: number) {
    if (num === 0) return 'Zero Rupees Only';

    const isNegative = num < 0;
    const absNum = Math.abs(num);

    const a = [
        '',
        'One',
        'Two',
        'Three',
        'Four',
        'Five',
        'Six',
        'Seven',
        'Eight',
        'Nine',
        'Ten',
        'Eleven',
        'Twelve',
        'Thirteen',
        'Fourteen',
        'Fifteen',
        'Sixteen',
        'Seventeen',
        'Eighteen',
        'Nineteen'
    ];

    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function inWords(n: number): string {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
        if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + inWords(n % 100) : '');
        if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
        if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
        return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
    }

    const [rupees, paise] = absNum.toFixed(2).split('.');
    const rupeesVal = Number.parseInt(rupees);
    const paiseVal = Number.parseInt(paise);

    let words = '';

    if (rupeesVal > 0) {
        words = inWords(rupeesVal) + ' Rupees';
    }

    if (paiseVal > 0) {
        if (words) {
            words += ' and ' + inWords(paiseVal) + ' Paise';
        } else {
            words = inWords(paiseVal) + ' Paise';
        }
    }

    if (!words) {
        words = 'Zero Rupees';
    }

    return (isNegative ? 'Minus ' : '') + words + ' Only';
}

export function printSalarySlips(
    slips: any[],
    institution: { name: string; address: string; logo: string },
    month: string,
    year: string,
    showLopDays = false,
    showLeaveDetails = false,
    showPanCardNo = false,
    showBankDetails = false
) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formatCurrency = (val: number) => (val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const content = slips
        .map((slip, index) => {
            const earnings = slip.earnings || [];
            const deductions = slip.deductions || [];
            const maxRows = Math.max(earnings.length, deductions.length);

            let rowsHtml = '';
            for (let i = 0; i < maxRows; i++) {
                const e = earnings[i] || { name: '', amount: '' };
                const d = deductions[i] || { name: '', amount: '' };
                rowsHtml += `
                <tr>
                    <td style="border: 1px solid black; padding: 8px; text-align: left;">${e.name || ''}</td>
                    <td style="border: 1px solid black; padding: 8px; text-align: right;">${e.amount ? formatCurrency(e.amount) : ''}</td>
                    <td style="border: 1px solid black; padding: 8px; text-align: left;">${d.name || ''}</td>
                    <td style="border: 1px solid black; padding: 8px; text-align: right;">${d.amount ? formatCurrency(d.amount) : ''}</td>
                </tr>
            `;
            }

            return `
            <div class="salary-slip" style="page-break-after: always; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
                <div style="border-bottom: 2px solid black; padding-bottom: 15px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center;">
                    <img src="${institution.logo}" style="height: 140px; width: auto;" alt="logo" />
                </div>

                <h3 style="text-align: center; text-decoration: underline; margin-bottom: 30px; font-size: 20px;">
                    Salary Slip: ${month} ${year}
                </h3>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 25px; font-size: 13px; line-height: 1.8;">
                    <div>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="width: 140px; font-weight: bold;">Name</td><td style="width: 10px;">:</td><td style="text-transform: uppercase;">${slip.employeeName}</td></tr>
                            <tr><td style="font-weight: bold;">Department</td><td>:</td><td>${slip.department || '-'}</td></tr>
                            <tr><td style="font-weight: bold;">Designation</td><td>:</td><td>${slip.designation}</td></tr>
                            ${slip.uanNumber ? `<tr><td style="font-weight: bold;">PF UAN Number</td><td>:</td><td>${slip.uanNumber}</td></tr>` : ''}
                            ${
                                showBankDetails
                                    ? `
                                <tr><td style="font-weight: bold;">Bank Name</td><td>:</td><td>${slip.bankName || '-'}</td></tr>
                                <tr><td style="font-weight: bold;">Bank Acc No.</td><td>:</td><td>${slip.bankAccountNo || '-'}</td></tr>
                            `
                                    : ''
                            }
                        </table>
                    </div>
                    <div>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="width: 140px; font-weight: bold;">Employee Code</td><td style="width: 10px;">:</td><td>${slip.employeeCode}</td></tr>
                            <tr><td style="font-weight: bold;">Date Of Joining</td><td>:</td><td>${slip.dateOfJoining ? format(new Date(slip.dateOfJoining), 'dd-MM-yyyy') : '-'}</td></tr>
                            ${showPanCardNo && slip.panNo ? `<tr><td style="font-weight: bold;">PAN No.</td><td>:</td><td>${slip.panNo}</td></tr>` : ''}
                            <tr><td style="font-weight: bold;">Total Days</td><td>:</td><td>${slip.totalDays || 0}</td></tr>
                            ${showLopDays ? `<tr><td style="font-weight: bold;">L.W.O.P Days</td><td>:</td><td>${slip.lopDays || 0}</td></tr>` : ''}
                            <tr><td style="font-weight: bold;">Pay Slip Seq</td><td>:</td><td>${slip.paySlipSeq || 0}</td></tr>
                        </table>
                    </div>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px;">
                    <thead>
                        <tr style="background-color: #f9f9f9;">
                            <th style="border: 1px solid black; padding: 10px; text-align: left; width: 35%;">Earnings</th>
                            <th style="border: 1px solid black; padding: 10px; text-align: right; width: 15%;">Amount</th>
                            <th style="border: 1px solid black; padding: 10px; text-align: left; width: 35%;">Deductions</th>
                            <th style="border: 1px solid black; padding: 10px; text-align: right; width: 15%;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                        <tr style="font-weight: bold;">
                            <td style="border: 1px solid black; padding: 10px; text-align: left;">Total:</td>
                            <td style="border: 1px solid black; padding: 10px; text-align: right;">${formatCurrency(slip.grossPay)}</td>
                            <td style="border: 1px solid black; padding: 10px; text-align: left;">Total:</td>
                            <td style="border: 1px solid black; padding: 10px; text-align: right;">${formatCurrency(slip.totalDeduction)}</td>
                        </tr>
                    </tbody>
                </table>

                <div style="margin-bottom: 40px; font-size: 13px; line-height: 2;">
                    <div style="display: flex;"><span style="width: 180px; font-weight: bold;">Net Salary</span><span>: ${formatCurrency(slip.netPayable)} /-</span></div>
                    <div style="display: flex;"><span style="width: 180px; font-weight: bold;">Net Salary in Words</span><span style="font-weight: 600;">: ${numberToWords(slip.netPayable)}</span></div>
                    ${slip.pensionFund ? `<div style="display: flex;"><span style="width: 180px; font-weight: bold;">Pension Fund</span><span>: ${formatCurrency(slip.pensionFund)} /-</span></div>` : ''}
                </div>

                <div style="display: flex; justify-content: space-between; padding: 0 20px; font-weight: bold; font-size: 13px; margin-bottom: 50px;">
                    <span>Principal/Accountant</span>
                    <span>Signature</span>
                </div>

                <p style="text-align: center; font-size: 12px; font-weight: bold; font-style: italic; margin-top: 50px;">
                    NOTE : Signature is not required because it is a computer generated statement.
                </p>

                ${
                    showLeaveDetails && slip.leaveDetails && slip.leaveDetails.length > 0
                        ? `
                    <div class="leave-details" style="margin-top: 50px; border-top: 2px dashed #ccc; padding-top: 40px;">
                        <h4 style="text-align: center; font-size: 18px; text-decoration: underline; margin-bottom: 20px;">Leave Details</h4>
                        <table style="width: 85%; margin: auto; border-collapse: collapse; font-size: 12px;">
                            <thead>
                                <tr style="background-color: #f5f5f5;">
                                    <th style="border: 1px solid black; padding: 8px; text-align: center;">Serial No.</th>
                                    <th style="border: 1px solid black; padding: 8px; text-align: center;">Leave Name</th>
                                    <th style="border: 1px solid black; padding: 8px; text-align: center;">Total Leaves</th>
                                    <th style="border: 1px solid black; padding: 8px; text-align: center;">Availed Leaves</th>
                                    <th style="border: 1px solid black; padding: 8px; text-align: center;">Balance Leaves</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(slip.leaveDetails || [])
                                    .map(
                                        (l: any) => `
                                    <tr>
                                        <td style="border: 1px solid black; padding: 8px; text-align: center;">${l.serialNo}</td>
                                        <td style="border: 1px solid black; padding: 8px; text-align: left; padding-left: 15px;">${l.leaveName || '-'}</td>
                                        <td style="border: 1px solid black; padding: 8px; text-align: center;">${l.totalLeaves || 0}</td>
                                        <td style="border: 1px solid black; padding: 8px; text-align: center;">${l.availedLeaves || 0}</td>
                                        <td style="border: 1px solid black; padding: 8px; text-align: center;">${l.balanceLeaves || 0}</td>
                                    </tr>
                                `
                                    )
                                    .join('')}
                            </tbody>
                        </table>
                    </div>
                `
                        : ''
                }
            </div>
        `;
        })
        .join('');

    printWindow.document.write(`
        <html>
            <head>
                <title>Salary Slips - ${month} ${year}</title>
                <style>
                    body { margin: 0; padding: 0; }
                    @media print {
                        .salary-slip { page-break-after: always; border: none !important; }
                        body { background: white; }
                    }
                    * { box-sizing: border-box; }
                </style>
            </head>
            <body onload="window.print(); window.close();">
                ${content}
            </body>
        </html>
    `);
    printWindow.document.close();
}
