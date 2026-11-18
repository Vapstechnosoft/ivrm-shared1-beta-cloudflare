'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { usebifurcationAcademicYear } from '@/hooks/timetable/constraints/bifurcationconstraints';
import { useFixingDayPeriodGridData } from '@/hooks/timetable/constraints/fixingData';
import { getCategoryDropDown } from '@/server/timetable/constraints/FixingForm';
import { getdetailsAllFixing } from '@/server/timetable/constraints/fixing';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import DayPeriodAddForm from './dayperiodAddForm';
import { dayPeriodColumns } from './dayperiodColumns';
import DayPeriodToggle from './dayperiodToggle';
import DayPeriodUpdate from './dayperiodUpdate';
import { filterData } from './utils';

interface DayPeriodTabProps {
    initialData: any;
    searchParams?: any;
}

export default function DayPeriodTab({ initialData, searchParams }: DayPeriodTabProps) {
    return (
        <FormProvider>
            <DayPeriodTabContent initialData={initialData} searchParams={searchParams} />
        </FormProvider>
    );
}

function DayPeriodTabContent({ initialData, searchParams }: DayPeriodTabProps) {
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
    const academicList = (academicData as any)?.data || initialData?.academiclist || initialData?.data?.academiclist || [];

    const [categoryList, setCategoryList] = useState<any[]>(
        filterData(
            initialData?.categorylist || initialData?.data?.categorylist || initialData?.catelist || initialData?.data?.catelist || [],
            'ttmC_CategoryName'
        )
    );
    const [dayList, setDayList] = useState<any[]>(filterData(initialData?.daylist || initialData?.data?.daylist || [], 'ttmD_DayName'));
    const [periodList, setPeriodList] = useState<any[]>(
        filterData(initialData?.periodlist || initialData?.data?.periodlist || [], 'ttmP_PeriodName')
    );

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                if (categoryList.length === 0 || dayList.length === 0 || periodList.length === 0) {
                    const [category, fixingData] = await Promise.all([getCategoryDropDown(), getdetailsAllFixing()]);

                    if (categoryList.length === 0) {
                        setCategoryList(filterData(category || [], 'ttmC_CategoryName'));
                    }

                    if (fixingData?.data) {
                        if (dayList.length === 0) {
                            setDayList(filterData(fixingData.data.daylist || [], 'ttmD_DayName'));
                        }
                        if (periodList.length === 0) {
                            setPeriodList(filterData(fixingData.data.periodlist || [], 'ttmP_PeriodName'));
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load initial dropdowns:', error);
            }
        };
        loadDropdowns();
    }, [initialData]);

    const { data: gridResponse, isLoading: gridLoading, refetchAll } = useFixingDayPeriodGridData(searchParams);
    const gridData = gridResponse
        ? (gridResponse as any)?.data || (gridResponse as any)?.fix_day_period_list || []
        : initialData?.fix_day_period_list || [];

    const onFormSuccess = () => {
        refetchAll();
        closeAllForms();
    };

    return (
        <div className='space-y-4'>
            <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                <Button
                    type='button'
                    onClick={() => {
                        console.log('clicked');
                        openAddForm();
                    }}
                    className='w-fit bg-orange-500 shadow-md transition-all duration-200 hover:scale-105 hover:bg-orange-600 hover:shadow-lg'>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Day Period Constraint
                </Button>
            </div>

            <CollapsibleSection title='Day Period Constraints List' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                <GenericDataTable data={gridData} columns={dayPeriodColumns} isLoading={gridLoading} />
            </CollapsibleSection>

            {isToggleFormOpen && selectedRow && <DayPeriodToggle rowData={selectedRow} onClose={closeToggleForm} />}

            {(isAddFormOpen || isEditFormOpen) && (
                <div ref={isAddFormOpen ? addFormRef : editFormRef}>
                    <CollapsibleSection
                        title={isEditFormOpen ? 'Edit Day Period Constraint' : 'Add New Day Period Constraint'}
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg'>
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
                                <DayPeriodAddForm
                                    academicList={academicList}
                                    categoryList={categoryList}
                                    dayList={dayList}
                                    periodList={periodList}
                                    onSuccess={onFormSuccess}
                                    onCancel={closeAddForm}
                                />
                            )}

                            {isEditFormOpen && selectedRow && (
                                <DayPeriodUpdate
                                    academicList={academicList}
                                    categoryList={categoryList}
                                    dayList={dayList}
                                    periodList={periodList}
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
