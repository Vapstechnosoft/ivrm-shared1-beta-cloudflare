'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterNumberingDropdown, useRegNumbering } from '@/hooks/admission/preadmission/useConfigurations';
import type { IMasterTransactionNumberingList } from '@/types/admission/preadmission/configaration';
import { Loader2, Plus, X } from 'lucide-react';
import { useState } from 'react';
import AddRegistrationNumberingForm from './_components/add-form';
import { registrationNumberingColumns } from './_components/columns';
import UpdateRegistrationNumberingForm from './_components/update-form';

export default function RegistrationNumberingPage() {
    return (
        <FormProvider<IMasterTransactionNumberingList>>
            <RegistrationNumberingPageContent />
        </FormProvider>
    );
}

function RegistrationNumberingPageContent() {
    const [selectedFlag, setSelectedFlag] = useState<string>('');
    const { data: masterNumberingResponse, isLoading: isLoadingMaster } = useMasterNumberingDropdown();

    const { data: response, isLoading: isLoadingGrid, error } = useRegNumbering(selectedFlag);

    // Total loading state includes both dropdown and grid fetching
    const isLoading = isLoadingMaster || isLoadingGrid;

    const { openAddForm } = useFormContext<IMasterTransactionNumberingList>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Center Dropdown */}
                <CollapsibleSection
                    title='Select Master Numbering'
                    description='Choose a numbering type to manage its configurations'
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='shadow-md'>
                    <div className='flex items-center justify-center py-6'>
                        <div className='flex w-full max-w-sm items-center gap-4'>
                            <Label htmlFor='master-numbering-select' className='whitespace-nowrap font-bold'>
                                Type:
                            </Label>
                            <Select value={selectedFlag} onValueChange={(value) => setSelectedFlag(value)} disabled={isLoadingMaster}>
                                <SelectTrigger id='master-numbering-select' className='w-full'>
                                    {isLoadingMaster ? (
                                        <div className='flex items-center gap-2 text-muted-foreground'>
                                            <Loader2 className='h-4 w-4 animate-spin' />
                                            <span>Loading...</span>
                                        </div>
                                    ) : (
                                        <SelectValue placeholder='Select an option' />
                                    )}
                                </SelectTrigger>
                                <SelectContent>
                                    {masterNumberingResponse?.data?.map((item: any) => (
                                        <SelectItem key={item.imN_Id} value={item.imN_Flag}>
                                            {item.imN_Flag}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Header Actions */}
                {response && response.data?.length === 0 && selectedFlag && (
                    <div className='slide-in-from-top-2 flex animate-in justify-end duration-300'>
                        <Button
                            type='button'
                            onClick={openAddForm}
                            className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                            <Plus className='h-4 w-4' />
                            Add Transaction Numbering
                        </Button>
                    </div>
                )}

                {/* Data Table Section */}
                {selectedFlag && (
                    <CollapsibleSection
                        title={`${selectedFlag} Numbering Configurations`}
                        description={`Manage ${selectedFlag} numbering settings`}
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='slide-in-from-bottom-4 animate-in shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable<IMasterTransactionNumberingList>
                            {...tableProps}
                            columns={registrationNumberingColumns}
                            isLoading={isLoadingGrid}
                            error={error}
                            isSearchRequired={false}
                            isPaginationRequired={false}
                            showViewOptions={false}
                            columnPinning={{ right: ['actions'] }}
                            loadingMessage={`Loading ${selectedFlag} Group Configurations...`}
                            noDataTitle='No Configurations Found'
                            noDataDescription={`Add a new transaction numbering configuration for ${selectedFlag}`}
                            errorTitle='Error Loading Configuration'
                        />
                    </CollapsibleSection>
                )}

                {/* Forms */}
                <FormSections selectedFlag={selectedFlag} />
            </div>
        </div>
    );
}

function FormSections({ selectedFlag }: { selectedFlag: string }) {
    const { isAddFormOpen, isEditFormOpen, selectedRow, closeAddForm, closeEditForm, addFormRef, editFormRef } =
        useFormContext<IMasterTransactionNumberingList>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title={`Add New ${selectedFlag} Numbering`}
                        description='Fill in the details below to create a new transaction numbering entry'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            {/* We are just rendering the original AddRegistrationNumberingForm. It will probably post using standard values. */}
                            <AddRegistrationNumberingForm selectedFlag={selectedFlag} onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title={`Edit ${selectedFlag} Numbering`}
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <UpdateRegistrationNumberingForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
