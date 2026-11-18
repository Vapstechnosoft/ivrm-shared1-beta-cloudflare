 'use client';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getStaffColumns } from './staff_columns';
import type { IStaffRow } from '@/hooks/admission/sms/reports/useGeneralSms';

interface Props {
    staff: IStaffRow[];
    isLoading: boolean;
    error: unknown;
    selectedIds: Set<number>;
    onSelectionChange: (ids: Set<number>) => void;
}

export default function StaffList({ staff, isLoading, selectedIds, onSelectionChange }: Props) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return staff;
        return staff.filter((s) => [s.staffName, s.mobileNo, s.emailId].some((v) => v?.toLowerCase().includes(q)));
    }, [staff, search]);

    const allSelected = filtered.length > 0 && filtered.every((s) => selectedIds.has(s.hrmE_Id));
    const someSelected = filtered.some((s) => selectedIds.has(s.hrmE_Id));

    const toggle = (id: number) => {
        const next = new Set(selectedIds);
        next.has(id) ? next.delete(id) : next.add(id);
        onSelectionChange(next);
    };

    const toggleAll = (checked: boolean) => {
        const next = new Set(selectedIds);
        filtered.forEach((s) => (checked ? next.add(s.hrmE_Id) : next.delete(s.hrmE_Id)));
        onSelectionChange(next);
    };

    const columns = useMemo(
        () => getStaffColumns({ selectedIds, allSelected, someSelected, onToggle: toggle, onToggleAll: toggleAll }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectedIds, allSelected, someSelected, filtered]
    );

    const tableProps = useDataTableProps({ data: filtered } as any);

    return (
        <div className='space-y-3'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
                <p className='flex items-center gap-2 font-semibold text-sm'>
                    Total Grid Records :
                    <span className='rounded-full bg-muted px-2 py-0.5 text-xs'>{staff.length}</span>
                    {selectedIds.size > 0 && (
                        <span className='font-normal text-muted-foreground'>({selectedIds.size} selected)</span>
                    )}
                </p>
                <div className='relative w-full max-w-sm'>
                    <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground' />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder='Search here...'
                        className='pl-9'
                    />
                </div>
            </div>

            <GenericDataTable<IStaffRow>
                {...tableProps}
                columns={columns}
                isLoading={isLoading}
                // error={error}
                loadingMessage='Loading Staff...'
                noDataTitle='No Staff Found'
                noDataDescription='Select at least one department and designation to load staff.'
                errorTitle='Failed to Load Staff'
            />
        </div>
    );
}
