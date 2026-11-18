'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { FormProvider } from '@/components/ui/form/form-provider';
import { GenericDataTable, useDataTableProps } from '@/components/ui/view-data-table/view-generic-data-table';
import type { IExamSubjectGroupingDetails } from '@/types/exam/exam-module/exam-mapping';
import type { IFeeTDetails } from '@/types/fees/transactions/transactions';
import type { ColumnDef } from '@tanstack/react-table';

interface FeeDetailsProps {
    onClose: () => void;
    data: IFeeTDetails[];
    loading: boolean;
}

export default function FeeDetails({ onClose, data, loading }: FeeDetailsProps) {
    const getTotalRow = (data: IFeeTDetails[]): IFeeTDetails => {
        const sum = (key: keyof IFeeTDetails) => data.reduce((acc, item) => acc + (Number(item[key]) || 0), 0);
        return {
            fmG_Id: 0,
            fmG_GroupName: 'Total',
            fsS_CurrentYrCharges: sum('fsS_CurrentYrCharges'),
            fsS_ConcessionAmount: sum('fsS_ConcessionAmount'),
            fsS_WaivedAmount: sum('fsS_WaivedAmount'),
            fsS_AdjustedAmount: sum('fsS_AdjustedAmount'),
            fsS_TotalToBePaid: sum('fsS_TotalToBePaid'),
            fsS_PaidAmount: sum('fsS_PaidAmount'),
            fsS_ToBePaid: sum('fsS_ToBePaid'),
            fsS_RefundAmount: sum('fsS_RefundAmount'),
            fsS_RunningExcessAmount: sum('fsS_RunningExcessAmount'),
            fsS_FineAmount: sum('fsS_FineAmount')
        } as IFeeTDetails;
    };
    const finalData = data.length ? [...data, getTotalRow(data)] : [];
    const tableProps = useDataTableProps({
        data: finalData,
        total: finalData.length,
        pageIndex: 0,
        pageSize: 5
    });

    return (
        <FormProvider<IExamSubjectGroupingDetails>>
            <div className='fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-[10vh]'>
                <div className='relative mx-auto w-[75%] rounded-2xl bg-white p-6 shadow-xl'>
                    {/* Header Section */}
                    <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                        <Heading title='Fee Details' />
                        <Button
                            variant='secondary'
                            onClick={onClose}
                            className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                            Close
                        </Button>
                    </div>

                    <GenericDataTable<IFeeTDetails>
                        {...tableProps}
                        columns={feeDetailsColumn}
                        isLoading={loading}
                        columnPinning={{ right: ['actions'] }}
                        noDataTitle='No Data Found'
                        noDataDescription='No Fee Details available.'
                        errorTitle='Error Loading Data'
                        showViewOptions={false}
                    />
                </div>
            </div>
        </FormProvider>
    );
}

export const feeDetailsColumn: ColumnDef<IFeeTDetails>[] = [
    {
        accessorKey: 'fmG_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL No' />,
        cell: ({ row, table }) => {
            const isTotal = row.original.fmG_GroupName === 'Total';
            if (isTotal) return <div className='font-bold'>-</div>;
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        }
    },
    {
        accessorKey: 'fmG_GroupName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group Name' />,
        cell: ({ row }) => {
            const isTotal = row.original.fmG_GroupName === 'Total';

            return <div className={isTotal ? 'font-bold text-blue-600' : ''}>{row.getValue('fmG_GroupName')}</div>;
        }
    },
    ...[
        'fsS_CurrentYrCharges',
        'fsS_ConcessionAmount',
        'fsS_WaivedAmount',
        'fsS_AdjustedAmount',
        'fsS_TotalToBePaid',
        'fsS_PaidAmount',
        'fsS_ToBePaid',
        'fsS_RefundAmount',
        'fsS_RunningExcessAmount',
        'fsS_FineAmount'
    ].map((key) => ({
        accessorKey: key,
        header: ({ column }: any) => <DataTableColumnHeader column={column} title={getColumnTitle(key)} />,
        cell: ({ row }: any) => {
            const isTotal = row.original.fmG_GroupName === 'Total';

            return <div className={isTotal ? 'font-bold' : ''}>{row.getValue(key)}</div>;
        }
    }))
];

const getColumnTitle = (key: string) => {
    switch (key) {
        case 'fsS_CurrentYrCharges':
            return 'Total Charges';
        case 'fsS_ConcessionAmount':
            return 'Total Concession';
        case 'fsS_WaivedAmount':
            return 'Total WaivedOff';
        case 'fsS_AdjustedAmount':
            return 'Total Adjustment';
        case 'fsS_TotalToBePaid':
            return 'Total Payable';
        case 'fsS_PaidAmount':
            return 'Total Paid Amount';
        case 'fsS_ToBePaid':
            return 'Total Outstanding';
        case 'fsS_RefundAmount':
            return 'Total Refund';
        case 'fsS_RunningExcessAmount':
            return 'Total Excess';
        case 'fsS_FineAmount':
            return 'Total Fine';
        default:
            return key;
    }
};
