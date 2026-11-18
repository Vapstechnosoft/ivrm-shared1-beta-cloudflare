import { format } from 'date-fns';
import { numberToWords } from './salary-slip-template';
export const printSalarySlips = (
    slips: any[],
    institution: any,
    month: string,
    year: string,
    lopDays: boolean,
    leaveDetails: boolean,
    panCardNo: boolean,
    bankDetails: boolean
) => {
    console.log('slips', slips);
    const printWindow = window.open('', '', 'width=1200,height=800');
    if (!printWindow) {
        alert('Please allow popups to print the report');
        return;
    }

    const formatCurrency = (value: number | null | undefined) => {
        if (value === null || value === undefined) return '0.00';
        return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const slipHtml = slips
        .map((slip, index) => {
            const earnings = slip.earnings || [];
            const deductions = slip.deductions || [];
            const maxRows = Math.max(earnings.length, deductions.length);

            const combinedRows = Array.from({ length: maxRows }, (_, i) => {
                const e = earnings[i];
                const d = deductions[i];
                return `
                <tr>
                    <td style="border: 1px solid black; padding: 8px; text-align: left; width: 35%;">${e?.name || ''}</td>
                    <td style="border: 1px solid black; padding: 8px; text-align: right; width: 15%;">${e ? formatCurrency(e.amount) : ''}</td>
                    <td style="border: 1px solid black; padding: 8px; text-align: left; width: 35%;">${d?.name || ''}</td>
                    <td style="border: 1px solid black; padding: 8px; text-align: right; width: 15%;">${d ? formatCurrency(d.amount) : ''}</td>
                </tr>
            `;
            }).join('');

            const leaveRows = (slip.leaveDetails || [])
                .map(
                    (l: any) => `
            <tr>
                <td style="text-align: center;">${l.serialNo}</td>
                <td style="text-align: left;">${l.leaveName || '-'}</td>
                <td style="text-align: center;">${l.totalLeaves || 0}</td>
                <td style="text-align: center;">${l.availedLeaves || 0}</td>
                <td style="text-align: center;">${l.balanceLeaves || 0}</td>
            </tr>
        `
                )
                .join('');

            return `
            <div class="slip-container" style="${index > 0 ? 'page-break-before: always; margin-top: 40px;' : ''}">
                <div class="header" style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 25px;">
                    <div style="border-bottom: 2px solid black; padding-bottom: 15px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center;">
                        <img src="${institution.logo}" style="height: 140px; width: auto;" alt="logo" />
                    </div>

                    <h3 style="text-align: center; text-decoration: underline; margin-bottom: 30px; font-size: 20px;">
                        Salary Slip: ${month} ${year}
                    </h3>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
                    <tr>
                        <td style="width: 50%; vertical-align: top; padding-right: 20px;">
                            <div style="margin-bottom: 8px;"><strong>Name:</strong> ${slip.employeeName}</div>
                            <div style="margin-bottom: 8px;"><strong>Department:</strong> ${slip.department}</div>
                            <div style="margin-bottom: 8px;"><strong>Designation:</strong> ${slip.designation}</div>
                            <div style="margin-bottom: 8px;"><strong>PF UAN Number:</strong> ${slip.pfNo || '-'}</div>
                            ${
                                bankDetails
                                    ? `<div style="margin-bottom: 8px;"><strong>Bank Name:</strong> ${slip.bankName || '-'}</div>
                            <div style="margin-bottom: 8px;"><strong>Bank Acc No:</strong> ${slip.bankAccountNo || '-'}</div>`
                                    : ''
                            }
                            
                        </td>
                        <td style="width: 50%; vertical-align: top;">
                            <div style="margin-bottom: 8px;"><strong>Employee Code:</strong> ${slip.employeeCode || '-'}</div>
                            <div style="margin-bottom: 8px;"><strong>Date of Joining:</strong> ${
                                format(new Date(slip.dateOfJoining), 'dd-MM-yyyy') || '-'
                            }</div>
                            ${panCardNo ? `<div style="margin-bottom: 8px;"><strong>PAN No:</strong> ${slip.panNo || '-'}</div>` : ''}
                            <div style="margin-bottom: 8px;"><strong>Total Days:</strong> ${slip.totalDays || '-'}</div>
                           ${lopDays ? `<div style="margin-bottom: 8px;"><strong>L.W.O.P Days:</strong> ${slip.lopDays || '-'}</div>` : ''}
                            <div style="margin-bottom: 8px;"><strong>Pay Slip Seq:</strong> ${slip.paySlipSeq || '-'}</div>
                        </td>
                    </tr>
                </table>

                <div style="margin-bottom: 24px;">
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid black; margin-bottom: 20px; font-size: 13px;">
                        <thead>
                            <tr>
                                <th style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold; width: 35%;">Earnings</th>
                                <th style="border: 1px solid black; padding: 8px; text-align: right; font-weight: bold; width: 15%;">Amount</th>
                                <th style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold; width: 35%;">Deductions</th>
                                <th style="border: 1px solid black; padding: 8px; text-align: right; font-weight: bold; width: 15%;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${combinedRows}
                            <tr style="font-weight: bold;">
                                <td style="border: 1px solid black; padding: 8px; text-align: left;">Total:</td>
                                <td style="border: 1px solid black; padding: 8px; text-align: right;">${formatCurrency(slip.grossPay)}</td>
                                <td style="border: 1px solid black; padding: 8px; text-align: left;">Total:</td>
                                <td style="border: 1px solid black; padding: 8px; text-align: right;">${formatCurrency(slip.totalDeduction)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style="margin-bottom: 30px; font-size: 13px;">
                    <div style="display: flex; gap: 10px; margin-bottom: 8px;">
                        <span style="width: 180px; font-weight: bold;">Net Salary</span>
                        <span style="font-weight: 600;">: ${formatCurrency(slip.netPayable)} /-</span>
                    </div>
                    <div style="display: flex; gap: 10px; margin-bottom: 8px;">
                        <span style="width: 180px; font-weight: bold;">Net Salary in Words</span>
                        <span style="font-weight: 600;">: ${numberToWords(slip.netPayable)}</span>
                    </div>
                    ${
                        slip.pensionFund !== undefined
                            ? `
                        <div style="display: flex; gap: 10px; margin-bottom: 8px;">
                            <span style="width: 180px; font-weight: bold;">Pension Fund</span>
                            <span style="font-weight: 600;">: ${formatCurrency(slip.pensionFund)} /-</span>
                        </div>
                    `
                            : ''
                    }
                </div>

                <div style="text-align: center; color: #666; font-size: 11px; margin-bottom: 30px;">
                    *This is a Computer generated payslip, does not require any signature.
                </div>

                ${
                    leaveDetails && slip.leaveDetails && slip.leaveDetails.length > 0
                        ? `
                <div style="margin-top: 20px;">
                    <h3 style="border-bottom: 1px solid #333; padding-bottom: 5px;">Leave Details</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                        <thead>
                            <tr style="background-color: #f3f4f6;">
                                <th style="border: 1px solid #ccc; padding: 8px;">Serial No.</th>
                                <th style="border: 1px solid #ccc; padding: 8px;">Leave Name</th>
                                <th style="border: 1px solid #ccc; padding: 8px;">Total Leaves</th>
                                <th style="border: 1px solid #ccc; padding: 8px;">Availed Leaves</th>
                                <th style="border: 1px solid #ccc; padding: 8px;">Balance Leaves</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${leaveRows}
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
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    padding: 40px; 
                    color: #333;
                }
                @media print {
                    body { padding: 20px; }
                    .slip-container { page-break-after: always; }
                }
                table { border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; }
                #no-border-table td { border: none !important; }
            </style>
        </head>
        <body>
            ${slipHtml}
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        // Option to close window after print
        // printWindow.close();
    }, 500);
};
