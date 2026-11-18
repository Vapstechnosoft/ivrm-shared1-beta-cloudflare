'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { GenericDataTable, useDataTableProps } from '@/components/ui/view-data-table/view-generic-data-table';
import { columns } from './columns';

interface LeaveDetailsGridProps {
    response: any;
    isLoading: boolean;
    currentApiParams?: any;
    onSearchQueryChange?: (params: any) => void;
}

export function LeaveDetailsGrid({ response, isLoading, currentApiParams, onSearchQueryChange }: LeaveDetailsGridProps) {
    const tableProps = useDataTableProps(response);

    return (
        <CollapsibleSection
            title='Total Grid Records'
            defaultOpen={true}
            variant='outline'
            size='md'
            className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
            <GenericDataTable
                {...tableProps}
                columns={columns}
                isLoading={isLoading}
                showViewOptions={true}
                showSearch={true}
                showPagination={true}
                showSorting={true}
                columnPinning={{ right: ['actions'] }}
                currentApiParams={currentApiParams}
                onSearchQueryChange={onSearchQueryChange}
                loadingMessage='Loading details...'
                noDataTitle='No Leave Records Found'
                noDataDescription='No leave records available for the selected criteria'
                errorTitle='Error Loading Leave Data'
            />
        </CollapsibleSection>
    );
}
