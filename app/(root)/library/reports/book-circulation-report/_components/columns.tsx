'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IBookCirculationReportGridData } from '@/types/library/reports/book-circulation-report';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

const SharedColumns: ColumnDef<IBookCirculationReportGridData>[] = [
    {
        id: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div>{continuousIndex}</div>;
        },
        enableHiding: true, // Use enableHiding as per user code, but enableSorting false
        enableSorting: false
    },
    {
        accessorKey: 'LMB_BOOKTITLE',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Book Title' />,
        cell: ({ row }) => <div>{row.getValue('LMB_BOOKTITLE')}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'LMBANO_ACCESSIONNO',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Accession No' />,
        cell: ({ row }) => <div>{row.getValue('LMBANO_ACCESSIONNO')}</div>,
        enableSorting: true
    }
];

const formatDateSafe = (dateVal: any) => {
    if (!dateVal) return '--';
    try {
        const d = new Date(dateVal);
        if (Number.isNaN(d.getTime())) return String(dateVal);
        return format(d, 'dd/MM/yyyy');
    } catch {
        return String(dateVal);
    }
};

const StatusDateColumns: ColumnDef<IBookCirculationReportGridData>[] = [
    {
        accessorKey: 'LBTR_STATUS',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Transaction Status' />,
        cell: ({ row }) => <div>{row.getValue('LBTR_STATUS') || '--'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'LBTR_ISSUEDDATE',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Issue Date' />,
        cell: ({ row }) => <div>{formatDateSafe(row.getValue('LBTR_ISSUEDDATE'))}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'LBTR_DUEDATE',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Due Date' />,
        cell: ({ row }) => <div>{formatDateSafe(row.getValue('LBTR_DUEDATE'))}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'LBTR_RETURNEDDATE',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Return Date' />,
        cell: ({ row }) => <div>{formatDateSafe(row.getValue('LBTR_RETURNEDDATE'))}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'LBTR_FINECOLLECTED',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fine Collected' />,
        cell: ({ row }) => <div>{row.getValue('LBTR_FINECOLLECTED')}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'LBTR_TOTALFINE',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total Fine' />,
        cell: ({ row }) => <div>{row.getValue('LBTR_TOTALFINE')}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'LMB_BOOKTYPE',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Book Type' />,
        cell: ({ row }) => <div>{row.getValue('LMB_BOOKTYPE')}</div>,
        enableSorting: true
    }
];

export const getColumns = (memberType: string): ColumnDef<IBookCirculationReportGridData>[] => {
    let specificColumns: ColumnDef<IBookCirculationReportGridData>[] = [];

    if (memberType === 'Student') {
        specificColumns = [
            {
                accessorKey: 'AMST_ADMNO',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Adm No.' />,
                cell: ({ row }) => <div>{row.getValue('AMST_ADMNO')}</div>,
                enableSorting: true
            },
            {
                accessorKey: 'AMST_NAME',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
                cell: ({ row }) => <div>{row.getValue('AMST_NAME')}</div>,
                enableSorting: true
            },
            {
                accessorKey: 'ASMCL_CLASSNAME',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
                cell: ({ row }) => {
                    const original = row.original as any;
                    return (
                        <div>
                            {original.ASMCL_CLASSNAME ||
                                original.ASMCL_CLASS_NAME ||
                                original.CLASSNAME ||
                                original.CLASS_NAME ||
                                original.asmcL_ClassName ||
                                original.asmcl_classname ||
                                original.className ||
                                original.ClassName ||
                                '--'}
                        </div>
                    );
                },
                enableSorting: true
            },
            {
                accessorKey: 'ASMC_SECTIONNAME',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
                cell: ({ row }) => {
                    const original = row.original as any;
                    return (
                        <div>
                            {original.ASMC_SECTIONNAME ||
                                original.ASMS_SECTIONNAME ||
                                original.SECTIONNAME ||
                                original.SECTION_NAME ||
                                original.ASMC_SECTION_NAME ||
                                original.ASMS_SECTION_NAME ||
                                original.MC_SECTIONNAME ||
                                original.asmC_SectionName ||
                                original.asmS_SectionName ||
                                original.asmc_sectionname ||
                                original.asms_sectionname ||
                                original.sectionName ||
                                original.SectionName ||
                                '--'}
                        </div>
                    );
                },
                enableSorting: true
            },
            {
                accessorKey: 'AMAY_ROLLNO',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Roll No.' />,
                cell: ({ row }) => <div>{row.getValue('AMAY_ROLLNO')}</div>,
                enableSorting: true
            },
            {
                accessorKey: 'LATEDAYS',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Late Return Days' />,
                cell: ({ row }) => {
                    const days = row.getValue('LATEDAYS') as number;
                    return <div>{days > 0 ? days : '--'}</div>;
                },
                enableSorting: true
            }
        ];
    } else if (memberType === 'Staff') {
        specificColumns = [
            {
                accessorKey: 'EMPNAME',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Staff Name' />,
                cell: ({ row }) => <div>{row.getValue('EMPNAME')}</div>,
                enableSorting: true
            },
            {
                accessorKey: 'HRME_EMPLOYEECODE',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Staff Code' />,
                cell: ({ row }) => <div>{row.getValue('HRME_EMPLOYEECODE')}</div>,
                enableSorting: true
            }
        ];
    } else if (memberType === 'Guest') {
        specificColumns = [
            {
                accessorKey: 'LBTR_GUESTNAME',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Guest Name' />,
                cell: ({ row }) => <div>{row.getValue('LBTR_GUESTNAME')}</div>,
                enableSorting: true
            },
            {
                accessorKey: 'LBTR_GUESTEMAILID',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Mail' />,
                cell: ({ row }) => <div>{row.getValue('LBTR_GUESTEMAILID')}</div>,
                enableSorting: true
            },
            {
                accessorKey: 'LBTR_GUESTCONTACTNO',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Contact' />,
                cell: ({ row }) => <div>{row.getValue('LBTR_GUESTCONTACTNO')}</div>,
                enableSorting: true
            }
        ];
    } else if (memberType === 'Department') {
        specificColumns = [
            {
                accessorKey: 'HRMD_DEPARTMENTNAME',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Department Name' />,
                cell: ({ row }) => <div>{row.getValue('HRMD_DEPARTMENTNAME')}</div>,
                enableSorting: true
            }
        ];
    }

    // Combine: Shared + Specific + Status/Dates
    return [...SharedColumns, ...specificColumns, ...StatusDateColumns];
};
