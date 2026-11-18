'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import {
    useAcademicYearDropDownMasterDayClasswise,
    useSubjectRestrictionDaySubjectGridData
} from '@/hooks/timetable/constraints/subjectrestriction';
import { getdetailsAllFixing } from '@/server/timetable/constraints/fixing';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import DaySubjectAddForm from './daysubjectAddForm';
import { daySubjectColumns } from './daysubjectColumns';
import DaySubjectToggle from './daysubjectToggle';
import DaySubjectUpdate from './daysubjectUpdate';

interface DaySubjectTabProps {
    initialData?: any;
    searchParams?: any;
}

export default function DaySubjectTab({ initialData, searchParams }: DaySubjectTabProps) {
    return (
        <FormProvider>
            <DaySubjectTabContent initialData={initialData} searchParams={searchParams} />
        </FormProvider>
    );
}

function DaySubjectTabContent({ initialData, searchParams }: DaySubjectTabProps) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        openAddForm,
        closeAddForm,
        closeEditForm,
        closeAllForms,
        isToggleFormOpen,
        closeToggleForm,
        selectedRow,
        addFormRef,
        editFormRef
    } = useFormContext();

    const [dayList, setDayList] = useState<any[]>([]);
    const [subjectList, setSubjectList] = useState<any[]>([]);

    const { data: academicData } = useAcademicYearDropDownMasterDayClasswise();
    const academicList = (academicData as any)?.data || (Array.isArray(academicData) ? academicData : []);

    const {
        data: gridResponse,
        isLoading: gridLoading,
        error,
        refetchAll
    } = useSubjectRestrictionDaySubjectGridData(searchParams);

    const tableProps = useDataTableProps(gridResponse);

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                const res = await getdetailsAllFixing();
                if (res?.data) {
                    setDayList(res.data.daylist || []);
                    setSubjectList(res.data.subjectlist || res.data.sublist || []);
                }
            } catch (error) {
                console.error(error);
            }
        };
        loadDropdowns();
    }, []);

    const onFormSuccess = () => {
        refetchAll();
        closeAllForms();
    };

    return (
        <div className='space-y-4'>
            <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                <Button type='button' onClick={openAddForm} className='bg-orange-500 shadow-md hover:scale-105 hover:bg-orange-600'>
                    <Plus className='mr-2 h-4 w-4' /> Add Day Subject Constraint
                </Button>
            </div>

            <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                <GenericDataTable
                    {...tableProps}
                    columns={daySubjectColumns}
                    isLoading={gridLoading}
                    error={error}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading day subject constraint data...'
                    noDataTitle='No Day Subject Constraints Found'
                    noDataDescription='Add a new day subject constraint to get started'
                    errorTitle='Error Loading Data'
                />
            </CollapsibleSection>

            {isToggleFormOpen && selectedRow && <DaySubjectToggle rowData={selectedRow} onClose={closeToggleForm} />}

            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Day Subject Constraint'
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
                            <DaySubjectAddForm
                                academicList={academicList}
                                dayList={dayList}
                                subjectList={subjectList}
                                onSuccess={onFormSuccess}
                                onCancel={closeAddForm}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Day Subject Constraint'
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
                            <DaySubjectUpdate
                                academicList={academicList}
                                dayList={dayList}
                                subjectList={subjectList}
                                selectedRow={selectedRow}
                                onSuccess={onFormSuccess}
                                onCancel={closeEditForm}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </div>
    );
}
