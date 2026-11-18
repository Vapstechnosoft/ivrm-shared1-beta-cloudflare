import type { IInvRItemConsumptionReportData } from '@/types/inventory/reports/inv-r-item-consumption';
import { format } from 'date-fns';
import React from 'react';

interface InvRItemConsumptionPrintProps {
    data: IInvRItemConsumptionReportData[];
    payload: any | null;
}

export const InvRItemConsumptionPrint = React.forwardRef<HTMLDivElement, InvRItemConsumptionPrintProps>(({ data, payload }, ref) => {
    const currentDate = format(new Date(), 'dd/MM/yyyy');

    if (!data || data.length === 0 || !payload) {
        return (
            <div ref={ref} className='bg-white p-5 text-center text-black'>
                No data selected for printing.
            </div>
        );
    }

    const typeflag = payload.typeflag || 'All';
    const optionflag = payload.optionflag;

    const renderTableHead = () => {
        if (typeflag === 'Overall') {
            if (optionflag === 'Item') {
                return (
                    <tr>
                        <th className='w-16 text-center'>Sl.No</th>
                        <th>Item</th>
                        <th>UOM</th>
                        <th className='text-right'>Quantity</th>
                    </tr>
                );
            }
            if (optionflag === 'Staff') {
                return (
                    <tr>
                        <th className='w-16 text-center'>Sl.No</th>
                        <th>Employee Name</th>
                        <th>Employee Code</th>
                        <th className='text-right'>Quantity</th>
                    </tr>
                );
            }
            if (optionflag === 'Department') {
                return (
                    <tr>
                        <th className='w-16 text-center'>Sl.No</th>
                        <th>Department</th>
                        <th className='text-right'>Quantity</th>
                    </tr>
                );
            }
            if (optionflag === 'Student') {
                return (
                    <tr>
                        <th className='w-16 text-center'>Sl.No</th>
                        <th>Student Name</th>
                        <th>Admission No.</th>
                        <th className='text-right'>Quantity</th>
                    </tr>
                );
            }
        }
        if (typeflag === 'Detailed' && optionflag === 'Item') {
            return (
                <tr>
                    <th className='w-16 text-center'>Sl.No</th>
                    <th>Item</th>
                    <th>UOM</th>
                    <th>Date</th>
                    <th className='text-right'>Quantity</th>
                </tr>
            );
        }

        // Default
        return (
            <tr>
                <th className='w-16 text-center'>Sl.No</th>
                <th>Item</th>
                <th>UOM</th>
                <th>Date</th>
                <th className='text-right'>Quantity</th>
            </tr>
        );
    };

    const renderTableBody = () => {
        return data.map((item: any, index: number) => {
            const slNo = <td className='text-center'>{index + 1}</td>;
            const itemName = <td>{item.itemName || '-'}</td>;
            const uom = <td>{item.invmuoM_UOMName || '-'}</td>;
            const qty = <td className='text-right'>{Number(item.icQty || 0).toFixed(2)}</td>;
            const date = <td>{item.icDate ? format(new Date(item.icDate), 'dd/MM/yyyy') : '-'}</td>;

            const memberName = <td>{item.memberName || '-'}</td>;
            const memberCode = <td>{item.memberCode || '-'}</td>;

            if (typeflag === 'Overall') {
                if (optionflag === 'Item') {
                    return (
                        <tr key={index}>
                            {slNo}
                            {itemName}
                            {uom}
                            {qty}
                        </tr>
                    );
                }
                if (optionflag === 'Staff') {
                    return (
                        <tr key={index}>
                            {slNo}
                            {memberName}
                            {memberCode}
                            {qty}
                        </tr>
                    );
                }
                if (optionflag === 'Department') {
                    return (
                        <tr key={index}>
                            {slNo}
                            {memberName}
                            {qty}
                        </tr>
                    );
                }
                if (optionflag === 'Student') {
                    return (
                        <tr key={index}>
                            {slNo}
                            {memberName}
                            {memberCode}
                            {qty}
                        </tr>
                    );
                }
            }
            if (typeflag === 'Detailed' && optionflag === 'Item') {
                return (
                    <tr key={index}>
                        {slNo}
                        {itemName}
                        {uom}
                        {date}
                        {qty}
                    </tr>
                );
            }

            // Default
            return (
                <tr key={index}>
                    {slNo}
                    {itemName}
                    {uom}
                    {date}
                    {qty}
                </tr>
            );
        });
    };

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
                                padding: 8px;
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
                            .data-table .text-right {
                                text-align: right;
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
                                font-size: 12px;
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
                            <div className='header-section text-center'>
                                <h2 className='font-bold text-lg uppercase'>Item Consumption Report</h2>
                                <p className='text-gray-600 text-sm'>Date: {currentDate}</p>
                            </div>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className='no-border'>
                            <table className='data-table w-full'>
                                <thead>{renderTableHead()}</thead>
                                <tbody>
                                    {renderTableBody()}
                                    <tr className='bg-gray-100 font-bold'>
                                        <td colSpan={1} className='px-4 text-right'>
                                            Total Records:
                                        </td>
                                        <td colSpan={6} className='px-4 text-left'>
                                            {data.length}
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

InvRItemConsumptionPrint.displayName = 'InvRItemConsumptionPrint';
