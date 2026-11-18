'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useFormContext } from '@/components/ui/form/form-provider';
import { tableSearchVariables } from '@/lib/data-table.config';
import { getCOEMappingDetails, getPageDetailsMap, getViewRecords } from '@/server/coe/masters/master-coe';
import type { IEventsMapping } from '@/types/alumni/master-coe';
import { Plus, X } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ViewDetailsDialog from '../view-details-dialog';
import EventsMappingForm from './add-update-form';
import { EventsMappingColumns } from './columns';
import ToggleEventsMappingForm from './toggle-form';

interface EventsMappingContentProps {
    initialData: any;
    refreshData?: () => void;
    isLoading?: boolean;
    error?: any;
    searchParams?: any;
}

export default function EventsMappingContent({
    initialData,
    refreshData,
    isLoading = false,
    error,
    searchParams
}: EventsMappingContentProps) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        isDetailsViewOpen,
        selectedRow,
        openAddForm,
        openEditForm,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        closeDetailsView,
        addFormRef,
        editFormRef
    } = useFormContext<IEventsMapping>();

    const extractMappings = useCallback((data: any) => {
        const raw = data?.data || data;
        const list = raw?.query?.length
            ? raw.query
            : raw?.mapped_eventlist?.length
              ? raw.mapped_eventlist
              : raw?.event_mapping_list?.length
                ? raw.event_mapping_list
                : raw?.completeddate?.length
                  ? raw.completeddate
                  : [];
        return [...list].sort((a, b) => (a.coeE_Id || a.COEE_Id || 0) - (b.coeE_Id || b.COEE_Id || 0));
    }, []);

    const [mappingData, setMappingData] = useState<any[]>(() => extractMappings(initialData));
    const [loadingMappings, setLoadingMappings] = useState(false);
    const [viewLoading, setViewLoading] = useState(false);
    const [viewData, setViewData] = useState<any>(null);

    // URL search, sort, and pagination state matching GenericDataTable
    const [page] = useQueryState(tableSearchVariables.page, parseAsInteger.withDefault(1));
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withDefault(10));
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));
    const [sortBy] = useQueryState(tableSearchVariables.sort_column, parseAsString.withDefault(''));
    const [sortDirection] = useQueryState(tableSearchVariables.sort_direction, parseAsString.withDefault('asc'));

    const fetchMappings = useCallback(async () => {
        setLoadingMappings(true);
        try {
            const res = await getCOEMappingDetails();
            const list = extractMappings(res);
            setMappingData(list);
        } catch (_error) {
            console.error('Failed to fetch mapping details');
        } finally {
            setLoadingMappings(false);
        }
    }, [extractMappings]);

    useEffect(() => {
        const list = extractMappings(initialData);
        if (list.length > 0) {
            setMappingData(list);
        } else if (!isLoading) {
            fetchMappings();
        }
    }, [fetchMappings, initialData, extractMappings, isLoading]);

    useEffect(() => {
        if (!isLoading && mappingData.length > 0 && searchParams?.coee_id) {
            const record = mappingData.find(
                (r: IEventsMapping) => String(r.coeE_Id || (r as any).COEE_Id) === String(searchParams.coee_id)
            );
            if (record && !isEditFormOpen) {
                openEditForm(record);
            }
        }
    }, [isLoading, mappingData, searchParams, openEditForm]);

    const handleOpenDetails = useCallback(async (row: IEventsMapping) => {
        const coeeId = row.coeE_Id || (row as any).COEE_Id;
        if (!coeeId) return;
        setViewLoading(true);
        try {
            const res = await getViewRecords(coeeId);
            const details = res?.data || res || {};
            setViewData(details);
        } catch (_error) {
            console.warn('getViewRecords failed, trying fallback to getPageDetailsMap');
            try {
                const res = await getPageDetailsMap(coeeId);
                const details = (res as any).event_mapping_list || (res as any).view_records || (res as any).data || [];
                setViewData(details);
            } catch (fallbackError) {
                console.error('Failed to fetch record details', fallbackError);
                setViewData([]);
            }
        } finally {
            setViewLoading(false);
        }
    }, []);

    // Filter and sort the complete dataset
    const filteredAndSortedData = useMemo(() => {
        let result = [...mappingData];

        if (searchQuery && searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter((item) => {
                const eventName = String(item.coemE_EventName || item.COEME_EventName || '').toLowerCase();
                const year = String(item.asmaY_Year || item.ASMAY_Year || '').toLowerCase();
                const startDate = String(item.coeE_EStartDate || item.COEE_EStartDate || '').toLowerCase();
                const endDate = String(item.coeE_EEndDate || item.COEE_EEndDate || '').toLowerCase();
                return eventName.includes(q) || year.includes(q) || startDate.includes(q) || endDate.includes(q);
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
    }, [mappingData, searchQuery, sortBy, sortDirection]);

    const totalCount = filteredAndSortedData.length;

    // Slice for current page so GenericDataTable renders the exact items for this page
    const pagedData = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredAndSortedData.slice(start, start + pageSize);
    }, [filteredAndSortedData, page, pageSize]);

    const tableProps = useDataTableProps({
        data: pagedData,
        total: totalCount,
        success: true
    });

    return (
        <div className='space-y-6'>
            <div className='flex justify-end'>
                <Button onClick={openAddForm} className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                    <Plus className='mr-2 h-4 w-4' /> Map New Event
                </Button>
            </div>

            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection title='Map New Event' defaultOpen={true}>
                        <div className='relative'>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={closeAddForm}
                                className='-top-12 absolute right-0 text-destructive hover:bg-destructive/10'>
                                <X className='mr-2 h-4 w-4' /> Close
                            </Button>
                            <EventsMappingForm
                                initialData={initialData}
                                onSuccess={() => {
                                    refreshData?.();
                                    fetchMappings();
                                    closeAddForm();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection title='Edit Event Mapping' defaultOpen={true}>
                        <div className='relative'>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={closeEditForm}
                                className='-top-12 absolute right-0 text-destructive hover:bg-destructive/10'>
                                <X className='mr-2 h-4 w-4' /> Close
                            </Button>
                            <EventsMappingForm
                                initialData={initialData}
                                editData={selectedRow}
                                onSuccess={() => {
                                    refreshData?.();
                                    fetchMappings();
                                    closeEditForm();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            <CollapsibleSection
                title='Mapped Events List'
                defaultOpen={true}
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable<IEventsMapping>
                    {...tableProps}
                    columns={EventsMappingColumns}
                    isLoading={loadingMappings || isLoading}
                    error={error}
                    showViewOptions={false}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading mappings...'
                    noDataTitle='No Mapped Events Found'
                    noDataDescription='Map a master event to an academic year to see it here.'
                    errorTitle='Error Loading Mappings'
                />
            </CollapsibleSection>

            {isToggleFormOpen && selectedRow && (
                <ToggleEventsMappingForm
                    rowData={selectedRow}
                    onClose={closeToggleForm}
                    onSuccess={() => {
                        refreshData?.();
                        fetchMappings();
                    }}
                />
            )}

            <ViewDetailsDialog
                isOpen={isDetailsViewOpen}
                onClose={closeDetailsView}
                title={`Details for ${selectedRow?.coemE_EventName || selectedRow?.COEME_EventName || 'Event'}`}
                loading={viewLoading}
                data={viewData}
            />

            <MappingDetailLoader isOpen={isDetailsViewOpen} selectedRow={selectedRow} onLoad={handleOpenDetails} />
        </div>
    );
}

function MappingDetailLoader({ isOpen, selectedRow, onLoad }: { isOpen: boolean; selectedRow: any; onLoad: (row: any) => void }) {
    useEffect(() => {
        if (isOpen && selectedRow) {
            onLoad(selectedRow);
        }
    }, [isOpen, selectedRow, onLoad]);
    return null;
}
