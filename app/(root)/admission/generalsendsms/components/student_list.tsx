 'use client';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Input } from '@/components/ui/input';
import type { IStudentRow } from '@/hooks/admission/sms/reports/useGeneralSms';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getStudentColumns } from './student_columns';

interface Props {
    students: IStudentRow[];
    isLoading: boolean;
    error: unknown;
    selectedIds: Set<number>;
    onSelectionChange: (ids: Set<number>) => void;
}

export default function StudentList({ students, isLoading, error, selectedIds, onSelectionChange }: Props) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return students;
        return students.filter((s) =>
            [s.studentName, s.admNo, s.mobileNo, s.emailId].some((v) => v?.toLowerCase().includes(q))
        );
    }, [students, search]);

    const allSelected = filtered.length > 0 && filtered.every((s) => selectedIds.has(s.amsT_Id));
    const someSelected = filtered.some((s) => selectedIds.has(s.amsT_Id));

    const toggle = (id: number) => {
        const next = new Set(selectedIds);
        next.has(id) ? next.delete(id) : next.add(id);
        onSelectionChange(next);
    };

    const toggleAll = (checked: boolean) => {
        const next = new Set(selectedIds);
        filtered.forEach((s) => (checked ? next.add(s.amsT_Id) : next.delete(s.amsT_Id)));
        onSelectionChange(next);
    };

    const columns = useMemo(
        () => getStudentColumns({ selectedIds, allSelected, someSelected, onToggle: toggle, onToggleAll: toggleAll }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectedIds, allSelected, someSelected, filtered]
    );

    // Same pattern as the fee transaction page: wrap the list in the shape useDataTableProps expects.
    const tableProps = useDataTableProps({ data: filtered } as any);

    return (
        <div className='space-y-3'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
                <p className='flex items-center gap-2 text-sm font-semibold'>
                    Total Grid Records :
                    <span className='rounded-full bg-muted px-2 py-0.5 text-xs'>{students.length}</span>
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

            <GenericDataTable<IStudentRow>
                {...tableProps}
                columns={columns}
                isLoading={isLoading}
                // error={error}
                loadingMessage='Loading Students...'
                noDataTitle='No Students Found'
                noDataDescription='Select academic year, class and section to load students.'
                errorTitle='Failed to Load Students'
            />
        </div>
    );
}
