'use client';

import { DataTableColumnHeader as ColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

export const studentColumns: ColumnDef<any>[] = [
    {
        accessorKey: 'sn',
        header: ({ column }) => <ColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'ASMAY_Year',
        header: ({ column }) => <ColumnHeader column={column} title='Year' />,
        cell: ({ row }) => row.original.ASMAY_Year || row.original.asmaY_Year || 'N/A'
    },
    {
        accessorKey: 'StudentName',
        header: ({ column }) => <ColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => row.original.StudentName || row.original.studentname || 'N/A'
    },
    {
        accessorKey: 'AMST_AdmNo',
        header: ({ column }) => <ColumnHeader column={column} title='Adm No' />,
        cell: ({ row }) => row.original.AMST_AdmNo || row.original.AMCST_AdmNo || row.original.amcsT_AdmNo || 'N/A'
    },
    {
        accessorKey: 'AMCO_CourseName',
        header: ({ column }) => <ColumnHeader column={column} title='Course' />,
        cell: ({ row }) => row.original.AMCO_CourseName || row.original.courseName || 'N/A'
    },
    {
        accessorKey: 'AMSE_SemesterName',
        header: ({ column }) => <ColumnHeader column={column} title='Semester' />,
        cell: ({ row }) => row.original.AMSE_SemesterName || row.original.semesterName || 'N/A'
    },
    {
        accessorKey: 'HLMH_Name',
        header: ({ column }) => <ColumnHeader column={column} title='Hostel' />,
        cell: ({ row }) => row.original.HLMH_Name || row.original.hlmH_Name || 'N/A'
    },
    {
        accessorKey: 'HLMRCA_RoomCategory',
        header: ({ column }) => <ColumnHeader column={column} title='Category' />,
        cell: ({ row }) => row.original.HLMRCA_RoomCategory || row.original.hlmrC_RoomCategory || 'N/A'
    },
    {
        accessorKey: 'HRMRM_RoomNo',
        header: ({ column }) => <ColumnHeader column={column} title='Room No' />,
        cell: ({ row }) => row.original.HRMRM_RoomNo || row.original.hrmrM_RoomNo || 'N/A'
    },
    {
        accessorKey: 'HLHSALT_AllotmentDate',
        header: ({ column }) => <ColumnHeader column={column} title='Date' />,
        cell: ({ row }) => {
            const date = row.original.HLHSALT_AllotmentDate || row.original.hlhsalT_AllotmentDate;
            return date ? new Date(date).toLocaleDateString('en-GB') : '';
        }
    },
    {
        accessorKey: 'HLHSALT_AllotRemarks',
        header: ({ column }) => <ColumnHeader column={column} title='Remarks' />,
        cell: ({ row }) => row.original.HLHSALT_AllotRemarks || row.original.hlhsalT_AllotRemarks || '-'
    }
];

export const staffColumns: ColumnDef<any>[] = [
    {
        accessorKey: 'sn',
        header: ({ column }) => <ColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'StaffName',
        header: ({ column }) => <ColumnHeader column={column} title='Staff Name' />,
        cell: ({ row }) => row.original.StaffName || row.original.empname || 'N/A'
    },
    {
        accessorKey: 'HRMD_DepartmentName',
        header: ({ column }) => <ColumnHeader column={column} title='Dept' />,
        cell: ({ row }) => row.original.HRMD_DepartmentName || 'N/A'
    },
    {
        accessorKey: 'HRMDES_DesignationName',
        header: ({ column }) => <ColumnHeader column={column} title='Designation' />,
        cell: ({ row }) => row.original.HRMDES_DesignationName || 'N/A'
    },
    {
        accessorKey: 'HRME_EmployeeCode',
        header: ({ column }) => <ColumnHeader column={column} title='Code' />,
        cell: ({ row }) => row.original.HRME_EmployeeCode || 'N/A'
    },
    {
        accessorKey: 'HLMH_Name',
        header: ({ column }) => <ColumnHeader column={column} title='Hostel' />,
        cell: ({ row }) => row.original.HLMH_Name || 'N/A'
    },
    {
        accessorKey: 'HLMRCA_RoomCategory',
        header: ({ column }) => <ColumnHeader column={column} title='Category' />,
        cell: ({ row }) => row.original.HLMRCA_RoomCategory || 'N/A'
    },
    {
        accessorKey: 'HRMRM_RoomNo',
        header: ({ column }) => <ColumnHeader column={column} title='Room No' />,
        cell: ({ row }) => row.original.HRMRM_RoomNo || 'N/A'
    },
    {
        accessorKey: 'HLHSTALT_AllotmentDate',
        header: ({ column }) => <ColumnHeader column={column} title='Date' />,
        cell: ({ row }) => {
            const date = row.original.HLHSTALT_AllotmentDate || row.original.hlhstalT_AllotmentDate;
            return date ? new Date(date).toLocaleDateString('en-GB') : '';
        }
    },
    {
        accessorKey: 'HLHSTALT_AllotRemarks',
        header: ({ column }) => <ColumnHeader column={column} title='Remarks' />,
        cell: ({ row }) => row.original.HLHSTALT_AllotRemarks || '-'
    }
];

export const guestColumns: ColumnDef<any>[] = [
    {
        accessorKey: 'sn',
        header: ({ column }) => <ColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'HLHGSTALT_GuestName',
        header: ({ column }) => <ColumnHeader column={column} title='Guest Name' />,
        cell: ({ row }) => row.original.HLHGSTALT_GuestName || row.original.hlhgstalT_GuestName || 'N/A'
    },
    {
        accessorKey: 'HLMH_Name',
        header: ({ column }) => <ColumnHeader column={column} title='Hostel' />,
        cell: ({ row }) => row.original.HLMH_Name || 'N/A'
    },
    {
        accessorKey: 'HLMRCA_RoomCategory',
        header: ({ column }) => <ColumnHeader column={column} title='Category' />,
        cell: ({ row }) => row.original.HLMRCA_RoomCategory || 'N/A'
    },
    {
        accessorKey: 'HRMRM_RoomNo',
        header: ({ column }) => <ColumnHeader column={column} title='Room No' />,
        cell: ({ row }) => row.original.HRMRM_RoomNo || 'N/A'
    },
    {
        accessorKey: 'HLHGSTALT_GuestPhoneNo',
        header: ({ column }) => <ColumnHeader column={column} title='Phone' />,
        cell: ({ row }) => row.original.HLHGSTALT_GuestPhoneNo || 'N/A'
    },
    {
        accessorKey: 'HLHGSTALT_GuestEmailId',
        header: ({ column }) => <ColumnHeader column={column} title='Email' />,
        cell: ({ row }) => row.original.HLHGSTALT_GuestEmailId || 'N/A'
    },
    {
        accessorKey: 'HLHGSTALT_GuestAddress',
        header: ({ column }) => <ColumnHeader column={column} title='Address' />,
        cell: ({ row }) => row.original.HLHGSTALT_GuestAddress || 'N/A'
    },
    {
        accessorKey: 'HLHGSTALT_AllotmentDate',
        header: ({ column }) => <ColumnHeader column={column} title='Date' />,
        cell: ({ row }) => {
            const date = row.original.HLHGSTALT_AllotmentDate || row.original.hlhgstalT_AllotmentDate;
            return date ? new Date(date).toLocaleDateString('en-GB') : '';
        }
    },
    {
        accessorKey: 'HLHGSTALT_AllotRemarks',
        header: ({ column }) => <ColumnHeader column={column} title='Remarks' />,
        cell: ({ row }) => row.original.HLHGSTALT_AllotRemarks || '-'
    }
];
