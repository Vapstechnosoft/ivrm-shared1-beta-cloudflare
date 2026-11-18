'use client';

import { toast } from 'sonner';

export const printBankCashReport = (reportData: any[], institution: any, month: string, year: string, paymentMode: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        toast.error('Failed to open print window');
        return;
    }

    const totalNetSalary = reportData.reduce((sum, item) => sum + (item.netSalary || 0), 0);

    const htmlContent = `
        <html>
            <head>
                <title>Bank / Cash Report</title>
                <style>
                    body { font-family: 'Inter', sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; }
                    .header h2 { margin: 5px 0; font-size: 18px; }
                    .header p { margin: 2px 0; font-size: 14px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .font-bold { font-weight: bold; }
                    @media print {
                        .no-print { display: none; }
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>BANK / CASH REPORT</h1>
                    <h2>${institution?.mI_Name || ''}</h2>
                    <p>${institution?.mI_Address1 || ''}, ${institution?.ivrmmcT_Name || ''} - ${institution?.mI_Pincode || ''}</p>
                    <p>REPORT FOR ${month.toUpperCase()} ${year}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Sl.No</th>
                            <th>Employee Name</th>
                             ${
                                 paymentMode === 'Bank'
                                     ? `
                                <th>Bank A/C Number</th>
                                <th>IFSC Code</th>
                                <th>Bank Name</th>
                                <th>Branch Name</th>
                            `
                                     : ''
                             }
                            <th>Net Salary</th>
                            <th>Signature</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportData
                            .map(
                                (item, index) => `
                            <tr>
                                <td class="text-center">${index + 1}</td>
                                <td>${item.employeeName || ''}</td>
                                ${
                                    paymentMode === 'Bank'
                                        ? `
                                    <td>${item.bankAcNumber || ''}</td>
                                    <td>${item.hrmbD_IFSCCode || ''}</td>
                                    <td>${item.hrmbD_BankName || ''}</td>
                                    <td>${item.hrmbD_BranchName || ''}</td>
                                `
                                        : ''
                                }
                                <td class="text-right">${(item.netSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td class="text-center"></td>
                            </tr>
                        `
                            )
                            .join('')}
                    </tbody>
                    <tfoot>
                        <tr class="font-bold">
                            <td colspan="${paymentMode === 'Bank' ? 6 : 2}" class="text-right">Total</td>
                            <td class="text-right">${totalNetSalary.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
                <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                    <p>Date: ${new Date().toLocaleDateString()}</p>
                    <p>Signature of the employer with Official Seal</p>
                </div>
                <script>
                    window.onload = () => {
                        window.print();
                        // window.close();
                    };
                </script>
            </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
};
