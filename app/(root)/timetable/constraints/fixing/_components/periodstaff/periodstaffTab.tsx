'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { usebifurcationAcademicYear } from '@/hooks/timetable/constraints/bifurcationconstraints';
import { usePeriodStaffGridData } from '@/hooks/timetable/constraints/fixingData';
import { getFixingPeriodStaffDetails, getdetailsAllFixing } from '@/server/timetable/constraints/fixing';
import { Plus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FixingViewModal } from '../fixing-view-modal';
import PeriodStaffAddForm from './periodstaffAddForm';
import { periodStaffColumns } from './periodstaffColumns';
import PeriodStaffToggle from './periodstaffToggle';
import PeriodStaffUpdate from './periodstaffUpdate';

interface PeriodStaffTabProps {
    initialData: any;
    searchParams?: any;
}

const uniqueById = (list: any[], idKey: string) => {
    const seen = new Set();
    return (list || []).filter((item: any) => {
        if (!item) return false;
        const actualKey = Object.keys(item).find((k) => k.toLowerCase() === idKey.toLowerCase());
        const id = actualKey ? item[actualKey] : undefined;
        if (id === undefined || id === null) return false;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
    });
};

const filterData = (list: any[], key: string) => {
    return (list || []).filter((item: any) => {
        if (!item) return false;
        const actualKey = Object.keys(item).find((k) => k.toLowerCase() === key.toLowerCase());
        const val = actualKey ? item[actualKey] : undefined;
        if (val === undefined || val === null) return false;
        if (typeof val !== 'string') return !!val;
        const name = val.trim();
        return name && name.toLowerCase() !== 'test';
    });
};

export default function PeriodStaffTab({ initialData, searchParams }: PeriodStaffTabProps) {
    return (
        <FormProvider>
            <PeriodStaffTabContent initialData={initialData} searchParams={searchParams} />
        </FormProvider>
    );
}

function PeriodStaffTabContent({ initialData, searchParams }: PeriodStaffTabProps) {
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
        isDetailsViewOpen,
        selectedRow: viewRow,
        closeDetailsView,
        addFormRef,
        editFormRef
    } = useFormContext();

    const { data: academicData } = usebifurcationAcademicYear();
    const academicList = (academicData as any)?.data || [];

    const { data: gridResponse, isLoading: isGridLoading, refetchAll } = usePeriodStaffGridData(searchParams);
    console.log();

    const gridData = (gridResponse as any)?.data || [];
    const totalItems = (gridResponse as any)?.total || gridData.length;

    const [dayList, setDayList] = useState<any[]>(initialData?.daylist || []);
    const [periodList, setPeriodList] = useState<any[]>(initialData?.periodlist || []);
    const [staffList, setStaffList] = useState<any[]>(initialData?.stafflist || []);
    const [viewDetails, setViewDetails] = useState<any[]>([]);
    const [isLoadingView, setIsLoadingView] = useState(false);

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                if (dayList.length === 0 || periodList.length === 0 || staffList.length === 0) {
                    const fixingData = await getdetailsAllFixing();
                    if (fixingData?.data) {
                        setDayList(filterData(fixingData.data.daylist || [], 'ttmD_DayName'));
                        setPeriodList(filterData(fixingData.data.periodlist || [], 'ttmP_PeriodName'));
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

    useEffect(() => {
        const fetchViewDetails = async () => {
            if (isDetailsViewOpen && viewRow) {
                try {
                    setIsLoadingView(true);
                    setViewDetails([]);
                    const id = viewRow.ttfpS_Id ?? viewRow.TTFPS_Id;
                    if (!id) return;

                    const res = await getFixingPeriodStaffDetails(id);
                    // biome-ignore lint/complexity/useOptionalChain: <explanation>
                    const subDetails = res?.fix_period_staff__classecedit || (res?.data && res.data[0]?.tempararyArrayList);
                    if (subDetails && Array.isArray(subDetails)) {
                        const details = subDetails.map((sub: any) => ({
                            clsDisplay: sub.asmcL_ClassName,
                            sectDisplay: sub.asmC_SectionName,
                            subDisplay: sub.ismS_SubjectName,
                            nop: sub.ttfpscC_Days || sub.nop || sub.nod
                        }));
                        setViewDetails(details);
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsLoadingView(false);
                }
            }
        };
        fetchViewDetails();
    }, [isDetailsViewOpen, viewRow]);

    const viewColumns = useMemo(
        () => [
            { accessorKey: 'clsDisplay', header: 'Class' },
            { accessorKey: 'sectDisplay', header: 'Section' },
            { accessorKey: 'subDisplay', header: 'Subject' },
            { accessorKey: 'nop', header: 'No Of Days' }
        ],
        []
    );

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
                    Add Period Staff Constraint
                </Button>
            </div>

            <CollapsibleSection
                title='Period Staff Constraints List'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable data={gridData} columns={periodStaffColumns} totalItems={totalItems} isLoading={isGridLoading} />
            </CollapsibleSection>

            {isToggleFormOpen && selectedRow && <PeriodStaffToggle rowData={selectedRow} onClose={closeToggleForm} />}

            {(isAddFormOpen || isEditFormOpen) && (
                <div ref={isAddFormOpen ? addFormRef : editFormRef}>
                    <CollapsibleSection
                        title={isEditFormOpen ? 'Edit Period Staff Constraint' : 'Add New Period Staff Constraint'}
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
                                <PeriodStaffAddForm
                                    academicList={academicList}
                                    periodList={periodList}
                                    staffList={staffList}
                                    onSuccess={onFormSuccess}
                                    onCancel={closeAddForm}
                                />
                            )}

                            {isEditFormOpen && selectedRow && (
                                <PeriodStaffUpdate
                                    academicList={academicList}
                                    periodList={periodList}
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

            <FixingViewModal
                isOpen={!!isDetailsViewOpen}
                onClose={closeDetailsView}
                title='Class-Section Wise Details'
                data={viewDetails}
                columns={viewColumns}
                isLoading={isLoadingView}
            />
        </div>
    );
}
