'use client';

import { Button } from '@/components/ui/button';
import type {
    IInvVendorPaymentDetails,
    IInvVendorPaymentOverallReport,
    IInvVendorPaymentVendorReport
} from '@/types/inventory/reports/inv-r-vendor-payment';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

export const overallColumns: ColumnDef<IInvVendorPaymentOverallReport>[] = [
    {
        accessorKey: 'index',
        header: 'SL.NO',
        cell: ({ row, table }) => table.getState().pagination.pageIndex * table.getState().pagination.pageSize + row.index + 1
    },
    {
        accessorKey: 'invmS_SupplierName',
        header: 'Supplier'
    },
    {
        accessorKey: 'invmgrN_GRNNo',
        header: 'GRN No'
    },
    {
        accessorKey: 'invspT_PaymentDate',
        header: 'Payment Date',
        cell: ({ row }) => {
            const date = row.getValue('invspT_PaymentDate');
            return date ? format(new Date(date as string), 'dd-MM-yyyy') : '-';
        }
    },
    {
        accessorKey: 'invspT_ModeOfPayment',
        header: 'Mode Of Payment'
    },
    {
        accessorKey: 'invspT_ChequeDDNo',
        header: 'Cheque/DD No',
        cell: ({ row }) => row.original.invspT_ChequeDDNo || '-'
    },
    {
        accessorKey: 'invspT_BankName',
        header: 'Bank Name',
        cell: ({ row }) => row.original.invspT_BankName || '-'
    },
    {
        accessorKey: 'invmgrN_TotalPaid',
        header: 'Amount',
        cell: ({ row }) => Number(row.original.invmgrN_TotalPaid || 0).toFixed(2)
    },
    {
        accessorKey: 'invspT_Remarks',
        header: 'Remarks'
    }
];

export const vendorPaymentColumns = (
    onVendorClick: (vendor: IInvVendorPaymentVendorReport) => void
): ColumnDef<IInvVendorPaymentVendorReport>[] => [
    {
        accessorKey: 'index',
        header: 'SL.NO',
        cell: ({ row, table }) => table.getState().pagination.pageIndex * table.getState().pagination.pageSize + row.index + 1
    },
    {
        accessorKey: 'vendorName',
        header: 'Vendor Name',
        cell: ({ row }) => (
            <Button variant='link' onClick={() => onVendorClick(row.original)}>
                {row.original.vendorName}
            </Button>
        )
    },
    {
        accessorKey: 'gstNo',
        header: 'GST No',
        cell: ({ row }) => row.original.gstNo || '-'
    },
    {
        accessorKey: 'totalAmount',
        header: 'Amount'
    },
    {
        accessorKey: 'totalPaidAmount',
        header: 'Paid Amount'
    },
    {
        accessorKey: 'balanceAmount',
        header: 'Balance Amount'
    }
];

export const vendorDetailsColumns: ColumnDef<IInvVendorPaymentDetails>[] = [
    {
        accessorKey: 'index',
        header: 'SL.NO',
        cell: ({ row, table }) => table.getState().pagination.pageIndex * table.getState().pagination.pageSize + row.index + 1
    },
    {
        accessorKey: 'grnNO',
        header: 'GRN NO'
    },
    {
        accessorKey: 'invmgrN_PurchaseDate',
        header: 'Date',
        cell: ({ row }) => {
            const date = row.getValue('invmgrN_PurchaseDate');
            return date ? format(new Date(date as string), 'dd-MM-yyyy') : '-';
        }
    },
    {
        accessorKey: 'totalAmount',
        header: 'Amount'
    },
    {
        accessorKey: 'totalPaidAmount',
        header: 'Paid Amount'
    },
    {
        accessorKey: 'balanceAmount',
        header: 'Balance Amount'
    }
];
