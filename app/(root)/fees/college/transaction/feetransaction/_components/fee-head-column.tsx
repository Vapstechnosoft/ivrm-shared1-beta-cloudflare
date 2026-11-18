'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { FormProvider } from '@/components/ui/form/form-provider';
import { GenericDataTable, useDataTableProps } from '@/components/ui/view-data-table/view-generic-data-table';
import type { ICollegeFeeHeadDetails } from '@/types/fees/college/transaction/transaction';
import type { ColumnDef } from '@tanstack/react-table';
import { X } from 'lucide-react';
import Portal from './portal';

interface FeeDetailsProps {
    onClose: () => void;
    data: ICollegeFeeHeadDetails[];
    loading?: boolean;
}

export default function FeeDetails({ onClose, data, loading = false }: FeeDetailsProps) {
    const getTotalRow = (items: ICollegeFeeHeadDetails[]): ICollegeFeeHeadDetails => {
        const sum = (key: keyof ICollegeFeeHeadDetails) => items.reduce((acc, item) => acc + (Number(item[key]) || 0), 0);
        return {
            fma_Id: 0,
            fmh_Id: 0,
            fmh_FeeName: 'Total',
            fti_Id: 0,
            fti_Name: '',
            fmg_Id: 0,
            fmg_GroupName: 'Total',
            fma_Amount: sum('fma_Amount'),
            totalamount: sum('totalamount'),
            concession: sum('concession'),
            fine: sum('fine'),
            due: sum('due'),
            payableAmount: sum('payableAmount'),
            nowPaying: sum('nowPaying')
        };
    };

    const finalData = data.length ? [...data, getTotalRow(data)] : [];
    const tableProps = useDataTableProps({
        data: finalData,
        total: finalData.length,
        pageIndex: 0,
        pageSize: 10
    });

    return (
        <Portal>
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
                <div className='relative w-full max-w-5xl rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200'>
                    {/* Header */}
                    <div className='mb-4 flex items-center justify-between border-b pb-4'>
                        <div>
                            <Heading title='College Fee Head Details' description='Breakdown of charges, concessions, dues, and payment heads' />
                        </div>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={onClose}
                            className='flex items-center gap-1.5 hover:bg-destructive/10 hover:text-destructive'>
                            <X className='h-4 w-4' />
                            Close
                        </Button>
                    </div>

                    <FormProvider<ICollegeFeeHeadDetails>>
                        <div className='max-h-[65vh] overflow-auto'>
                            <GenericDataTable<ICollegeFeeHeadDetails>
                                {...tableProps}
                                columns={feeDetailsColumns}
                                isLoading={loading}
                                noDataTitle='No Fee Head Details Available'
                                noDataDescription='No fee head records found for the selected group/term.'
                                showViewOptions={false}
                            />
                        </div>
                    </FormProvider>
                </div>
            </div>
        </Portal>
    );
}

const feeDetailsColumns: ColumnDef<ICollegeFeeHeadDetails>[] = [
    {
        accessorKey: 'fma_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-2' />,
        cell: ({ row, table }) => {
            const isTotal = row.original.fmh_FeeName === 'Total';
            if (isTotal) return <div className='font-bold text-center'>-</div>;
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='pl-2'>{pageIndex * pageSize + row.index + 1}</div>;
        }
    },
    {
        accessorKey: 'fmh_FeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fee Head' />,
        cell: ({ row }) => {
            const isTotal = row.original.fmh_FeeName === 'Total';
            return <div className={isTotal ? 'font-bold text-blue-700' : 'font-medium'}>{row.getValue('fmh_FeeName')}</div>;
        }
    },
    {
        accessorKey: 'fti_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Installment' />,
        cell: ({ row }) => {
            const isTotal = row.original.fmh_FeeName === 'Total';
            if (isTotal) return <div className='font-bold'>-</div>;
            return <div>{row.getValue('fti_Name') || '-'}</div>;
        }
    },
    {
        accessorKey: 'fma_Amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Charges (₹)' />,
        cell: ({ row }) => {
            const isTotal = row.original.fmh_FeeName === 'Total';
            return (
                <div className={`text-right ${isTotal ? 'font-bold' : ''}`}>
                    ₹{Number(row.getValue('fma_Amount') || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
            );
        }
    },
    {
        accessorKey: 'concession',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Concession (₹)' />,
        cell: ({ row }) => {
            const isTotal = row.original.fmh_FeeName === 'Total';
            return (
                <div className={`text-right text-amber-700 ${isTotal ? 'font-bold' : ''}`}>
                    ₹{Number(row.getValue('concession') || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
            );
        }
    },
    {
        accessorKey: 'fine',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fine (₹)' />,
        cell: ({ row }) => {
            const isTotal = row.original.fmh_FeeName === 'Total';
            return (
                <div className={`text-right text-rose-600 ${isTotal ? 'font-bold' : ''}`}>
                    ₹{Number(row.getValue('fine') || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
            );
        }
    },
    {
        accessorKey: 'due',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Due (₹)' />,
        cell: ({ row }) => {
            const isTotal = row.original.fmh_FeeName === 'Total';
            return (
                <div className={`text-right ${isTotal ? 'font-bold' : ''}`}>
                    ₹{Number(row.getValue('due') || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
            );
        }
    },
    {
        accessorKey: 'nowPaying',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Now Paying (₹)' />,
        cell: ({ row }) => {
            const isTotal = row.original.fmh_FeeName === 'Total';
            return (
                <div className={`text-right text-emerald-700 ${isTotal ? 'font-bold' : 'font-semibold'}`}>
                    ₹{Number(row.getValue('nowPaying') || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
            );
        }
    }
];
