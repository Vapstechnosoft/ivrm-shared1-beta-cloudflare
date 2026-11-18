export const printEmployeeProfileReport = (reportData: any) => {
    const printWindow = window.open('', '', 'width=1200,height=800');
    if (!printWindow) {
        alert('Please allow popups to print the report');
        return;
    }

    const profileCards = reportData
        .map((record: any, index: number) => {
            const doj = record.joinDate;
            const dol = record.leftDate;
            const dob = record.dob;

            const formatDate = (dateString?: string) => {
                if (!dateString) return 'N/A';
                try {
                    const date = new Date(dateString);
                    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('en-GB');
                } catch (e) {
                    return dateString;
                }
            };

            let contacts = record.contactDetails;
            if (Array.isArray(contacts)) {
                contacts = contacts.join(', ');
            }

            return `
            <div class="profile-card">
                <div class="profile-content">
                    <div class="details-column">
                        <table class="details-table">
                            <tr><td class="label">Employee Code</td><td class="colon">:</td><td class="value">${record.employeeCode || 'N/A'}</td></tr>
                            <tr><td class="label">Name of Employee</td><td class="colon">:</td><td class="value uppercase">${record.employeeName || 'N/A'}</td></tr>
                            <tr><td class="label">Designation</td><td class="colon">:</td><td class="value">${record.designation || 'N/A'}</td></tr>
                            <tr><td class="label">Contact Details</td><td class="colon">:</td><td class="value">${contacts || 'N/A'}</td></tr>
                            <tr><td class="label">Email-Id</td><td class="colon">:</td><td class="value">${record.emailId || 'N/A'}</td></tr>
                            <tr><td class="label">Join Date</td><td class="colon">:</td><td class="value">${formatDate(doj)}</td></tr>
                            <tr><td class="label">Left Date</td><td class="colon">:</td><td class="value">${formatDate(dol)}</td></tr>
                            <tr><td class="label">Total no. Of Service</td><td class="colon">:</td><td class="value">${record.totalService || 'N/A'}</td></tr>
                            <tr><td class="label">Blood Group</td><td class="colon">:</td><td class="value">${record.bloodGroup || 'N/A'}</td></tr>
                            <tr><td class="label">Address</td><td class="colon">:</td><td class="value">${record.address || 'N/A'}</td></tr>
                            <tr><td class="label">Age</td><td class="colon">:</td><td class="value">${record.age ? record.age : 'N/A'}</td></tr>
                            <tr><td class="label">Religion</td><td class="colon">:</td><td class="value">${record.religion || 'N/A'}</td></tr>
                            <tr><td class="label">DOB</td><td class="colon">:</td><td class="value">${formatDate(dob)}</td></tr>
                            <tr><td class="label">AdharCard Number</td><td class="colon">:</td><td class="value">${record.aadharCardNumber || 'N/A'}</td></tr>
                            <tr><td class="label">Father Name</td><td class="colon">:</td><td class="value">${record.fatherName || 'N/A'}</td></tr>
                        </table>
                    </div>
                    <div class="image-column">
                        <div class="photo-box ${record.hrmE_Photo ? 'has-photo' : 'no-photo'}">
                            ${record.hrmE_Photo ? `<img src="${record.hrmE_Photo}" alt="Photo" />` : '<span>No Photo</span>'}
                        </div>
                    </div>
                </div>
                <div class="signature-section">
                    <div class="signature">
                        <div class="signature-line"></div>
                        <p>Signature of Nodal Officer</p>
                    </div>
                </div>
            </div>
        `;
        })
        .join('');

    printWindow.document.write(`
        <html>
        <head>
            <title>Employee Profile Report</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    padding: 20px; 
                    color: #000;
                }
                .report-title {
                    text-align: center;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #333;
                    padding-bottom: 15px;
                }
                .report-title h2 { font-size: 20px; font-weight: bold; text-transform: uppercase; margin: 0 0 5px 0; }
                .report-title h4 { font-size: 14px; margin: 5px 0; font-weight: normal; }
                .report-title h5 { font-size: 16px; font-weight: bold; text-transform: uppercase; margin: 10px 0 0 0; }
                
                .profile-card {
                    margin-bottom: 40px;
                    page-break-inside: avoid;
                }
                .profile-content {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                }
                .details-column {
                    flex: 1;
                    padding-right: 20px;
                }
                .details-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .details-table td {
                    padding: 6px 4px;
                    vertical-align: top;
                    font-size: 13px;
                    border-bottom: 1px solid #eee;
                }
                .label {
                    font-weight: bold;
                    width: 35%;
                    color: #555;
                }
                .colon {
                    width: 10px;
                    font-weight: bold;
                }
                .value {
                    color: #000;
                }
                .uppercase {
                    text-transform: uppercase;
                }
                
                .image-column {
                    width: 150px;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                }
                .photo-box {
                    width: 120px;
                    height: 150px;
                    border: 2px solid #333;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .photo-box.no-photo {
                    background-color: #f9f9f9;
                    color: #999;
                    font-size: 12px;
                }
                .photo-box img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .signature-section {
                    position: fixed;
                    bottom: 30;
                    width: 100%;
                    text-align: right;
                    padding-right: 40px;
                    page-break-inside: avoid;
                }
                .signature {
                    display: inline-block;
                    text-align: center;
                }
                .signature-line {
                    width: 200px;
                    border-top: 1px solid #000;
                    margin-bottom: 5px;
                }
                .signature p {
                    margin: 0;
                    font-size: 14px;
                    font-weight: bold;
                }

                @media print {
                    @page {
                        margin-top: 30mm;
                    }
                    body { margin: 0; padding: 20px 10px; }
                    .report-title { border-bottom: 2px solid #000; }
                    .details-table td { border-bottom: 1px solid #ccc; }
                    .photo-box { border-color: #000; }
                }
            </style>
        </head>
        <body>
            <div class="report-title">
                 ${reportData && reportData.length > 0 && reportData[0].institutionName ? `<h2>${reportData[0].institutionName}</h2>` : ''}
                 ${reportData && reportData.length > 0 && reportData[0].institutionAddress ? `<h4>${reportData[0].institutionAddress}</h4>` : ''}
                 ${reportData && reportData.length > 0 && reportData[0].institutionPincode ? `<h4>PIN: ${reportData[0].institutionPincode}</h4>` : ''}
                <h5>Employee Profile Report</h5>
            </div>
            
            ${profileCards}
            
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 250);
};
