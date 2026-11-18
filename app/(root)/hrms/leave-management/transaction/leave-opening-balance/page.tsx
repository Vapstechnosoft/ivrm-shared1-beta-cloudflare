'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import {
    useDeleteLeaveOpeningBalance,
    useGetLeaveOB,
    useLeaveOpeningBalanceGrid,
    useSaveLeaveOpeningBalance
} from '@/hooks/hrms/leave-management/transaction/useLeaveOpeningBalance';
import { usePeriodLeaveReportEmployees, useReportDepartments, useReportDesignations, useReportGroupTypes } from '@/hooks/hrms/useReports';
// import { useMasterLeaveDropdowns } from '@/hooks/hrms/leave-management/useMasters'; // Removed
import { Plus, X } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { use, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { type LeaveOpeningBalance, getLeaveOpeningBalanceColumns } from './_components/columns';
import { LeaveOpeningBalanceForm, type LeaveOpeningBalanceFormData } from './_components/leave-opening-balance-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function LeaveOpeningBalancePage(props: { searchParams: SearchParams }) {
    const _searchParams = use(props.searchParams);

    // Use nuqs hooks for reactive table parameters
    const [params, setParams] = useQueryStates({
        page: parseAsInteger.withDefault(1),
        page_size: parseAsInteger.withDefault(10),
        search_query: parseAsString.withDefault(''),
        sort_column: parseAsString.withDefault(''),
        sort_direction: parseAsString.withDefault('asc'),
        search_columns: parseAsString.withDefault(''),
        search_column: parseAsString.withDefault('')
    });

    // Normalize params for useLeaveOpeningBalanceGrid
    const normalizedParams = useMemo(
        () => ({
            page: params.page,
            page_size: params.page_size,
            search_query: params.search_query || '',
            sort_column: params.sort_column || '',
            sort_direction: (params.sort_direction as 'asc' | 'desc') || 'asc',
            search_columns: params.search_columns || params.search_column || ''
        }),
        [params]
    );

    // Fetch Grid Data
    const { data: gridResponse, isLoading: isLoadingGrid, refetch: refetchGrid } = useLeaveOpeningBalanceGrid(normalizedParams);
    const rows = (gridResponse?.data || []) as LeaveOpeningBalance[];

    return (
        <FormProvider<LeaveOpeningBalance> scrollToForm={false}>
            <LeaveOpeningBalancePageContent
                rows={rows}
                isLoadingGrid={isLoadingGrid}
                refetchGrid={refetchGrid}
                totalItems={gridResponse?.total || rows.length}
                params={params}
                setParams={setParams}
            />
        </FormProvider>
    );
}

function LeaveOpeningBalancePageContent({
    rows,
    isLoadingGrid,
    refetchGrid,
    totalItems,
    params,
    setParams
}: {
    rows: LeaveOpeningBalance[];
    isLoadingGrid: boolean;
    refetchGrid: () => void;
    totalItems: number;
    params: any;
    setParams: any;
}) {
    const { openAddForm, openEditForm, isAddFormOpen, closeAddForm, closeEditForm } = useFormContext<LeaveOpeningBalance>();
    const saveMutation = useSaveLeaveOpeningBalance();
    const deleteMutation = useDeleteLeaveOpeningBalance();

    // --- State for Filters in Form ---
    const [selectedTypeIds, setSelectedTypeIds] = useState<number[]>([]);
    const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>([]);
    const [selectedDesignationIds, setSelectedDesignationIds] = useState<number[]>([]);

    // --- Master Data Hooks ---
    const { data: groupTypesData, isLoading: isLoadingTypes } = useReportGroupTypes();

    // Convert arrays to comma-separated strings for the report hooks
    const groupTypeIdsStr = selectedTypeIds.join(',');
    const { data: departmentsData, isLoading: isLoadingDepartments } = useReportDepartments(groupTypeIdsStr);

    const deptIdsStr = selectedDeptIds.join(',');
    const { data: designationsData, isLoading: isLoadingDesignations } = useReportDesignations(groupTypeIdsStr, deptIdsStr);

    // PeriodLeaveReportEmployees takes arrays, so keep as is
    const { data: employeesData, isLoading: isLoadingEmployees } = usePeriodLeaveReportEmployees(selectedDeptIds, selectedDesignationIds);
    const { data: leaveOBResponse, isLoading: isLoadingLeaveTypes } = useGetLeaveOB();

    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isAddFormOpen) {
            formRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isAddFormOpen]);

    // --- Mapped Data ---
    const types = useMemo(() => {
        return (groupTypesData?.data || [])
            .map((item: any) => ({
                id: Number(item.key || item.hrmgT_Id || item.id),
                name: item.value || item.hrmgT_EmployeeGroupType || item.name || ''
            }))
            .filter((i: any) => i.id);
    }, [groupTypesData]);

    const departments = useMemo(() => {
        return (departmentsData?.data || [])
            .map((item: any) => ({
                id: Number(item.hrmD_Id || item.hrmd_id || item.key || item.id),
                name: item.hrmD_DepartmentName || item.hrmd_departmentName || item.value || item.name || ''
            }))
            .filter((i: any) => i.id);
    }, [departmentsData]);

    const designations = useMemo(() => {
        return (designationsData?.data || [])
            .map((item: any) => ({
                id: Number(item.hrmdeS_Id || item.hrmdes_id || item.key || item.id),
                name: item.hrmdeS_DesignationName || item.hrmdes_designationName || item.value || item.name || ''
            }))
            .filter((i: any) => i.id);
    }, [designationsData]);

    const employees = useMemo(() => {
        if (!employeesData || !Array.isArray(employeesData)) return [];

        return employeesData
            .map((item: any) => {
                const id = item.HRME_Id || item.hrmE_Id || item.id || item.key;
                if (id == null) return null;

                const firstName = item.HRME_EmployeeFirstName || item.hrmE_EmployeeFirstName || '';
                const middleName = item.HRME_EmployeeMiddleName || item.hrmE_EmployeeMiddleName || '';
                const lastName = item.HRME_EmployeeLastName || item.hrmE_EmployeeLastName || '';
                const fullName = `${firstName} ${middleName} ${lastName}`.trim().replace(/\s+/g, ' ');

                return {
                    id: Number(id),
                    employeeCode: id,
                    employeeName: fullName || item.value || item.employeeName || 'Unknown'
                };
            })
            .filter((i: any) => i !== null) as { id: number; employeeCode: string; employeeName: string }[];
    }, [employeesData]);

    // Extract leave types from the GetLeaveOB response
    const leaveTypes: { id: number; name: string }[] = useMemo(() => {
        const unique = new Map();
        (leaveOBResponse?.data || []).forEach((item: any) => {
            const id = Number(item.key);
            if (id && !unique.has(id)) {
                unique.set(id, {
                    id: id,
                    name: item.value
                });
            }
        });
        return Array.from(unique.values());
    }, [leaveOBResponse]);

    const handleFormSubmit = async (formData: LeaveOpeningBalanceFormData) => {
        if (!formData.selectedEmployeeId) {
            toast.error('Please select an employee');
            return;
        }

        const employeeLeaveOB = Object.entries(formData.leaveBalances)
            .map(([leaveName, balance]) => {
                const leave = leaveTypes.find((l) => l.name === leaveName);
                return {
                    hrmL_Id: leave?.id || 0,
                    hreobL_OBLeaves: Number(balance)
                };
            })
            .filter((item) => item.hrmL_Id !== 0);
        // Note: allowing 0 checks if needed, but usually we just send what was entered.

        saveMutation.mutate(
            {
                hrmE_Id: formData.selectedEmployeeId,
                employeeLeaveOB: employeeLeaveOB
            },
            {
                onSuccess: () => {
                    refetchGrid();
                    closeAddForm();
                    closeEditForm();
                    // Reset internal state if needed
                    setSelectedTypeIds([]);
                    setSelectedDeptIds([]);
                    setSelectedDesignationIds([]);
                }
            }
        );
    };

    const handleFilterChange = (type: 'types' | 'departments' | 'designations', values: number[]) => {
        if (type === 'types') {
            setSelectedTypeIds(values);
            setSelectedDeptIds([]); // Reset dependent filters
            setSelectedDesignationIds([]);
        } else if (type === 'departments') {
            setSelectedDeptIds(values);
            setSelectedDesignationIds([]);
        } else if (type === 'designations') {
            setSelectedDesignationIds(values);
        }
    };

    const handleDelete = (row: LeaveOpeningBalance) => {
        if (confirm('Are you sure you want to delete this record?')) {
            deleteMutation.mutate(row.hreobL_Id, {
                onSuccess: () => refetchGrid()
            });
        }
    };

    const columns = getLeaveOpeningBalanceColumns({
        onEdit: (row) => {
            // Edit logic is tricky due to filters required to re-select employee.
            // For now we disable or support limitededit?
            // Since API supports Upsert, maybe just open Add form if we can pre-select.
            // But we don't have filters.
            // For now, let's keep it simple: Add New Entry. If Edit needed, user deletes and re-adds or adds again to update.
            // But I'll leave the hook there.
            openEditForm(row);
            // Note: Form will open empty/default unless we pass default props, which is hard here.
            // In future, we can implementing fetching employee details by ID to pre-fill filters.
        },
        onDelete: handleDelete
    });

    const tableProps = useDataTableProps({
        data: rows,
        columns: columns,
        totalItems: totalItems,
        searchParams: params,
        onSearchParamsChange: setParams
    });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={() => {
                            setSelectedTypeIds([]);
                            setSelectedDeptIds([]);
                            setSelectedDesignationIds([]);
                            openAddForm();
                        }}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Leave Opening Balance
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    title='LEAVE OPENING BALANCE REPORT'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<LeaveOpeningBalance>
                        {...tableProps}
                        columns={columns}
                        isLoading={isLoadingGrid}
                        showViewOptions={false}
                        showSearchColumns={true}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading leave opening balance...'
                        noDataTitle='No Leave Opening Balance Found'
                        noDataDescription='Get started by creating your first leave opening balance'
                        errorTitle='Error Loading Leave Opening Balance'
                    />
                </CollapsibleSection>

                {/* Forms - Rendered conditionally by FormProvider state */}
                <div ref={formRef}>
                    <FormSections
                        types={types}
                        departments={departments}
                        designations={designations}
                        employees={employees}
                        leaveTypes={leaveTypes}
                        isLoadingTypes={isLoadingTypes}
                        isLoadingDepartments={isLoadingDepartments}
                        isLoadingDesignations={isLoadingDesignations}
                        isLoadingEmployees={isLoadingEmployees}
                        onFilterChange={handleFilterChange}
                        onSubmit={handleFormSubmit}
                    />
                </div>
            </div>
        </div>
    );
}

function FormSections({
    types,
    departments,
    designations,
    employees,
    leaveTypes,
    isLoadingTypes,
    isLoadingDepartments,
    isLoadingDesignations,
    isLoadingEmployees,
    onFilterChange,
    onSubmit
}: {
    types: Array<{ id: number; name: string }>;
    departments: Array<{ id: number; name: string }>;
    designations: Array<{ id: number; name: string }>;
    employees: Array<{ id: number; employeeCode: string; employeeName: string }>;
    leaveTypes: Array<{ id: number; name: string }>;
    isLoadingTypes: boolean;
    isLoadingDepartments: boolean;
    isLoadingDesignations: boolean;
    isLoadingEmployees: boolean;
    onFilterChange: (type: 'types' | 'departments' | 'designations', values: number[]) => void;
    onSubmit: (data: LeaveOpeningBalanceFormData) => void;
}) {
    const { isAddFormOpen, closeAddForm } = useFormContext<LeaveOpeningBalance>();

    return (
        <>
            {isAddFormOpen && (
                <div className='mb-4'>
                    <CollapsibleSection
                        title='LEAVE OPENING BALANCE'
                        description='Fill in the details to set leave opening balance'
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
                            <LeaveOpeningBalanceForm
                                types={types}
                                departments={departments}
                                designations={designations}
                                employees={employees}
                                leaveTypes={leaveTypes}
                                onSubmit={onSubmit}
                                onCancel={closeAddForm}
                                isLoadingTypes={isLoadingTypes}
                                isLoadingDepartments={isLoadingDepartments}
                                isLoadingDesignations={isLoadingDesignations}
                                isLoadingEmployees={isLoadingEmployees}
                                onFilterChange={onFilterChange}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
