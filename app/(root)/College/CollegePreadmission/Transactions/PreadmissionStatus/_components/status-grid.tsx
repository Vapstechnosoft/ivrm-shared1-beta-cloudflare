'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { FileText, BookOpen, MessageSquare, Eye } from 'lucide-react';
import { IClgPreadmissionStudent } from '@/types/college/transactions';
import RemarksModal from './modals/remarks-modal';
import DocumentsModal from './modals/documents-modal';

interface StatusGridProps {
    students: IClgPreadmissionStudent[];
    statusList: any[];
    statusType: 'Appsts' | 'admsts';
    selectedStudents: IClgPreadmissionStudent[];
    onSelectionChange: (students: IClgPreadmissionStudent[]) => void;
    onStudentStatusChange: (pacA_Id: number, pamsT_Id: number) => void;
    onStudentRemarkChange: (pacA_Id: number, remark: string) => void;
    onBulkStatusChange: (pamsT_Id: number) => void;
    onViewApplication: (student: IClgPreadmissionStudent) => void;
}

export default function PreadmissionStatusGrid({
    students,
    statusList,
    statusType,
    selectedStudents,
    onSelectionChange,
    onStudentStatusChange,
    onStudentRemarkChange,
    onBulkStatusChange,
    onViewApplication,
}: StatusGridProps) {
    const [bulkStatus, setBulkStatus] = useState<string>('');
    const [remarksStudent, setRemarksStudent] = useState<IClgPreadmissionStudent | null>(null);
    const [docsStudent, setDocsStudent] = useState<IClgPreadmissionStudent | null>(null);

    const isAllSelected = students.length > 0 && selectedStudents.length === students.length;
    const isIndeterminate = selectedStudents.length > 0 && selectedStudents.length < students.length;

    const toggleAll = (checked: boolean) => {
        onSelectionChange(checked ? [...students] : []);
    };

    const toggleRow = (student: IClgPreadmissionStudent, checked: boolean) => {
        if (checked) {
            onSelectionChange([...selectedStudents, student]);
        } else {
            onSelectionChange(selectedStudents.filter((s) => s.pacA_Id !== student.pacA_Id));
        }
    };

    const isSelected = (student: IClgPreadmissionStudent) =>
        selectedStudents.some((s) => s.pacA_Id === student.pacA_Id);

    const columns: ColumnDef<IClgPreadmissionStudent>[] = [
        {
            id: 'select',
            header: () => (
                <Checkbox
                    checked={isAllSelected}
                    data-state={isIndeterminate ? 'indeterminate' : undefined}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={isSelected(row.original)}
                    onCheckedChange={(checked) => toggleRow(row.original, !!checked)}
                    aria-label="Select row"
                />
            ),
            size: 40,
        },
        {
            accessorKey: 'pacA_RegistrationNo',
            header: 'Reg. No.',
        },
        {
            accessorKey: 'name',
            header: 'Student Name',
        },
        {
            accessorKey: 'amcO_CourseName',
            header: 'Course',
        },
        {
            accessorKey: 'pacA_Sex',
            header: 'Gender',
            size: 80,
        },
        {
            accessorKey: 'statusName',
            header: 'Current Status',
        },
        {
            id: 'update_status',
            header: () => (
                <div className="space-y-1">
                    <span className="text-xs font-medium">Update Status</span>
                    <div className="flex gap-1">
                        <Select
                            value={bulkStatus}
                            onValueChange={(val) => {
                                setBulkStatus(val);
                                onBulkStatusChange(Number(val));
                            }}
                        >
                            <SelectTrigger className="h-7 text-xs w-36">
                                <SelectValue placeholder="Update All" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusList.map((s: any) => (
                                    <SelectItem key={s.pamsT_Id} value={String(s.pamsT_Id)}>
                                        {s.pamsT_Name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            ),
            cell: ({ row }) => (
                <Select
                    value={row.original.pamsT_Id ? String(row.original.pamsT_Id) : ''}
                    onValueChange={(val) => onStudentStatusChange(row.original.pacA_Id, Number(val))}
                >
                    <SelectTrigger className="h-8 text-xs w-36">
                        <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                        {statusList.map((s: any) => (
                            <SelectItem key={s.pamsT_Id} value={String(s.pamsT_Id)}>
                                {s.pamsT_Name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ),
        },
        {
            id: 'remark',
            header: 'Remark',
            cell: ({ row }) => (
                <Input
                    className="h-8 text-xs"
                    placeholder="Enter remark..."
                    defaultValue={row.original.pacA_Statusremark || ''}
                    onBlur={(e) => onStudentRemarkChange(row.original.pacA_Id, e.target.value)}
                />
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        title="View Application"
                        onClick={() => onViewApplication(row.original)}
                    >
                        <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        title="View Documents"
                        onClick={() => setDocsStudent(row.original)}
                    >
                        <FileText className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 relative"
                        title="View Remarks"
                        onClick={() => setRemarksStudent(row.original)}
                    >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {(row.original.remarkcount ?? 0) > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3.5 h-3.5 text-[9px] flex items-center justify-center">
                                {row.original.remarkcount}
                            </span>
                        )}
                    </Button>
                </div>
            ),
            size: 100,
        },
    ];

    const tableProps = useDataTableProps({ data: students, total: students.length });

    return (
        <>
            <GenericDataTable {...tableProps} columns={columns} />

            {remarksStudent && (
                <RemarksModal
                    student={remarksStudent}
                    open={!!remarksStudent}
                    onClose={() => setRemarksStudent(null)}
                />
            )}

            {docsStudent && (
                <DocumentsModal
                    student={docsStudent}
                    open={!!docsStudent}
                    onClose={() => setDocsStudent(null)}
                />
            )}
        </>
    );
}
