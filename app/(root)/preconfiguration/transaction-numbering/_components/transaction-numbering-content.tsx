'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useRegNumbering } from '@/hooks/admission/preadmission/useConfigurations';
import type { IMasterTransactionNumberingList } from '@/types/admission/preadmission/configaration';
import { Plus, X } from 'lucide-react';

import AddTransactionNumberingForm from './add-form';
import { registrationNumberingColumns } from './columns';
import UpdateTransactionNumberingForm from './update-form';

export default function TransactionNumberingContent({ numberingType }: { numberingType: string }) {
    const { data: response, isLoading, error, refetch, refetchAll } = useRegNumbering(numberingType);
    const { openAddForm, isAddFormOpen, isEditFormOpen, selectedRow, closeAddForm, closeEditForm, addFormRef, editFormRef } =
        useFormContext<IMasterTransactionNumberingList>();

    const handleSuccess = async () => {
        closeAddForm();
        closeEditForm();
        await refetchAll();
        refetch();
    };

    const getTableData = (res: any, type: string) => {
        if (!res) return [];
        const resData = res?.data ?? res;
        if (type === 'RollNumber') {
            return (
                resData.rolenoNumbering ||
                resData.RolenoNumbering ||
                resData.rollNumberingArraylist ||
                resData.RollNumberingArraylist ||
                resData.rollnoNumbering ||
                resData.RollnoNumbering ||
                resData.rollNumbering ||
                resData.RollNumbering ||
                resData.rollNoNumbering ||
                resData.RollNoNumbering ||
                []
            );
        }
        if (type === 'TC') {
            return resData.tcNumberingArraylist || resData.TcNumberingArraylist || [];
        }
        const camel = `${type.charAt(0).toLowerCase() + type.slice(1)}NumberingArraylist`;
        const pascal = `${type.charAt(0).toUpperCase() + type.slice(1)}NumberingArraylist`;
        return resData[camel] || resData[pascal] || [];
    };

    const resData = response?.data ?? response;
    const tableData = getTableData(resData, numberingType);
    const rollConfig =
        resData?.rolenoNumberingConfig ||
        resData?.RolenoNumberingConfig ||
        resData?.rollNumberingconfig ||
        resData?.RollNumberingconfig ||
        [];
    const tableProps = useDataTableProps({ ...response, data: tableData });

    return (
        <div className='space-y-4 pt-4'>
            {tableData.length === 0 && !isLoading && (
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add {numberingType} Numbering
                    </Button>
                </div>
            )}

            <CollapsibleSection
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable<IMasterTransactionNumberingList>
                    {...tableProps}
                    columns={registrationNumberingColumns}
                    isLoading={isLoading}
                    error={error}
                    isSearchRequired={false}
                    isPaginationRequired={false}
                    showViewOptions={false}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage={`Loading ${numberingType} Numberings...`}
                    noDataTitle={`No ${numberingType} Numberings Found`}
                    noDataDescription='Get started by creating your first configuration'
                />
            </CollapsibleSection>

            {/* Forms */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title={`Add New ${numberingType} Numbering`}
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
                            <AddTransactionNumberingForm numberingType={numberingType} onSuccess={handleSuccess} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title={`Edit ${numberingType} Numbering`}
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
                            <UpdateTransactionNumberingForm
                                numberingType={numberingType}
                                selectedRow={{
                                    ...selectedRow,
                                    rollNumberingconfig:
                                        selectedRow?.rollNumberingconfig && selectedRow.rollNumberingconfig.length > 0
                                            ? selectedRow.rollNumberingconfig
                                            : selectedRow?.RollNumberingconfig && selectedRow.RollNumberingconfig.length > 0
                                              ? selectedRow.RollNumberingconfig
                                              : rollConfig
                                }}
                                initialData={{
                                    rollNumberingconfig: rollConfig
                                }}
                                onSuccess={handleSuccess}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </div>
    );
}
