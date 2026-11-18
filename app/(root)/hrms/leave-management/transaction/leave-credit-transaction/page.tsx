'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import {
    useLeaveTransactionManualList,
    useSaveLeaveTransactionManual,
    useUpdateLeaveTransactionManual
} from '@/hooks/hrms/leave-management/useLeaveTransactionManual';
import { useMasterLeaveYear } from '@/hooks/hrms/leave-management/useMasters';
import { usePeriodLeaveReportEmployees, useReportDepartments, useReportDesignations, useReportGroupTypes } from '@/hooks/hrms/useReports';
import { Plus, X } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { use, useMemo, useState } from 'react';
import { type LeaveCreditTransaction, getLeaveCreditTransactionColumns } from './_components/columns';
import { LeaveCreditTransactionForm } from './_components/leave-credit-transaction-form';
import { ToggleLeaveTransactionManualForm } from './_components/toggle-transaction-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function LeaveCreditTransactionPage(props: { searchParams: SearchParams }) {
    const _searchParams = use(props.searchParams);

    // Use nuqs hooks for reactive table parameters
    const [params] = useQueryStates({
        page: parseAsInteger.withDefault(1),
        page_size: parseAsInteger.withDefault(10),
        search_query: parseAsString.withDefault(''),
        sort_column: parseAsString.withDefault(''),
        sort_direction: parseAsString.withDefault('asc'),
        search_columns: parseAsString.withDefault(''),
        search_column: parseAsString.withDefault('')
    });

    // Normalize params for useLeaveTransactionManualList
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

    const { data: response, isLoading, error, refetchAll } = useLeaveTransactionManualList(normalizedParams);
    return (
        <FormProvider<LeaveCreditTransaction>>
            <LeaveCreditTransactionPageContent response={response} isLoading={isLoading} error={error} refetchAll={refetchAll} />
        </FormProvider>
    );
}

function LeaveCreditTransactionPageContent({
    response,
    isLoading,
    error,
    refetchAll
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetchAll: () => void;
}) {
    const { openAddForm } = useFormContext<LeaveCreditTransaction>();
    const { openEditForm, openToggleForm } = useFormContext<LeaveCreditTransaction>();
    const tableProps = useDataTableProps(response);
    const columns = getLeaveCreditTransactionColumns({
        onEdit: openEditForm,
        onToggle: (row: LeaveCreditTransaction) => {
            openToggleForm(row);
        }
    });

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

    // PeriodLeaveReportEmployees takes arrays
    const { data: employeesData, isLoading: isLoadingEmployees } = usePeriodLeaveReportEmployees(selectedDeptIds, selectedDesignationIds);

    // Leave Year Data
    const { data: yearData } = useMasterLeaveYear();
    console.log('yearData', yearData);
    const years = useMemo(() => {
        return (yearData?.data || []).map((y: any) => ({
            id: Number(y.hrmlY_Id || y.id || 0),
            year: y.hrmlY_LeaveYear || y.leaveYear || '',
            fromDate: y.hrmlY_FromDate || y.fromDate || '',
            toDate: y.hrmlY_ToDate || y.toDate || '',
            isActive: !!(y.isActive || y.active || y.hrmlY_ActiveFlag)
        }));
    }, [yearData]);

    const activeYearId = useMemo(() => {
        const active = years.find((y) => y.isActive);
        return active?.id || 0;
    }, [years]);

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
                    employeeCode: item.HRME_EmployeeCode || item.hrmE_EmployeeCode || item.employeeCode || '',
                    employeeName: fullName || item.value || item.employeeName || 'Unknown'
                };
            })
            .filter((i: any) => i !== null) as { id: number; employeeCode: string; employeeName: string }[];
    }, [employeesData]);

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
                        Add Leave Transaction
                    </Button>
                </div>
                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<LeaveCreditTransaction>
                        {...tableProps}
                        columns={columns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        showSearchColumns={true}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading leave transactions...'
                        noDataTitle='No Leave Transactions Found'
                        noDataDescription='Get started by creating your first leave transaction'
                        errorTitle='Error Loading Leave Transactions'
                    />
                </CollapsibleSection>
                {/* Forms */}
                <FormSections
                    refetchAll={refetchAll}
                    types={types}
                    departments={departments}
                    designations={designations}
                    employees={employees}
                    years={years}
                    activeYearId={activeYearId}
                    isLoadingTypes={isLoadingTypes}
                    isLoadingDepartments={isLoadingDepartments}
                    isLoadingDesignations={isLoadingDesignations}
                    isLoadingEmployees={isLoadingEmployees}
                    onFilterChange={handleFilterChange}
                />
            </div>
        </div>
    );
}

function FormSections({
    refetchAll,
    types,
    departments,
    designations,
    employees,
    years,
    activeYearId,
    isLoadingTypes,
    isLoadingDepartments,
    isLoadingDesignations,
    isLoadingEmployees,
    onFilterChange
}: {
    refetchAll: () => void;
    types: Array<{ id: number; name: string }>;
    departments: Array<{ id: number; name: string }>;
    designations: Array<{ id: number; name: string }>;
    employees: Array<{ id: number; employeeCode: string; employeeName: string }>;
    years: Array<{ id: number; year: string; fromDate: string; toDate: string; isActive: boolean }>;
    activeYearId: number;
    isLoadingTypes: boolean;
    isLoadingDepartments: boolean;
    isLoadingDesignations: boolean;
    isLoadingEmployees: boolean;
    onFilterChange: (type: 'types' | 'departments' | 'designations', values: number[]) => void;
}) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        addFormRef,
        editFormRef
    } = useFormContext<LeaveCreditTransaction>();

    const { mutate: saveTransaction } = useSaveLeaveTransactionManual();
    const { mutate: updateTransaction } = useUpdateLeaveTransactionManual();

    const handleFormSubmit = (formData: LeaveCreditTransaction) => {
        console.log('formData', formData);
        // Inject Active Year ID if missing
        const dataToSave = {
            ...formData,
            hrmlY_Id: formData.hrmlY_Id || activeYearId
        };

        if (selectedRow) {
            updateTransaction(dataToSave as any, {
                onSuccess: () => {
                    refetchAll();
                    closeEditForm();
                }
            });
        } else {
            saveTransaction(dataToSave as any, {
                onSuccess: () => {
                    refetchAll();
                    closeAddForm();
                }
            });
        }
    };

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='LEAVE TRANSACTION'
                        description='Fill in the details to process leave transaction'
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
                            <LeaveCreditTransactionForm
                                editingRow={null}
                                onSubmit={handleFormSubmit}
                                onCancel={closeAddForm}
                                types={types}
                                departments={departments}
                                designations={designations}
                                employees={employees}
                                years={years}
                                activeYearId={activeYearId}
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
            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Leave Transaction'
                        description='Update leave transaction information'
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
                            <LeaveCreditTransactionForm
                                editingRow={selectedRow}
                                onSubmit={handleFormSubmit}
                                onCancel={closeEditForm}
                                types={types}
                                departments={departments}
                                designations={designations}
                                employees={employees}
                                years={years}
                                activeYearId={activeYearId}
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
            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && (
                <ToggleLeaveTransactionManualForm
                    rowData={selectedRow}
                    onClose={closeToggleForm}
                    onSuccess={() => {
                        refetchAll();
                    }}
                />
            )}
        </>
    );
}
