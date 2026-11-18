'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Edit, IndianRupee, Info } from 'lucide-react';

function formatFullName(original: any): string {
    const fn = (original.amsT_FirstName || original.AMST_FirstName || '').trim();
    const mn = (original.amsT_MiddleName || original.AMST_MiddleName || '').trim();
    const ln = (original.amsT_LastName || original.AMST_LastName || '').trim();

    if (!fn && !mn && !ln) {
        return (
            original.studentName ||
            original.StudentName ||
            original.student_Name ||
            original.memberName ||
            original.MemberName ||
            original.hrmE_EmployeeFirstName ||
            original.HRME_EmployeeFirstName ||
            original.hrmD_DepartmentName ||
            original.HRMD_DepartmentName ||
            original.lbtR_GuestName ||
            original.LBTR_GuestName ||
            '-'
        );
    }

    const parts: string[] = [];
    if (fn) parts.push(fn);
    if (mn && !fn.toLowerCase().split(/\s+/).includes(mn.toLowerCase())) parts.push(mn);
    if (ln && !fn.toLowerCase().split(/\s+/).includes(ln.toLowerCase()) && !mn.toLowerCase().split(/\s+/).includes(ln.toLowerCase())) parts.push(ln);

    return parts.join(' ') || fn || '-';
}

export const getBookIssueColumns = (
    onEdit?: (row: any) => void,
    onViewFine?: (row: any) => void
): ColumnDef<any>[] => [
    {
        id: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.No.' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='font-medium'>{continuousIndex}</div>;
        },
        enableHiding: true,
        enableSorting: false
    },
    {
        accessorKey: 'studentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => {
            const original = row.original || {};
            const val = (row.getValue('studentName') as string) || formatFullName(original);
            return <div className='font-medium'>{val || '-'}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'amsT_AdmNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adm No.' />,
        cell: ({ row }) => {
            const original = row.original || {};
            const val =
                (row.getValue('amsT_AdmNo') as string) ||
                original.amsT_AdmNo ||
                original.AMST_AdmNo ||
                original.amsT_Admno ||
                original.AMST_Admno ||
                original.admNo ||
                original.AdmNo ||
                original.admno ||
                original.Admno ||
                original.amsT_RegistrationNo ||
                original.AMST_RegistrationNo ||
                original.registrationNo ||
                original.RegistrationNo ||
                original.regNo ||
                original.RegNo ||
                original.amsT_RollNo ||
                original.AMST_RollNo ||
                original.rollNo ||
                original.RollNo ||
                original.amsT_MIS_AdmNo ||
                original.AMST_MIS_AdmNo ||
                original.hrmE_EmployeeCode ||
                original.HRME_EmployeeCode ||
                original.employeeCode ||
                original.EmployeeCode ||
                '-';
            return <div>{val}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        cell: ({ row }) => {
            const original = row.original || {};
            const val =
                [
                    row.getValue('asmcL_ClassName'),
                    original.asmcL_ClassName,
                    original.ASMCL_ClassName,
                    original.asmcL_Classname,
                    original.className,
                    original.ClassName,
                    original.class_Name,
                    original.Class_Name,
                    original.class,
                    original.Class
                ].find((v) => v !== undefined && v !== null && v !== '' && v !== '-') || '-';
            return <div>{val}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
        cell: ({ row }) => {
            const original = row.original || {};
            const val =
                [
                    row.getValue('asmC_SectionName'),
                    original.asmC_SectionName,
                    original.ASMC_SectionName,
                    original.asmS_SectionName,
                    original.ASMS_SectionName,
                    original.asmC_Sectionname,
                    original.sectionName,
                    original.SectionName,
                    original.section_Name,
                    original.Section_Name,
                    original.section,
                    original.Section
                ].find((v) => v !== undefined && v !== null && v !== '' && v !== '-') || '-';
            return <div>{val}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'lmbanO_AccessionNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Accession No.' />,
        cell: ({ row }) => {
            const original = row.original || {};
            const val =
                [
                    row.getValue('lmbanO_AccessionNo'),
                    original.lmbanO_AccessionNo,
                    original.LMBANO_AccessionNo,
                    original.lmbanO_Accessionno,
                    original.lmbanO_AccessNo,
                    original.LMBANO_AccessNo,
                    original.accessionNo,
                    original.AccessionNo,
                    original.accession_No,
                    original.Accession_No,
                    original.accNo,
                    original.AccNo,
                    original.barcode,
                    original.Barcode,
                    original.lmbanO_Id || original.LMBANO_Id ? String(original.lmbanO_Id || original.LMBANO_Id) : ''
                ].find((v) => v !== undefined && v !== null && v !== '' && v !== '-') || '-';
            return <div>{val}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'lmB_BookTitle',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Book Title' />,
        cell: ({ row }) => {
            const original = row.original || {};
            const val =
                [
                    row.getValue('lmB_BookTitle'),
                    original.lmB_BookTitle,
                    original.LMB_BookTitle,
                    original.lmB_Booktitle,
                    original.LMB_Booktitle,
                    original.bookTitle,
                    original.BookTitle,
                    original.book_Title,
                    original.Book_Title,
                    original.booktitle,
                    original.Booktitle,
                    original.bookName,
                    original.BookName,
                    original.book_Name,
                    original.Book_Name,
                    original.bookname,
                    original.Bookname,
                    original.title,
                    original.Title,
                    original.lmB_Title,
                    original.LMB_Title,
                    original.lbtR_BookTitle,
                    original.LBTR_BookTitle,
                    original.lbtR_BookName,
                    original.LBTR_BookName
                ].find((v) => v !== undefined && v !== null && v !== '' && v !== '-') || '-';
            return <div className='max-w-[200px] truncate' title={typeof val === 'string' ? val : ''}>{val}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'issue_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Issue Date' />,
        cell: ({ row }) => {
            const date = ((row.getValue('issue_Date') as string) ||
                row.original?.issue_Date ||
                row.original?.Issue_Date ||
                row.original?.issueDate ||
                row.original?.IssueDate ||
                row.original?.createdDate ||
                row.original?.lmB_EntryDate ||
                row.original?.LMB_EntryDate) as string;
            if (!date || date.startsWith('0001')) return <div>-</div>;
            try {
                return <div>{format(new Date(date), 'dd/MM/yyyy')}</div>;
            } catch {
                return <div>{date}</div>;
            }
        },
        enableSorting: true
    },
    {
        accessorKey: 'due_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Due Date' />,
        cell: ({ row }) => {
            const date = ((row.getValue('due_Date') as string) ||
                row.original?.due_Date ||
                row.original?.Due_Date ||
                row.original?.dueDate ||
                row.original?.DueDate ||
                row.original?.return_Date ||
                row.original?.Return_Date) as string;
            if (!date || date.startsWith('0001')) return <div>-</div>;
            try {
                return <div>{format(new Date(date), 'dd/MM/yyyy')}</div>;
            } catch {
                return <div>{date}</div>;
            }
        },
        enableSorting: true
    },
    {
        accessorKey: 'return_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Return Date' />,
        cell: ({ row }) => {
            const date = ((row.getValue('return_Date') as string) ||
                row.original?.return_Date ||
                row.original?.Return_Date ||
                row.original?.returnDate ||
                row.original?.ReturnDate ||
                row.original?.lbtR_ReturnDate ||
                row.original?.LBTR_ReturnDate) as string;
            if (!date || date.startsWith('0001')) return <div>-</div>;
            try {
                return <div>{format(new Date(date), 'dd/MM/yyyy')}</div>;
            } catch {
                return <div>{date}</div>;
            }
        },
        enableSorting: true
    },
    {
        accessorKey: 'renewal_Counter',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Renewal' />,
        cell: ({ row }) => {
            const count =
                row.original?.renewal_Counter ??
                row.original?.Renewal_Counter ??
                row.original?.lbtR_Renewalcounter ??
                row.original?.LBTR_Renewalcounter ??
                row.original?.renewal ??
                row.original?.Renewal ??
                0;
            return <div>{count}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'book_Trans_Status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const status =
                (row.getValue('book_Trans_Status') as string) ||
                row.original?.book_Trans_Status ||
                row.original?.Book_Trans_Status ||
                row.original?.status ||
                row.original?.Status ||
                (row.original?.returnval || row.original?.Returnval ? 'Return' : 'Issue') ||
                'Issue';
            return (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${
                        String(status).toLowerCase().includes('return')
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                    }`}>
                    {status}
                </span>
            );
        },
        enableSorting: true
    },
    {
        id: 'viewFine',
        header: ({ column }) => <DataTableColumnHeader column={column} title='View Fine' className='text-center text-red-600' />,
        cell: ({ row }) => {
            return (
                <div className='flex justify-center'>
                    <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => (onViewFine ? onViewFine(row.original) : onEdit?.(row.original))}
                        title={`View Fine (Fine: ₹${row.original.fine_Amount || row.original.finecollected || 0})`}
                        className='h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-800'>
                        <IndianRupee className='h-4 w-4' />
                    </Button>
                </div>
            );
        },
        enableSorting: false
    },
    {
        id: 'returnRenewal',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Return/Renewal' className='text-center' />,
        cell: ({ row }) => {
            return (
                <div className='flex justify-center'>
                    <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => onEdit?.(row.original)}
                        title='Return / Renewal'
                        className='h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-800'>
                        <Edit className='h-4 w-4' />
                    </Button>
                </div>
            );
        },
        enableSorting: false
    }
];

export const BookIssueColumns = getBookIssueColumns();
