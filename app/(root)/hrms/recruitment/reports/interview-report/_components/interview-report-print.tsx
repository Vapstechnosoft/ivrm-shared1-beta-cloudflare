export const printInterviewReport = (reportData: any[]) => {
    const printWindow = window.open('', '', 'width=1200,height=800');
    if (!printWindow) {
        alert('Please allow popups to print the report');
        return;
    }

    const tableRows = reportData
        .map((record: any, index: number) => {
            const date = record.interviewDate ? new Date(record.interviewDate).toLocaleDateString('en-GB') : '-';

            return `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td class="text-left">${record.candidateName || ''}</td>
                <td class="text-left">${record.interviewRound || ''}</td>
                <td class="text-left">${record.interviewerName || ''}</td>
                <td class="text-center">${date}</td>
                <td class="text-left">${record.interviewVenue || ''}</td>
                <td class="text-left">${record.interviewFeedback || ''}</td>
                <td class="text-center">${record.candidateStatus || ''}</td>
            </tr>
        `;
        })
        .join('');

    printWindow.document.write(`
        <html>
        <head>
            <title>Interview Report</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    padding: 20px; 
                    font-size: 12px;
                }
                .text-center { text-align: center; }
                .text-left { text-align: left; }
                
                h2 { text-align: center; margin-bottom: 20px; }
                
                table.data-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 10px;
                    margin-bottom: 20px;
                    font-size: 11px;
                }
                table.data-table th, table.data-table td { 
                    border: 1px solid #000; 
                    padding: 6px; 
                }
                table.data-table th { 
                    background-color: #f0f0f0; 
                    font-weight: bold;
                }
                
                @media print {
                    body { margin: 0; padding: 10px; }
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            <h2>Interview Report</h2>

            <table class="data-table">
                <thead>
                    <tr>
                        <th>SL.No</th>
                        <th>Candidate Name</th>
                        <th>Interview Round</th>
                        <th>Interviewer Name</th>
                        <th>Interview Date</th>
                        <th>Interview Venue</th>
                        <th>Interview Feedback</th>
                        <th>Candidate Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 250);
};
