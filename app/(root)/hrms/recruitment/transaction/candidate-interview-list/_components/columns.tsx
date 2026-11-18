'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ColumnDef } from '@tanstack/react-table';

export interface CandidateInterviewListItem {
    hrcisC_Id: number;
    hrcD_Id: number;
    hrcD_FullName: string;
    hrcisC_InterviewRounds: string;
    hrcisC_InterviewDate: string;
    hrcisC_Status: string;
    hrcisC_ActiveFlg: boolean;
}

export const candidateInterviewListColumns: ColumnDef<CandidateInterviewListItem>[] = [
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
    {
        accessorKey: 'hrcisC_InterviewRounds',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Round' />,
        cell: ({ row }) => <div>{row.getValue('hrcisC_InterviewRounds')}</div>
    },
    {
        accessorKey: 'hrcisC_Status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => <div>{row.getValue('hrcisC_Status')}</div>
    },
    // {
    //     accessorKey: 'hrcisC_ActiveFlg',
    //     header: ({ column }) => <DataTableColumnHeader column={column} title='Active Status' />,
    //     cell: ({ row }) => (
    //         <div className='flex justify-center'>
    //             {getStatusBadge(row.original.hrcisC_ActiveFlg ? 'active' : 'inactive')}
    //         </div>
    //     )
    // },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: CandidateInterviewListItem }) {
    const { openEditForm, openToggleForm } = useFormContext<CandidateInterviewListItem>();

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={openEditForm}
            onToggle={openToggleForm}
            toggleConditionKey='hrcisC_ActiveFlg'
        />
    );
}
