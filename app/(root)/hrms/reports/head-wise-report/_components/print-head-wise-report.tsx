export const printHeadWiseReport = (data: any[], institution: any, monthName: string, yearStr: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalEarning = data.reduce((sum, item) => sum + (item.totalEarning || 0), 0);
    const totalDeduction = data.reduce((sum, item) => sum + (item.totalDeduction || 0), 0);
    const totalNetSalary = data.reduce((sum, item) => sum + (item.netSalary || 0), 0);

    const htmlContent = `
    <html>
      <head>
        <title>Head wise Report</title>
        <style>
          @page { size: landscape; margin: 20mm; }
          body { font-family: 'Inter', sans-serif; color: #333; margin: 0; padding: 0; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; color: #111; }
          .header p { margin: 5px 0; font-size: 14px; color: #666; }
          .report-title { font-weight: bold; font-size: 16px; margin-top: 15px; text-decoration: underline; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th { background-color: #f8fafc; color: #475569; font-weight: 600; text-align: left; padding: 12px 8px; border: 1px solid #e2e8f0; text-transform: uppercase; }
          td { padding: 10px 8px; border: 1px solid #e2e8f0; color: #1e293b; }
          tr:nth-child(even) { background-color: #f1f5f9; }
          
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          
          .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; }
          .footer-item { display: flex; flex-direction: column; gap: 4px; }
          .footer-label { font-size: 11px; color: #64748b; text-transform: uppercase; }
          
          .print-info { margin-top: 30px; font-size: 10px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${institution?.mI_Name || ''}</h1>
          <p>${institution?.mI_Address1 || ''}, ${institution?.ivrmmcT_Name || ''} - ${institution?.mI_Pincode || ''}</p>
          <div class="report-title">HEAD WISE REPORT FOR ${monthName.toUpperCase()} ${yearStr}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 50px;">Sl.No</th>
              <th>Employee Code</th>
              <th>Employee Name</th>
              <th>Designation</th>
              <th class="text-right">Total Earning</th>
              <th class="text-right">Total Deduction</th>
              <th class="text-right">Net Salary</th>
            </tr>
          </thead>
          <tbody>
            ${data
                .map(
                    (item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.employeeCode || ''}</td>
                <td>${item.employeeName || ''}</td>
                <td>${item.designationName || ''}</td>
                <td class="text-right">₹${(item.totalEarning || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td class="text-right">₹${(item.totalDeduction || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td class="text-right">₹${(item.netSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            `
                )
                .join('')}
          </tbody>
        </table>

        <div class="footer">
          <div class="footer-item">
            <span class="footer-label">Total Earnings</span>
            <span>₹${totalEarning.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div class="footer-item">
            <span class="footer-label">Total Deductions</span>
            <span>₹${totalDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div class="footer-item">
            <span class="footer-label">Total Net Salary</span>
            <span>₹${totalNetSalary.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div class="print-info">
          Generated on ${new Date().toLocaleString()}
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
