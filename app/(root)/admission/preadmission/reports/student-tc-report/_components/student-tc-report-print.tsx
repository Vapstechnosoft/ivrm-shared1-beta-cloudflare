import { format } from 'date-fns';
import React from 'react';
import { FIELD_CONFIG } from './columns';

interface StudentTcReportPrintProps {
    data: any[];
    selectedFields: string[];
}

export const StudentTcReportPrint = React.forwardRef<HTMLDivElement, StudentTcReportPrintProps>(({ data, selectedFields }, ref) => {
    const currentDate = format(new Date(), 'dd/MM/yyyy');

    if (!data || data.length === 0) {
        return (
            <div ref={ref} className='bg-white p-5 text-center text-black'>
                No data selected for printing.
            </div>
        );
    }

    const formatDate = (date: unknown): string => {
        if (typeof date !== 'string') return 'N/A';
        if (!date) return 'N/A';
        try {
            return format(new Date(date), 'dd-MM-yyyy');
        } catch {
            return 'N/A';
        }
    };

    return (
        <div ref={ref} className='print-preview-container min-h-full w-full bg-white text-black'>
            <style>
                {`
                        @media print {
                            @page {
                                margin: 10mm;
                                size: A4 landscape;
                            }
                            body {
                                visibility: hidden;
                                background: white;
                                margin: 0;
                                padding: 0;
                            }
                            .print-preview-container {
                                visibility: visible !important;
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                                background: white;
                                z-index: 9999;
                                color: black;
                            }
                            .print-preview-container * {
                                visibility: visible !important;
                            }
                            .main-table {
                                width: 100%;
                                border-collapse: collapse;
                                border: none !important;
                            }
                            .data-table {
                                width: 100%;
                                border-collapse: collapse;
                                border: 1px solid #000;
                            }
                            .data-table th, .data-table td {
                                border: 1px solid #000;
                                padding: 4px;
                                text-align: center;
                                font-size: 10px;
                            }
                            .data-table th {
                                background-color: #f3f4f6;
                                font-weight: bold;
                                -webkit-print-color-adjust: exact;
                            }
                            .text-left {
                                text-align: left !important;
                            }
                            .header-section {
                                text-align: center;
                                padding-bottom: 20px;
                            }
                            .footer-section {
                                padding-top: 20px;
                                display: flex;
                                justify-content: space-between;
                                font-size: 10px;
                            }
                            .no-border {
                                border: none !important;
                            }
                        }
                    `}
            </style>

            <table className='main-table no-border'>
                <thead>
                    <tr>
                        <td className='no-border'>
                            {/* Header */}
                            <div className='header-section text-center'>
                                <h2 className='font-bold text-lg uppercase'>Student TC Report</h2>
                                <p className='text-gray-600 text-sm'>Date: {currentDate}</p>
                            </div>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className='no-border'>
                            {/* Table */}
                            <table className='data-table w-full'>
                                <thead>
                                    <tr className='bg-gray-100'>
                                        <th className='w-12'>Sl.No</th>
                                        {selectedFields.map((fieldId) => (
                                            <th key={fieldId}>{FIELD_CONFIG[fieldId]?.label || fieldId}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((student, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            {selectedFields.map((fieldId) => {
                                                const value = student[fieldId];
                                                const config = FIELD_CONFIG[fieldId];
                                                const displayValue = config?.isDate ? formatDate(value) : (value ?? 'N/A');
                                                return <td key={`${index}-${fieldId}`}>{displayValue}</td>;
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td className='no-border'>
                            {/* Footer */}
                            <div className='footer-section'>
                                <div>Printed Date: {currentDate}</div>
                                <div>Signature</div>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
});

StudentTcReportPrint.displayName = 'StudentTcReportPrint';
