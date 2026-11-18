'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { PageHeader } from '@/components/ui/layout/page-header';
import { SectionCard } from '@/components/ui/layout/section-card';
import { tableSearchVariables } from '@/lib/data-table.config';
import { getMasterPages } from '@/server/super-admin/super-admin-module/general-setting/master-page';
import type { IMasterPage } from '@/types/super-admin/super-admin-module/general-setting/master-page';
import { Plus, X } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import React, { useEffect, useState } from 'react';
import AddMasterPageForm from './_components/add-form';
import { columns } from './_components/columns';
import { PageProvider } from './_components/page-context';

export default function MasterPage() {
    return (
        <FormProvider<IMasterPage>>
            <MasterPageContent />
        </FormProvider>
    );
}

function MasterPageContent() {
    const { openAddForm } = useFormContext<IMasterPage>();
    const [data, setData] = useState<IMasterPage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination State
    const [page] = useQueryState(tableSearchVariables.page, parseAsInteger.withOptions({ shallow: false }).withDefault(1));
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withOptions({ shallow: false }).withDefault(10));
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withOptions({ shallow: false }).withDefault(''));
    const [sortBy] = useQueryState(tableSearchVariables.sort_column, parseAsString.withOptions({ shallow: false }).withDefault(''));
    const [sortDirection] = useQueryState(
        tableSearchVariables.sort_direction,
        parseAsString.withOptions({ shallow: false }).withDefault('asc')
    );
    const [totalItems, setTotalItems] = useState(0);

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        const searchParams = {
            page: page,
            page_size: pageSize,
            search_query: searchQuery,
            sort_column: sortBy,
            sort_direction: sortDirection
        };

        try {
            const res = await getMasterPages(searchParams);
            if (res.success) {
                setData(res.data || []);
                setTotalItems(res.total || 0);
            }
        } catch (error) {
            console.error('Failed to fetch master pages', error);
        } finally {
            setIsLoading(false);
        }
    }, [page, pageSize, searchQuery, sortBy, sortDirection]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <PageProvider refreshData={fetchData}>
            <div className='container mx-auto space-y-8 p-6'>
                <PageHeader
                    title='Master Pages'
                    highlightWord='Pages'
                    description='Manage core application pages, define their properties, and control global visibility settings.'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='h-11 rounded-full bg-[#7C3AED] px-6 font-bold text-white shadow-lg shadow-purple-200 transition-all hover:scale-105 hover:bg-[#6D28D9]'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Master Page
                    </Button>
                </PageHeader>

                <FormSections onRefresh={fetchData} />

                <SectionCard>
                    <CollapsibleSection title='Master Pages List' defaultOpen={true} variant='default' size='lg'>
                        <div className='p-4'>
                            <GenericDataTable
                                data={data}
                                columns={columns}
                                isLoading={isLoading}
                                isPaginationRequired={true}
                                totalItems={totalItems}
                            />
                        </div>
                    </CollapsibleSection>
                </SectionCard>
            </div>
        </PageProvider>
    );
}

function FormSections({ onRefresh }: { onRefresh: () => void }) {
    const { isAddFormOpen, isEditFormOpen, closeAddForm, closeEditForm, addFormRef, editFormRef } = useFormContext<IMasterPage>();

    const closeForm = isEditFormOpen ? closeEditForm : closeAddForm;
    const title = isEditFormOpen ? 'Edit Master Page' : 'Add Master Page';
    const isOpen = isAddFormOpen || isEditFormOpen;
    const currentRef = isEditFormOpen ? editFormRef : addFormRef;

    const handleSuccess = () => {
        closeForm();
        onRefresh();
    };

    return (
        <div ref={currentRef}>
            {isOpen && (
                <CollapsibleSection
                    title={title}
                    defaultOpen={true}
                    variant='outline'
                    size='lg'
                    className='slide-in-from-top-2 animate-in shadow-lg'>
                    <div className='relative'>
                        <Button
                            type='button'
                            onClick={closeForm}
                            variant='ghost'
                            size='sm'
                            className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                            <X className='h-4 w-4 text-destructive' /> Close
                        </Button>
                        <AddMasterPageForm onSuccess={handleSuccess} onCancel={closeForm} />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
