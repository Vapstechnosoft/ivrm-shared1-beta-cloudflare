'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError, Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    useEmployeePunchDetails,
    useSaveEmployeePunch,
    useTogglePunchDetail
} from '@/hooks/hrms/attendance-management/useFrontOfficeAddLogs';
import {
    useReportDepartments,
    useReportDesignations,
    useReportEmployeesByGroupTypeDeptAndDesignation,
    useReportGroupTypes
} from '@/hooks/hrms/useReports';
import { FrontOfficeAddLogsSchema } from '@/schemas/hrms/report';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2, Plus, Save, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { DetailedTimePicker } from './_components/detailed-time-picker';

interface FilterFormValues {
    groupType: string[];
    department: string[];
    designation: string[];
    date: Date;
    employee: string;
    punchTime: string; // HH:mm format
    inOutFlag: 'I' | 'O' | '';
    remarks?: string;
}

interface CartLog {
    id: string;
    hrmE_Id: number;
    employeeName: string;
    foeP_PunchDate: Date;
    foepD_PunchTime: string;
    inOutFlag: 'I' | 'O';
    remarks?: string;
}

export default function FrontOfficeAddLogsPage() {
    return (
        <FormProvider>
            <FrontOfficeAddLogsContent />
        </FormProvider>
    );
}

function FrontOfficeAddLogsContent() {
    const {
        control,
        handleSubmit,
        watch,
        reset,
        setValue,

        formState: { errors },
        trigger
    } = useForm<FilterFormValues>({
        resolver: zodResolver(FrontOfficeAddLogsSchema),
        mode: 'onChange',
        defaultValues: {
            groupType: [],
            department: [],
            designation: [],
            date: new Date(),
            employee: '',
            punchTime: 'HH:MM',
            inOutFlag: ''
        }
    });

    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');
    const watchedDesignation = watch('designation');
    const watchedEmployee = watch('employee');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [cartLogs, setCartLogs] = useState<CartLog[]>([]);
    const [resetkey, setResetKey] = useState(0);

    // Mapped ID arrays for hook dependencies
    const groupTypeIds = useMemo(() => watchedGroupType.map(Number).filter(Boolean), [watchedGroupType]);
    const deptIds = useMemo(() => watchedDepartment.map(Number).filter(Boolean), [watchedDepartment]);
    const desigIds = useMemo(() => watchedDesignation.map(Number).filter(Boolean), [watchedDesignation]);

    // Data Hooks
    const { data: groupTypesData } = useReportGroupTypes();
    const { data: departmentsData } = useReportDepartments(groupTypeIds.toString());
    const { data: designationsData } = useReportDesignations(groupTypeIds.toString(), deptIds.toString());
    const { data: employeesData } = useReportEmployeesByGroupTypeDeptAndDesignation(groupTypeIds, deptIds, desigIds);

    console.log('employeesData', watchedEmployee);

    // Fetch existing punch details
    const watchedDate = watch('date');
    const formattedDate = watchedEmployee && watchedDate ? format(watchedDate, 'yyyy-MM-dd') : '';
    console.log('formattedDate', formattedDate);
    const {
        data: punchDetailsData,
        isLoading: isPunchDetailsLoading,
        refetch: refetchPunchDetails
    } = useEmployeePunchDetails(formattedDate, Number(watchedEmployee));
    console.log('punchDetailsData', punchDetailsData);
    // Transforms
    const groupTypesDataTransformed = useMemo(() => {
        return (
            groupTypesData?.data?.map((gt: any) => ({
                id: gt.key || gt.hrmgT_Id,
                name: gt.value || gt.hrmgT_EmployeeGroupType
            })) || []
        ).filter((d: any) => d.id != null);
    }, [groupTypesData]);

    const departmentsDataTransformed = useMemo(() => {
        return (
            departmentsData?.data?.map((d: any) => ({
                id: d.hrmD_Id || d.hrmd_id || d.key || d.id,
                name: d.hrmD_DepartmentName || d.hrmd_departmentName || d.value || d.name
            })) || []
        ).filter((d: any) => d.id != null);
    }, [departmentsData]);

    const designationsDataTransformed = useMemo(() => {
        return (
            designationsData?.data?.map((d: any) => ({
                id: d.hrmdeS_Id || d.hrmdes_id || d.key || d.id,
                name: d.hrmdeS_DesignationName || d.hrmdes_designationName || d.value || d.name
            })) || []
        ).filter((d: any) => d.id != null);
    }, [designationsData]);

    const employeesDataTransformed = useMemo(() => {
        const list = employeesData?.data?.employeeNames || employeesData;
        if (!list || !Array.isArray(list)) return [];

        return list
            .map((emp: any) => {
                const id = emp.hrmE_Id || emp.id;
                if (!id) return null;

                return {
                    id: Number(id),
                    employeeName: emp.employeeFullName || 'Unknown Employee',
                    employeeCode: emp.hrmE_EmployeeCode || id.toString()
                };
            })
            .filter(Boolean);
    }, [employeesData]);

    console.log('employeesDataTransformed', employeesDataTransformed);

    const { mutateAsync: savePunch, isPending } = useSaveEmployeePunch();
    const { mutate: deletePunch, isPending: isDeleting } = useTogglePunchDetail();

    const onSubmit = async () => {
        if (cartLogs.length === 0) {
            toast.error('Cart is empty. Please add logs to cart first.');
            return;
        }

        const payload = {
            punchLogs: cartLogs.map((log) => ({
                hrmE_Id: log.hrmE_Id,
                foeP_PunchDate: format(log.foeP_PunchDate, 'yyyy-MM-dd'),
                foepD_PunchTime: log.foepD_PunchTime,
                inOutFlag: log.inOutFlag,
                remarks: log.remarks
            }))
        };
        console.log("Payload",payload)

        try {
            await savePunch(payload);
            setCartLogs([]);
            reset({
                groupType: [],
                department: [],
                designation: [],
                date: new Date(),
                employee: '',
                punchTime: 'HH:MM',
                inOutFlag: '',
                remarks: ''
            });
        } catch (error) {
            console.error('Save Error:', error);
        }
    };

    const addToCart = async () => {
        const isValid = await trigger(['groupType', 'department', 'designation', 'date', 'employee', 'punchTime', 'inOutFlag']);

        if (!isValid) return;

        const values = watch();
        const emp = employeesDataTransformed.find((e: any) => String(e.id) === values.employee);

        const newLog: CartLog = {
            id: Math.random().toString(36).substr(2, 9),
            hrmE_Id: Number(values.employee),
            employeeName: emp?.employeeName || 'Unknown',
            foeP_PunchDate: values.date,
            foepD_PunchTime: values.punchTime,
            inOutFlag: values.inOutFlag as 'I' | 'O',
            remarks: values.remarks
        };

        setCartLogs([...cartLogs, newLog]);

        // Reset only log-related fields
        setValue('punchTime', 'HH:MM');
        setValue('inOutFlag', '');
        setValue('remarks', '');
    };

    const removeFromCart = (id: string) => {
        setCartLogs(cartLogs.filter((log) => log.id !== id));
    };

    const resetCartHandler = () => {
        reset();
        setCartLogs([]);
    };

    const resetLogsHandler = () => {
        reset(), setResetKey((prev) => prev + 1);
    };

    return (
        <div className='container min-h-screen space-y-8 bg-gray-50/50 p-6'>
            {/* Filters Section - Kept for functionality, but stylized */}
            <CollapsibleSection defaultOpen={true} title='Employee Logs Insertion' variant='outline' className='bg-white shadow-sm'>
                <div className='mb-8 grid grid-cols-1 gap-6 p-4 md:grid-cols-3'>
                    <div className='space-y-2'>
                        <Label className='font-semibold'>Group Type<span className='text-destructive'>*</span></Label>
                        <Controller
                            key={resetkey}
                            name='groupType'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    options={groupTypesDataTransformed.map((gt: any) => ({
                                        label: gt.name,
                                        value: String(gt.id)
                                    }))}
                                    defaultValue={field.value}
                                    onValueChange={field.onChange}
                                    placeholder='Select Group Types'
                                />
                            )}
                        />
                        {errors.groupType && <FormError>{errors.groupType.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label className='font-semibold'>Department<span className='text-destructive'>*</span></Label>
                        <Controller
                            key={resetkey}
                            name='department'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    options={departmentsDataTransformed.map((dept: any) => ({
                                        label: dept.name,
                                        value: String(dept.id)
                                    }))}
                                    defaultValue={field.value}
                                    onValueChange={field.onChange}
                                    placeholder='Select Departments'
                                />
                            )}
                        />
                        {errors.department && <FormError>{errors.department.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label className='font-semibold'>Designation<span className='text-destructive'>*</span></Label>
                        <Controller
                            key={resetkey}
                            name='designation'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    options={designationsDataTransformed.map((desg: any) => ({
                                        label: desg.name,
                                        value: String(desg.id)
                                    }))}
                                    defaultValue={field.value}
                                    onValueChange={field.onChange}
                                    placeholder='Select Designations'
                                />
                            )}
                        />
                        {errors.designation && <FormError>{errors.designation.message}</FormError>}
                    </div>
                </div>

                {/* ADD LOGS Section */}
                <div className='overflow-hidden rounded-md border bg-white'>
                    <div className=' px-4 py-2'>
                        <h2 className='font-bold text-black text-sm uppercase tracking-wide'>ADD LOGS</h2>
                    </div>

                    <div className='overflow-x-auto p-0'>
                        <table className='w-full border-collapse'>
                            <thead>
                                <tr className='bg-violet-600'>
                                    <th className='border border-r px-4 py-2 text-center font-bold text-[13px] text-white'>Date</th>
                                    <th className='border border-r px-4 py-2 text-center font-bold text-[13px] text-white'>Time</th>
                                    <th className='border border-r px-4 py-2 text-center font-bold text-[13px] text-white'>
                                        Employee Name
                                    </th>
                                    <th className='border border-r px-4 py-2 text-center font-bold text-[13px] text-white'>In/Out</th>
                                    <th className='px-4 py-2 text-center font-bold text-[13px] text-white'>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className='min-w-[180px] border-gray-200 border-r p-4'>
                                        <Controller
                                            key={resetkey}
                                            name='date'
                                            control={control}
                                            render={({ field }) => (
                                                <div className='flex flex-col items-center gap-1'>
                                                    <DatePicker
                                                        date={field.value}
                                                        setDate={field.onChange}
                                                        placeholder='Select Date'
                                                        disabled={{ after: new Date() }}
                                                        className='rounded-none border-0 border-blue-300 border-b-2 bg-transparent transition-colors focus-within:border-blue-500'
                                                    />
                                                    {errors.date && <FormError>{errors.date.message}</FormError>}
                                                </div>
                                            )}
                                        />
                                    </td>
                                    <td className='min-w-[150px] border-gray-200 border-r p-2'>
                                        <div className='flex scale-90 justify-center'>
                                            <Controller
                                                key={resetkey}
                                                name='punchTime'
                                                control={control}
                                                render={({ field, fieldState }) => (
                                                    <DetailedTimePicker
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        error={fieldState.error?.message}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </td>
                                    <td className='min-w-[250px] border-gray-200 border-r p-4'>
                                        <Controller
                                            key={resetkey}
                                            name='employee'
                                            control={control}
                                            render={({ field }) => (
                                                <div className='flex flex-col gap-1'>
                                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                                        <SelectTrigger className='w-full rounded-none border-0 border-blue-300 border-b-2 focus:border-blue-500 focus:ring-0'>
                                                            <SelectValue placeholder='Select Employee' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {employeesDataTransformed.map((emp: any) => (
                                                                <SelectItem key={emp.id} value={String(emp.id)}>
                                                                    {emp.employeeName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.employee && <FormError>{errors.employee.message}</FormError>}
                                                </div>
                                            )}
                                        />
                                    </td>
                                    <td className='min-w-[150px] border-gray-200 border-r p-4'>
                                        <Controller
                                            key={resetkey}
                                            name='inOutFlag'
                                            control={control}
                                            render={({ field }) => (
                                                <div className='flex flex-col gap-1'>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className='w-full rounded-none border-0 border-blue-300 border-b-2 bg-transparent focus:border-blue-500 focus:ring-0'>
                                                            <SelectValue placeholder='--Select--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value='I'>In</SelectItem>
                                                            <SelectItem value='O'>Out</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.inOutFlag && <FormError>{errors.inOutFlag.message}</FormError>}
                                                </div>
                                            )}
                                        />
                                    </td>
                                    <td className='min-w-[250px] p-4'>
                                        <Controller
                                            name='remarks'
                                            control={control}
                                            render={({ field }) => (
                                                <Textarea
                                                    placeholder='Remarks....'
                                                    {...field}
                                                    className='min-h-[80px] resize-none border-gray-300 transition-colors focus:border-blue-500'
                                                />
                                            )}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add to Cart Buttons */}
                <div className='my-8 flex justify-center gap-4'>
                    <Button
                        type='button'
                        onClick={addToCart}
                        className=' flex h-10 w-fit items-center gap-2 rounded-sm font-bold text-[12px] text-white uppercase shadow-sm'>
                        <Plus className='h-4 w-4 stroke-[3px]' />
                        ADD TO CART
                    </Button>
                    <Button
                        type='button'
                        onClick={resetLogsHandler}
                        className=' flex h-10 w-fit items-center gap-2 rounded-sm px-6 font-bold text-[12px] text-white uppercase shadow-sm'>
                        <X className='h-4 w-4 stroke-[3px]' />
                        CANCEL
                    </Button>
                </div>

                {/* Existing Logs (Punch Details) - Visible ONLY if needed, or keeping it separate
        {watchedEmployee &&
          (punchDetailsData as any)?.data?.length > 0 &&
          !cartLogs.length && (
            <CollapsibleSection
              title="EXISTING LOGS"
              defaultOpen={false}
              className=""
            >
              <div className="p-4">
                <table className="w-full text-sm border-collapse bg-white rounded-md overflow-hidden shadow-sm">
                  <thead className="bg-gray-600 text-white">
                    <tr>
                      <th className="border p-2">SL. No.</th>
                      <th className="border p-2">Time</th>
                      <th className="border p-2">IN / OUT</th>
                      <th className="border p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(punchDetailsData as any).data.map(
                      (punch: any, index: number) => (
                        <tr key={punch.foepD_Id} className="text-center">
                          <td className="border p-2">{index + 1}</td>
                          <td className="border p-2 font-bold">
                            {punch.foepD_PunchTime}
                          </td>
                          <td className="border p-2 font-bold">
                            {punch.foepD_InOutFlg === "I" ? "IN" : "OUT"}
                          </td>
                          <td className="border p-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => setDeleteId(punch.foepD_Id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </CollapsibleSection>
          )} */}

                {/* CART DETAILS Section */}

                {cartLogs.length > 0 && (
                    <div>
                        {/* Cart Details */}
                        <div className='overflow-hidden rounded-md border border-blue-200 bg-white shadow-md'>
                            <div className=' flex items-center justify-between px-4 py-2 text-black'>
                                <h2 className='font-bold text-sm uppercase tracking-wide'>CART DETAILS</h2>
                            </div>

                            <div className='overflow-x-auto p-0'>
                                <table className='w-full border-collapse'>
                                    <thead>
                                        <tr className='bg-violet-600 text-white'>
                                            <th className='w-[60px] border-blue-400 border-r px-2 py-2 text-center font-bold text-[12px]'>
                                                Sl.No
                                            </th>
                                            <th className='border-blue-400 border-r px-4 py-2 text-center font-bold text-[12px]'>
                                                Employee Name
                                            </th>
                                            <th className='border-blue-400 border-r px-4 py-2 text-center font-bold text-[12px]'>In/Out</th>
                                            <th className='border-blue-400 border-r px-4 py-2 text-center font-bold text-[12px]'>Date</th>
                                            <th className='border-blue-400 border-r px-4 py-2 text-center font-bold text-[12px]'>Time</th>
                                            <th className='border-blue-400 border-r px-4 py-2 text-center font-bold text-[12px]'>
                                                Remarks
                                            </th>
                                            <th className='px-4 py-2 text-center font-bold text-[12px]'>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className='bg-white'>
                                        {cartLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className='p-8 text-center text-gray-400 italic'>
                                                    Cart is empty. Add logs above.
                                                </td>
                                            </tr>
                                        ) : (
                                            cartLogs.map((log, index) => (
                                                <tr key={log.id} className='text-sm transition-colors hover:bg-blue-50'>
                                                    <td className='border p-2 text-center font-medium text-gray-600'>{index + 1}</td>
                                                    <td className='border p-2 text-center font-semibold text-gray-800'>
                                                        {log.employeeName}
                                                    </td>
                                                    <td className='border p-2 text-center font-bold text-blue-700'>{log.inOutFlag}</td>
                                                    <td className='border p-2 text-center text-gray-700'>
                                                        {format(log.foeP_PunchDate, 'eee MMM dd yyyy')}
                                                    </td>
                                                    <td className='border p-2 text-center font-bold text-gray-800'>
                                                        {log.foepD_PunchTime}
                                                    </td>
                                                    <td className='border p-2 px-4 text-gray-600'>{log.remarks}</td>
                                                    <td className='border p-2 text-center'>
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            className='h-8 w-8 text-red-500 hover:bg-red-50'
                                                            onClick={() => removeFromCart(log.id)}>
                                                            <Trash2 className='h-4 w-4' />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Final Action Buttons */}
                        <div className='my-4 flex justify-center gap-4'>
                            <Button
                                type='button'
                                onClick={onSubmit}
                                disabled={isPending || cartLogs.length === 0}
                                className='flex h-10 w-fit items-center gap-2 rounded-sm px-8 font-bold text-[12px] text-white uppercase shadow-md'>
                                {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <Save className='h-4 w-4' />}
                                SAVE
                            </Button>
                            <Button
                                type='button'
                                onClick={resetCartHandler}
                                className='flex h-10 w-fit items-center gap-2 rounded-sm px-8 font-bold text-[12px] text-white uppercase shadow-md'>
                                <X className='h-4 w-4' />
                                CANCEL
                            </Button>
                        </div>
                    </div>
                )}
            </CollapsibleSection>
        </div>
    );
}
