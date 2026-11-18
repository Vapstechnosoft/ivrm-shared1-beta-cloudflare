'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { usebifurcationAcademicYear } from '@/hooks/timetable/constraints/bifurcationconstraints';
import { useDaySubjectGridData } from '@/hooks/timetable/constraints/fixingData';
import { getdetailsAllFixing } from '@/server/timetable/constraints/fixing';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { filterData } from '../dayperiod/utils';
import DaySubjectAddForm from './daysubjectAddForm';
import { daySubjectColumns } from './daysubjectColumns';
import DaySubjectToggle from './daysubjectToggle';
import DaySubjectUpdate from './daysubjectUpdate';

interface DaySubjectTabProps {
    initialData: any;
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

    const { data: academicData } = usebifurcationAcademicYear();
    const academicList = Array.isArray(academicData) ? academicData : (academicData as any)?.data || [];

    const [dayList, setDayList] = useState<any[]>(initialData?.daylist || initialData?.data?.daylist || []);
    const [subjectList, setSubjectList] = useState<any[]>(initialData?.subjectlist || initialData?.data?.subjectlist || []);

    const { data: gridResponse, isLoading: isGridLoading, refetchAll } = useDaySubjectGridData(searchParams);
    console.log('gridResponse', gridResponse);

    const gridData = (gridResponse as any)?.data || [];

    const totalItems = (gridResponse as any)?.total || gridData.length;

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                if (dayList.length === 0 || subjectList.length === 0) {
                    const fixingData = await getdetailsAllFixing();
                    if (fixingData?.data) {
                        setDayList(filterData(fixingData.data.daylist || [], 'ttmD_DayName'));
                        setSubjectList(filterData(fixingData.data.subjectlist || [], 'ismS_SubjectName'));
                    }
                }
            } catch (error) {
                console.error('Failed to load initial dropdowns:', error);
                toast.error('Failed to load dropdown options');
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
                <Button
                    type='button'
                    onClick={openAddForm}
                    className='w-fit bg-orange-500 shadow-md transition-all duration-200 hover:scale-105 hover:bg-orange-600 hover:shadow-lg'>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Day Subject Constraint
                </Button>
            </div>

            <CollapsibleSection
                title='Day Subject Constraints List'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable data={gridData} columns={daySubjectColumns} totalItems={totalItems} isLoading={isGridLoading} />
            </CollapsibleSection>

            {isToggleFormOpen && selectedRow && <DaySubjectToggle rowData={selectedRow} onClose={closeToggleForm} />}

            {(isAddFormOpen || isEditFormOpen) && (
                <div ref={isAddFormOpen ? addFormRef : editFormRef}>
                    <CollapsibleSection
                        title={isEditFormOpen ? 'Edit Day Subject Constraint' : 'Add New Day Subject Constraint'}
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={isEditFormOpen ? closeEditForm : closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>

                            {isAddFormOpen && (
                                <DaySubjectAddForm
                                    academicList={academicList}
                                    dayList={dayList}
                                    subjectList={subjectList}
                                    onSuccess={onFormSuccess}
                                    onCancel={closeAddForm}
                                />
                            )}

                            {isEditFormOpen && selectedRow && (
                                <DaySubjectUpdate
                                    academicList={academicList}
                                    dayList={dayList}
                                    subjectList={subjectList}
                                    selectedRow={selectedRow}
                                    onSuccess={onFormSuccess}
                                    onCancel={closeEditForm}
                                />
                            )}
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </div>
    );
}
