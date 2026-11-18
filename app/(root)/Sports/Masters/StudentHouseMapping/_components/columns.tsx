'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { StudentHouseMappingDTO } from '@/types/sports/masters/student-house-mapping';
import type { ColumnDef, Row } from '@tanstack/react-table';

/* ============================================
   Actions Cell Component
   ============================================ */
function ActionsCell({ row }: { row: Row<StudentHouseMappingDTO> }) {
    const data = row.original;
    const { openEditForm, openToggleForm } = useFormContext<StudentHouseMappingDTO>();

    return (
        <ActionButtons
            rowData={data}
            buttons={{
                edit: true,
                toggle: true,
                delete: false
            }}
            onEdit={() => openEditForm(data)}
            onToggle={() => openToggleForm(data)}
            toggleConditionKey='spccmH_ActiveFlag'
        />
    );
}

/* ============================================
   Student House Mapping Columns Definition
   ============================================ */
export const columns: ColumnDef<StudentHouseMappingDTO>[] = [
    {
        id: 'id', // Matches backend logic: request.sort_column == "id" ? "spccmH_Id" : ...
        accessorKey: 'spccsH_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Year' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccmH_HouseName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='House Name' />,
        enableSorting: true
    },
    {
        accessorKey: 'studentname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        enableSorting: true
    },
    {
        accessorKey: 'amsT_AdmNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adm No.' />,
        enableSorting: true
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        enableSorting: true
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccsH_Remarks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remark' />,
        enableSorting: true
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ActionsCell
    }
];
