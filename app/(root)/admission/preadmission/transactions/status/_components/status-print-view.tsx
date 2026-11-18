'use client';

import { format } from 'date-fns';
import React from 'react';

interface StatusPrintViewProps {
    data: any[];
    userName: string;
}

const StatusPrintView = React.forwardRef<HTMLDivElement, StatusPrintViewProps>(({ data, userName }, ref) => {
    const currentDate = format(new Date(), 'dd/MM/yyyy');

    if (!data || data.length === 0) {
        return (
            <div ref={ref} className='bg-white p-5 text-center text-black'>
                No data selected for printing.
            </div>
        );
    }

    return (
        <div ref={ref} className='print-preview-container min-h-full w-full bg-white text-black'>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page {
                            margin: 10mm;
                            size: A4 portrait;
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
                            padding: 6px;
                            font-size: 11px;
                        }
                        .data-table th {
                            background-color: #f3f4f6;
                            font-weight: bold;
                            text-align: left;
                            -webkit-print-color-adjust: exact;
                        }
                        .data-table td {
                            text-align: left;
                        }
                        .data-table .text-center {
                            text-align: center;
                        }
                        .header-section {
                            text-align: center;
                            padding-bottom: 20px;
                        }
                        .footer-section {
                            padding-top: 20px;
                            display: flex;
                            justify-content: space-between;
                            font-size: 11px;
                        }
                        .no-border {
                            border: none !important;
                        }
                    }
                `
                }}
            />

            <table className='main-table no-border'>
                <thead>
                    <tr>
                        <td className='no-border'>
                            {/* Header */}
                            <div className='header-section text-center'>
                                <h2 className='font-bold text-lg uppercase underline'>Preadmission Status Report</h2>
                                <p className='mt-1 text-gray-600 text-xs'>Generated on: {currentDate}</p>
                            </div>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className='no-border'>
                            <table className='data-table w-full'>
                                <thead>
                                    <tr>
                                        <th className='w-12 text-center'>SL.No</th>
                                        <th>Student Name</th>
                                        <th className='text-center'>Class</th>
                                        <th>RegNo</th>
                                        <th className='text-center'>Status</th>
                                        <th className='text-center'>Mobile No.</th>
                                        <th>Remark</th>
                                        <th>Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((user, index) => (
                                        <tr key={index}>
                                            <td className='text-center'>{index + 1}</td>
                                            <td className='font-semibold'>{user.name}</td>
                                            <td className='text-center'>{user.className}</td>
                                            <td>{user.pasR_RegistrationNo}</td>
                                            <td className='text-center'>{user.statusName}</td>
                                            <td className='text-center'>{user.pasR_MobileNo}</td>
                                            <td className='italic'>{user.remark || '-'}</td>
                                            <td>{user.pasR_emailId}</td>
                                        </tr>
                                    ))}
                                    <tr className='bg-gray-100 font-bold'>
                                        <td colSpan={1} className='text-center'>
                                            Total
                                        </td>
                                        <td colSpan={7} className='px-4 text-left'>
                                            {data.length} Records
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td className='no-border'>
                            <div className='footer-section mt-4 border-t pt-4'>
                                <div>Printed Date: {currentDate}</div>
                                <div>Printed By: {userName || 'System Admin'}</div>
                                <div>Authorized Signature</div>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
});

StatusPrintView.displayName = 'StatusPrintView';
export default StatusPrintView;
