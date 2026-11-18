'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useClgMasterSections } from '@/hooks/college/useCollegeMasters';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { IClgMasterSection } from '@/types/college/masters';
import { Plus, X, ArrowUpDown } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';
import AddMasterSectionForm from './_components/add-form';
import UpdateMasterSectionForm from './_components/update-form';
import { masterSectionColumns } from './_components/columns';
import ToggleMasterSectionForm from './_components/toggle-form';
import OrderMasterSectionForm from './_components/order-form';

export default function ClgMasterSectionPage() {
    return (
        <FormProvider<IClgMasterSection>>
            <ClgMasterSectionContent />
        </FormProvider>
    );
}

function ClgMasterSectionContent() {
    const { openAddForm } = useFormContext<IClgMasterSection>();
    const { data: response, isLoading, error } = useClgMasterSections();
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));
    const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);

    const dataList = Array.isArray(response?.data) ? response.data : [];

    const filteredData = useMemo(() => {
        if (!searchQuery) return dataList;
        const query = searchQuery.toLowerCase();
        return dataList.filter((item: IClgMasterSection) =>
            item.acmS_SectionName?.toLowerCase().includes(query) ||
            item.acmS_SectionCode?.toLowerCase().includes(query)
        );
    }, [dataList, searchQuery]);

    const tableProps = useDataTableProps({ ...response, data: filteredData });

    return (
        <div className='p-6 space-y-6'>
            <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                    <CardTitle>Master Section</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='flex justify-end gap-2'>
                        <Button type='button' onClick={() => setIsOrderFormOpen(true)} variant='outline' className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                            <ArrowUpDown className='h-4 w-4 mr-2' /> Set Order
                        </Button>
                        <Button type='button' onClick={openAddForm} className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                            <Plus className='h-4 w-4 mr-2' /> Add Section
                        </Button>
                    </div>

                    <FormSections />

                    <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable<IClgMasterSection>
                            {...tableProps}
                            columns={masterSectionColumns}
                            isLoading={isLoading}
                            error={error}
                            showViewOptions={false}
                            columnPinning={{ right: ['actions'] }}
                            loadingMessage='Loading master sections...'
                            noDataTitle='No Master Sections Found'
                            noDataDescription='Get started by creating your first section'
                            errorTitle='Error Loading Sections'
                        />
                    </CollapsibleSection>

                    {isOrderFormOpen && (
                        <OrderMasterSectionForm data={dataList} onClose={() => setIsOrderFormOpen(false)} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function FormSections() {
    const { isAddFormOpen, isEditFormOpen, isToggleFormOpen, selectedRow, closeAddForm, closeEditForm, closeToggleForm, addFormRef, editFormRef } = useFormContext<IClgMasterSection>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection title='Add New Section' defaultOpen={true} variant='outline' size='md' className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button type='button' onClick={closeAddForm} variant='ghost' size='sm' className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive mr-2' /> Close
                            </Button>
                            <AddMasterSectionForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection title='Edit Section' defaultOpen={true} variant='outline' size='md' className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button type='button' onClick={closeEditForm} variant='ghost' size='sm' className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive mr-2' /> Close
                            </Button>
                            <UpdateMasterSectionForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {isToggleFormOpen && selectedRow && (
                <ToggleMasterSectionForm rowData={selectedRow} onClose={closeToggleForm} />
            )}
        </>
    );
}
