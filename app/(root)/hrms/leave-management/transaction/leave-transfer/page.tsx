'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDeleteLeaveStatusById, useLeaveCreditAndBalanceGrid } from '@/hooks/hrms/leave-management/useTransactions';
import { useLeaveDropdown, useLeaveYearDropdown } from '@/hooks/hrms/useMasters';
import { usePeriodLeaveReportEmployees, useReportDepartments, useReportDesignations, useReportGroupTypes } from '@/hooks/hrms/useReports';
import { Plus, X } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { use, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { type LeaveCreditBalanceGridItem, getLeaveTransferColumns } from './_components/columns';
import { LeaveTransferForm, type LeaveTransferFormData } from './_components/leave-transfer-form';
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
export default function LeaveTransferPage(props: { searchParams: SearchParams }) {
    const _searchParams = use(props.searchParams);

    // Use nuqs hooks for reactive table parameters
    const [params] = useQueryStates({
        page: parseAsInteger.withDefault(1),
        page_size: parseAsInteger.withDefault(10),
        search_query: parseAsString.withDefault(''),
        sort_column: parseAsString.withDefault(''),
        sort_direction: parseAsString.withDefault('asc')
    });

    // Normalize params for useLeaveCreditAndBalanceGrid
    const normalizedParams = useMemo(
        () => ({
            page: params.page,
            page_size: params.page_size,
            search_query: params.search_query || '',
            sort_column: params.sort_column || '',
            sort_direction: (params.sort_direction as 'asc' | 'desc') || 'asc'
        }),
        [params]
    );

    const { data: response, isLoading, error } = useLeaveCreditAndBalanceGrid(normalizedParams);
    return (
        <FormProvider<LeaveCreditBalanceGridItem>>
            <LeaveTransferPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}
function LeaveTransferPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<LeaveCreditBalanceGridItem>();
    const { openEditForm, openDeleteForm } = useFormContext<LeaveCreditBalanceGridItem>();
    const tableProps = useDataTableProps(response);
    const columns = getLeaveTransferColumns({
        onEdit: openEditForm,
        onDelete: (id: number) => {
            const row = response?.data?.find((r: LeaveCreditBalanceGridItem) => r.hrelS_Id === id);
            if (row) {
                openDeleteForm(row);
            }
        }
    });
    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Leave Transfer
                    </Button>
                </div>
                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<LeaveCreditBalanceGridItem>
                        {...tableProps}
                        columns={columns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading leave transfers...'
                        noDataTitle='No Leave Transfers Found'
                        noDataDescription='Get started by creating your first leave transfer'
                        errorTitle='Error Loading Leave Transfers'
                    />
                </CollapsibleSection>
                {/* Forms */}
                <FormSections />
            </div>
        </div>
    );
}
function FormSections() {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isDeleteFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeDeleteForm,
        addFormRef,
        editFormRef
    } = useFormContext<LeaveCreditBalanceGridItem>();
    const { refetchAll } = useLeaveCreditAndBalanceGrid();
    const deleteLeaveStatus = useDeleteLeaveStatusById();
    const [activeTab, setActiveTab] = useState('Leave Updation');

    // --- State for Filters in Form ---
    const [selectedTypeIds, setSelectedTypeIds] = useState<number[]>([]);
    const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>([]);
    const [selectedDesignationIds, setSelectedDesignationIds] = useState<number[]>([]);

    // --- Master Data Hooks ---
    const { data: groupTypesData, isLoading: isLoadingTypes } = useReportGroupTypes();

    const groupTypeIdsStr = selectedTypeIds.join(',');
    const { data: departmentsData, isLoading: isLoadingDepartments } = useReportDepartments(groupTypeIdsStr);

    const deptIdsStr = selectedDeptIds.join(',');
    const { data: designationsData, isLoading: isLoadingDesignations } = useReportDesignations(groupTypeIdsStr, deptIdsStr);

    const { data: employeesData } = usePeriodLeaveReportEmployees(selectedDeptIds, selectedDesignationIds);

    const filteredEmployeeIds = useMemo(() => {
        if (!employeesData || !Array.isArray(employeesData)) return null;
        return employeesData.map((e: any) => Number(e.HRME_Id || e.hrmE_Id)).filter((id) => id);
    }, [employeesData]);

    // --- Leave Data Hooks ---
    const { data: yearsData } = useLeaveYearDropdown();
    const { data: leavesData } = useLeaveDropdown();
    console.log('leavesData', leavesData);

    const leaveYears = useMemo(() => {
        return (yearsData?.data || []).map((y: any) => ({
            id: Number(y.hrmlY_Id),
            name: y.hrmlY_LeaveYear
        }));
    }, [yearsData]);

    const leaveNames = useMemo(() => {
        return (leavesData?.data || []).map((l: any) => ({
            id: Number(l.key),
            name: l.value
        }));
    }, [leavesData]);

    console.log("leavesData", leaveNames);

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

    const handleFilterChange = (type: 'types' | 'departments' | 'designations', values: number[]) => {
        if (type === 'types') {
            setSelectedTypeIds(values);
            setSelectedDeptIds([]);
            setSelectedDesignationIds([]);
        } else if (type === 'departments') {
            setSelectedDeptIds(values);
            setSelectedDesignationIds([]);
        } else if (type === 'designations') {
            setSelectedDesignationIds(values);
        }
    };

    // handleFormSubmit is no longer used by child, passed as dummy
    const handleFormSubmit = (_formData: LeaveTransferFormData) => {};

    const handleDelete = () => {
        if (selectedRow) {
            deleteLeaveStatus.mutate(
                { hrels_id: selectedRow.hrelS_Id },
                {
                    onSuccess: () => {
                        toast.success('Leave transfer deleted successfully');
                        refetchAll();
                        closeDeleteForm();
                    }
                }
            );
        }
    };
    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Leave Transfer'
                        description='Fill in the details to process leave transfer'
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
                            <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                                <TabsList className='grid w-full grid-cols-3'>
                                    <TabsTrigger value='Leave Updation'>Leave Updation</TabsTrigger>
                                    <TabsTrigger value='Leave Addition'>Leave Addition</TabsTrigger>
                                    <TabsTrigger value='Leave CarryForward'>Leave CarryForward</TabsTrigger>
                                </TabsList>
                                <TabsContent value='Leave Updation' className='mt-4'>
                                    <LeaveTransferForm
                                        activeTab='Leave Updation'
                                        onSubmit={handleFormSubmit}
                                        onCancel={closeAddForm}
                                        types={types}
                                        departments={departments}
                                        designations={designations}
                                        isLoadingTypes={isLoadingTypes}
                                        isLoadingDepartments={isLoadingDepartments}
                                        isLoadingDesignations={isLoadingDesignations}
                                        onFilterChange={handleFilterChange}
                                        filteredEmployeeIds={filteredEmployeeIds}
                                        employees={employeesData}
                                        leaveYears={leaveYears}
                                        leaveNames={leaveNames}
                                    />
                                </TabsContent>
                                <TabsContent value='Leave Addition' className='mt-4'>
                                    <LeaveTransferForm
                                        activeTab='Leave Addition'
                                        onSubmit={handleFormSubmit}
                                        onCancel={closeAddForm}
                                        types={types}
                                        departments={departments}
                                        designations={designations}
                                        isLoadingTypes={isLoadingTypes}
                                        isLoadingDepartments={isLoadingDepartments}
                                        isLoadingDesignations={isLoadingDesignations}
                                        onFilterChange={handleFilterChange}
                                        filteredEmployeeIds={filteredEmployeeIds}
                                        employees={employeesData}
                                        leaveYears={leaveYears}
                                        leaveNames={leaveNames}
                                    />
                                </TabsContent>
                                <TabsContent value='Leave CarryForward' className='mt-4'>
                                    <LeaveTransferForm
                                        activeTab='Leave CarryForward'
                                        onSubmit={handleFormSubmit}
                                        onCancel={closeAddForm}
                                        types={types}
                                        departments={departments}
                                        designations={designations}
                                        isLoadingTypes={isLoadingTypes}
                                        isLoadingDepartments={isLoadingDepartments}
                                        isLoadingDesignations={isLoadingDesignations}
                                        onFilterChange={handleFilterChange}
                                        filteredEmployeeIds={filteredEmployeeIds}
                                        employees={employeesData}
                                        leaveYears={leaveYears}
                                        leaveNames={leaveNames}
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Leave Transfer'
                        description='Update leave transfer information'
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
                            <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                                <TabsList className='grid w-full grid-cols-3'>
                                    <TabsTrigger value='Leave Updation'>Leave Updation</TabsTrigger>
                                    <TabsTrigger value='Leave Addition'>Leave Addition</TabsTrigger>
                                    <TabsTrigger value='Leave CarryForward'>Leave CarryForward</TabsTrigger>
                                </TabsList>
                                <TabsContent value='Leave Updation' className='mt-4'>
                                    <LeaveTransferForm
                                        activeTab='Leave Updation'
                                        onSubmit={handleFormSubmit}
                                        onCancel={closeEditForm}
                                        defaultValues={{
                                            leaveYear: String(selectedRow.hrmlY_Id),
                                            leaveName: String(selectedRow.hrmL_Id)
                                        }}
                                        types={types}
                                        departments={departments}
                                        designations={designations}
                                        isLoadingTypes={isLoadingTypes}
                                        isLoadingDepartments={isLoadingDepartments}
                                        isLoadingDesignations={isLoadingDesignations}
                                        onFilterChange={handleFilterChange}
                                        filteredEmployeeIds={filteredEmployeeIds}
                                        employees={employeesData}
                                        leaveYears={leaveYears}
                                        leaveNames={leaveNames}
                                    />
                                </TabsContent>
                                <TabsContent value='Leave Addition' className='mt-4'>
                                    <LeaveTransferForm
                                        activeTab='Leave Addition'
                                        onSubmit={handleFormSubmit}
                                        onCancel={closeEditForm}
                                        defaultValues={{
                                            leaveYear: String(selectedRow.hrmlY_Id),
                                            leaveName: String(selectedRow.hrmL_Id)
                                        }}
                                        types={types}
                                        departments={departments}
                                        designations={designations}
                                        isLoadingTypes={isLoadingTypes}
                                        isLoadingDepartments={isLoadingDepartments}
                                        isLoadingDesignations={isLoadingDesignations}
                                        onFilterChange={handleFilterChange}
                                        filteredEmployeeIds={filteredEmployeeIds}
                                        employees={employeesData}
                                        leaveYears={leaveYears}
                                        leaveNames={leaveNames}
                                    />
                                </TabsContent>
                                <TabsContent value='Leave CarryForward' className='mt-4'>
                                    <LeaveTransferForm
                                        activeTab='Leave CarryForward'
                                        onSubmit={handleFormSubmit}
                                        onCancel={closeEditForm}
                                        defaultValues={{
                                            leaveYear: String(selectedRow.hrmlY_Id),
                                            leaveName: String(selectedRow.hrmL_Id)
                                        }}
                                        types={types}
                                        departments={departments}
                                        designations={designations}
                                        isLoadingTypes={isLoadingTypes}
                                        isLoadingDepartments={isLoadingDepartments}
                                        isLoadingDesignations={isLoadingDesignations}
                                        onFilterChange={handleFilterChange}
                                        filteredEmployeeIds={filteredEmployeeIds}
                                        employees={employeesData}
                                        leaveYears={leaveYears}
                                        leaveNames={leaveNames}
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {/* Delete Form */}
            {isDeleteFormOpen && selectedRow && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
                    <div className='mx-4 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg'>
                        <h2 className='mb-4 font-semibold text-lg'>Delete Leave Transfer</h2>
                        <p className='mb-6'>Are you sure you want to delete this leave transfer? This action cannot be undone.</p>
                        <div className='flex justify-end gap-2'>
                            <Button type='button' variant='outline' onClick={closeDeleteForm}>
                                Cancel
                            </Button>
                            <Button type='button' variant='destructive' onClick={handleDelete}>
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
