import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { StaffReplacementGridData } from '@/types/timetable/Transaction/staffreplacementexistingtonew';
import type { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<StaffReplacementGridData>[] = [
    {
        id: 'sno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='S.No' />,
        cell: ({ row }) => <div className='pl-4'>{row.index + 1}</div>,
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'ttmC_CategoryName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category' />,
        cell: ({ row }) => <div>{row.getValue('ttmC_CategoryName')}</div>,
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_ClassName')}</div>,
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
        cell: ({ row }) => <div>{row.getValue('asmC_SectionName')}</div>,
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'hrmE_EmployeeFirstName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Staff' />,
        cell: ({ row }) => <div>{row.getValue('hrmE_EmployeeFirstName')}</div>,
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'ismS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' />,
        cell: ({ row }) => <div>{row.getValue('ismS_SubjectName')}</div>,
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'ttmP_PeriodName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Period' />,
        cell: ({ row }) => <div>{row.getValue('ttmP_PeriodName')}</div>,
        enableSorting: true,
        enableHiding: false
    }
];
