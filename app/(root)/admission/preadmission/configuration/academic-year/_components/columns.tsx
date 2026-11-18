'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { getPreAdmissionYearEditData } from '@/server/admission/preadmission/configuration/academic_year_master';
import type { IMasterAcademicYearMasterList } from '@/types/admission/preadmission/configaration';
import { format } from 'date-fns';
import { toast } from 'sonner';

const formatDate = (date: unknown): string => {
    if (typeof date !== 'string') return 'N/A';
    if (!date) return 'N/A';
    return format(new Date(date), 'dd-MM-yyyy');
};
import { getStatusBadge } from '@/components/extras/helpers/helper';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterAcademicYearColumns: ColumnDef<IMasterAcademicYearMasterList>[] = [
    {
        accessorKey: 'asmaY_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='w-full pl-6 font-bold text-black' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='w-full pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'mI_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Institute Name' className='font-bold text-black' />,
        cell: ({ row }) => {
            const original = row.original as any;
            return (
                <div>{row.getValue('mI_Name') || original?.institution_name || original?.Institution_name || original?.mI_Name || '-'}</div>
            );
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic year' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Year')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmaY_From_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Date' className='font-bold text-black' />,
        cell: ({ row }) => {
            const date = row.getValue('asmaY_From_Date');
            return <div>{formatDate(date)}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmaY_To_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Date' className='font-bold text-black' />,
        cell: ({ row }) => {
            const date = row.getValue('asmaY_To_Date');
            return <div>{formatDate(date)}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmaY_Cut_Of_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='CutOff Date' className='font-bold text-black' />,
        cell: ({ row }) => {
            const date = row.getValue('asmaY_Cut_Of_Date');
            return <div>{formatDate(date)}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmaY_Order',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Year order' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Order')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmaY_Pre_ActiveFlag',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Pre-Admission Flag' className='text-nowrap font-bold text-black' />
        ),
        cell: ({ row }) => (
            <div className='text-center'>{getStatusBadge((row.getValue('asmaY_Pre_ActiveFlag') as number) === 1 ? 'yes' : 'no')}</div>
        ),
        enableSorting: false,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start font-bold text-black' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({
    rowData
}: {
    rowData: IMasterAcademicYearMasterList;
}) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterAcademicYearMasterList>();

    const handleEdit = useCallback(
        async (data: IMasterAcademicYearMasterList) => {
            try {
                const response = (await getPreAdmissionYearEditData(data.asmaY_Id)) as any;
                if (response.success && response.data?.geteditdetails?.length > 0) {
                    openEditForm(response.data.geteditdetails[0]);
                } else if (response.success === false && response.message) {
                    toast.error(response.message);
                } else {
                    openEditForm(data);
                }
            } catch (error: any) {
                toast.error(typeof error === 'string' ? error : error?.message || 'Failed to fetch details');
            }
        },
        [openEditForm]
    );
    const handleToggle = useCallback(
        (data: IMasterAcademicYearMasterList) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='is_Active'
        />
    );
}
