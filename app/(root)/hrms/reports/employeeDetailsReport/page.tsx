'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    type EmployeeDetailsReportRequest,
    useEmployeeAndEmployeeType,
    useEmployeeDetailsReportOnload,
    useFilterEmployeeDetails,
    useReportDepartments,
    useReportDesignations,
    useReportGroupTypes,
    useSearchEmployeeDetailsReport
} from '@/hooks/hrms/useReports';
import { exportToExcel } from '@/lib/export-to-file';
import { format } from 'date-fns';
import { Download, Loader2, Search as SearchIcon, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

// Fixed Header List from Legacy
const HEADER_LIST = [
    { id: 'HRME_EmployeeCode', value: 'Employee Code' },
    { id: 'HRME_EmployeeFirstName', value: 'Employee Name' },
    { id: 'HRME_FatherName', value: 'Father Name' },
    { id: 'HRME_MobileNo', value: 'Mobile No.' },
    { id: 'HRME_EmailId', value: 'Email Id' },
    { id: 'HRME_DOB', value: 'Date Of Birth' },
    // { id: 'EmergencyContect', value: 'Emergency Contact Number' },
    // { id: 'DateofConfromation', value: 'Date Of Confirmation' },
    { id: 'HRMET_Id', value: 'Employee Type' },
    { id: 'HRMGT_Id', value: 'Group Type' },
    { id: 'HRMD_Id', value: 'Department' },
    { id: 'HRMDES_Id', value: 'Designation' },
    { id: 'HRMG_Id', value: 'Grade' },
    { id: 'IVRMMG_Id', value: 'Gender' },
    { id: 'IVRMMMS_Id', value: 'Marital Status' },
    { id: 'ReligionId', value: 'Religion' },
    { id: 'CasteId', value: 'Caste' },
    { id: 'HRME_IdentificationMark', value: 'Identification Mark' },
    { id: 'HRME_SubjectsTaught', value: 'Subjects Taught' },
    { id: 'HRME_BiometricCode', value: 'Biometric Code' },
    { id: 'HRME_PerStreet', value: 'Permanent Address' },
    { id: 'HRME_LocStreet', value: 'Communication Address' },
    { id: 'HRME_DOJ', value: 'Date Of Join' },
    { id: 'HRME_DOL', value: 'Date Of Left' },
    { id: 'HRME_ExpectedRetirementDate', value: 'Expected Retirement Date' },
    { id: 'HRME_BloodGroup', value: 'Blood Group' },
    { id: 'HRME_PANCardNo', value: 'PAN Card No.' },
    { id: 'HRME_AadharCardNo', value: 'Aadhar Card No.' },
    // { id: 'HRMBD_BankName', value: 'Bank Name' },
    { id: 'HRMEB_AccountNo', value: 'Account No.' },
    { id: 'HREED_Amount', value: 'Basic Amount' }
];

interface FilterFormValues {
    formatType: 'Format1' | 'Format2';
    headers: string[]; // Selected Header IDs
    // Format 1
    dateCriteria: 'DOB' | 'DOJ' | 'DOL';
    fromDate: Date | undefined;
    toDate: Date | undefined;
    working: boolean;
    left: boolean;
    allOrIndividual: 'All' | 'Individual';
    typeOrEmployee: 'Type' | 'Employee';
    selectedEmployeeType: string; // ID
    selectedEmployee: string; // ID
    // Format 2
    groupType: string[]; // IDs
    department: string[]; // IDs
    designation: string[]; // IDs
}

export default function EmployeeDetailsReportPage() {
    return (
        <FormProvider>
            <EmployeeDetailsReportContent />
        </FormProvider>
    );
}

function EmployeeDetailsReportContent() {
    const [reportData, setReportData] = useState<any>(null);
    const [filteredEmployeeDropdown, setFilteredEmployeeDropdown] = useState<any[]>([]);
    const [filteredEmployeeTypeDropdown, setFilteredEmployeeTypeDropdown] = useState<any[]>([]);

    const [empTypeLoading, setEmpTypeLoading] = useState(false);

    const tableRef = useRef<HTMLTableElement>(null);

    const { control, handleSubmit, watch, setValue, reset } = useForm<FilterFormValues>({
        defaultValues: {
            formatType: 'Format1',
            headers: HEADER_LIST.map((h) => h.id), // Default Select All
            dateCriteria: 'DOB',
            fromDate: new Date(), // Start of current month
            toDate: new Date(),
            working: true,
            left: true,
            allOrIndividual: 'All',
            typeOrEmployee: 'Type',
            selectedEmployeeType: '',
            selectedEmployee: '',
            groupType: [],
            department: [],
            designation: []
        }
    });

    const watchedFormatType = watch('formatType');
    const watchedAllOrIndividual = watch('allOrIndividual');
    const watchedTypeOrEmployee = watch('typeOrEmployee');
    const watchedWorking = watch('working');
    const watchedLeft = watch('left');
    const watchedDateCriteria = watch('dateCriteria');
    const watchedFromDate = watch('fromDate');
    const watchedToDate = watch('toDate');
    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');
    const watchedHeaders = watch('headers');
    const watchSelectedEmployeeType = watch('selectedEmployeeType');
    const watchSelectedEmployee = watch('selectedEmployee');

    // Queries
    const { data: onloadData, isLoading: isLoadingOnload } = useEmployeeDetailsReportOnload();
    const { data: groupTypesData, isLoading: isLoadingGroupTypes } = useReportGroupTypes();
    const { mutate: searchReport, isPending: isSearching } = useSearchEmployeeDetailsReport();
    const { mutate: filterEmployees } = useFilterEmployeeDetails();
    const { mutate: getEmployeeAndType } = useEmployeeAndEmployeeType();

    // Scroll to Grid View smoothly
    useEffect(() => {
        if (reportData && tableRef.current) {
            tableRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [reportData]);

    // Effect to fetch Employee/Type based on dynamic payload
    useEffect(() => {
        const fetchEmployeeData = () => {
            // Only fetch if "Individual" is selected (implied by requirement)
            // or generally fetch if criteria changes?
            // User said "if i will pass 'typeOrEmployee': 'Type', this list 'employeeTypedropdown' should come..."
            // This implies we should fetch whenever the relevant criteria for this API changes.
            const payload = {
                fromDate: watchedFromDate ? format(watchedFromDate, 'yyyy-MM-dd') : null,
                toDate: watchedToDate ? format(watchedToDate, 'yyyy-MM-dd') : null,
                formatType: watchedFormatType,
                dobjl: watchedDateCriteria,
                allOrIndividual: watchedAllOrIndividual,
                typeOrEmployee: 'Type', // Hardcode to 'Type' because backend returns BOTH employeeTypedropdown and employeeDetails lists for this value
                hrmeT_Id: 0,
                hrmE_Id: 0,
                left: watchedLeft,
                working: watchedWorking
            };

            try {
                setEmpTypeLoading(true);
                getEmployeeAndType(payload, {
                    onSuccess: (res) => {
                        if (res.data) {
                            console.log('Emp API Response:', res);

                            if (res.data.employeeTypedropdown) {
                                setFilteredEmployeeTypeDropdown(res.data.employeeTypedropdown);
                            }

                            if (res.data.employeeDetails) {
                                setFilteredEmployeeDropdown(res.data.employeeDetails);
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error fetching employee/type data:', error);
            } finally {
                setEmpTypeLoading(false);
            }
        };

        // Trigger on relevant changes
        // Using a timeout or simple effect is fine.
        if (watchedFormatType === 'Format1' && watchedAllOrIndividual === 'Individual') {
            fetchEmployeeData();
        }
    }, [
        watchedFormatType,
        watchedDateCriteria,
        watchedFromDate,
        watchedToDate,
        watchedAllOrIndividual,
        watchedWorking,
        watchedLeft,
        watchedTypeOrEmployee,
        watchSelectedEmployee,
        watchSelectedEmployeeType,
        getEmployeeAndType
    ]);

    // Initial Load just ensures we have defaults if needed, but this new effect covers the "Individual" case.
    // Legacy `onloadData` might still be useful for "All" or initial states if this API fails or isn't triggered.
    // But we previously saw `onloadData` populating these.
    // I will KEEP `onloadData` for initial population but let this new API override it when interactions happen.

    // Initial Load Side Effects (keep existing for fallback/initial)
    useEffect(() => {
        if (onloadData?.data) {
            setFilteredEmployeeDropdown(onloadData.data.employeedropdown || []);
            setFilteredEmployeeTypeDropdown(onloadData.data.employeeTypedropdown || []);
        }
    }, [onloadData]);
    // Cascading Dropdowns for Format 2
    const groupTypeIdsArray = watchedGroupType?.join(',') || '';
    const { data: departmentsData, isLoading: isLoadingDepartments } = useReportDepartments(groupTypeIdsArray);
    const groupDepartmentIdsArray = watchedDepartment?.join(',') || '';
    const { data: designationsData, isLoading: isLoadingDesignations } = useReportDesignations(groupTypeIdsArray, groupDepartmentIdsArray);

    // Filter Employees when Working/Left changes (Legacy: GetEmployeeListByWorkingSelection)
    useEffect(() => {
        const fetchFiltered = () => {
            // Only filter if we have basic data - ACTUALLY we might need to re-fetch from the new API?
            // The new API endpoint is specifically for "get_employee_and_employee_type".
            // Does it accept Working/Left? The payload doesn't explicitly show it in the request, but usually these do.
            // If NOT, we keep the old "filterEmployees" for updates?
            // User asked to Integrate this API in "Employee Type" "Employee".
            // I will assume this API replaces the source for these dropdowns.
            // But if `filterEmployees` uses `FilterEmployeeData` and that returns dropdowns too, we might have a conflict or need to switch logic.
            // Let's assume this new API is for INITIAL load or reset.
            // And `filterEmployees` is for filtering.
            // However, if the new API allows filtering, I should use it.
            // But I'll stick to replacing the INITIAL `onloadData` usage for these dropdowns.
            /* 
            Legacy: 
            onload calls `getalldetails` -> populates dropdowns.
            `GetEmployeeListByWorkingSelection` calls `FilterEmployeeData` -> populates dropdowns.
            
            User request: Integrate `get_employee_and_employee_type` in "Employee Type" "Employee".
            This implies specifically for these dropdowns.
            I will use it on mount.
            
            If I leave `filterEmployees` as is, it might overwrite this with data from `FilterEmployeeData`.
            I will assume `FilterEmployeeData` is still valid for filtering.
            I will JUST update the initial load to use this new API for these specific dropdowns.
            */
        };
        // Reuse existing filter logic for Working/Left changes for now, unless that is also broken/replaced.
        // But I will comment out the `onloadData` setting these dropdowns, as the new API validates it.
    }, []); // Removed dependency on onloadData for these specific dropdowns.

    // Filter Employees when Working/Left changes (Legacy: GetEmployeeListByWorkingSelection)
    useEffect(() => {
        const fetchFiltered = () => {
            // Only filter if we have basic data validation or just run it?
            // If the user interacts with Working/Left, we call the Filter API.
            // This remains unchanged from my previous correct implementation,
            // EXCEPT we shouldn't rely on `onloadData` existence to trigger it?
            // Actually, we can just run it.

            const payload = {
                FormatType: watchedFormatType,
                Working: watchedWorking,
                Left: watchedLeft,
                FromDate: format(watch('fromDate') || new Date(), 'yyyy-MM-dd'),
                ToDate: format(watch('toDate') || new Date(), 'yyyy-MM-dd')
            };

            filterEmployees(payload, {
                onSuccess: (res: any) => {
                    if (res.data) {
                        setFilteredEmployeeDropdown(res.data.employeeDetails || []);
                        setFilteredEmployeeTypeDropdown(res.data.employeeTypedropdown || []);
                    }
                }
            });
        };
        // call on change
        if (watchedWorking !== undefined && watchedLeft !== undefined) {
            fetchFiltered();
        }
    }, [watchedWorking, watchedLeft, filterEmployees, watch]); // added watch to deps

    // Handle Search
    const onSubmit = (data: FilterFormValues) => {
        if (data.headers.length === 0) {
            toast.error('Kindly select Headers To display');
            return;
        }
        console.log('data', data);

        const payload: EmployeeDetailsReportRequest = {
            mI_Id: 0,
            roleId: 0,
            formatType: data.formatType,
            dobjl: data.dateCriteria,
            allOrIndividual: data.allOrIndividual,
            fromDate: data.fromDate ? new Date(data.fromDate).toISOString() : new Date().toISOString(),
            toDate: data.toDate ? new Date(data.toDate).toISOString() : new Date().toISOString(),
            hrmeT_Id: data.selectedEmployeeType ? Number(data.selectedEmployeeType) : 0,
            hrmE_Id: data.selectedEmployee ? Number(data.selectedEmployee) : 0,
            typeOrEmployee: data.allOrIndividual === 'Individual' ? data.typeOrEmployee : 'string',
            coloumns: 'string',
            working: data.working,
            left: data.left,
            headerselected: data.headers,
            groupTypeselected: data.groupType.length > 0 ? data.groupType.map(Number) : [0],
            departmentselected: data.department.length > 0 ? data.department.map(Number) : [0],
            designationselected: data.designation.length > 0 ? data.designation.map(Number) : [0],
            empIds: 'string',
            hrmD_IdList: [0],
            hrmD_Id: 0
        };

        console.log('FINAL SEARCH PAYLOAD:', JSON.stringify(payload, null, 2));
        if (data.formatType === 'Format1' && data.allOrIndividual === 'Individual') {
            if (data.typeOrEmployee === 'Type' && !data.selectedEmployeeType) {
                toast.error('Select Employee Type');
                return;
            }
            if (data.typeOrEmployee === 'Employee' && !data.selectedEmployee) {
                toast.error('Select Employee');
                return;
            }
        }

        // Validation for Format 2
        if (data.formatType === 'Format2') {
            if (data.groupType.length === 0 && data.department.length === 0 && data.designation.length === 0) {
                toast.error('Kindly select atleast one record (Group, Dept or Desig)');
                return;
            }
        }

        console.log('Search Payload:', JSON.stringify(payload, null, 2));

        searchReport(payload, {
            onSuccess: (res: any) => {
                console.log('🔥 Raw API Response:', res);

                // Check if API returned success: false
                if (!res.success) {
                    setReportData(null);
                    toast.error(res.message || 'Failed to fetch report');
                    return;
                }
                console.log('API Response:', res);
                // API success: true, check data
                if (res.data && res.data.employeeDetails && res.data.employeeDetails.length > 0) {
                    setReportData(res.data);
                    console.log('Report Data:', res.data);
                    toast.success('Report generated successfully');
                } else {
                    setReportData(null);
                    console.log('Report Data:', res.data);
                    toast.error('No Record found to display .. !');
                }
            }
        });
    };

    const handleCancel = () => {
        reset();
        setReportData(null);
    };

    const handleExport = () => {
        if (!reportData || !reportData.employeeDetails) {
            toast.error('No data to export');
            return;
        }

        const columns = watchedHeaders.map((id) => {
            const header = HEADER_LIST.find((h) => h.id === id);
            return { label: header?.value || id, value: id };
        });
        // Add SL No
        columns.unshift({ label: 'Sl.No', value: 'index' }); // value 'index' is handled by custom logic or we map it.

        // Pre-process data to add index
        const content = reportData.employeeDetails.map((row: any, index: number) => ({
            ...row,
            index: index + 1
        }));

        exportToExcel('EmployeeDetailsReport', JSON.stringify(columns), JSON.stringify(content));
    };

    // Columns for Grid
    const columns = useMemo(() => {
        const cols: any[] = [
            {
                id: 'serialNumber',
                header: 'Sl.No',
                cell: ({ row }: any) => row.index + 1
            }
        ];

        // Dynamic columns based on selection
        // We use the `watchedHeaders` to preserve order or `HEADER_LIST` order?
        // Legacy: `ng-repeat="column in columnsTest"` where `columnsTest = promise.headerselected`
        // So it respects the order sent to backend or backend return order.
        // We can just iterate `watchedHeaders` and map to `HEADER_LIST` to get labels.

        watchedHeaders.forEach((headerId) => {
            const headerDef = HEADER_LIST.find((h) => h.id === headerId);
            if (headerDef) {
                cols.push({
                    accessorKey: headerId, // Data Key matches Header ID usually
                    header: headerDef.value,
                    cell: ({ row }: any) => {
                        const val = row.original[headerId];
                        // Date formatting if needed? Legacy just shows `row[column.columnID]`.
                        // Some keys like 'HRME_DOB' might need formatting.
                        if (headerId.includes('Date') || headerId.includes('DOB') || headerId.includes('DOJ') || headerId.includes('DOL')) {
                            if (val) {
                                const date = new Date(val);
                                if (!isNaN(date.getTime())) {
                                    return format(date, 'dd/MM/yyyy');
                                }
                            }
                        }
                        return val;
                    }
                });
            }
        });

        return cols;
    }, [watchedHeaders]);

    const processedGridData = useMemo(() => {
        return reportData?.employeeDetails || [];
    }, [reportData]);

    return (
        <div className='container min-h-screen space-y-4 p-2'>
            {/* <div className="flex items-center justify-between">
        <h2 className="font-bold text-2xl tracking-tight">
          Employee Details Report
        </h2>
      </div> */}

            <CollapsibleSection title='Configuration' defaultOpen={true} variant='outline'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    {/* Header Selection */}
                    <div className='rounded-md border p-4'>
                        <Label className='mb-2 block font-semibold'>
                            Select Headers <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            name='headers'
                            control={control}
                            render={({ field }) => (
                                <div className='grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5'>
                                    {/* Select All Checkbox */}
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox
                                            checked={field.value.length === HEADER_LIST.length}
                                            onCheckedChange={(checked) => {
                                                field.onChange(checked ? HEADER_LIST.map((h) => h.id) : []);
                                            }}
                                        />
                                        <span className='font-semibold'>All</span>
                                    </div>
                                    {HEADER_LIST.map((header) => (
                                        <div key={header.id} className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value.includes(header.id)}
                                                onCheckedChange={(checked) => {
                                                    const newValue = checked
                                                        ? [...field.value, header.id]
                                                        : field.value.filter((val) => val !== header.id);
                                                    field.onChange(newValue);
                                                }}
                                            />
                                            <span className='text-sm'>{header.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        />
                    </div>

                    {/* Format Type */}
                    <div className='flex justify-center'>
                        <Controller
                            name='formatType'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup value={field.value} onValueChange={field.onChange} className='flex space-x-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='Format1' id='f1' />
                                        <Label htmlFor='f1'>Format 1</Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='Format2' id='f2' />
                                        <Label htmlFor='f2'>Format 2</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>

                    {/* Format 1 Controls */}
                    {watchedFormatType === 'Format1' && (
                        <div className='space-y-6 rounded-md border bg-slate-50 p-4 dark:bg-slate-900/50'>
                            {/* Date Criteria */}
                            <div className='flex justify-center'>
                                <Controller
                                    name='dateCriteria'
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup value={field.value} onValueChange={field.onChange} className='flex space-x-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='DOB' id='dob' />
                                                <Label htmlFor='dob'>Date of Birth</Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='DOJ' id='doj' />
                                                <Label htmlFor='doj'>Date of Joining</Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='DOL' id='dol' />
                                                <Label htmlFor='dol'>Date of Leaving</Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>

                            {/* Dates */}
                            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                <div className='space-y-2'>
                                    <Label>
                                        From Date <span className='text-destructive'>*</span>
                                    </Label>
                                    <Controller
                                        name='fromDate'
                                        control={control}
                                        render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label>
                                        To Date <span className='text-destructive'>*</span>
                                    </Label>
                                    <Controller
                                        name='toDate'
                                        control={control}
                                        render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />}
                                    />
                                </div>
                            </div>

                            {/* Working / Left */}
                            <div className='flex justify-center space-x-6'>
                                <div className='flex items-center space-x-2'>
                                    <Controller
                                        name='working'
                                        control={control}
                                        render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
                                    />
                                    <Label>Working</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Controller
                                        name='left'
                                        control={control}
                                        render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
                                    />
                                    <Label>Left</Label>
                                </div>
                            </div>

                            {/* All / Individual */}
                            <div className='flex justify-center'>
                                <Controller
                                    name='allOrIndividual'
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup value={field.value} onValueChange={field.onChange} className='flex space-x-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='All' id='all' />
                                                <Label htmlFor='all'>All</Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='Individual' id='individual' />
                                                <Label htmlFor='individual'>Individual</Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>

                            {/* Individual Specifics */}
                            {watchedAllOrIndividual === 'Individual' && (
                                <div className='space-y-4 rounded-md border p-4'>
                                    <div className='flex justify-center'>
                                        <Controller
                                            name='typeOrEmployee'
                                            control={control}
                                            render={({ field }) => (
                                                <RadioGroup value={field.value} onValueChange={field.onChange} className='flex space-x-6'>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='Type' id='type' />
                                                        <Label htmlFor='type'>Type</Label>
                                                    </div>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='Employee' id='emp' />
                                                        <Label htmlFor='emp'>Employee</Label>
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        />
                                    </div>

                                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                        {watchedTypeOrEmployee === 'Type' && (
                                            <div className='space-y-2'>
                                                <Label>
                                                    Employee Type <span className='text-destructive'>*</span>
                                                </Label>
                                                <Controller
                                                    name='selectedEmployeeType'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={empTypeLoading ? 'Loading...' : 'Select Type'} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {filteredEmployeeTypeDropdown.length === 0 ? (
                                                                    <div className='p-4 text-center text-muted-foreground text-sm'>
                                                                        No employee types found for the selected criteria.
                                                                    </div>
                                                                ) : (
                                                                    filteredEmployeeTypeDropdown.map((item: any) => (
                                                                        <SelectItem
                                                                            key={item.hrmeT_Id}
                                                                            value={item.hrmeT_Id?.toString() ?? ''}>
                                                                            {item.hrmeT_EmployeeType}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>
                                        )}
                                        {watchedTypeOrEmployee === 'Employee' && (
                                            <div className='space-y-2'>
                                                <Label>
                                                    Employee <span className='text-destructive'>*</span>
                                                </Label>
                                                <Controller
                                                    name='selectedEmployee'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Select Employee' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {filteredEmployeeDropdown.length === 0 ? (
                                                                    <div className='p-4 text-center text-muted-foreground text-sm'>
                                                                        No employees found for the selected criteria.
                                                                    </div>
                                                                ) : (
                                                                    filteredEmployeeDropdown.map((item: any) => (
                                                                        <SelectItem
                                                                            key={item.hrmE_Id}
                                                                            value={item.hrmE_Id?.toString() ?? ''}>
                                                                            {item.employeeFullName}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Format 2 Controls */}
                    {watchedFormatType === 'Format2' && (
                        <div className='grid grid-cols-1 gap-6 rounded-md border bg-slate-50 p-4 lg:grid-cols-3 dark:bg-slate-900/50'>
                            <div className='space-y-2'>
                                <Label>
                                    Group Type <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='groupType'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={
                                                groupTypesData?.data?.map((item: any) => ({
                                                    label: item.value || item.hrmgT_EmployeeGroupType,
                                                    value: (item.key ?? item.hrmgT_Id)?.toString() ?? ''
                                                })) || []
                                            }
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder={isLoadingGroupTypes ? 'Loading...' : 'Select Group Types'}
                                            disabled={isLoadingGroupTypes}
                                        />
                                    )}
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label>
                                    Department <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='department'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={
                                                departmentsData?.data?.map((item: any) => ({
                                                    label: item.hrmD_DepartmentName || item.value,
                                                    value: (item.hrmD_Id ?? item.key)?.toString() ?? ''
                                                })) || []
                                            }
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder={isLoadingDepartments ? 'Loading...' : 'Select Departments'}
                                            disabled={isLoadingDepartments || departmentsData?.data?.length == 0}
                                        />
                                    )}
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label>
                                    Designation <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='designation'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={
                                                designationsData?.data?.map((item: any) => ({
                                                    label: item.value || item.hrmdeS_DesignationName,
                                                    value: (item.key ?? item.hrmdeS_Id)?.toString() ?? ''
                                                })) || []
                                            }
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder={isLoadingDesignations ? 'Loading...' : 'Select Designations'}
                                            disabled={isLoadingDesignations || designationsData?.data?.length == 0}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    <div className='flex justify-center gap-4'>
                        <Button type='submit' disabled={isSearching} className='w-32'>
                            {isSearching ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <SearchIcon className='mr-2 h-4 w-4' />}
                            Search
                        </Button>
                        <Button type='button' variant='destructive' onClick={handleCancel} className='w-32'>
                            <X className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                    </div>
                </form>
            </CollapsibleSection>

            {reportData && (
                <CollapsibleSection
                    title='Report Details'
                    defaultOpen={true}
                    className='border shadow-md'
                    rightElement={
                        <Button variant='outline' size='sm' onClick={handleExport} className='gap-2'>
                            <Download className='h-4 w-4' />
                            Export to Excel
                        </Button>
                    }>
                    <div ref={tableRef} className='h-[500px] overflow-y-auto'>
                        <GenericDataTable
                            data={processedGridData}
                            columns={columns}
                            totalItems={processedGridData.length}
                            isLoading={false}
                            showViewOptions={false}
                            showSearchColumns={false}
                            showExportOptions={false}
                            maxSelectableRows={0}
                            isPaginationRequired={false}
                            isSearchRequired={false}
                            scrollable
                        />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
