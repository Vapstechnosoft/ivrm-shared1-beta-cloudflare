import { format } from 'date-fns';
import React from 'react';

interface InvVendorPaymentPrintProps {
    data: any[];
    payload: any | null;
}

export const InvVendorPaymentPrint = React.forwardRef<HTMLDivElement, InvVendorPaymentPrintProps>(({ data, payload }, ref) => {
    const currentDate = format(new Date(), 'dd/MM/yyyy');

    if (!data || data.length === 0 || !payload) {
        return (
            <div ref={ref} className='bg-white p-5 text-center text-black'>
                No data selected for printing.
            </div>
        );
    }

    const reportType = payload.reporttype || 'Overall';

    const renderTableHead = () => {
        if (reportType === 'Overall') {
            return (
                <tr>
                    <th className='w-16 text-center'>Sl.No</th>
                    <th>Supplier</th>
                    <th>GRN No</th>
                    <th>Payment Date</th>
                    <th>Mode</th>
                    <th>Cheque/DD No</th>
                    <th>Bank Name</th>
                    <th className='text-right'>Amount</th>
                    <th>Remarks</th>
                </tr>
            );
        }
        if (reportType === 'Vendor') {
            return (
                <tr>
                    <th className='w-16 text-center'>Sl.No</th>
                    <th>Vendor Name</th>
                    <th>GST No</th>
                    <th className='text-right'>Amount</th>
                    <th className='text-right'>Paid Amount</th>
                    <th className='text-right'>Balance Amount</th>
                </tr>
            );
        }
        return null;
    };

    const renderTableBody = () => {
        return data.map((item: any, index: number) => {
            const slNo = <td className='text-center'>{index + 1}</td>;

            if (reportType === 'Overall') {
                const sup = <td>{item.invmS_SupplierName || '-'}</td>;
                const grn = <td>{item.invmgrN_GRNNo || '-'}</td>;
                const pDate = <td>{item.invspT_PaymentDate ? format(new Date(item.invspT_PaymentDate), 'dd-MM-yyyy') : '-'}</td>;
                const mode = <td>{item.invspT_ModeOfPayment || '-'}</td>;
                const cheque = <td>{item.invspT_ChequeDDNo || '-'}</td>;
                const bank = <td>{item.invspT_BankName || '-'}</td>;
                const amt = <td className='text-right'>{Number(item.invmgrN_TotalPaid || 0).toFixed(2)}</td>;
                const rmk = <td>{item.invspT_Remarks || '-'}</td>;

                return (
                    <tr key={index}>
                        {slNo}
                        {sup}
                        {grn}
                        {pDate}
                        {mode}
                        {cheque}
                        {bank}
                        {amt}
                        {rmk}
                    </tr>
                );
            }

            if (reportType === 'Vendor') {
                const vName = <td>{item.vendorName || '-'}</td>;
                const gst = <td>{item.gstNo || '-'}</td>;
                const amt = <td className='text-right'>{item.totalAmount ?? 0}</td>;
                const pAmt = <td className='text-right'>{item.totalPaidAmount ?? 0}</td>;
                const bAmt = <td className='text-right'>{item.balanceAmount ?? 0}</td>;

                return (
                    <tr key={index}>
                        {slNo}
                        {vName}
                        {gst}
                        {amt}
                        {pAmt}
                        {bAmt}
                    </tr>
                );
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
                            <div className='header-section text-center'>
                                <h2 className='font-bold text-lg uppercase'>Vendor Payment Report</h2>
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
                                        <td colSpan={reportType === 'Overall' ? 8 : 5} className='px-4 text-left'>
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

InvVendorPaymentPrint.displayName = 'InvVendorPaymentPrint';
