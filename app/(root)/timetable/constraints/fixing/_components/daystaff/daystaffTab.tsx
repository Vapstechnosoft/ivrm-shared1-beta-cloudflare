'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { usebifurcationAcademicYear } from '@/hooks/timetable/constraints/bifurcationconstraints';
import { useDayStaffGridData } from '@/hooks/timetable/constraints/fixingData';
import { getdetailsAllFixing } from '@/server/timetable/constraints/fixing';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { filterData } from '../dayperiod/utils';
import DayStaffAddForm from './daystaffAddForm';
import { dayStaffColumns } from './daystaffColumns';
import DayStaffToggle from './daystaffToggle';
import DayStaffUpdate from './daystaffUpdate';

interface DayStaffTabProps {
    initialData: any;
    searchParams?: any;
}

export default function DayStaffTab({ initialData, searchParams }: DayStaffTabProps) {
    return (
        <FormProvider>
            <DayStaffTabContent initialData={initialData} searchParams={searchParams} />
        </FormProvider>
    );
}

function DayStaffTabContent({ initialData, searchParams }: DayStaffTabProps) {
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
    const [staffList, setStaffList] = useState<any[]>(initialData?.stafflist || initialData?.data?.stafflist || []);

    const { data: gridResponse, isLoading: isGridLoading, refetchAll } = useDayStaffGridData(searchParams);

    const gridData = gridResponse
        ? (gridResponse as any)?.data || (gridResponse as any)?.fix_day_staff_list || (Array.isArray(gridResponse) ? gridResponse : [])
        : initialData?.data?.fix_day_staff_list || initialData?.fix_day_staff_list || [];

    const totalItems =
        (gridResponse as any)?.total ||
        (gridResponse as any)?.count ||
        (Array.isArray(gridResponse) ? gridResponse.length : initialData?.total || gridData.length);

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                if (dayList.length === 0 || staffList.length === 0) {
                    const fixingData = await getdetailsAllFixing();
                    if (fixingData?.data) {
                        setDayList(filterData(fixingData.data.daylist || [], 'ttmD_DayName'));
                        setStaffList(filterData(fixingData.data.stafflist || [], 'staffName'));
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
                    Add Day Staff Constraint
                </Button>
            </div>

            <CollapsibleSection
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable data={gridData} columns={dayStaffColumns} totalItems={totalItems} isLoading={isGridLoading} />
            </CollapsibleSection>

            {isToggleFormOpen && selectedRow && <DayStaffToggle rowData={selectedRow} onClose={closeToggleForm} />}

            {(isAddFormOpen || isEditFormOpen) && (
                <div ref={isAddFormOpen ? addFormRef : editFormRef}>
                    <CollapsibleSection
                        title={isEditFormOpen ? 'Edit Day Staff Constraint' : 'Add New Day Staff Constraint'}
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
                                <DayStaffAddForm
                                    academicList={academicList}
                                    dayList={dayList}
                                    staffList={staffList}
                                    onSuccess={onFormSuccess}
                                    onCancel={closeAddForm}
                                />
                            )}

                            {isEditFormOpen && selectedRow && (
                                <DayStaffUpdate
                                    academicList={academicList}
                                    dayList={dayList}
                                    staffList={staffList}
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
