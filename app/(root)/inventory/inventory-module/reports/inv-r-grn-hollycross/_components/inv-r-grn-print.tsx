import type { IInvRGRNPayload, IInvRGRNReportData } from '@/types/inventory/reports/inv-r-grn';
import { format } from 'date-fns';
import React from 'react';

interface InvRGRNPrintProps {
    data: IInvRGRNReportData[];
    payload: IInvRGRNPayload | null;
}

export const InvRGRNPrint = React.forwardRef<HTMLDivElement, InvRGRNPrintProps>(({ data, payload }, ref) => {
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
        if (typeflag === 'All' || typeflag === 'Detailed') {
            return (
                <tr>
                    <th className='w-16 text-center'>Sl.No</th>
                    <th>GRN No</th>
                    <th>Purchase Date</th>
                    <th>Supplier</th>
                    <th>Item</th>
                    <th>Kit No</th>
                    <th>UOM</th>
                    <th className='text-right'>Quantity</th>
                    <th className='text-right'>Overall Qty</th>
                    <th className='text-right'>Rate</th>
                    <th className='text-right'>MRP</th>
                    <th className='text-right'>Sale Price</th>
                    <th className='text-right'>Discount</th>
                    <th className='text-right'>Tax</th>
                    <th className='text-right'>Total Amount</th>
                </tr>
            );
        } else if (typeflag === 'Overall') {
            if (optionflag === 'Item_1') {
                return (
                    <tr>
                        <th className='w-16 text-center'>Sl.No</th>
                        <th>Item</th>
                        <th>Item Code</th>
                        <th className='text-right'>Quantity</th>
                        <th className='text-right'>Overall Qty</th>
                        <th className='text-right'>Rate</th>
                        <th className='text-right'>MRP</th>
                        <th className='text-right'>Sale Price</th>
                        <th className='text-right'>Discount</th>
                        <th className='text-right'>Tax</th>
                        <th className='text-right'>Amount</th>
                    </tr>
                );
            } else if (optionflag === 'Supplier') {
                return (
                    <tr>
                        <th className='w-16 text-center'>Sl.No</th>
                        <th>Supplier Name</th>
                        <th>Code</th>
                        <th>Contact No.</th>
                        <th>Email ID</th>
                        <th className='text-right'>Quantity</th>
                        <th className='text-right'>Overall Qty</th>
                        <th className='text-right'>Rate</th>
                        <th className='text-right'>MRP</th>
                        <th className='text-right'>Sale Price</th>
                        <th className='text-right'>Discount</th>
                        <th className='text-right'>Tax</th>
                        <th className='text-right'>Amount</th>
                    </tr>
                );
            }
        }
        return null;
    };

    const renderTableBody = () => {
        if (typeflag === 'All' || typeflag === 'Detailed') {
            return data.map((item, index) => (
                <tr key={index}>
                    <td className='text-center'>{index + 1}</td>
                    <td>{item.invmgrn_grnno || '-'}</td>
                    <td>{item.invmgrn_purchasedate ? item.invmgrn_purchasedate.split('T')[0] : '-'}</td>
                    <td>{item.invms_suppliername || '-'}</td>
                    <td>{item.invmi_itemname || '-'}</td>
                    <td>{item.invtgrn_naration || item.invtgrN_Naration || '-'}</td>
                    <td>{item.invmuom_uomname || '-'}</td>
                    <td className='text-right'>{Number(item.invtgrn_qty || 0).toFixed(2)}</td>
                    <td className='text-right'>{Number(item.OverallQty || 0).toFixed(2)}</td>
                    <td className='text-right'>{Number(item.invtgrn_purchaserate || 0).toFixed(2)}</td>
                    <td className='text-right'>{Number(item.invtgrn_mrp || 0).toFixed(2)}</td>
                    <td className='text-right'>{Number(item.invtgrn_salesprice || 0).toFixed(2)}</td>
                    <td className='text-right'>{Number(item.invtgrn_discountamt || 0).toFixed(2)}</td>
                    <td className='text-right'>{Number(item.invtgrn_taxamt || 0).toFixed(2)}</td>
                    <td className='text-right'>{Number(item.invtgrn_amount || 0).toFixed(2)}</td>
                </tr>
            ));
        } else if (typeflag === 'Overall') {
            if (optionflag === 'Item_1') {
                return data.map((item, index) => (
                    <tr key={index}>
                        <td className='text-center'>{index + 1}</td>
                        <td>{item.invmi_itemname || item.invmI_ItemName || '-'}</td>
                        <td>{item.invmi_itemcode || item.invmI_ItemCode || '-'}</td>
                        <td className='text-right'>{Number((item.grnQuantity ?? item.grnquantity) || 0).toFixed(2)}</td>
                        <td className='text-right'>{Number(item.OverallQty || 0).toFixed(2)}</td>
                        <td className='text-right'>{Number((item.grnRate ?? item.grnrate) || 0).toFixed(2)}</td>
                        <td className='text-right'>{Number((item.grnMRP ?? item.grnmrp) || 0).toFixed(2)}</td>
                        <td className='text-right'>{Number((item.grnSalePrice ?? item.grnsaleprice) || 0).toFixed(2)}</td>
                        <td className='text-right'>{Number((item.grnDiscount ?? item.grndiscount) || 0).toFixed(2)}</td>
                        <td className='text-right'>{Number((item.grnTax ?? item.grntax) || 0).toFixed(2)}</td>
                        <td className='text-right'>{Number((item.grnAmount ?? item.grnamount) || 0).toFixed(2)}</td>
                    </tr>
                ));
            } else if (optionflag === 'Supplier') {
                return data.map((item, index) => (
                    <tr key={index}>
                        <td className='text-center'>{index + 1}</td>
                        <td>{item.invms_suppliername || item.invmS_SupplierName || '-'}</td>
                        <td>{item.invmS_SupplierCode || '-'}</td>
                        <td>{item.invms_supplierconatctno || item.invmS_SupplierConatctNo || '-'}</td>
                        <td>{item.invms_emailid || item.invmS_EmailId || '-'}</td>
                        <td className='text-right'>{Number((item.grnQuantity ?? item.grnquantity) || 0).toFixed(2)}</td>
                        <td className='text-right'>{Number(item.OverallQty || 0).toFixed(2)}</td>
                        <td className='text-right'>{Number((item.grnRate ?? item.grnrate) || 0).toFixed(2)}</td>
                        <td className='text-right'>{Number((item.grnMRP ?? item.grnmrp) || 0).toFixed(2)}</td>
                        <td className='text-right'>{Number((item.grnSalePrice ?? item.grnsaleprice) || 0).toFixed(2)}</td>
                        <td className='text-right'>{Number((item.grnDiscount ?? item.grndiscount) || 0).toFixed(2)}</td>
                        <td className='text-right'>{Number((item.grnTax ?? item.grntax) || 0).toFixed(2)}</td>
                        <td className='text-right'>{Number((item.grnAmount ?? item.grnamount) || 0).toFixed(2)}</td>
                    </tr>
                ));
            }
        }
        return null;
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
                                <h2 className='font-bold text-lg uppercase'>Goods Receipt Note (GRN) Report</h2>
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
                                        <td colSpan={14} className='px-4 text-left'>
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

InvRGRNPrint.displayName = 'InvRGRNPrint';
