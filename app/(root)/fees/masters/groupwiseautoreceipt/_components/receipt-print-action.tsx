import { Button } from '@/components/ui/button';
import type { IMasterInstitution } from '@/types/exam/exam-module/report';
import { Printer } from 'lucide-react'; // Adjust path as needed

// PrintReceiptButton Component
const PrintReceiptButton = ({ htmlContent, institution }: { htmlContent: string; institution: IMasterInstitution | null }) => {
    const handlePrint = () => {
        const printWindow = window.open('', '_blank', 'width=900,height=900,toolbar=yes,scrollbars=yes');
        if (!printWindow) {
            alert('Please allow pop-ups to print the receipt');
            return;
        }

        const hasLogo = institution?.mI_Logo && institution.mI_Logo.trim() !== '';
        const logoUrl = institution?.mI_Logo || '';
        const instituteName = institution?.mI_Name || '';

        const documentHtml = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Receipt - ${instituteName} ${new Date().toLocaleDateString()}</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            padding: 20px;
                            background: white;
                        }
                        
                        .print-container {
                            max-width: 100%;
                            margin: 0 auto;
                            background: white;
                        }
                        
                        .print-header {
                            text-align: center;
                            margin-bottom: 30px;
                            padding-bottom: 20px;
                            border-bottom: 2px solid #333;
                        }
                        
                        .logo-wrapper {
                            margin-bottom: 15px;
                        }
                        
                        .print-logo {
                            max-width: 100px;
                            max-height: 100px;
                            object-fit: contain;
                            border-radius: 50%;
                            border: 1px solid #ddd;
                            padding: 5px;
                        }
                        
                        .print-school-name {
                            font-size: 24px;
                            font-weight: bold;
                            margin-bottom: 5px;
                            color: #000;
                        }
                        
                        .print-title {
                            font-size: 20px;
                            font-weight: bold;
                            text-align: center;
                            margin: 20px 0;
                            text-transform: uppercase;
                            letter-spacing: 2px;
                        }
                        
                        .print-content {
                            margin: 20px 0;
                        }
                        
                        .print-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 15px 0;
                        }
                        
                        .print-table th,
                        .print-table td {
                            border: 1px solid #000;
                            padding: 10px;
                            text-align: left;
                            font-size: 12px;
                        }
                        
                        .print-table th {
                            background: #f5f5f5;
                            font-weight: bold;
                        }
                        
                        .print-footer {
                            margin-top: 40px;
                            padding-top: 20px;
                            text-align: center;
                            border-top: 1px solid #ddd;
                            font-size: 10px;
                            color: #666;
                        }
                        
                        @media print {
                            body {
                                padding: 0;
                                margin: 0;
                            }
                            
                            .print-container {
                                padding: 15px;
                            }
                            
                            .print-table th,
                            .print-table td {
                                border-color: #000 !important;
                            }
                        }
                        
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .text-left { text-align: left; }
                    </style>
                </head>
                <body>
                    <div class="print-container">
                        <div class="print-header">
                            ${
                                hasLogo
                                    ? `
                                <div class="logo-wrapper">
                                    <img src="${logoUrl}" alt="Institute Logo" class="print-logo" 
                                         onerror="this.style.display='none'" />
                                </div>
                            `
                                    : ''
                            }
                            
                            ${instituteName ? `<div class="print-school-name">${instituteName}</div>` : ''}
                        </div>
                        
                        <div class="print-title">OFFICIAL RECEIPT</div>
                        
                        <div class="print-content">
                            ${htmlContent}
                        </div>
                        
                        <div class="print-footer">
                            <p>This is a computer-generated receipt and requires no signature.</p>
                            <p>Generated on: ${new Date().toLocaleString()}</p>
                        </div>
                    </div>
                    
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                window.onafterprint = function() {
                                    window.close();
                                };
                            }, 500);
                        };
                    <\/script>
                </body>
            </html>
        `;

        printWindow.document.write(documentHtml);
        printWindow.document.close();
    };

    return (
        <Button
            onClick={handlePrint}
            className='min-w-[100px] bg-blue-600 text-white transition-all duration-200 hover:scale-105 hover:bg-blue-700'>
            <Printer className='mr-2 h-4 w-4' />
            Print
        </Button>
    );
};
