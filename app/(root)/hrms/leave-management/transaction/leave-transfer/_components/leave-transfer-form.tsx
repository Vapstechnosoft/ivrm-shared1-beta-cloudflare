'use client';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useLeaveAdditionStatusTab,
    useLeaveCarryForwardStatusTab,
    useLeaveCreditAndBalanceGrid,
    useUpdateLeaveStatusTab
} from '@/hooks/hrms/leave-management/useTransactions';
import { Save, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
export interface LeaveTransferFormData {
    type: string[];
    department: string[];
    designation: string[];
    leaveYear: string;
    leaveName: string;
}
interface LeaveTransferFormProps {
    activeTab: string;
    onSubmit: (data: LeaveTransferFormData) => void;
    onCancel: () => void;
    defaultValues?: Partial<LeaveTransferFormData>;
    // New Cascading Props
    types: Array<{ id: number; name: string }>;
    departments: Array<{ id: number; name: string }>;
    designations: Array<{ id: number; name: string }>;
    leaveYears: Array<{ id: number; name: string }>;
    leaveNames: Array<{ id: number; name: string }>;
    isLoadingTypes?: boolean;
    isLoadingDepartments?: boolean;
    isLoadingDesignations?: boolean;
    onFilterChange: (type: 'types' | 'departments' | 'designations', values: number[]) => void;
    filteredEmployeeIds: number[] | null;
    employees?: any[];
}

interface GridRow {
    hrmE_Id: number;
    hrmE_EmployeeName: string | null;
    hrelS_CBLeaves: number;
    hrelS_TotalLeaves: number;
    hrmL_Id: number;
    hrmlY_Id: number;
    hrelS_Id: number;
    // Local state
    isSelected: boolean;
    newCredit: number;
}

export function LeaveTransferForm({
    activeTab,
    onSubmit,
    onCancel,
    defaultValues,
    types,
    departments,
    designations,
    isLoadingTypes = false,
    isLoadingDepartments = false,
    isLoadingDesignations = false,
    onFilterChange,
    filteredEmployeeIds,
    employees = [],
    leaveYears = [],
    leaveNames = []
}: LeaveTransferFormProps) {
    // Hooks
    // Keep basic data for Leave Year/Name mainly, but we ignore Type/Dept/Desg from it now
    const { data: gridResponse, isLoading: isLoadingGrid } = useLeaveCreditAndBalanceGrid();
    const updateLeaveStatus = useUpdateLeaveStatusTab();
    const addLeaveStatus = useLeaveAdditionStatusTab();
    const carryForwardLeaveStatus = useLeaveCarryForwardStatusTab();

    // Form
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm<LeaveTransferFormData>({
        defaultValues: defaultValues || {
            type: [],
            department: [],
            designation: [],
            leaveYear: '',
            leaveName: ''
        }
    });

    const selectedLeaveYear = watch('leaveYear');
    const selectedLeaveName = watch('leaveName');

    // We don't watch these for local filtering anymore since we rely on `onFilterChange` to trigger updates up the chain
    // But we still need them for form submission data provided they are IDs.
    // The previous implementation used strings. The new API returns IDs.
    // We need to ensure the form stores strings (as per MultiSelect expectation) but we might process them as numbers.
    const selectedDepartments = watch('department');
    const selectedDesignations = watch('designation');
    const selectedTypes = watch('type');

    // Local state for grid edits (using a map for performance or just state)
    // For simplicity, let's derive the base list and store edits in a separate state
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [newCredits, setNewCredits] = useState<Record<number, number>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Filtered Grid Data (Derived from Employees list instead of Balance grid)
    const filteredGridData = useMemo(() => {
        if (!employees || !Array.isArray(employees)) return [];

        let data = employees.map((emp) => {
            const hrmE_Id = emp.HRME_Id || emp.hrmE_Id || emp.id || emp.key;
            const firstName = emp.HRME_EmployeeFirstName || emp.hrmE_EmployeeFirstName || '';
            const middleName = emp.HRME_EmployeeMiddleName || emp.hrmE_EmployeeMiddleName || '';
            const lastName = emp.HRME_EmployeeLastName || emp.hrmE_EmployeeLastName || '';
            const hrmE_EmployeeName = `${firstName} ${middleName} ${lastName}`.trim().replace(/\s+/g, ' ');

            // Find balance for this employee in the balance grid
            // We also need to match the selected leave name if possible
            const balanceRecord = gridResponse?.data?.find(
                (b) => b.hrmE_Id === hrmE_Id && (!selectedLeaveName || String(b.hrmL_Id) === selectedLeaveName)
            );

            return {
                hrmE_Id,
                hrmE_EmployeeName,
                hrelS_CBLeaves: balanceRecord?.hrelS_CBLeaves ?? 0,
                hrelS_TotalLeaves: balanceRecord?.hrelS_TotalLeaves ?? 0,
                hrmL_Id: balanceRecord?.hrmL_Id ?? Number(selectedLeaveName),
                hrmlY_Id: balanceRecord?.hrmlY_Id ?? Number(selectedLeaveYear),
                hrelS_Id: balanceRecord?.hrelS_Id ?? 0
            };
        });

        // Name Search Filter
        if (searchTerm.trim()) {
            const lowerSearch = searchTerm.toLowerCase();
            data = data.filter((item) => item.hrmE_EmployeeName?.toLowerCase().includes(lowerSearch));
        }

        return data;
    }, [employees, gridResponse, selectedLeaveName, selectedLeaveYear, searchTerm]);

    // Pagination Logic
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredGridData.slice(startIndex, startIndex + pageSize);
    }, [filteredGridData, currentPage]);

    const totalPages = Math.ceil(filteredGridData.length / pageSize);

    const handleToggleRow = (id: number) => {
        const newSet = new Set(selectedRows);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedRows(newSet);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRows(new Set(filteredGridData.map((item) => item.hrmE_Id)));
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleCreditChange = (id: number, val: string) => {
        const num = Number.parseFloat(val);
        setNewCredits((prev) => ({
            ...prev,
            [id]: isNaN(num) ? 0 : num
        }));
    };

    const onSubmitForm: SubmitHandler<LeaveTransferFormData> = (data) => {
        // Collect selected employees
        const employeesToProcess = filteredGridData.filter((item) => selectedRows.has(item.hrmE_Id));

        if (employeesToProcess.length === 0) {
            toast.error('Please select at least one employee');
            return;
        }

        if (activeTab === 'Leave Updation') {
            const payload = {
                HRME_SubstituteFlag: '',
                HRELAP_Id: 0,
                HRML_Id: Number(data.leaveName),
                HRMLY_Id: Number(data.leaveYear),
                monthid: 0,
                emplist: employeesToProcess.map((emp) => ({
                    HRME_Id: emp.hrmE_Id,
                    HRELS_CreditedLeaves: newCredits[emp.hrmE_Id] ?? 0 // Default or existing?
                }))
            };
            updateLeaveStatus.mutate(payload, {
                onSuccess: () => {
                    onCancel();
                }
            });
        } else if (activeTab === 'Leave Addition') {
            const payload = {
                HRML_Id: Number(data.leaveName),
                HRMLY_Id: Number(data.leaveYear),
                employees: employeesToProcess.map((emp) => ({
                    HRME_Id: emp.hrmE_Id,
                    HRELS_CreditedLeaves: newCredits[emp.hrmE_Id] ?? 0
                }))
            };
            addLeaveStatus.mutate(payload, {
                onSuccess: () => {
                    onCancel();
                }
            });
        } else if (activeTab === 'Leave CarryForward') {
            const payload = {
                employees: employeesToProcess.map((emp) => ({
                    hrmE_Id: emp.hrmE_Id,
                    hrelS_CreditedLeaves: newCredits[emp.hrmE_Id] ?? 0
                }))
            };
            carryForwardLeaveStatus.mutate(payload, {
                onSuccess: () => {
                    onCancel();
                }
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                {/* Type Filter */}
                <div className='space-y-2'>
                    <Label className='font-medium text-sm'>Type:</Label>
                    <Controller
                        name='type'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={types.map((t) => ({ label: t.name, value: String(t.id) }))}
                                onValueChange={(values) => {
                                    field.onChange(values);
                                    // Convert to numbers for the filter callback
                                    const numValues = values.map((v) => Number(v));
                                    onFilterChange('types', numValues);
                                    // Clear dependents
                                    setValue('department', []);
                                    setValue('designation', []);
                                }}
                                defaultValue={field.value || []}
                                placeholder={isLoadingTypes ? 'Loading...' : 'Select Types'}
                                className='w-full'
                                maxHeight={240}
                                disabled={isLoadingTypes}
                            />
                        )}
                    />
                </div>
                {/* Department Filter */}
                <div className='space-y-2'>
                    <Label className='font-medium text-sm'>Department:</Label>
                    <Controller
                        name='department'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={departments.map((d) => ({ label: d.name, value: String(d.id) }))}
                                onValueChange={(values) => {
                                    field.onChange(values);
                                    const numValues = values.map((v) => Number(v));
                                    onFilterChange('departments', numValues);
                                    setValue('designation', []);
                                }}
                                defaultValue={field.value || []}
                                placeholder={isLoadingDepartments ? 'Loading...' : 'Select Departments'}
                                className='w-full'
                                maxHeight={240}
                                disabled={isLoadingDepartments}
                            />
                        )}
                    />
                </div>
                {/* Designation Filter */}
                <div className='space-y-2'>
                    <Label className='font-medium text-sm'>Designation:</Label>
                    <Controller
                        name='designation'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={designations.map((d) => ({ label: d.name, value: String(d.id) }))}
                                onValueChange={(values) => {
                                    field.onChange(values);
                                    const numValues = values.map((v) => Number(v));
                                    onFilterChange('designations', numValues);
                                }}
                                defaultValue={field.value || []}
                                placeholder={isLoadingDesignations ? 'Loading...' : 'Select Designations'}
                                className='w-full'
                                maxHeight={240}
                                disabled={isLoadingDesignations}
                            />
                        )}
                    />
                </div>
            </div>

            {/* Leave Year and Leave Name */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                    <Label htmlFor='leave-year-select' className='font-medium text-sm'>
                        Leave Year <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='leaveYear'
                        control={control}
                        rules={{ required: 'Leave Year is required' }}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange} disabled={leaveYears.length === 0}>
                                <SelectTrigger id='leave-year-select' className={errors.leaveYear ? 'border-red-500' : ''}>
                                    <SelectValue placeholder={leaveYears.length > 0 ? 'Select' : 'Loading...'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {leaveYears.map((item) => (
                                        <SelectItem key={item.id} value={String(item.id)}>
                                            {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.leaveYear && <FormError>{errors.leaveYear.message}</FormError>}
                </div>
                <div>
                    <Label htmlFor='leave-name-select' className='font-medium text-sm'>
                        Leave Name <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='leaveName'
                        control={control}
                        rules={{ required: 'Leave Name is required' }}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange} disabled={leaveNames.length === 0}>
                                <SelectTrigger id='leave-name-select' className={errors.leaveName ? 'border-red-500' : ''}>
                                    <SelectValue placeholder={leaveNames.length > 0 ? 'Select' : 'Loading...'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {leaveNames.map((item) => (
                                        <SelectItem key={item.id} value={String(item.id)}>
                                            {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.leaveName && <FormError>{errors.leaveName.message}</FormError>}
                </div>
            </div>

            {/* Employee Grid - Visible only after filters are selected */}
            {selectedTypes.length > 0 && selectedDepartments.length > 0 && selectedDesignations.length > 0 ? (
                <div className='fade-in slide-in-from-top-4 mx-auto max-w-4xl animate-in space-y-4 duration-500'>
                    <div className='flex items-center justify-between px-1'>
                        <h3 className='font-bold text-primary text-sm uppercase tracking-wider'>Employee List</h3>
                        <div className='relative w-full max-w-xs'>
                            <input
                                type='text'
                                placeholder='🔍 Search by name...'
                                className='w-full rounded-full border bg-gray-50 px-4 py-1.5 text-xs transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20'
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    <div className='overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md'>
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='bg-gradient-to-r from-purple-600 to-indigo-700 text-white'>
                                    <th className='w-12 p-3 text-left'>
                                        <div className='flex items-center justify-center'>
                                            <input
                                                type='checkbox'
                                                className='h-4 w-4 cursor-pointer rounded border-white/30 bg-transparent text-white checked:bg-white checked:text-blue-600 focus:ring-0 focus:ring-offset-0'
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                                checked={filteredGridData.length > 0 && selectedRows.size === filteredGridData.length}
                                            />
                                        </div>
                                    </th>
                                    <th className='p-3 text-left font-semibold text-[11px] uppercase tracking-tight'>Employee Name</th>
                                    <th className='w-32 p-3 text-right font-semibold text-[11px] uppercase tracking-tight'>New Credit</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100 bg-white'>
                                {isLoadingGrid ? (
                                    <tr>
                                        <td colSpan={3} className='p-8 text-center'>
                                            <div className='flex flex-col items-center gap-2'>
                                                <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                                                <span className='font-medium text-muted-foreground text-xs'>Loading participants...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className='p-8 text-center text-muted-foreground text-xs italic'>
                                            No employees found for the current selection
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((item, idx) => (
                                        <tr
                                            key={item.hrmE_Id}
                                            className={`transition-colors hover:bg-purple-50/30 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                            <td className='p-3 text-center'>
                                                <input
                                                    type='checkbox'
                                                    className='h-4 w-4 cursor-pointer rounded border-gray-300 text-primary transition-all focus:ring-primary/20'
                                                    checked={selectedRows.has(item.hrmE_Id)}
                                                    onChange={() => handleToggleRow(item.hrmE_Id)}
                                                />
                                            </td>
                                            <td className='p-3 font-medium text-gray-700'>{item.hrmE_EmployeeName}</td>

                                            <td className='p-3 text-right'>
                                                <div className='flex justify-end'>
                                                    <input
                                                        type='number'
                                                        className='w-20 rounded-lg border border-gray-200 bg-gray-50/50 px-2 py-1.5 text-right font-bold shadow-inner transition-all focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5'
                                                        value={newCredits[item.hrmE_Id] ?? ''}
                                                        onChange={(e) => handleCreditChange(item.hrmE_Id, e.target.value)}
                                                        placeholder='0'
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className='flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-2'>
                            <div className='px-2 font-semibold text-[11px] text-gray-500 uppercase tracking-wide'>
                                Page <span className='text-gray-900'>{currentPage}</span> of{' '}
                                <span className='text-gray-900'>{totalPages}</span>
                                <span className='mx-2 text-gray-300'>|</span>
                                Showing <span className='text-gray-900'>{filteredGridData.length}</span> Total
                            </div>
                            <div className='flex gap-1.5'>
                                <Button
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    className='h-8 rounded-lg border bg-white font-bold text-xs transition-all hover:bg-gray-100'
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}>
                                    PREV
                                </Button>
                                <Button
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    className='h-8 rounded-lg border bg-white font-bold text-xs transition-all hover:bg-gray-100'
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}>
                                    NEXT
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className='flex flex-col items-center justify-center rounded-2xl border-2 border-gray-100 border-dashed bg-gray-50/50 p-12 text-center'>
                    <div className='mb-3 rounded-full bg-purple-50 p-3 text-purple-500'>
                        <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
                            />
                        </svg>
                    </div>
                    <p className='font-semibold text-gray-400 text-sm'>Please select Type, Department, and Designation to load employees</p>
                </div>
            )}

            {/* Action Buttons */}
            <div className='flex justify-center gap-2 pt-4'>
                <Button type='submit' variant='default' className='min-w-[120px]'>
                    <Save className='mr-2 h-4 w-4' />
                    SAVE
                </Button>
                <Button type='button' variant='outline' onClick={onCancel} className='min-w-[120px]'>
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>
            </div>
        </form>
    );
}
