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

export function generateSalarySlipHtml(
    slip: any,
    institution: { name: string; address: string; logo: string },
    month: string,
    year: string,
    showLopDays = false,
    showLeaveDetails = false,
    showPanCardNo = false,
    showBankDetails = false
) {
    const formatCurrency = (val: number) => (val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const earnings = slip.earnings || [];
    const deductions = slip.deductions || [];
    const maxRows = Math.max(earnings.length, deductions.length);

    let rowsHtml = '';
    for (let i = 0; i < maxRows; i++) {
        const e = earnings[i] || { name: '', amount: '' };
        const d = deductions[i] || { name: '', amount: '' };
        rowsHtml += `
            <tr>
                <td align="left">${e.name || '&nbsp;'}</td>
                <td align="right">${e.amount ? formatCurrency(e.amount) : '&nbsp;'}</td>
                <td align="left">${d.name || '&nbsp;'}</td>
                <td align="right">${d.amount ? formatCurrency(d.amount) : '&nbsp;'}</td>
            </tr>
        `;
    }

    return `
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
        <td align="center">
            <img src="${institution.logo}" height="70" />
        </td>
    </tr>

    <tr>
        <td align="center">
            <br/>
            <b><u>Salary Slip: ${month} ${year}</u></b>
            <br/><br/>
        </td>
    </tr>
        </table>

        <table width="100%" border="0" cellpadding="2" cellspacing="0">
    <tr>
        <td width="55%" valign="top">
            <table width="100%" border="0" cellpadding="2" cellspacing="0">

                <tr>
                    <td width="10" ><b>Name</b></td>
                    <td>: ${slip.employeeName || '-'}</td>
                </tr>

                <tr>
                    <td width="80" ><b>Department</b></td>
                    <td>: ${slip.department || '-'}</td>
                </tr>

                <tr>
                    <td width="80" ><b>Designation</b></td>
                    <td>: ${slip.designation || '-'}</td>
                </tr>

                ${slip.uanNumber
            ? `
                <tr>
                    <td width="80" ><b>PF UAN Number</b></td>
                    <td>: ${slip.uanNumber}</td>
                </tr>
                `
            : ''
        }

                ${showBankDetails
            ? `
                <tr>
                    <td width="110"><b>Bank Name</b></td>
                    <td>: ${slip.bankName || '-'}</td>
                </tr>

                <tr>
                    <td width="110"><b>Bank Acc No.</b></td>
                    <td>: ${slip.bankAccountNo || '-'}</td>
                </tr>
                `
            : ''
        }

            </table>
        </td>

        
        <td width="40%" valign="top">
            <table width="100%" border="0" cellpadding="2" cellspacing="0">

                <tr>
                    <td width="110"><b>Employee Code</b></td>
                    <td>: ${slip.employeeCode || '-'}</td>
                </tr>

                <tr>
                    <td width="110" ><b>Date Of Joining</b></td>
                    <td>: ${slip.dateOfJoining
            ? format(new Date(slip.dateOfJoining), 'dd-MM-yyyy')
            : '-'
        }</td>
                </tr>

                ${showPanCardNo && slip.panNo
            ? `
                <tr>
                    <td width="110"><b>PAN No.</b></td>
                    <td>: ${slip.panNo}</td>
                </tr>
                `
            : ''
        }

                <tr>
                    <td width="110"><b>Total Days</b></td>
                    <td>: ${slip.totalDays || 0}</td>
                </tr>

                ${showLopDays
            ? `
                <tr>
                    <td width="110"><b>L.W.O.P Days</b></td>
                    <td>: ${slip.lopDays || 0}</td>
                </tr>
                `
            : ''
        }

                <tr>
                    <td width="110"><b>Pay Slip Seq</b></td>
                    <td>: ${slip.paySlipSeq || 0}</td>
                </tr>

            </table>
        </td>
    </tr>
</table>
        <br/><br/>

        <table width="100%" border="1" cellpadding="5" cellspacing="0">
            <tr bgcolor="#f9f9f9">
                <th width="35%" align="left"><b>Earnings</b></th>
                <th width="15%" align="right"><b>Amount</b></th>
                <th width="35%" align="left"><b>Deductions</b></th>
                <th width="15%" align="right"><b>Amount</b></th>
            </tr>
            ${rowsHtml}
            <tr>
                <td align="left"><b>Total:</b></td>
                <td align="right"><b>${formatCurrency(slip.grossPay)}</b></td>
                <td align="left"><b>Total:</b></td>
                <td align="right"><b>${formatCurrency(slip.totalDeduction)}</b></td>
            </tr>
        </table>

        <br/><br/>

        <table width="100%" border="0" cellpadding="3" cellspacing="0">
            <tr><td width="180"><b>Net Salary</b></td><td>: ${formatCurrency(slip.netPayable)} /-</td></tr>
            <tr><td><b>Net Salary in Words</b></td><td>: <b>${numberToWords(slip.netPayable)}</b></td></tr>
            ${slip.pensionFund ? `<tr><td><b>Pension Fund</b></td><td>: ${formatCurrency(slip.pensionFund)} /-</td></tr>` : ''}
        </table>

        <br/><br/><br/>

        <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td align="left"><b>Principal/Accountant</b></td>
                <td align="right"><b>Signature</b></td>
            </tr>
        </table>

        <br/><br/>
        <div align="center"><i><font size="1">NOTE : Signature is not required because it is a computer generated statement.</font></i></div>

        ${showLeaveDetails && slip.leaveDetails && slip.leaveDetails.length > 0
            ? `
            <br/><br/>
            <div align="center"><b><u>Leave Details</u></b></div>
            <br/>
            <table width="85%" align="center" border="1" cellpadding="5" cellspacing="0">
                <tr bgcolor="#f5f5f5">
                    <th align="center"><b>Serial No.</b></th>
                    <th align="center"><b>Leave Name</b></th>
                    <th align="center"><b>Total Leaves</b></th>
                    <th align="center"><b>Availed Leaves</b></th>
                    <th align="center"><b>Balance Leaves</b></th>
                </tr>
                ${(slip.leaveDetails || [])
                .map(
                    (l: any) => `
                    <tr>
                        <td align="center">${l.serialNo}</td>
                        <td align="left">${l.leaveName || '-'}</td>
                        <td align="center">${l.totalLeaves || 0}</td>
                        <td align="center">${l.availedLeaves || 0}</td>
                        <td align="center">${l.balanceLeaves || 0}</td>
                    </tr>
                `
                )
                .join('')}
            </table>
        `
            : ''
        }
    `;
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

    const content = slips
        .map((slip, index) => {
            return generateSalarySlipHtml(slip, institution, month, year, showLopDays, showLeaveDetails, showPanCardNo, showBankDetails);
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
