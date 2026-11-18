'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { format, isValid, parse } from 'date-fns';

export const formatDate = (date: unknown): string => {
    if (typeof date !== 'string' || !date) return 'N/A';

    // Try parsing as dd/MM/yyyy first since that's what the API returns
    const parsedDate = parse(date, 'dd/MM/yyyy', new Date());
    if (isValid(parsedDate)) {
        return format(parsedDate, 'dd-MM-yyyy');
    }

    // Try parsing as dd-MM-yyyy as fallback
    const parsedDateHyphen = parse(date, 'dd-MM-yyyy', new Date());
    if (isValid(parsedDateHyphen)) {
        return format(parsedDateHyphen, 'dd-MM-yyyy');
    }

    // Fallback to standard Date constructor
    const fallbackDate = new Date(date);
    if (isValid(fallbackDate)) {
        return format(fallbackDate, 'dd-MM-yyyy');
    }

    return 'N/A';
};

export const FIELD_CONFIG: Record<string, { label: string; isDate?: boolean }> = {
    AMST_AdmNo: { label: 'Adm No' },
    AMST_FirstName: { label: 'First Name' },
    AMST_MiddleName: { label: 'Middle Name' },
    AMST_LastName: { label: 'Last Name' },
    AMST_Date: { label: 'Adm Date', isDate: true },
    AMST_RegistrationNo: { label: 'Registration No' },
    AMST_Sex: { label: 'Gender' },
    AMST_DOB: { label: 'Date of Birth', isDate: true },
    AMST_DOB_Words: { label: 'Date of birth(in words)' },
    AMST_FatherName: { label: "Father's Name" },
    AMST_MotherName: { label: "Mother's Name" },
    AMST_FatherOccupation: { label: "Father's Occupation" },
    AMST_MotherOccupation: { label: "Mother's Occupation" },
    AMST_MotherMonIncome: { label: "Mother's Income" },
    AMST_FatherMonIncome: { label: "Father's Income" },
    AMST_Nationality: { label: 'Nationality' },
    AMST_BloodGroup: { label: 'Blood Group' },
    AMST_MotherTongue: { label: 'Language' },
    AMST_MobileNo: { label: 'Phone number' },
    AMST_emailId: { label: 'Email id' },
    // AMST_PlaceOfBirth: { label: 'Place of Birth' },
    AMST_AadharNo: { label: 'Aadhar Card Number' },
    IVRMMR_Name: { label: 'Religion' }
};

const serialNumberColumn: ColumnDef<any> = {
    accessorKey: 'AMST_Id',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6 font-bold text-black' />,
    cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        const continuousIndex = pageIndex * pageSize + row.index + 1;
        return <div className='pl-6'>{continuousIndex}</div>;
    },
    enableSorting: true,
    enableHiding: false
};

const createDynamicColumn = (fieldId: string): ColumnDef<any> => {
    const config = FIELD_CONFIG[fieldId];

    if (!config) {
        return {
            accessorKey: fieldId,
            header: ({ column }) => <DataTableColumnHeader column={column} title={fieldId} className='font-bold text-black' />,
            cell: ({ row }) => <div>{row.getValue(fieldId) || 'N/A'}</div>,
            enableSorting: true,
            enableHiding: true
        };
    }

    return {
        accessorKey: fieldId,
        header: ({ column }) => <DataTableColumnHeader column={column} title={config.label} className='font-bold text-black' />,
        cell: ({ row }) => {
            const value = row.getValue(fieldId);

            if (config.isDate) {
                return <div>{formatDate(value)}</div>;
            }

            return <div>{String(value) || 'N/A'}</div>;
        },
        enableSorting: true,
        enableHiding: true
    };
};

export const getMasterAdmissionReportColumns = (selectedFields: string[]): ColumnDef<any>[] => {
    const columns: ColumnDef<any>[] = [serialNumberColumn];

    selectedFields.forEach((fieldId) => {
        columns.push(createDynamicColumn(fieldId));
    });

    return columns;
};
