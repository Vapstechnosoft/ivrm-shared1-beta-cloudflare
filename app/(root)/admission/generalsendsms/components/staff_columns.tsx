 import { Checkbox } from '@/components/ui/checkbox';
import type { IStaffRow } from '@/hooks/admission/sms/reports/useGeneralSms';
import type { ColumnDef } from '@tanstack/react-table';

interface Options {
    selectedIds: Set<number>;
    allSelected: boolean;
    someSelected: boolean;
    onToggle: (id: number) => void;
    onToggleAll: (checked: boolean) => void;
}

export function getStaffColumns({
    selectedIds,
    allSelected,
    someSelected,
    onToggle,
    onToggleAll
}: Options): ColumnDef<IStaffRow>[] {
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
                    aria-label={`Select ${row.original.staffName}`}
                    checked={selectedIds.has(row.original.hrmE_Id)}
                    onCheckedChange={() => onToggle(row.original.hrmE_Id)}
                />
            ),
            enableSorting: false
        },
        { accessorKey: 'staffName', header: 'Staff Name' },
        { accessorKey: 'mobileNo', header: 'Mobile No.', cell: ({ getValue }) => getValue<string | null>() ?? '' },
        { accessorKey: 'emailId', header: 'Email', cell: ({ getValue }) => getValue<string | null>() ?? '' }
    ];
}
