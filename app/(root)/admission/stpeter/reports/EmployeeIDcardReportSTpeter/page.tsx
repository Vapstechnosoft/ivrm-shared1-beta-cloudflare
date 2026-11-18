'use client';

import { Check, Loader2, Printer, Search, Users, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
    useFilterStpeterEmployees,
    useGetStpeterDepts,
    useGetStpeterDesig,
    useGetStpeterEmployeeDetails,
    useStpeterEmployeeIdCardLoadData
} from '@/hooks/admission/preadmission/reports/useStpeterEmployeeIdCard';

export default function EmployeeIDcardReportSTpeterPage() {
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Masters -------------------- */
    const { data: loadData, isLoading: isLoadDataLoading } = useStpeterEmployeeIdCardLoadData();

    /* -------------------- UI State -------------------- */
    const [groupTypes, setGroupTypes] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);

    const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
    const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>([]);
    const [selectedDesigIds, setSelectedDesigIds] = useState<number[]>([]);

    const [employeeList, setEmployeeList] = useState<any[]>([]);
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
    const [employeeSearch, setEmployeeSearch] = useState('');

    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState<any[]>([]);
    const [summaryData, setSummaryData] = useState<any[]>([]);

    const deptMutation = useGetStpeterDepts();
    const desigMutation = useGetStpeterDesig();
    const filterMutation = useFilterStpeterEmployees();
    const detailsMutation = useGetStpeterEmployeeDetails();

    const formatIdList = (ids: number[]) => (ids.length === 0 ? [0] : ids);
    const getData = (res: any) => res?.data?.data || res?.data || res;

    /* -------------------- Initial Data -------------------- */
    useEffect(() => {
        const data = getData(loadData);
        if (data) {
            const groups = data.groupTypelist || [];
            const depts = data.departmentlist || [];
            const desigs = data.designationlist || [];
            const employees = data.employeedropdown || [];

            setGroupTypes(groups);
            setDepartments(depts);
            setDesignations(desigs);
            // setEmployeeList(employees);

            // Default: Select all
            setSelectedGroupIds(groups.map((g: any) => g.hrmgT_Id));
            setSelectedDeptIds(depts.map((d: any) => d.hrmD_Id));
            setSelectedDesigIds(desigs.map((ds: any) => ds.hrmdeS_Id));
        }
    }, [loadData]);

    const updateDepartments = async (groupIds: number[]) => {
        try {
            const res = await deptMutation.mutateAsync({ hrmgT_IdList: formatIdList(groupIds) });
            const data = getData(res);
            const depts = Array.isArray(data?.departmentlist) ? data.departmentlist : [];
            setDepartments(depts);
            const allDeptIds = depts.map((d: any) => d.hrmD_Id);
            setSelectedDeptIds(allDeptIds);
            return allDeptIds;
        } catch (error) {
            toast.error('Failed to update departments');
            return [];
        }
    };

    const updateDesignations = async (groupIds: number[], deptIds: number[]) => {
        try {
            const res = await desigMutation.mutateAsync({
                hrmgT_IdList: formatIdList(groupIds),
                hrmD_IdList: formatIdList(deptIds)
            });
            const data = getData(res);
            const desigs = Array.isArray(data?.designationlist) ? data.designationlist : [];
            setDesignations(desigs);
            const allDesigIds = desigs.map((d: any) => d.hrmdeS_Id);
            setSelectedDesigIds(allDesigIds);
            return allDesigIds;
        } catch (error) {
            toast.error('Failed to update designations');
            return [];
        }
    };

    /* -------------------- Handlers -------------------- */
    const handleGroupToggle = async (id: number) => {
        const newGroupIds = selectedGroupIds.includes(id) ? selectedGroupIds.filter((i) => i !== id) : [...selectedGroupIds, id];
        setSelectedGroupIds(newGroupIds);

        const newDeptIds = await updateDepartments(newGroupIds);
        await updateDesignations(newGroupIds, newDeptIds);
    };

    const handleDeptToggle = async (id: number) => {
        const newDeptIds = selectedDeptIds.includes(id) ? selectedDeptIds.filter((i) => i !== id) : [...selectedDeptIds, id];
        setSelectedDeptIds(newDeptIds);
        await updateDesignations(selectedGroupIds, newDeptIds);
    };

    const handleSearchEmployees = async () => {
        try {
            const res = await filterMutation.mutateAsync({
                hrmgT_IdList: formatIdList(selectedGroupIds),
                hrmD_IdList: formatIdList(selectedDeptIds),
                hrmdeS_IdList: formatIdList(selectedDesigIds)
            });
            const data = getData(res);
            const employees = Array.isArray(data?.employeedropdown) ? data.employeedropdown : [];
            setEmployeeList(employees);
            if (employees.length === 0) toast.error('No employees found for this selection');
            else toast.success(`Found ${employees.length} employees`);
        } catch (error) {
            toast.error('Error filtering employees');
        }
    };

    const handleClear = () => {
        const data = getData(loadData);
        if (data) {
            const groups = data.groupTypelist || [];
            const depts = data.departmentlist || [];
            const desigs = data.designationlist || [];
            const employees = data.employeedropdown || [];

            setGroupTypes(groups);
            setDepartments(depts);
            setDesignations(desigs);
            setEmployeeList([]);

            setSelectedGroupIds(groups.map((g: any) => g.hrmgT_Id));
            setSelectedDeptIds(depts.map((d: any) => d.hrmD_Id));
            setSelectedDesigIds(desigs.map((ds: any) => ds.hrmdeS_Id));
        } else {
            setEmployeeList([]);
        }
        setSelectedEmployeeIds([]);
        setEmployeeSearch('');
        setShowReport(false);
        setReportData([]);
        setSummaryData([]);
    };

    const handleShowDetails = async () => {
        if (selectedEmployeeIds.length === 0) {
            toast.error('Please select at least one employee');
            return;
        }

        try {
            const res = await detailsMutation.mutateAsync({ hrmE_multiId: selectedEmployeeIds });
            const data = getData(res);

            const arrayEmps = data?.arrayempsList || [];
            const fills = data?.filltypes || [];

            if (arrayEmps.length > 0 || fills.length > 0) {
                // Merge logic: VAPS backend often returns matching indices for these two arrays
                const merged = (arrayEmps.length >= fills.length ? arrayEmps : fills).map((item: any, idx: number) => {
                    const empDetail = arrayEmps[idx] || {};
                    const fillDetail = fills[idx] || {};
                    return {
                        ...empDetail,
                        ...fillDetail,
                        hrmE_Id: item.hrmE_Id || fillDetail.hrmE_Id || empDetail.hrmE_Id || 0,
                        // Priority merging for common fields
                        hrmE_EmployeeFirstName: empDetail.hrmE_EmployeeFirstName || fillDetail.hrmE_EmployeeFirstName,
                        hrmE_EmployeeCode: empDetail.hrmE_EmployeeCode || fillDetail.hrme_employeecode || fillDetail.hrmE_EmployeeCode,
                        hrmE_DOJ: empDetail.hrmE_DOJ || fillDetail.hrme_doj || fillDetail.hrmE_DOJ,
                        hrmE_DOB: empDetail.hrmE_DOB || fillDetail.hrme_dob || fillDetail.hrmE_DOB,
                        employeefullname: fillDetail.employeefullname || empDetail.employeefullname,
                        // Use top level designation if item one is missing
                        designationName: empDetail.designationName || fillDetail.hrmdeS_DesignationName || data?.designationName || 'Staff'
                    };
                });

                setReportData(merged);
                setSummaryData(fills);
                setShowReport(true);
                toast.success('Employee details fetched successfully');
            } else {
                toast.error('Could not fetch employee details');
            }
        } catch (error) {
            toast.error('Failed to generate report');
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'St_Peters_Employee_ID_Cards',
        onBeforePrint: () => {
            return new Promise((resolve) => {
                setTimeout(() => resolve(void 0), 500);
            });
        }
    });

    /* -------------------- Helpers -------------------- */
    const getQualification = (emp: any) => {
        return emp.hrmE_QualificationName || emp.employequalification?.[0]?.hrmC_QulaificationName || 'N/A';
    };

    const getSubjects = (emp: any) => {
        const subjects = emp.employeeclasssubject?.map((s: any) => s.ismS_SubjectName).filter(Boolean) || [];
        return [...new Set(subjects)].join(', ') || 'N/A';
    };

    const getEmployeeName = (one: any) => {
        const emp = one.currentemployeeDetails;
        if (emp) {
            return `${emp.hrmE_EmployeeFirstName} ${emp.hrmE_EmployeeMiddleName || ''} ${emp.hrmE_EmployeeLastName}`.trim();
        }
        // Fallback to top level if available (defensive)
        if (one.hrmE_EmployeeFirstName || one.hrmE_EmployeeMiddleName || one.hrmE_EmployeeLastName) {
            return `${one.hrmE_EmployeeFirstName || ''} ${one.hrmE_EmployeeMiddleName || ''} ${one.hrmE_EmployeeLastName || ''}`.trim();
        }
        // Support for merged filltypes attribute
        if (one.employeefullname) {
            return one.employeefullname;
        }
        return 'Unknown Employee';
    };

    const filteredEmployees = useMemo(() => {
        return employeeList.filter((e) => {
            const fullName =
                `${e.hrmE_EmployeeFirstName || ''} ${e.hrmE_EmployeeMiddleName || ''} ${e.hrmE_EmployeeLastName || ''}`.toLowerCase();
            const code = (e.hrmE_EmployeeCode || e.currentemployeeDetails?.hrmE_EmployeeCode || '').toLowerCase();
            const search = employeeSearch.toLowerCase();
            return fullName.includes(search) || code.includes(search);
        });
    }, [employeeList, employeeSearch]);

    return (
        <div className='min-h-screen p-4'>
            <CollapsibleSection
                title='Employee Profile Report'
                description="Generate printable ID cards for St. Peter's School employees"
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>
                <div className='space-y-6 p-6'>
                    {/* Multi-Select Filters Grid */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                        {/* Group Type */}
                        <div className='flex h-[300px] flex-col overflow-hidden rounded-sm border border-blue-200'>
                            <div className='flex items-center justify-between border-blue-100 border-b bg-white px-3 py-1.5'>
                                <Label className='font-bold text-[11px] text-slate-700'>
                                    Group Type:<span className='text-red-500'>*</span>
                                </Label>
                                <div className='flex items-center gap-1.5'>
                                    <Checkbox
                                        id='grp-all'
                                        checked={selectedGroupIds.length === groupTypes.length && groupTypes.length > 0}
                                        onCheckedChange={async (checked) => {
                                            const ids = checked ? groupTypes.map((g) => g.hrmgT_Id) : [];
                                            setSelectedGroupIds(ids);
                                            const newDepts = await updateDepartments(ids);
                                            await updateDesignations(ids, newDepts);
                                        }}
                                        className='h-3.5 w-3.5 rounded-none border-slate-400'
                                    />
                                    <Label htmlFor='grp-all' className='font-bold text-[10px] text-slate-500'>
                                        All
                                    </Label>
                                </div>
                            </div>
                            <ScrollArea className='flex-grow bg-white'>
                                <div className='p-1'>
                                    {groupTypes.map((g: any) => (
                                        <div
                                            key={g.hrmgT_Id}
                                            className='group flex cursor-pointer items-center space-x-2 px-3 py-1 transition-colors hover:bg-blue-50/50'
                                            onClick={() => handleGroupToggle(g.hrmgT_Id)}>
                                            <Checkbox
                                                checked={selectedGroupIds.includes(g.hrmgT_Id)}
                                                className='h-3 w-3 rounded-none border-slate-300 data-[state=checked]:border-[#3f51b5] data-[state=checked]:bg-[#3f51b5]'
                                            />
                                            <span className='font-medium text-[10px] text-slate-600 group-hover:text-blue-700'>
                                                {g.hrmgT_EmployeeGroupType}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Department */}
                        <div className='flex h-[300px] flex-col overflow-hidden rounded-sm border border-blue-200'>
                            <div className='flex items-center justify-between border-blue-100 border-b bg-white px-3 py-1.5'>
                                <Label className='font-bold text-[11px] text-slate-700'>
                                    Department:<span className='text-red-500'>*</span>
                                </Label>
                                <div className='flex items-center gap-1.5'>
                                    <Checkbox
                                        id='dept-all'
                                        checked={selectedDeptIds.length === departments.length && departments.length > 0}
                                        onCheckedChange={async (checked) => {
                                            const ids = checked ? departments.map((d) => d.hrmD_Id) : [];
                                            setSelectedDeptIds(ids);
                                            await updateDesignations(selectedGroupIds, ids);
                                        }}
                                        className='h-3.5 w-3.5 rounded-none border-slate-400'
                                    />
                                    <Label htmlFor='dept-all' className='font-bold text-[10px] text-slate-500'>
                                        All
                                    </Label>
                                </div>
                            </div>
                            <ScrollArea className='flex-grow bg-white'>
                                <div className='p-1'>
                                    {departments.map((d: any) => (
                                        <div
                                            key={d.hrmD_Id}
                                            className='group flex cursor-pointer items-center space-x-2 px-3 py-1 transition-colors hover:bg-blue-50/50'
                                            onClick={() => handleDeptToggle(d.hrmD_Id)}>
                                            <Checkbox
                                                checked={selectedDeptIds.includes(d.hrmD_Id)}
                                                className='h-3 w-3 rounded-none border-slate-300 data-[state=checked]:border-[#3f51b5] data-[state=checked]:bg-[#3f51b5]'
                                            />
                                            <span className='font-medium text-[10px] text-slate-600 group-hover:text-blue-700'>
                                                {d.hrmD_DepartmentName}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Designation */}
                        <div className='flex h-[300px] flex-col overflow-hidden rounded-sm border border-blue-200'>
                            <div className='flex items-center justify-between border-blue-100 border-b bg-white px-3 py-1.5'>
                                <Label className='font-bold text-[11px] text-slate-700'>
                                    Designation:<span className='text-red-500'>*</span>
                                </Label>
                                <div className='flex items-center gap-1.5'>
                                    <Checkbox
                                        id='desig-all'
                                        checked={selectedDesigIds.length === designations.length && designations.length > 0}
                                        onCheckedChange={(checked) => {
                                            const ids = checked ? designations.map((d) => d.hrmdeS_Id) : [];
                                            setSelectedDesigIds(ids);
                                        }}
                                        className='h-3.5 w-3.5 rounded-none border-slate-400'
                                    />
                                    <Label htmlFor='desig-all' className='font-bold text-[10px] text-slate-500'>
                                        All
                                    </Label>
                                </div>
                            </div>
                            <ScrollArea className='flex-grow bg-white'>
                                <div className='p-1'>
                                    {designations.map((d: any) => (
                                        <div
                                            key={d.hrmdeS_Id}
                                            className='group flex cursor-pointer items-center space-x-2 px-3 py-1 transition-colors hover:bg-blue-50/50'
                                            onClick={() =>
                                                setSelectedDesigIds((prev) =>
                                                    prev.includes(d.hrmdeS_Id)
                                                        ? prev.filter((i) => i !== d.hrmdeS_Id)
                                                        : [...prev, d.hrmdeS_Id]
                                                )
                                            }>
                                            <Checkbox
                                                checked={selectedDesigIds.includes(d.hrmdeS_Id)}
                                                className='h-3 w-3 rounded-none border-slate-300 data-[state=checked]:border-[#3f51b5] data-[state=checked]:bg-[#3f51b5]'
                                            />
                                            <span className='font-medium text-[10px] text-slate-600 group-hover:text-blue-700'>
                                                {d.hrmdeS_DesignationName}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>

                    <div className='flex justify-center gap-3 border-t pt-6'>
                        <Button
                            size='sm'
                            onClick={handleSearchEmployees}
                            disabled={filterMutation.isPending}
                            className='h-9 min-w-[120px] rounded-sm bg-[#3f51b5] font-bold text-[11px] uppercase shadow-sm hover:bg-[#303f9f]'>
                            {filterMutation.isPending ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            ) : (
                                <Search className='mr-2 h-4 w-4' />
                            )}
                            SEARCH
                        </Button>
                        <Button
                            size='sm'
                            variant='destructive'
                            onClick={handleClear}
                            className='h-9 min-w-[120px] rounded-sm bg-[#ff5722] font-bold text-[11px] uppercase shadow-sm hover:bg-[#e64a19]'>
                            <X className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                    </div>

                    {/* Employee List Section */}
                    {employeeList.length > 0 && (
                        <div className='mx-auto max-w-4xl space-y-4 border-t pt-8'>
                            <div className='flex items-center justify-between px-2'>
                                <Label className='font-bold text-slate-700 text-xs uppercase'>1. Select Employees</Label>
                                <div
                                    className='flex cursor-pointer items-center space-x-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 transition-colors hover:bg-slate-100'
                                    onClick={() =>
                                        setSelectedEmployeeIds(
                                            selectedEmployeeIds.length === employeeList.length ? [] : employeeList.map((e) => e.hrmE_Id)
                                        )
                                    }>
                                    <Checkbox
                                        id='sel-all-emp'
                                        checked={selectedEmployeeIds.length === employeeList.length && employeeList.length > 0}
                                        onCheckedChange={(checked) =>
                                            setSelectedEmployeeIds(checked ? employeeList.map((e) => e.hrmE_Id) : [])
                                        }
                                        className='h-3.5 w-3.5 rounded-none border-slate-400'
                                    />
                                    <Label htmlFor='sel-all-emp' className='cursor-pointer font-bold text-[10px] text-slate-600 uppercase'>
                                        SELECT ALL ({selectedEmployeeIds.length}/{employeeList.length})
                                    </Label>
                                </div>
                            </div>
                            <div className='relative max-w-md'>
                                <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-slate-400' />
                                <Input
                                    className='h-10 rounded-sm border-slate-200 pl-10 text-[12px] placeholder:text-slate-400 focus:border-[#3f51b5] focus:ring-0'
                                    placeholder='Search employee by name or code...'
                                    value={employeeSearch}
                                    onChange={(e) => setEmployeeSearch(e.target.value)}
                                />
                                {employeeSearch && (
                                    <X
                                        className='-translate-y-1/2 absolute top-1/2 right-3 h-3.5 w-3.5 cursor-pointer text-slate-400 hover:text-slate-600'
                                        onClick={() => setEmployeeSearch('')}
                                    />
                                )}
                            </div>
                            <ScrollArea className='h-[320px] rounded-sm border border-blue-100 bg-slate-50/20 p-1'>
                                {filteredEmployees.length > 0 ? (
                                    <div className='grid grid-cols-1 gap-1.5 md:grid-cols-2'>
                                        {filteredEmployees.map((e: any) => {
                                            const isSelected = selectedEmployeeIds.includes(e.hrmE_Id);
                                            return (
                                                <div
                                                    key={e.hrmE_Id}
                                                    onClick={() =>
                                                        setSelectedEmployeeIds((prev) =>
                                                            prev.includes(e.hrmE_Id)
                                                                ? prev.filter((i) => i !== e.hrmE_Id)
                                                                : [...prev, e.hrmE_Id]
                                                        )
                                                    }
                                                    className={cn(
                                                        'group relative flex cursor-pointer items-center space-x-3 overflow-hidden rounded-sm border p-3 transition-all',
                                                        isSelected
                                                            ? 'border-blue-200 bg-blue-50 ring-1 ring-blue-100'
                                                            : 'border-slate-200 bg-white hover:border-blue-200'
                                                    )}>
                                                    <div
                                                        className={cn(
                                                            'flex h-5 w-5 items-center justify-center rounded-full border transition-colors',
                                                            isSelected
                                                                ? 'border-blue-600 bg-blue-600'
                                                                : 'border-slate-300 bg-white group-hover:border-blue-400'
                                                        )}>
                                                        {isSelected && <Check className='h-3 w-3 text-white' />}
                                                    </div>
                                                    <div className='flex min-w-0 flex-col pr-4'>
                                                        <span className='truncate font-bold text-[10px] text-slate-800 uppercase'>
                                                            {getEmployeeName(e)}
                                                        </span>
                                                        <div className='mt-0.5 flex items-center gap-2'>
                                                            <span className='rounded-[2px] bg-slate-100 px-1.5 py-0.5 font-medium text-[9px] text-slate-500'>
                                                                Code:{' '}
                                                                {e.hrmE_EmployeeCode ||
                                                                    e.currentemployeeDetails?.hrmE_EmployeeCode ||
                                                                    'N/A'}
                                                            </span>
                                                            <span className='max-w-[120px] truncate font-bold text-[9px] text-blue-500 uppercase'>
                                                                {e.designationName || 'Staff'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className='flex h-full items-center justify-center font-medium text-slate-500 text-sm'>
                                        No records found
                                    </div>
                                )}
                            </ScrollArea>

                            {/* Final Action Buttons */}
                            <div className='flex justify-center gap-4 pt-4'>
                                <Button
                                    size='sm'
                                    onClick={handleShowDetails}
                                    disabled={detailsMutation.isPending}
                                    className='h-9 min-w-[140px] rounded-sm bg-slate-700 font-bold text-[11px] shadow-sm hover:bg-slate-800'>
                                    {detailsMutation.isPending ? <Loader2 className='animate-spin' /> : 'SHOW CARDS'}
                                </Button>
                                <Button
                                    size='sm'
                                    onClick={handlePrint}
                                    disabled={!showReport}
                                    className='h-9 min-w-[140px] rounded-sm bg-[#3f51b5] font-bold text-[11px] shadow-sm hover:bg-[#303f9f]'>
                                    <Printer className='mr-2 h-4 w-4' />
                                    PRINT
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CollapsibleSection>

            {/* Print Preview */}
            {showReport && (
                <div className='mt-8 space-y-8 pb-20'>
                    {/* Summary Table (On-Screen & Print) */}
                    {summaryData.length > 0 && (
                        <div className='printable-summary mx-auto max-w-5xl overflow-hidden rounded-xl border bg-white shadow-sm'>
                            <div className='flex items-center justify-between border-b bg-slate-50 px-6 py-4'>
                                <h3 className='flex items-center font-bold text-slate-800 text-sm uppercase tracking-wider'>
                                    <Users className='mr-2 h-4 w-4 text-[#3f51b5]' />
                                    Employee Summary List
                                </h3>
                                <span className='rounded-full bg-blue-100 px-2 py-1 font-bold text-[10px] text-blue-700'>
                                    {summaryData.length} EMPLOYEES
                                </span>
                            </div>
                            <div className='overflow-x-auto'>
                                <table className='w-full border-collapse text-left'>
                                    <thead>
                                        <tr className='bg-slate-50/50'>
                                            <th className='border-b px-6 py-3 font-bold text-[9px] text-slate-500 uppercase tracking-wider'>
                                                Sl.No
                                            </th>
                                            <th className='border-b px-6 py-3 font-bold text-[9px] text-slate-500 uppercase tracking-wider'>
                                                Employee Details
                                            </th>
                                            <th className='border-b px-6 py-3 font-bold text-[9px] text-slate-500 uppercase tracking-wider'>
                                                Qualification
                                            </th>
                                            <th className='border-b px-6 py-3 font-bold text-[9px] text-slate-500 uppercase tracking-wider'>
                                                Subjects Taught
                                            </th>
                                            <th className='border-b px-6 py-3 font-bold text-[9px] text-slate-500 uppercase tracking-wider'>
                                                Code/PAN
                                            </th>
                                            <th className='border-b px-6 py-3 font-bold text-[9px] text-slate-500 uppercase tracking-wider'>
                                                DOJ/DOB
                                            </th>
                                            <th className='border-b px-6 py-3 font-bold text-[9px] text-slate-500 uppercase tracking-wider'>
                                                Docs
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-slate-100'>
                                        {reportData.map((emp, idx) => {
                                            const docs = emp.employeedocument || [];
                                            return (
                                                <tr key={idx} className='transition-colors hover:bg-slate-50/50'>
                                                    <td className='px-6 py-3 font-medium text-[10px] text-slate-600'>{idx + 1}</td>
                                                    <td className='px-6 py-3'>
                                                        <div className='flex flex-col'>
                                                            <span className='font-bold text-[10px] text-slate-900 uppercase'>
                                                                {getEmployeeName(emp)}
                                                            </span>
                                                            <span className='text-[9px] text-slate-500 uppercase'>
                                                                {emp.designationName || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className='px-6 py-3 font-semibold text-[10px] text-slate-600'>
                                                        {getQualification(emp)}
                                                    </td>
                                                    <td
                                                        className='max-w-[200px] truncate px-6 py-3 text-[9px] text-slate-500 italic'
                                                        title={getSubjects(emp)}>
                                                        {getSubjects(emp)}
                                                    </td>
                                                    <td className='px-6 py-3'>
                                                        <div className='flex flex-col text-[9px]'>
                                                            <span className='font-bold text-slate-600'>
                                                                Code: {emp.hrme_employeecode || emp.hrmE_EmployeeCode || 'N/A'}
                                                            </span>
                                                            <span className='text-slate-400'>
                                                                PAN: {emp.hrme_pancardno || emp.hrmE_PANCardNo || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className='px-6 py-3'>
                                                        <div className='flex flex-col text-[9px]'>
                                                            <span className='text-slate-600'>
                                                                DOJ:{' '}
                                                                {emp.hrme_doj || emp.hrmE_DOJ
                                                                    ? new Date(emp.hrme_doj || emp.hrmE_DOJ).toLocaleDateString('en-GB')
                                                                    : 'N/A'}
                                                            </span>
                                                            <span className='text-slate-400'>
                                                                DOB:{' '}
                                                                {emp.hrme_dob || emp.hrmE_DOB
                                                                    ? new Date(emp.hrme_dob || emp.hrmE_DOB).toLocaleDateString('en-GB')
                                                                    : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className='px-6 py-3'>
                                                        <div className='flex flex-wrap gap-1'>
                                                            {docs.map((doc: any, dIdx: number) => (
                                                                <a
                                                                    key={dIdx}
                                                                    href={doc.hrmedS_DocumentImageName}
                                                                    target='_blank'
                                                                    rel='noopener noreferrer'
                                                                    className='rounded-[2px] border border-blue-100 bg-blue-50 px-1.5 py-0.5 font-bold text-[8px] text-blue-600 transition-colors hover:bg-blue-100'
                                                                    title={doc.hrmedS_DocumentName}>
                                                                    DOC
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ID Cards Section */}
                    {reportData.length > 0 && (
                        <div className='flex flex-col items-center overflow-auto rounded-[32px] border border-slate-200 bg-slate-100 p-6 md:p-10'>
                            <Label className='mb-6 font-bold text-[11px] text-slate-500 uppercase tracking-[0.2em]'>ID Cards Preview</Label>
                            <div ref={printRef} className='printable-content flex flex-wrap justify-center gap-10 bg-transparent'>
                                {reportData.map((single: any, index: number) => {
                                    const emp = single.currentemployeeDetails;
                                    const desig =
                                        single.designationName ||
                                        emp?.hrmdeS_DesignationName ||
                                        single.hrmdeS_DesignationName ||
                                        'Employee';
                                    const address =
                                        single.hrmE_LocStreet ||
                                        emp?.hrmE_LocStreet ||
                                        single.hrmE_PerStreet ||
                                        emp?.hrmE_PerStreet ||
                                        'MIRABAI ROAD, DURGAPUR-713204';
                                    const mobile = single.hrmE_MobileNo || emp?.hrmE_MobileNo || 'XXXXXXXXXX';
                                    const blood = single.hrmE_BloodGroup || emp?.hrmE_BloodGroup || 'N/A';

                                    return (
                                        <div key={index} className='id-card-wrapper'>
                                            <div className='id-card'>
                                                <div className='top-blue'>
                                                    <div className='school-logo-container'>
                                                        <img
                                                            src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/034c34ba-ca51-442c-9eb7-74ec831b17b1.png'
                                                            alt='School Logo'
                                                            crossOrigin='anonymous'
                                                        />
                                                        <div className='school-name-style'>St. Peter&apos;s School</div>
                                                    </div>
                                                    <div className='subtitle-style'>
                                                        UNDER THE DIOCESE OF DURGAPUR, (CHURCH OF NORTH INDIA)
                                                        <br />
                                                        Affiliated to the Council for the Indian School Certificate Examination, New Delhi
                                                        <br />
                                                        School Code : WB065
                                                    </div>
                                                </div>

                                                <div className='photo-container'>
                                                    <img
                                                        src={
                                                            emp?.hrmE_Photo ||
                                                            'https://vapsclg.blob.core.windows.net/files/100/StudentPhotos/102ec61d-7212-421f-829d-4395679ac021.png'
                                                        }
                                                        alt='Employee Photo'
                                                        crossOrigin='anonymous'
                                                        onError={(e: any) => {
                                                            e.target.src =
                                                                'https://vapsclg.blob.core.windows.net/files/100/StudentPhotos/102ec61d-7212-421f-829d-4395679ac021.png';
                                                        }}
                                                    />
                                                </div>

                                                <div className='info-area'>
                                                    <div className='info-row'>
                                                        <span className='info-label'>Name :</span>
                                                        <span className='info-value name-highlight'>{getEmployeeName(single)}</span>
                                                    </div>
                                                    <div className='info-row'>
                                                        <span className='info-label'>Designation :</span>
                                                        <span className='info-value'>{desig}</span>
                                                    </div>
                                                    <div className='info-row'>
                                                        <span className='info-label'>Address :</span>
                                                        <span className='info-value line-clamp-2 font-medium text-[11px] leading-tight'>
                                                            {address}
                                                        </span>
                                                    </div>
                                                    <div className='info-row'>
                                                        <span className='info-label'>Blood Group :</span>
                                                        <span className='info-value'>{blood}</span>
                                                    </div>
                                                    <div className='info-row'>
                                                        <span className='info-label'>Emg. Con. No. :</span>
                                                        <span className='info-value'>{mobile}</span>
                                                    </div>
                                                </div>

                                                <div className='id-card-footer'>
                                                    MIRABAI ROAD, DURGAPUR-713204
                                                    <br />
                                                    PHONE : 0343-2564132 / 2663994
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&display=swap');

                .id-card-wrapper {
                   page-break-inside: avoid;
                }

                .id-card {
                    position: relative;
                    width: 350px;
                    height: 535px;
                    background: linear-gradient(211deg, transparent 48%, black 43%, black 78%, transparent 60%), 
                                linear-gradient(149deg, transparent 48%, black 33%, black 60%, transparent 60%), 
                                linear-gradient(142deg, #2DBDE6 55%, transparent 46%), 
                                linear-gradient(165deg, black, black 114%);
                    box-shadow: 3px 3px 15px rgba(0,0,0,0.5);
                    border-radius: 12px;
                    color: white;
                    overflow: hidden;
                    font-family: Arial, sans-serif;
                }

                .id-card::before {
                    content: "";
                    position: absolute;
                    top: 38%;
                    left: -15px;
                    width: 160px;
                    border-top: 2px dashed rgba(255,255,255,0.4);
                    transform: rotate(31deg);
                    pointer-events: none;
                }

                .id-card::after {
                    content: "";
                    position: absolute;
                    top: 36%;
                    left: 255px;
                    width: 110px;
                    border-top: 2px dashed rgba(255,255,255,0.4);
                    transform: rotate(-31deg);
                    pointer-events: none;
                }

                .top-blue {
                    background-color: #2dbde4;
                    height: 140px;
                    padding: 10px;
                    text-align: center;
                }

                .school-logo-container img {
                    width: 45px;
                    height: auto;
                    margin: 0 auto;
                }

                .school-name-style {
                    font-family: 'UnifrakturCook', cursive;
                    font-size: 32px;
                    line-height: 1;
                    margin-top: 5px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }

                .subtitle-style {
                    font-size: 8.5px;
                    font-weight: 800;
                    line-height: 1.2;
                    margin-top: 8px;
                    color: rgba(255,255,255,0.95);
                    text-align: center;
                    text-transform: uppercase;
                }

                .photo-container {
                    margin: 15px auto;
                    width: 160px;
                    height: 180px;
                    clip-path: polygon( 50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25% );
                    background: white;
                    border: 3px solid #003366;
                    position: relative;
                    z-index: 10;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                }

                .photo-container img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .info-area {
                    margin: 20px 25px;
                    font-size: 14px;
                    line-height: 1.4;
                }

                .info-row {
                    display: flex;
                    margin-bottom: 8px;
                    justify-content: flex-start;
                }

                .info-label {
                    width: 105px;
                    font-weight: 800;
                    color: #2dbde4;
                    font-size: 13px;
                }

                .info-value {
                    flex: 1;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }

                .name-highlight {
                    color: #f1a311;
                    font-size: 18px;
                    font-weight: 900;
                    text-transform: uppercase;
                    line-height: 1.1;
                    display: inline-block;
                }

                .id-card-footer {
                    position: absolute;
                    bottom: 0;
                    width: 100%;
                    background-color: #2dbde4;
                    padding: 8px;
                    font-size: 10px;
                    font-weight: 900;
                    text-align: center;
                    letter-spacing: 1px;
                }

                @media print {
                    .printable-summary {
                        break-after: page;
                        margin-bottom: 20px !important;
                    }
                    .printable-content {
                        width: 100% !important;
                        padding: 0 !important;
                        gap: 20px !important;
                        box-shadow: none !important;
                    }
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                    .id-card {
                        box-shadow: none !important;
                        border: 1px solid #000;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
}
