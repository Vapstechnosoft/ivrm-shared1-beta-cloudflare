import type { IInvRStockReportData } from '@/types/inventory/reports/inv-r-stock';
import { format } from 'date-fns';
import React from 'react';

interface InvRStockPrintProps {
    data: IInvRStockReportData[];
    payload: any | null;
}

export const InvRStockPrint = React.forwardRef<HTMLDivElement, InvRStockPrintProps>(({ data, payload }, ref) => {
    const currentDate = format(new Date(), 'dd/MM/yyyy');

    if (!data || data.length === 0 || !payload) {
        return (
            <div ref={ref} className='bg-white p-5 text-center text-black'>
                No data selected for printing.
            </div>
        );
    }

    const optionflag = payload.optionflag || 'All';
    const isOverall = payload.overallflag === 'Overall';

    const renderTableHead = () => {
        return (
            <tr>
                <th className='w-16 text-center'>Sl.No</th>
                {optionflag !== 'Item' && <th>Item</th>}
                <th className='text-right'>Opening Balance</th>
                {!isOverall && <th className='text-right'>Rate</th>}
                {!isOverall && <th className='text-right'>OB Amount</th>}
                <th className='text-right'>Sale Qty</th>
                <th className='text-right'>Item Cons.</th>
                <th className='text-right'>Checked Out</th>
                <th className='text-right'>Stock +</th>
                <th className='text-right'>Stock -</th>
                <th className='text-right'>Balance</th>
            </tr>
        );
    };

    const renderTableBody = () => {
        return data.map((item: any, index: number) => {
            const slNo = <td className='text-center'>{index + 1}</td>;
            const itemName = <td>{item.invmI_ItemName || '-'}</td>;

            const obQty = <td className='text-right'>{Number(item.purOBQty || 0).toFixed(2)}</td>;
            const rate = <td className='text-right'>{Number(item.invstO_PurchaseRate || 0).toFixed(2)}</td>;
            const obAmt = <td className='text-right'>{Number(item.obAmount || 0).toFixed(2)}</td>;
            const saleQty = <td className='text-right'>{Number(item.salesQty || 0).toFixed(2)}</td>;
            const itemCons = <td className='text-right'>{Number(item.invstO_ItemConQty || 0).toFixed(2)}</td>;
            const checkedOut = <td className='text-right'>{Number(item.invstO_CheckedOutQty || 0).toFixed(2)}</td>;
            const stockPlus = <td className='text-right'>{Number(item.invstO_PhyPlusQty || 0).toFixed(2)}</td>;
            const stockMin = <td className='text-right'>{Number(item.invstO_PhyMinQty || 0).toFixed(2)}</td>;
            const balance = <td className='text-right font-bold'>{Number(item.invstO_AvaiableStock || 0).toFixed(2)}</td>;

            return (
                <tr key={index}>
                    {slNo}
                    {optionflag !== 'Item' && itemName}
                    {obQty}
                    {!isOverall && rate}
                    {!isOverall && obAmt}
                    {saleQty}
                    {itemCons}
                    {checkedOut}
                    {stockPlus}
                    {stockMin}
                    {balance}
                </tr>
            );
        });
    };

    const closingStockTotal = data.reduce((acc, curr) => acc + (curr.invstO_AvaiableStock || 0), 0);

    return (
        <div ref={ref} className='print-preview-container min-h-full w-full bg-white text-black'>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
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
                            {/* Header */}
                            <div className='header-section text-center'>
                                <h2 className='font-bold text-lg uppercase'>Stock Report</h2>
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
                                <thead>{renderTableHead()}</thead>
                                <tbody>
                                    {renderTableBody()}
                                    <tr className='bg-gray-100 font-bold'>
                                        <td
                                            colSpan={optionflag !== 'Item' ? (!isOverall ? 10 : 8) : !isOverall ? 9 : 7}
                                            className='px-4 text-right'>
                                            Total Records: {data.length}
                                        </td>
                                        <td colSpan={1} className='px-4 text-right font-bold text-green-700'>
                                            Balance: {closingStockTotal.toFixed(2)}
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

InvRStockPrint.displayName = 'InvRStockPrint';
