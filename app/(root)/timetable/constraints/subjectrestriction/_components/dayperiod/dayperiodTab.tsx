'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import {
    useAcademicYearDropDownMasterDayClasswise,
    useCategtoryDropDownMasterDayClasswise,
    useSubjectRestrictionDayPeriodGridData
} from '@/hooks/timetable/constraints/subjectrestriction';
import { getdetailsAllFixing } from '@/server/timetable/constraints/fixing';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { extractList } from '../../../fixing/_components/dayperiod/utils';
import DayPeriodAddForm from './dayperiodAddForm';
import { dayPeriodColumns } from './dayperiodColumns';
import DayPeriodToggle from './dayperiodToggle';
import DayPeriodUpdate from './dayperiodUpdate';

interface DayPeriodTabProps {
    initialData?: any;
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

    const [dayList, setDayList] = useState<any[]>([]);
    const [periodList, setPeriodList] = useState<any[]>([]);

    const { data: academicYearData } = useAcademicYearDropDownMasterDayClasswise();
    const { data: categoryData } = useCategtoryDropDownMasterDayClasswise();
    const academicList = extractList(academicYearData);
    const categoryList = extractList(categoryData);

    const {
        data: gridResponse,
        isLoading: gridLoading,
        error,
        refetchAll
    } = useSubjectRestrictionDayPeriodGridData(searchParams);

    const tableProps = useDataTableProps(gridResponse);

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                const res = await getdetailsAllFixing();
                if (res?.data) {
                    setDayList(res.data.daylist || []);
                    setPeriodList(res.data.periodlist || []);
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
                <Button
                    type='button'
                    onClick={openAddForm}
                    className='w-fit bg-orange-500 shadow-md transition-all duration-200 hover:scale-105 hover:bg-orange-600 hover:shadow-lg'>
                    <Plus className='mr-2 h-4 w-4' /> Add Day Period Constraint
                </Button>
            </div>

            <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                <GenericDataTable
                    {...tableProps}
                    columns={dayPeriodColumns}
                    isLoading={gridLoading}
                    error={error}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading day period constraint data...'
                    noDataTitle='No Day Period Constraints Found'
                    noDataDescription='Add a new day period constraint to get started'
                    errorTitle='Error Loading Data'
                />
            </CollapsibleSection>

            {isToggleFormOpen && selectedRow && <DayPeriodToggle rowData={selectedRow} onClose={closeToggleForm} />}

            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Day Period Constraint'
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

                            <DayPeriodAddForm dayList={dayList} periodList={periodList} onSuccess={onFormSuccess} onCancel={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Day Period Constraint'
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

                            <DayPeriodUpdate
                                dayList={dayList}
                                periodList={periodList}
                                selectedRow={selectedRow}
                                academicList={academicList}
                                categoryList={categoryList}
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
