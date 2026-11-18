'use client';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit } from 'lucide-react';
export interface InterviewerFeedback {
    id: number;
    candidateName: string;
    interviewDate: string;
    interviewerName: string;
    rating: string;
    recommendation: string;
}

function ActionButtonsCell({ rowData }: { rowData: any }) {
    const { openEditForm } = useFormContext<any>();

    return (
        <div className='flex items-center gap-2'>
            <Button variant='ghost' size='sm' onClick={() => openEditForm(rowData)} className='text-blue-600 hover:text-blue-800'>
                <Edit className='h-4 w-4' />
            </Button>
        </div>
    );
}

export const interviewerFeedbackColumns: ColumnDef<InterviewerFeedback>[] = [
    {
        id: 'serialNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'hrcD_FullName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Candidate Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('hrcD_FullName')}</div>
    },
    {
        accessorKey: 'hrcisC_InterviewRounds',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Interview Type' />,
        cell: ({ row }) => <div>{row.getValue('hrcisC_InterviewRounds')}</div>
    },
    {
        accessorKey: 'hrcisC_InterviewDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Interview Date' />,
        cell: ({ row }) => {
            const dateStr = row.getValue('hrcisC_InterviewDate') as string;
            if (!dateStr) return <div>-</div>;

            // If the date is already in DD-MM-YYYY format, render it directly
            if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr.trim())) {
                return <div>{dateStr}</div>;
            }

            // Otherwise, attempt standard parsing and format as DD-MM-YYYY
            try {
                const date = new Date(dateStr);
                if (!isNaN(date.getTime())) {
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear();
                    return <div>{`${day}-${month}-${year}`}</div>;
                }
            } catch (_) {}

            return <div>{dateStr}</div>;
        }
    },
    // {
    //     accessorKey: 'rating',
    //     header: ({ column }) => <DataTableColumnHeader column={column} title='Rating' />,
    //     cell: ({ row }) => <div>{row.getValue('rating')}</div>
    // },
    // {
    //     accessorKey: 'recommendation',
    //     header: ({ column }) => <DataTableColumnHeader column={column} title='Recommendation' />,
    //     cell: ({ row }) => <div>{row.getValue('recommendation')}</div>
    // },
    {
        accessorKey: 'hrcisC_Status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => <div>{row.getValue('hrcisC_Status')}</div>
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        size: 50
    }
];
