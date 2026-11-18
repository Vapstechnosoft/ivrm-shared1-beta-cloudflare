 import { Checkbox } from '@/components/ui/checkbox';
import type { IStudentRow } from '@/hooks/admission/sms/reports/useGeneralSms';
import type { ColumnDef } from '@tanstack/react-table';

interface Options {
    selectedIds: Set<number>;
    allSelected: boolean;
    someSelected: boolean;
    onToggle: (id: number) => void;
    onToggleAll: (checked: boolean) => void;
}

// Selection lives in the parent so it survives search filtering and works with any table wrapper.
export function getStudentColumns({
    selectedIds,
    allSelected,
    someSelected,
    onToggle,
    onToggleAll
}: Options): ColumnDef<IStudentRow>[] {
    return [
        {
            id: 'select',
            size: 48,
            header: () => (
                <Checkbox
                    aria-label='Select all'
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={(v) => onToggleAll(v === true)}
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    aria-label={`Select ${row.original.studentName}`}
                    checked={selectedIds.has(row.original.amsT_Id)}
                    onCheckedChange={() => onToggle(row.original.amsT_Id)}
                />
            ),
            enableSorting: false
        },
        { accessorKey: 'studentName', header: 'Student Name' },
        { accessorKey: 'admNo', header: 'Adm.No' },
        { accessorKey: 'mobileNo', header: 'Mobile No.' },
        { accessorKey: 'emailId', header: 'Email Id' }
    ];
}
