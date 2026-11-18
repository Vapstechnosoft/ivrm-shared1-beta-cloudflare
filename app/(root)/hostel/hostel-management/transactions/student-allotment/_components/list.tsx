'use client';

import { GenericDataTable } from '@/components/ui/view-data-table/view-generic-data-table';
import { studentAllotmentColumns } from './columns';

interface StudentAllotmentListProps {
    data: any[];
}

export default function StudentAllotmentList({ data }: StudentAllotmentListProps) {
    return (
        <div className='mt-6'>
            <GenericDataTable columns={studentAllotmentColumns} data={data} isLoading={false} />
        </div>
    );
}
