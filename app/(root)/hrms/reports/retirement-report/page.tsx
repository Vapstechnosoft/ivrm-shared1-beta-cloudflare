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
    useLoginBasedDepartmentsByGroupType,
    useMasterGroupTypes,
    useReportDesignations,
    useSearchEmployeeDetailsReport
} from '@/hooks/hrms/useReports';
import { exportToExcel } from '@/lib/export-to-file';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Download, Loader2, Search as SearchIcon, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const HEADER_LIST = [
    { id: 'HRME_EmployeeCode', value: 'Employee Code' },
    { id: 'HRME_EmployeeFirstName', value: 'Employee Name' },
    { id: 'HRME_FatherName', value: 'Father Name' },
    { id: 'HRME_EmailId', value: 'Email Id' },
    { id: 'HRME_MobileNo', value: 'Mobile No.' },
    { id: 'HRME_DOB', value: 'Date Of Birth' },
    { id: 'HRMET_Id', value: 'Employee Type' },
    { id: 'HRMGT_Id', value: 'Group Type' },
    { id: 'HRMD_Id', value: 'Department' },
    { id: 'HRMDES_Id', value: 'Designation' },
    { id: 'HRMG_Id', value: 'Grade' },
    { id: 'HRME_BiometricCode', value: 'Biometric' },
    { id: 'HRME_Photo', value: 'Photo' },
    { id: 'HRME_DOJ', value: 'Date Of Join' },
    { id: 'HRME_DOL', value: 'Date Of Left' },
    { id: 'DateofConfromation', value: 'Date Of Confirmation' },
    { id: 'HRME_ExpectedRetirementDate', value: 'Expected Retirement Date' },
    { id: 'HRME_BloodGroup', value: 'Blood Group' },
    { id: 'HRME_PANCardNo', value: 'PAN Card No.' },
    { id: 'HRME_AadharCardNo', value: 'Aadhar Card No' }
];

const mockEmployees = [
    { key: '1208', value: 'ANUSHA T' },
    { key: 'EMP002', value: 'KIRAN KUMAR' },
    { key: 'EMP003', value: 'PALLAVI C' },
    { key: 'EMP004', value: 'RAFIQ' },
    { key: 'EMP005', value: 'NATARAJA' }
];

const mockApiResponse = {
    employeeSalaryslipDetails: [
        {
            hrmD_Id: 80,
            hrmD_code: 'EMP001',
            hrmD_Name: 'John Doe',
            hrmD_FatherName: 'Father Name 1',
            hrmD_MobileNo: '9876543210',
            hrmD_EmailId: 'john@example.com',
            hrmD_DateOfBirth: '1990-01-01',
            hrmD_EmergencyContact: '9876543211',
            hrmD_DateOfConfirmation: '2023-01-01',
            hrmD_EmployeeType: 'Permanent',
            hrmD_GroupType: 'Teaching Staff',
            hrmD_DepartmentName: 'Teaching',
            hrmD_Designation: 'Senior Teacher',
            hrmD_Status: 'Active',
            hrmD_DateOfJoining: '2022-01-01',
            hrmD_DateOfLeaving: '',
            hrmD_ReasonForLeaving: '',
            hrmD_Remarks: 'Good performance',
            hrmD_Address: '123 Main St',
            hrmD_Qualification: 'M.Ed',
            hrmD_Experience: '5 years',
            hrmD_WorkingDays: 22,
            hrmD_Lop: 0
        },
        {
            hrmD_Id: 84,
            hrmD_code: 'EMP002',
            hrmD_Name: 'John Smith',
            hrmD_FatherName: 'Father Name 2',
            hrmD_MobileNo: '9876543220',
            hrmD_EmailId: 'smith@example.com',
            hrmD_DateOfBirth: '1985-05-15',
            hrmD_EmergencyContact: '9876543221',
            hrmD_DateOfConfirmation: '2023-06-01',
            hrmD_EmployeeType: 'Contract',
            hrmD_GroupType: 'Non Teaching Staff',
            hrmD_DepartmentName: 'Non Teaching',
            hrmD_Designation: 'Admin',
            hrmD_Status: 'Active',
            hrmD_DateOfJoining: '2023-01-01',
            hrmD_DateOfLeaving: '',
            hrmD_ReasonForLeaving: '',
            hrmD_Remarks: '',
            hrmD_Address: '456 Oak Ave',
            hrmD_Qualification: 'B.Com',
            hrmD_Experience: '3 years',
            hrmD_WorkingDays: 31,
            hrmD_Lop: 5
        }
    ]
};

const filterSchema = z
    .object({
        formatType: z.enum(['Format1', 'Format2']),
        headers: z.array(z.string()),
        dateCriteria: z.enum(['DOB', 'DOJ', 'DOL']),
        fromDate: z
            .date({
                required_error: 'From Date is required',
                invalid_type_error: 'Invalid Date'
            })
            .optional(),
        toDate: z
            .date({
                required_error: 'To Date is required',
                invalid_type_error: 'Invalid Date'
            })
            .optional(),
        working: z.boolean(),
        left: z.boolean(),
        allOrIndividual: z.enum(['All', 'Individual']),
        typeOrEmployee: z.enum(['Type', 'Employee']),
        selectedEmployeeType: z.string().optional(),
        selectedEmployee: z.string().optional(),
        groupType: z.array(z.string()).default([]),
        department: z.array(z.string()).default([]),
        designation: z.array(z.string()).default([])
    })
    .superRefine((data, ctx) => {
        if (data.formatType === 'Format1') {
            if (!data.fromDate) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['fromDate'],
                    message: 'From Date is required'
                });
            }
            if (!data.toDate) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['toDate'],
                    message: 'To Date is required'
                });
            }
            if (data.fromDate && data.toDate && data.toDate < data.fromDate) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['toDate'],
                    message: 'To Date cannot be earlier than From Date'
                });
            }
        }
    });

type FilterFormValues = z.infer<typeof filterSchema>;

export default function RetirementReportPage() {
    return (
        <FormProvider>
            <RetirementReportContent />
        </FormProvider>
    );
}

function RetirementReportContent() {
    const [reportData, setReportData] = useState<any>(null);
    //   const [isSearching, setIsSearching] = useState(false);
    const tableRef = useRef<HTMLTableElement>(null);
    const [filteredEmployeeDropdown, setFilteredEmployeeDropdown] = useState<any[]>([]);
    const [filteredEmployeeTypeDropdown, setFilteredEmployeeTypeDropdown] = useState<any[]>([]);

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors }
    } = useForm<FilterFormValues>({
        resolver: zodResolver(filterSchema),
        defaultValues: {
            formatType: 'Format1',
            headers: HEADER_LIST.map((h) => h.id), // Default Select All
            dateCriteria: 'DOB',
            fromDate: new Date(),
            toDate: new Date(),
            working: false,
            left: false,
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
    const watchedHeaders = watch('headers');
    const watchedDateCriteria = watch('dateCriteria');
    const watchedFromDate = watch('fromDate');
    const watchedToDate = watch('toDate');
    const watchedWorking = watch('working');
    const watchedLeft = watch('left');
    const watchSelectedEmployee = watch('selectedEmployee');
    const watchSelectedEmployeeType = watch('selectedEmployeeType');
    const watchGroupType = watch('groupType');
    const watchDepartment = watch('department');
    const watchDesignation = watch('designation');

    const { data: masterGroupTypes, isLoading: isLoadingGroupTypes } = useMasterGroupTypes();
    const types = watchGroupType.map((id) => Number.parseInt(id));
    const { data: masterDepartments, isLoading: isLoadingDepartments } = useLoginBasedDepartmentsByGroupType(types);

    const groupTypeIds = watchGroupType?.join(',');
    const deptIds = watchDepartment?.join(',') || '';
    const { data: masterDesignations, isLoading: isLoadingDesignations } = useReportDesignations(groupTypeIds, deptIds);

    const { mutate: getEmployeeAndType } = useEmployeeAndEmployeeType();

    const { mutate: searchReport, isPending: isSearching } = useSearchEmployeeDetailsReport();

    const groupTypeOptions =
        masterGroupTypes?.data?.map((item: any) => ({
            label: item.value || item.hrmgT_EmployeeGroupType,
            value: (item.key ?? item.hrmgT_Id)?.toString() ?? ''
        })) || [];

    const departmentsOptions =
        masterDepartments?.data?.map((item: any) => ({
            label: item.hrmD_DepartmentName || item.value,
            value: (item.hrmD_Id ?? item.key)?.toString() ?? ''
        })) || [];

    const designationsOptions =
        masterDesignations?.data?.map((item: any) => ({
            label: item.value || item.hrmdeS_DesignationName,
            value: (item.key ?? item.hrmdeS_Id)?.toString() ?? ''
        })) || [];

    useEffect(() => {
        const fetchEmployeeData = () => {
            const payload = {
                fromDate: watchedFromDate ? new Date(watchedFromDate).toISOString() : null,
                toDate: watchedToDate ? new Date(watchedToDate).toISOString() : null,
                formatType: watchedFormatType,
                dobjl: watchedDateCriteria,
                allOrIndividual: watchedAllOrIndividual,
                typeOrEmployee: 'Type', // Hardcode to 'Type' because backend returns BOTH employeeTypedropdown and employeeDetails lists for this value
                hrmeT_Id: 0,
                hrmE_Id: 0,
                left: watchedLeft,
                working: watchedWorking
            };

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

    // Scroll smoothly
    useEffect(() => {
        if (reportData && tableRef.current) {
            tableRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [reportData]);

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
        columns.unshift({ label: 'Sl.No', value: 'index' });

        const content = reportData.employeeDetails.map((row: any, index: number) => ({
            ...row,
            index: index + 1
        }));

        exportToExcel('RetirementReport', JSON.stringify(columns), JSON.stringify(content));
    };

    const columns = useMemo(() => {
        const cols: any[] = [
            {
                id: 'serialNumber',
                header: 'Sl.No',
                cell: ({ row }: any) => row.index + 1
            }
        ];

        watchedHeaders.forEach((headerId) => {
            const headerDef = HEADER_LIST.find((h) => h.id === headerId);
            if (headerDef) {
                cols.push({
                    accessorKey: headerId,
                    header: headerDef.value,
                    cell: ({ row }: any) => {
                        const val = row.original[headerId];
                        if (headerId === 'HRME_Photo') {
                            return val ? <img src={val} alt='Profile' className='h-10 w-10 rounded-md object-cover' /> : '-';
                        }
                        if (headerId.includes('Date')) {
                            if (val) {
                                const date = new Date(val);
                                if (!isNaN(date.getTime())) {
                                    return format(date, 'dd/MM/yyyy');
                                }
                            }
                        }
                        return val || '-';
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

                    {/* Working / Left (Always visible for both Formats) */}
                    <div className='flex justify-center space-x-6 rounded-md border bg-slate-50 p-4 dark:bg-slate-900/50'>
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
                                    {errors.fromDate && (
                                        <p className='font-medium text-[0.8rem] text-destructive'>{errors.fromDate.message as string}</p>
                                    )}
                                </div>
                                <div className='space-y-2'>
                                    <Label>
                                        To Date <span className='text-destructive'>*</span>
                                    </Label>
                                    <Controller
                                        name='toDate'
                                        control={control}
                                        render={({ field }) => (
                                            <DatePicker
                                                date={field.value}
                                                setDate={field.onChange}
                                                disabled={
                                                    watchedFromDate
                                                        ? { before: new Date(new Date(watchedFromDate).setHours(0, 0, 0, 0)) }
                                                        : undefined
                                                }
                                            />
                                        )}
                                    />
                                    {errors.toDate && (
                                        <p className='font-medium text-[0.8rem] text-destructive'>{errors.toDate.message as string}</p>
                                    )}
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
                                                                <SelectValue placeholder='Select Type' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {filteredEmployeeTypeDropdown.map((item: any) => (
                                                                    <SelectItem key={item.hrmeT_Id} value={item.hrmeT_Id?.toString() ?? ''}>
                                                                        {item.hrmeT_EmployeeType}
                                                                    </SelectItem>
                                                                ))}
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
                                                                {filteredEmployeeDropdown.length === 0 && (
                                                                    <SelectItem value='not-found'>No Employee Found</SelectItem>
                                                                )}
                                                                {filteredEmployeeDropdown.map((item: any) => (
                                                                    <SelectItem key={item.hrmE_Id} value={item.hrmE_Id?.toString() ?? ''}>
                                                                        {item.employeeFullName}
                                                                    </SelectItem>
                                                                ))}
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
                                            options={groupTypeOptions}
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
                                            options={departmentsOptions}
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder={isLoadingDepartments ? 'Loading...' : 'Select Departments'}
                                            disabled={isLoadingGroupTypes}
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
                                            options={designationsOptions}
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder={isLoadingDesignations ? 'Loading...' : 'Select Designations'}
                                            disabled={isLoadingDepartments}
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
                            scrollable
                        />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
