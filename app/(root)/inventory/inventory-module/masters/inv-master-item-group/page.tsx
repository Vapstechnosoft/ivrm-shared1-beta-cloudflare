'use client';
import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useInvMasterItemGroup } from '@/hooks/inventory/masters/use-inv-master-item-group';
import type { IInvMasterItemGroup } from '@/types/inventory/masters/inv-master-group';
import { Boxes, Pencil, Plus, PlusCircle, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import { InvMasterItemGroupColumns } from './_components/item-group-columns';
import { AddItemGroupForm, ToggleItemGroupForm, UpdateItemGroupForm } from './_components/item-group-form';

import { useInvMasterUserGroup } from '@/hooks/inventory/masters/use-inv-master-user-group';

export default function InvMasterItemGroupPage() {
    return (
        <FormProvider<IInvMasterItemGroup>>
            <ItemGroupPageContent />
        </FormProvider>
    );
}

function ItemGroupPageContent() {
    const searchParams = useSearchParams();
    const params = Object.fromEntries(searchParams.entries());
    const { data: response, isLoading } = useInvMasterItemGroup(params);
    const { data: userGroupResponse } = useInvMasterUserGroup();
    const { openAddForm } = useFormContext<IInvMasterItemGroup>();

    const userGroupsList = React.useMemo(() => {
        if (!userGroupResponse) return [];
        const payload = userGroupResponse.data || userGroupResponse;
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload.data)) return payload.data;
        if (Array.isArray(payload.get_usergroup)) return payload.get_usergroup;
        return [];
    }, [userGroupResponse]);

    const enrichedData = React.useMemo(() => {
        if (!response) return undefined;

        // The actual API payload could be directly `response`, or wrapped inside `response.data`.
        const payload = response?.data || response;

        let itemGroups = [];
        if (Array.isArray(payload)) {
            itemGroups = payload;
        } else if (Array.isArray(payload?.data)) {
            itemGroups = payload.data;
        } else if (Array.isArray(payload?.get_itemgroup)) {
            itemGroups = payload.get_itemgroup;
        }

        const enrichedItemGroups = itemGroups.map((item: any) => {
            const userGroup = userGroupsList.find((ug: any) => ug.invmG_Id === item.invmG_ParentId);
            return {
                ...item,
                userGroupName: userGroup ? userGroup.invmG_GroupName : ''
            };
        });

        // Preserve all original response properties (like success, total)
        if (Array.isArray(payload)) {
            return enrichedItemGroups;
        }

        return {
            ...payload,
            data: enrichedItemGroups,
            get_itemgroup: enrichedItemGroups
        };
    }, [response, userGroupsList]);

    const tableProps = useDataTableProps(enrichedData, {
        dataKey: 'data',
        totalKey: 'total'
    });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Item Group Master' description='Manage Item Groups' />
                    </div>
                </div>

                <div className='space-y-4 p-1'>
                    {/* Header Actions */}
                    <div className='flex justify-end'>
                        <Button
                            type='button'
                            onClick={openAddForm}
                            className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                            <Plus className='h-4 w-4' />
                            Add Item Group
                        </Button>
                    </div>

                    {/* Data Table */}
                    <CollapsibleSection
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                        title='Item Group List'
                        icon={<Boxes className='h-5 w-5' />}>
                        <GenericDataTable<IInvMasterItemGroup>
                            {...tableProps}
                            columns={InvMasterItemGroupColumns}
                            isLoading={isLoading}
                            columnPinning={{ right: ['actions'] }}
                            loadingMessage='Loading Item Groups...'
                            noDataTitle='No Item Groups Found'
                            noDataDescription='Create your first Item Group'
                        />
                    </CollapsibleSection>

                    {/* Forms */}
                    <FormSections response={response} userGroupsList={userGroupsList} />
                </div>
            </div>
        </div>
    );
}

interface FormSectionsProps {
    response: any;
    userGroupsList: any[];
}

function FormSections({ response, userGroupsList }: FormSectionsProps) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        addFormRef,
        editFormRef
    } = useFormContext<IInvMasterItemGroup>();

    const userGroupOptions = userGroupsList.map((item: any) => ({
        label: item.invmG_GroupName,
        value: item.invmG_Id.toString()
    }));

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Item Group'
                        description='Fill in the details below'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'
                        icon={<PlusCircle className='h-5 w-5' />}>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <AddItemGroupForm onSuccess={closeAddForm} userGroupOptions={userGroupOptions} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Item Group'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'
                        icon={<Pencil className='h-5 w-5' />}>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <UpdateItemGroupForm selectedRow={selectedRow} onSuccess={closeEditForm} userGroupOptions={userGroupOptions} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && <ToggleItemGroupForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
