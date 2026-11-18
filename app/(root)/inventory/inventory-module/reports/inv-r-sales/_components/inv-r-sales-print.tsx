import type { IInvRSalesReportData } from '@/types/inventory/reports/inv-r-sales';
import { format } from 'date-fns';
import React from 'react';

interface InvRSalesPrintProps {
    data: IInvRSalesReportData[];
    payload: any | null; // using any since InvRSalesSchema is used in page
}

export const InvRSalesPrint = React.forwardRef<HTMLDivElement, InvRSalesPrintProps>(({ data, payload }, ref) => {
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
    const showTax = payload.showTax || false;
    const showDiscount = payload.showDiscount || false;

    const renderTableHead = () => {
        if (typeflag === 'All') {
            return (
                <tr>
                    <th className='w-16 text-center'>Sl.No</th>
                    <th>Item</th>
                    <th>Sale No</th>
                    <th>Sale Date</th>
                    <th className='text-right'>Quantity</th>
                    <th className='text-right'>Price</th>
                    <th className='text-right'>Amount</th>
                    {showTax && <th className='text-right'>Tax</th>}
                    {showDiscount && <th className='text-right'>Discount</th>}
                </tr>
            );
        } else if (typeflag === 'Detailed') {
            if (optionflag === 'Item') {
                return (
                    <tr>
                        <th className='w-16 text-center'>Sl.No</th>
                        <th>Sale No</th>
                        <th>Sale Date</th>
                        <th>Item</th>
                        <th className='text-right'>Quantity</th>
                        <th className='text-right'>Price</th>
                        <th className='text-right'>Amount</th>
                        {showTax && <th className='text-right'>Tax</th>}
                        {showDiscount && <th className='text-right'>Discount</th>}
                    </tr>
                );
            } else if (['Student', 'Staff', 'Customer', 'Saleno'].includes(optionflag)) {
                return (
                    <tr>
                        <th className='w-16 text-center'>Sl.No</th>
                        <th>Sale No</th>
                        <th>Sale Date</th>
                        <th>Item</th>
                        <th>Name</th>
                        <th className='text-right'>Quantity</th>
                        <th className='text-right'>Price</th>
                        <th className='text-right'>Amount</th>
                        {showTax && <th className='text-right'>Tax</th>}
                        {showDiscount && <th className='text-right'>Discount</th>}
                    </tr>
                );
            }
        } else if (typeflag === 'Overall') {
            if (optionflag === 'Item') {
                return (
                    <tr>
                        <th className='w-16 text-center'>Sl.No</th>
                        <th>Item</th>
                        <th className='text-right'>Quantity</th>
                        <th className='text-right'>Price</th>
                        <th className='text-right'>Amount</th>
                        {showTax && <th className='text-right'>Tax</th>}
                        {showDiscount && <th className='text-right'>Discount</th>}
                    </tr>
                );
            } else if (['Student', 'Staff', 'Customer'].includes(optionflag)) {
                return (
                    <tr>
                        <th className='w-16 text-center'>Sl.No</th>
                        <th>Name</th>
                        <th className='text-right'>Quantity</th>
                        <th className='text-right'>Price</th>
                        <th className='text-right'>Amount</th>
                        {showTax && <th className='text-right'>Tax</th>}
                        {showDiscount && <th className='text-right'>Discount</th>}
                    </tr>
                );
            }
        }
        return null;
    };

    const renderTableBody = () => {
        return data.map((item: any, index: number) => {
            const slNo = <td className='text-center'>{index + 1}</td>;
            const saleNo = <td>{item.invmsL_SalesNo || item.invmsl_SalesNo || item.Invmsl_SalesNo || item.invmsl_salesno || '-'}</td>;

            const rawDate = item.sales_Date || item.invmsL_SalesDate || item.invmsl_SalesDate || item.invmsl_salesdate;
            const saleDate = <td>{rawDate ? rawDate.split('T')[0] : '-'}</td>;

            const itemName = <td>{item.item_Name || item.invmI_ItemName || item.invmi_ItemName || item.invmi_itemname || '-'}</td>;
            const name = <td>{item.membername || item.memberName || '-'}</td>;

            const qty = item.sales_Qty ?? item.invtsL_SalesQty ?? item.saleQty ?? item.invtsl_SalesQty ?? item.invtsl_salesqty ?? 0;
            const quantity = <td className='text-right'>{Number(qty).toFixed(2)}</td>;

            const pr =
                item.sales_Price ?? item.invtsL_SalesPrice ?? item.salePrice ?? item.invtsl_SalesPrice ?? item.invtsl_salesprice ?? 0;
            const price = <td className='text-right'>{Number(pr).toFixed(2)}</td>;

            const amt = item.total_Amount ?? item.invtsL_Amount ?? item.saleAmount ?? item.invtsl_Amount ?? item.invtsl_amount ?? 0;
            const amount = <td className='text-right'>{Number(amt).toFixed(2)}</td>;

            const tx = item.tax_Amt ?? item.invtsL_TaxAmt ?? item.saleTax ?? item.invtsl_TaxAmt ?? item.invtsl_taxamt ?? 0;
            const tax = <td className='text-right'>{Number(tx).toFixed(2)}</td>;

            const disc =
                item.discount_Amt ??
                item.invtsL_DiscountAmt ??
                item.saleDiscount ??
                item.invtsl_DiscountAmt ??
                item.invtsl_discountamt ??
                0;
            const discount = <td className='text-right'>{Number(disc).toFixed(2)}</td>;

            if (typeflag === 'All') {
                return (
                    <tr key={index}>
                        {slNo}
                        {itemName}
                        {saleNo}
                        {saleDate}
                        {quantity}
                        {price}
                        {amount}
                        {showTax && tax}
                        {showDiscount && discount}
                    </tr>
                );
            } else if (typeflag === 'Detailed') {
                if (optionflag === 'Item') {
                    return (
                        <tr key={index}>
                            {slNo}
                            {saleNo}
                            {saleDate}
                            {itemName}
                            {quantity}
                            {price}
                            {amount}
                            {showTax && tax}
                            {showDiscount && discount}
                        </tr>
                    );
                } else if (['Student', 'Staff', 'Customer', 'Saleno'].includes(optionflag)) {
                    return (
                        <tr key={index}>
                            {slNo}
                            {saleNo}
                            {saleDate}
                            {itemName}
                            {name}
                            {quantity}
                            {price}
                            {amount}
                            {showTax && tax}
                            {showDiscount && discount}
                        </tr>
                    );
                }
            } else if (typeflag === 'Overall') {
                if (optionflag === 'Item') {
                    return (
                        <tr key={index}>
                            {slNo}
                            {itemName}
                            {quantity}
                            {price}
                            {amount}
                            {showTax && tax}
                            {showDiscount && discount}
                        </tr>
                    );
                } else if (['Student', 'Staff', 'Customer'].includes(optionflag)) {
                    return (
                        <tr key={index}>
                            {slNo}
                            {name}
                            {quantity}
                            {price}
                            {amount}
                            {showTax && tax}
                            {showDiscount && discount}
                        </tr>
                    );
                }
            }
            return null;
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
                                <h2 className='font-bold text-lg uppercase'>Sales Report</h2>
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
                                        <td colSpan={1} className='px-4 text-right'>
                                            Total Records:
                                        </td>
                                        <td colSpan={10} className='px-4 text-left'>
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

InvRSalesPrint.displayName = 'InvRSalesPrint';
