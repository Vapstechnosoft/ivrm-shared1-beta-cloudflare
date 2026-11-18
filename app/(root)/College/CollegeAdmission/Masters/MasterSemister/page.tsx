'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useClgMasterSemesters } from '@/hooks/college/useCollegeMasters';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { IClgMasterSemester } from '@/types/college/masters';
import { Plus, X, ArrowUpDown } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';
import AddMasterSemesterForm from './_components/add-form';
import UpdateMasterSemesterForm from './_components/update-form';
import { masterSemesterColumns } from './_components/columns';
import ToggleMasterSemesterForm from './_components/toggle-form';
import OrderMasterSemesterForm from './_components/order-form';

export default function ClgMasterSemesterPage() {
    return (
        <FormProvider<IClgMasterSemester>>
            <ClgMasterSemesterContent />
        </FormProvider>
    );
}

function ClgMasterSemesterContent() {
    const { openAddForm } = useFormContext<IClgMasterSemester>();
    const { data: response, isLoading, error } = useClgMasterSemesters();
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));
    const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);

    const dataList = Array.isArray(response?.data?.semlist) ? response.data.semlist : [];

    const filteredData = useMemo(() => {
        if (!searchQuery) return dataList;
        const query = searchQuery.toLowerCase();
        
        const activeStatus = (flag?: boolean) => flag ? 'active' : 'inactive';

        return dataList.filter((item: IClgMasterSemester) =>
            item.amsE_SEMName?.toLowerCase().includes(query) ||
            item.amsE_SEMCode?.toLowerCase().includes(query) ||
            item.amsE_SEMOrder?.toString().includes(query) ||
            item.amsE_SEMInfo?.toLowerCase().includes(query) ||
            item.amsE_SEMTypeFlag?.toLowerCase().includes(query) ||
            item.amsE_EvenOdd?.toLowerCase().includes(query) ||
            activeStatus(item.amsE_ActiveFlg).includes(query)
        );
    }, [dataList, searchQuery]);

    const tableProps = useDataTableProps({ ...response, data: filteredData });

    return (
        <div className='p-6 space-y-6'>
            <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                    <CardTitle>Master Semester</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='flex justify-end gap-2'>
                        <Button type='button' onClick={() => setIsOrderFormOpen(true)} variant='outline' className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                            <ArrowUpDown className='h-4 w-4 mr-2' /> Set Order
                        </Button>
                        <Button type='button' onClick={openAddForm} className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                            <Plus className='h-4 w-4 mr-2' /> Add Semester
                        </Button>
                    </div>

                    <FormSections />

                    <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable<IClgMasterSemester>
                            {...tableProps}
                            columns={masterSemesterColumns}
                            isLoading={isLoading}
                            error={error}
                            showViewOptions={false}
                            columnPinning={{ right: ['actions'] }}
                            loadingMessage='Loading master semesters...'
                            noDataTitle='No Master Semesters Found'
                            noDataDescription='Get started by creating your first semester'
                            errorTitle='Error Loading Semesters'
                        />
                    </CollapsibleSection>

                    {isOrderFormOpen && (
                        <OrderMasterSemesterForm data={Array.isArray(response?.data?.semlistorder) ? response.data.semlistorder : []} onClose={() => setIsOrderFormOpen(false)} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function FormSections() {
    const { isAddFormOpen, isEditFormOpen, isToggleFormOpen, selectedRow, closeAddForm, closeEditForm, closeToggleForm, addFormRef, editFormRef } = useFormContext<IClgMasterSemester>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection title='Add New Semester' defaultOpen={true} variant='outline' size='md' className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button type='button' onClick={closeAddForm} variant='ghost' size='sm' className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive mr-2' /> Close
                            </Button>
                            <AddMasterSemesterForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection title='Edit Semester' defaultOpen={true} variant='outline' size='md' className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button type='button' onClick={closeEditForm} variant='ghost' size='sm' className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive mr-2' /> Close
                            </Button>
                            <UpdateMasterSemesterForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {isToggleFormOpen && selectedRow && (
                <ToggleMasterSemesterForm rowData={selectedRow} onClose={closeToggleForm} />
            )}
        </>
    );
}
