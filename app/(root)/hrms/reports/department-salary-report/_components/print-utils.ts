export const printDepartmentSalaryReport = (reportData: any, month: string, year: string, departmentNames = '') => {
    const printWindow = window.open('', '', 'width=1200,height=800');
    if (!printWindow) {
        alert('Please allow popups to print the report');
        return;
    }

    const departmentDetails = reportData.departmentSalaryDetails || [];
    const currentDate = new Date();

    // Dynamic institution details from API response (same as on-screen preview)
    const institutionDetails = reportData.institutionDetails || {};
    const institutionName = institutionDetails.mI_Name || '';
    const institutionAddress = [
        institutionDetails.mI_Address1,
        institutionDetails.mI_Address2,
        institutionDetails.mI_Address3
    ]
        .filter(Boolean)
        .join(', ');
    const institutionPinLine = institutionDetails.ivrmmcT_Name
        ? `${institutionDetails.ivrmmcT_Name} - ${institutionDetails.mI_Pincode || ''}`
        : (institutionDetails.mI_Pincode || '');

    // Determine dynamic headers (union of all rows)
    const earningMap = new Map<number, { id: number; name: string; order: number; index: number }>();
    const deductionMap = new Map<number, { id: number; name: string; order: number; index: number }>();

    departmentDetails.forEach((row: any) => {
        row.earningresult?.forEach((e: any, idx: number) => {
            if (!earningMap.has(e.hrmeD_Id)) {
                earningMap.set(e.hrmeD_Id, { id: e.hrmeD_Id, name: e.hrmeD_Name, order: e.hrmeD_Order || 0, index: idx });
            }
        });
        row.deductionresult?.forEach((d: any, idx: number) => {
            if (!deductionMap.has(d.hrmeD_Id)) {
                deductionMap.set(d.hrmeD_Id, { id: d.hrmeD_Id, name: d.hrmeD_Name, order: d.hrmeD_Order || 0, index: idx });
            }
        });
    });

    const earningHeads = Array.from(earningMap.values()).sort((a, b) => a.order - b.order || a.index - b.index);
    const deductionHeads = Array.from(deductionMap.values()).sort((a, b) => a.order - b.order || a.index - b.index);

    const earningHeaders = earningHeads.map((head: any) => `<th class="text-right">${head.name}</th>`).join('');

    const deductionHeaders = deductionHeads.map((head: any) => `<th class="text-right">${head.name}</th>`).join('');

    // Calculate totals across all rows
    let grandTotalGross = 0;
    let grandTotalDed = 0;
    let grandTotalNet = 0;

    // Totals by specific earning/deduction head
    const earningTotalsMap = new Map<number, number>();
    const deductionTotalsMap = new Map<number, number>();

    const tableRows = departmentDetails
        .map((record: any, index: number) => {
            // Look up amounts matching the dynamic heads
            const earningCells = earningHeads
                .map((eh: any) => {
                    const val = record.earningresult?.find((e: any) => e.hrmeD_Id === eh.id)?.hresD_Amount || 0;
                    earningTotalsMap.set(eh.id, (earningTotalsMap.get(eh.id) || 0) + val);
                    return `<td class="text-right">${val.toFixed(2)}</td>`;
                })
                .join('');

            const deductionCells = deductionHeads
                .map((dh: any) => {
                    const val = record.deductionresult?.find((d: any) => d.hrmeD_Id === dh.id)?.hresD_Amount || 0;
                    deductionTotalsMap.set(dh.id, (deductionTotalsMap.get(dh.id) || 0) + val);
                    return `<td class="text-right">${val.toFixed(2)}</td>`;
                })
                .join('');

            const gross = Number(record.grossEarning) || 0;
            const totalDed = Number(record.grossDeduction) || 0;
            const netPay = record.netSalary !== undefined && record.netSalary !== null ? Number(record.netSalary) : gross - totalDed;

            grandTotalGross += gross;
            grandTotalDed += totalDed;
            grandTotalNet += netPay;

            return `
          <tr>
              <td class="text-center">${index + 1}</td>
              <td>${record.hrmD_DepartmentName || ''}</td>
              <td class="text-center">${record.lopDays || 0}</td>
              ${earningCells}
              <td class="text-right font-bold">${gross.toFixed(2)}</td>
              ${deductionCells}
              <td class="text-right font-bold">${totalDed.toFixed(2)}</td>
              <td class="text-right font-bold">${netPay.toFixed(2)}</td>
          </tr>
      `;
        })
        .join('');

    // Generate dynamic totals for each head in the footer
    const earningTotalsCells = earningHeads
        .map((eh: any) => {
            const val = earningTotalsMap.get(eh.id) || 0;
            return `<td class="text-right">${val.toFixed(2)}</td>`;
        })
        .join('');

    const deductionTotalsCells = deductionHeads
        .map((dh: any) => {
            const val = deductionTotalsMap.get(dh.id) || 0;
            return `<td class="text-right">${val.toFixed(2)}</td>`;
        })
        .join('');

    const footerRow = `
      <tr class="font-bold bg-gray-100">
          <td colspan="3" class="text-right">Total</td>
          ${earningTotalsCells}
          <td class="text-right">${grandTotalGross.toFixed(2)}</td>
          ${deductionTotalsCells}
          <td class="text-right">${grandTotalDed.toFixed(2)}</td>
          <td class="text-right">${grandTotalNet.toFixed(2)}</td>
      </tr>
  `;

    // HTML Generation

    printWindow.document.write(`
      <html>
      <head>
          <title>Department Salary Report</title>
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
                  height: 60px;
              }
              .institution-name {
                  font-size: 20px;
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
                  margin-bottom: 10px;
                  font-size: 12px;
                  text-align: center;
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
              .bg-gray-100 { background-color: #f3f4f6; }
              
              @media print {
                  body { margin: 0; padding: 10px; }
                  .no-print { display: none; }
              }
          </style>
      </head>
      <body>
          <div class="header-container">
              <h1 class="institution-name">${institutionName}</h1>
              ${institutionAddress ? `<p>${institutionAddress}</p>` : ''}
              ${institutionPinLine ? `<p>${institutionPinLine}</p>` : ''}
          </div>

          <div class="report-title">
              Department Salary Report - ${month} ${year}
          </div>
          
          <div class="info-box">
             ${departmentNames ? `Departments: ${departmentNames}` : ''}
          </div>

          <table>
              <thead>
                  <tr>
                      <th class="text-center" style="width: 30px">Sl.No</th>
                      <th class="text-left">Department Name</th>
                      <th class="text-center">LOP</th>
                      ${earningHeaders}
                      <th class="text-right">Gross Pay</th>
                      ${deductionHeaders}
                      <th class="text-right">Total Ded</th>
                      <th class="text-right">Net Pay</th>
                  </tr>
              </thead>
              <tbody>
                  ${tableRows}
                  ${footerRow}
              </tbody>
          </table>
          
          <div style="margin-top: 30px; text-align: right; font-size: 11px;">
              Generated on: ${currentDate.toLocaleString()}
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
