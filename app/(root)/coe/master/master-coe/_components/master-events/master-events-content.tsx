'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useFormContext } from '@/components/ui/form/form-provider';
import { tableSearchVariables } from '@/lib/data-table.config';
import { getViewRecordsMaster } from '@/server/coe/masters/master-coe';
import type { IMasterEvent } from '@/types/alumni/master-coe';
import { Plus, X } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import React, { useCallback, useMemo, useState } from 'react';
import ViewDetailsDialog from '../view-details-dialog';
import MasterEventsForm from './add-update-form';
import { MasterEventsColumns } from './columns';
import ToggleMasterEventForm from './toggle-form';

interface MasterEventsContentProps {
    initialData: any;
    refreshData: () => void;
    isLoading?: boolean;
    error?: any;
    searchParams?: any;
}

export default function MasterEventsContent({
    initialData,
    refreshData,
    isLoading = false,
    error,
    searchParams
}: MasterEventsContentProps) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        isMappedviewOpen,
        selectedRow,
        openAddForm,
        openEditForm,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        closeMappedview,
        addFormRef,
        editFormRef
    } = useFormContext<IMasterEvent>();

    const [viewLoading, setViewLoading] = useState(false);
    const [viewData, setViewData] = useState<any[]>([]);

    const [page] = useQueryState(tableSearchVariables.page, parseAsInteger.withDefault(1));
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withDefault(10));
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));
    const [sortBy] = useQueryState(tableSearchVariables.sort_column, parseAsString.withDefault(''));
    const [sortDirection] = useQueryState(tableSearchVariables.sort_direction, parseAsString.withDefault('asc'));

    const handleOpenMappedView = useCallback(async (row: IMasterEvent) => {
        const id = row.COEME_Id || (row as any).coemE_Id;
        if (!id) return;
        setViewLoading(true);
        try {
            const res = await getViewRecordsMaster(id);
            const details = (res as any).event_mapping_list || (res as any).view_records || (res as any).data || [];
            setViewData(details);
        } catch (error) {
            console.error('Failed to fetch mapping details');
        } finally {
            setViewLoading(false);
        }
    }, []);

    // Table data extraction logic
    const rawEvents = useMemo(() => {
        const data = initialData?.data || initialData;
        if (Array.isArray(data)) return data;
        return data?.master_eventlist || data?.master_event_list || data?.query || [];
    }, [initialData]);

    const filteredAndSortedEvents = useMemo(() => {
        let result = [...rawEvents];

        if (searchQuery && searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter((item) => {
                const name = String(item.COEME_EventName || item.coemE_EventName || '').toLowerCase();
                const desc = String(item.COEME_EventDesc || item.coemE_EventDesc || '').toLowerCase();
                return name.includes(q) || desc.includes(q);
            });
        }

        if (sortBy) {
            result.sort((a, b) => {
                const valA = a[sortBy] ?? '';
                const valB = b[sortBy] ?? '';
                if (typeof valA === 'number' && typeof valB === 'number') {
                    return sortDirection === 'desc' ? valB - valA : valA - valB;
                }
                const comp = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
                return sortDirection === 'desc' ? -comp : comp;
            });
        }

        return result;
    }, [rawEvents, searchQuery, sortBy, sortDirection]);

    const totalEvents = filteredAndSortedEvents.length;

    const pagedEvents = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredAndSortedEvents.slice(start, start + pageSize);
    }, [filteredAndSortedEvents, page, pageSize]);

    const tableProps = useDataTableProps({
        ...initialData,
        data: pagedEvents,
        total: totalEvents
    });

    React.useEffect(() => {
        if (!isLoading && rawEvents.length > 0 && searchParams?.coeme_id) {
            const record = rawEvents.find((r: IMasterEvent) => String(r.COEME_Id || (r as any).coemE_Id) === String(searchParams.coeme_id));
            if (record && !isEditFormOpen) {
                openEditForm(record);
            }
        }
    }, [isLoading, rawEvents, searchParams, openEditForm]);

    const parameterlist = (() => {
        const data = initialData?.data || initialData;
        return data?.parameterlist || data?.parameter_list || [];
    })();

    return (
        <div className='space-y-6'>
            <div className='flex justify-end'>
                <Button onClick={openAddForm} className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                    <Plus className='mr-2 h-4 w-4' /> Create New Event
                </Button>
            </div>

            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection title='Create New Event' defaultOpen={true}>
                        <div className='relative'>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={closeAddForm}
                                className='-top-12 absolute right-0 text-destructive hover:bg-destructive/10'>
                                <X className='mr-2 h-4 w-4' /> Close
                            </Button>
                            <MasterEventsForm
                                parameterlist={parameterlist}
                                onSuccess={() => {
                                    refreshData();
                                    closeAddForm();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection title='Edit Event' defaultOpen={true}>
                        <div className='relative'>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={closeEditForm}
                                className='-top-12 absolute right-0 text-destructive hover:bg-destructive/10'>
                                <X className='mr-2 h-4 w-4' /> Close
                            </Button>
                            <MasterEventsForm
                                parameterlist={parameterlist}
                                editData={selectedRow}
                                onSuccess={() => {
                                    refreshData();
                                    closeEditForm();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            <CollapsibleSection
                title='Master Events List'
                defaultOpen={true}
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable<IMasterEvent>
                    {...tableProps}
                    columns={MasterEventsColumns}
                    isLoading={isLoading}
                    error={error}
                    showViewOptions={false}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading events...'
                    noDataTitle='No Master Events Found'
                    noDataDescription='Create a new event to get started.'
                    errorTitle='Error Loading Events'
                />
            </CollapsibleSection>

            {isToggleFormOpen && selectedRow && (
                <ToggleMasterEventForm rowData={selectedRow} onClose={closeToggleForm} onSuccess={refreshData} />
            )}

            <ViewDetailsDialog
                isOpen={isMappedviewOpen}
                onClose={closeMappedview}
                title={`Mapped Records for ${selectedRow?.COEME_EventName || selectedRow?.coemE_EventName || 'Event'}`}
                loading={viewLoading}
                data={viewData}
            />

            {/* Effect to handle detail loading when modal opens */}
            <DetailLoader isOpen={isMappedviewOpen} selectedRow={selectedRow} onLoad={handleOpenMappedView} />
        </div>
    );
}

function DetailLoader({ isOpen, selectedRow, onLoad }: { isOpen: boolean; selectedRow: any; onLoad: (row: any) => void }) {
    React.useEffect(() => {
        if (isOpen && selectedRow) {
            onLoad(selectedRow);
        }
    }, [isOpen, selectedRow, onLoad]);
    return null;
}
