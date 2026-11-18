'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { usebifurcationAcademicYear } from '@/hooks/timetable/constraints/bifurcationconstraints';
import { useSubjectRestrictionDayStaffGridData } from '@/hooks/timetable/constraints/subjectrestriction';
import { getSubjectRestrictionDetailsRestrictions } from '@/server/timetable/constraints/subjectrestriction';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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

    const [dayList, setDayList] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);

    const {
        data: gridResponse,
        isLoading: isGridLoading,
        error,
        refetchAll
    } = useSubjectRestrictionDayStaffGridData(searchParams);

    const tableProps = useDataTableProps(gridResponse);

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                const res = await getSubjectRestrictionDetailsRestrictions();
                if (res?.data) {
                    setDayList(res.data.daylist);
                    setStaffList(res.data.stafflist);
                }
            } catch (error) {
                console.error('Failed to load dropdowns:', error);
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

            <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                <GenericDataTable
                    {...tableProps}
                    columns={dayStaffColumns}
                    isLoading={isGridLoading}
                    error={error}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading day staff constraint data...'
                    noDataTitle='No Day Staff Constraints Found'
                    noDataDescription='Add a new day staff constraint to get started'
                    errorTitle='Error Loading Data'
                />
            </CollapsibleSection>

            {isToggleFormOpen && selectedRow && <DayStaffToggle rowData={selectedRow} onClose={closeToggleForm} />}

            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Day Staff Constraint'
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

                            <DayStaffAddForm
                                academicList={academicList}
                                dayList={dayList}
                                staffList={staffList}
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
                        title='Edit Day Staff Constraint'
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

                            <DayStaffUpdate
                                academicList={academicList}
                                dayList={dayList}
                                staffList={staffList}
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
