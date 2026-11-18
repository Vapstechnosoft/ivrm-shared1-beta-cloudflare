'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DateField } from '@/components/ui/dateField';
import { DaySelectionCheckbox } from '@/components/ui/day-selection-checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    useEmployeeShiftMappingHolidayTypes,
    useHolidayDatesForDays,
    useMasterHoliday
} from '@/hooks/hrms/attendance-management/useMasters';
import { useLeaveYearDropdown, useMasterDepartment } from '@/hooks/hrms/useMasters';
import { hrmsMasterSchemas } from '@/schemas/hrms/masters';
import { addOrUpdateMasterHoliday } from '@/server/hrms/attendance-management/masters/master-holiday';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Save } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof hrmsMasterSchemas.masterHoliday.add>;

interface AddMasterHolidayFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterHolidayForm({ onSuccess, className = '' }: AddMasterHolidayFormProps) {
    const { refetchAll } = useMasterHoliday();
    const { data: departmentData } = useMasterDepartment();
    const { data: leaveYearData } = useLeaveYearDropdown();
    const holidayTypeQuery = useEmployeeShiftMappingHolidayTypes();
    const { data: holidayTypeData, error: holidayTypeError, status: holidayTypeStatus } = holidayTypeQuery;

    useEffect(() => {
        if (holidayTypeStatus === 'error') {
            console.error('❌ [HOLIDAY TYPE ERROR]:', holidayTypeError);
        }
    }, [holidayTypeError, holidayTypeStatus]);
    // Mapping Leave Year options
    const leaveYearOptions = useMemo(() => {
        const rawData = leaveYearData as any;
        if (!rawData) return [];
        const list = Array.isArray(rawData) ? rawData : Array.isArray(rawData.data) ? rawData.data : [];

        return list.map((year: any) => ({
            label: year.hrmlY_LeaveYear || '',
            value: String(year.hrmlY_Id || '')
        }));
    }, [leaveYearData]);

    // Get departments from API
    const departmentOptions = useMemo(() => {
        if (!departmentData?.data) return [];
        const data = Array.isArray(departmentData.data) ? departmentData.data : (departmentData.data as any)?.report_list || [];
        return data
            .filter((dept: { hrmD_ActiveFlag?: boolean }) => dept.hrmD_ActiveFlag)
            .map((dept: { hrmD_DepartmentName?: string; hrmD_Id?: number }) => ({
                label: dept.hrmD_DepartmentName || '',
                value: String(dept.hrmD_Id || '')
            }))
            .filter((dept: { label: string; value: string }) => dept.label && dept.value);
    }, [departmentData]);

    const holidayTypeOptions = useMemo(() => {
        // Robust response handling
        const rawData = holidayTypeData as any;
        if (!rawData) return [];

        let list = [];
        if (Array.isArray(rawData)) {
            list = rawData;
        } else if (rawData.data && Array.isArray(rawData.data)) {
            list = rawData.data;
        } else if (rawData.data && rawData.data.$values && Array.isArray(rawData.data.$values)) {
            list = rawData.data.$values;
        } else if (rawData.$values && Array.isArray(rawData.$values)) {
            list = rawData.$values;
        }

        return list
            .map((type: any) => ({
                label: type.value || type.Value || '',
                value: String(type.key || type.Key || ''),
                name: type.value || type.Value || ''
            }))
            .filter((opt: any) => opt.value && opt.value !== 'undefined');
    }, [holidayTypeData]);

    const leaveYearId = useId();
    const departmentId = useId();
    const holidayTypeId = useId();
    const selectedDaysId = useId();
    const startDateId = useId();
    const endDateId = useId();
    const holidayNameId = useId();
    const remarksId = useId();

    const {
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(hrmsMasterSchemas.masterHoliday.add),
        mode: 'onChange',
        defaultValues: {
            day_flag: true,
            selectedDaysDate: [],
            fomhwdD_ToDate: '',
            fO_Start_Date: '',
            fomhwD_HolidayWDName: '',
            fO_Remark: '',
            fohwdT_Id: 0,
            hrmlY_Id: 0,
            hrmD_Id: 0,
            calendarYear: '',
            selectedDays: []
        }
    });

    const hrmlY_Id = watch('hrmlY_Id');
    const selectedDays = watch('selectedDays') || [];
    const day_flag = watch('day_flag');
    const fohwdT_Id = watch('fohwdT_Id');

    // Handle holiday type change logic from legacy
    useEffect(() => {
        if (fohwdT_Id && holidayTypeOptions.length > 0) {
            const selectedType = holidayTypeOptions.find(
                (o: { label: string; value: string; name: string }) => o.value === String(fohwdT_Id)
            );
            if (selectedType) {
                const typeName = selectedType.name.toUpperCase();
                const isDateBased = typeName === 'PUBLIC HOLIDAY' || typeName === 'WEEK END' || typeName === 'PAID HOLIDAY';

                if (isDateBased) {
                    setValue('day_flag', false);
                    setValue('selectedDays', []);
                    setValue('selectedDaysDate', []);
                } else {
                    setValue('day_flag', true);
                    setValue('fO_Start_Date', '');
                    setValue('fomhwdD_ToDate', '');
                    setValue('fomhwD_HolidayWDName', '');
                    setValue('fO_Remark', '');
                }
            }
        }
    }, [fohwdT_Id, holidayTypeOptions, setValue]);

    // Call API when days are selected
    const { data: datesData, isLoading: isLoadingDates } = useHolidayDatesForDays(
        hrmlY_Id && selectedDays.length > 0 && day_flag
            ? {
                  hrmlY_Id: Number(hrmlY_Id),
                  days: selectedDays.join(',')
              }
            : undefined,
        true
    );

    // Parse dates from API response
    const holidayDates = useMemo(() => {
        if (!datesData?.data) return [];
        return datesData.data.map((item: any, index: number) => ({
            id: item.date ? `${item.date}_${item.dayname || index}` : `date_${index}`,
            dayname: item.dayname || '',
            date: item.date || ''
        }));
    }, [datesData]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Reset page when data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [holidayDates]);

    const totalPages = Math.ceil(holidayDates.length / pageSize);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return holidayDates.slice(start, start + pageSize);
    }, [holidayDates, currentPage, pageSize]);

    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRows(new Set(holidayDates.map((item: any) => item.id)));
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleRowSelect = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedRows);
        if (checked) newSelected.add(id);
        else newSelected.delete(id);
        setSelectedRows(newSelected);
    };

    // Update selectedDaysDate in form state whenever selectedRows changes
    useEffect(() => {
        const selectedData = holidayDates
            .filter((item: any) => selectedRows.has(item.id))
            .map((item: any) => ({ date: item.date, dayname: item.dayname }));
        setValue('selectedDaysDate', selectedData);
    }, [selectedRows, holidayDates, setValue]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            // The new API expects keys matching the form fields (mostly lowercase)
            const payload = {
                ...data,
                fohwdT_Id: Number(data.fohwdT_Id),
                hrmlY_Id: Number(data.hrmlY_Id),
                hrmD_Id: Number(data.hrmD_Id) || 0,
                // Ensure dates are stringified if present and formatted without 'Z' to avoid backend conversion issues
                fO_Start_Date: data.fO_Start_Date ? format(new Date(data.fO_Start_Date), "yyyy-MM-dd'T'HH:mm:ss.SSS") : undefined,
                fomhwdD_ToDate: data.fomhwdD_ToDate ? format(new Date(data.fomhwdD_ToDate), "yyyy-MM-dd'T'HH:mm:ss.SSS") : undefined
            };

            const response = await addOrUpdateMasterHoliday(payload);
            if (response?.success) {
                toast.success(response?.message || 'Master holiday saved successfully');
                reset();
                setSelectedRows(new Set());
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to save master holiday');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to save master holiday');
        }
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label htmlFor={leaveYearId}>
                                Calendar Year <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='hrmlY_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select value={String(field.value)} onValueChange={field.onChange}>
                                        <SelectTrigger id={leaveYearId}>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {leaveYearOptions.map((opt: any) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.hrmlY_Id && <FormError>{errors.hrmlY_Id.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor={departmentId}>Department</Label>
                            <Controller
                                name='hrmD_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select value={String(field.value)} onValueChange={field.onChange}>
                                        <SelectTrigger id={departmentId}>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='0'>All</SelectItem>
                                            {departmentOptions.map((dept: any) => (
                                                <SelectItem key={dept.value} value={dept.value}>
                                                    {dept.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor={holidayTypeId}>
                                Holiday Type <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='fohwdT_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select value={String(field.value || '')} onValueChange={(val) => field.onChange(Number(val))}>
                                        <SelectTrigger id={holidayTypeId}>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {holidayTypeOptions.map((type: { label: string; value: string; name: string }) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.fohwdT_Id && <FormError>{errors.fohwdT_Id.message}</FormError>}
                        </div>

                        {day_flag && (
                            <div className='space-y-2'>
                                <Label htmlFor={selectedDaysId}>
                                    Select Day <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='selectedDays'
                                    control={control}
                                    render={({ field }) => (
                                        <DaySelectionCheckbox
                                            id={selectedDaysId}
                                            label='Select Day'
                                            selectedDays={field.value || []}
                                            onDaysChange={field.onChange}
                                            checked={(field.value || []).length > 0}
                                        />
                                    )}
                                />
                                {errors.selectedDays && <FormError>{errors.selectedDays.message}</FormError>}
                            </div>
                        )}
                    </div>

                    {!day_flag && (
                        <div className='space-y-4'>
                            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                <div className='space-y-2'>
                                    <Label htmlFor={startDateId}>
                                        Start Date <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='fO_Start_Date'
                                        control={control}
                                        render={({ field, fieldState }) => <DateField field={field} fieldState={fieldState} label='' />}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor={endDateId}>
                                        End Date <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='fomhwdD_ToDate'
                                        control={control}
                                        render={({ field, fieldState }) => <DateField field={field} fieldState={fieldState} label='' />}
                                    />
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor={holidayNameId}>
                                    Holiday Name <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='fomhwD_HolidayWDName'
                                    control={control}
                                    render={({ field }) => (
                                        <InputText {...field} id={holidayNameId} placeholder='Enter holiday name' maxLength={30} />
                                    )}
                                />
                                {errors.fomhwD_HolidayWDName && <FormError>{errors.fomhwD_HolidayWDName.message}</FormError>}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor={remarksId}>
                                    Remarks <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='fO_Remark'
                                    control={control}
                                    render={({ field }) => <InputTextarea {...field} id={remarksId} placeholder='Enter remarks' />}
                                />
                                {errors.fO_Remark && <FormError>{errors.fO_Remark.message}</FormError>}
                            </div>
                        </div>
                    )}
                </div>

                {day_flag && selectedDays.length > 0 && (
                    <div className='space-y-4 rounded-md border border-input bg-background p-4'>
                        <h3 className='font-semibold text-sm'>Holiday List</h3>
                        {isLoadingDates ? (
                            <div className='py-4 text-center'>Loading dates...</div>
                        ) : holidayDates.length === 0 ? (
                            <div className='py-4 text-center'>No dates found for selected days in this year.</div>
                        ) : (
                            <div className='space-y-4'>
                                <div className='max-h-[400px] overflow-x-auto overflow-y-auto rounded-md border'>
                                    <Table>
                                        <TableHeader className='sticky top-0 z-10 bg-background'>
                                            <TableRow>
                                                <TableHead className='w-12'>
                                                    <Checkbox
                                                        checked={holidayDates.length > 0 && selectedRows.size === holidayDates.length}
                                                        onCheckedChange={handleSelectAll}
                                                    />
                                                </TableHead>
                                                <TableHead>Day Name</TableHead>
                                                <TableHead>Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedData.map((item: any) => (
                                                <TableRow key={item.id} className={selectedRows.has(item.id) ? 'bg-muted/50' : ''}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedRows.has(item.id)}
                                                            onCheckedChange={(checked) => handleRowSelect(item.id, !!checked)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{item.dayname}</TableCell>
                                                    <TableCell>{item.date ?? '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination Footer */}
                                <div className='flex items-center justify-between rounded-md border bg-muted/20 px-2 py-1 text-xs'>
                                    <div className='text-muted-foreground'>
                                        Showing {Math.min((currentPage - 1) * pageSize + 1, holidayDates.length)} to{' '}
                                        {Math.min(currentPage * pageSize, holidayDates.length)} of {holidayDates.length} entries
                                    </div>
                                    <div className='flex items-center space-x-4'>
                                        <div className='flex items-center space-x-2'>
                                            <span className='text-muted-foreground'>Rows per page:</span>
                                            <Select value={String(pageSize)} onValueChange={(val) => setPageSize(Number(val))}>
                                                <SelectTrigger className='h-7 w-16 border-none bg-transparent shadow-none hover:bg-muted/50 focus:ring-0'>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[10, 20, 30, 50].map((size) => (
                                                        <SelectItem key={size} value={String(size)}>
                                                            {size}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='flex items-center space-x-1'>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                className='h-7 w-7'
                                                onClick={() => setCurrentPage(1)}
                                                disabled={currentPage === 1}>
                                                <ChevronsLeft className='h-4 w-4' />
                                            </Button>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                className='h-7 w-7'
                                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}>
                                                <ChevronLeft className='h-4 w-4' />
                                            </Button>
                                            <span className='px-2'>
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                className='h-7 w-7'
                                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}>
                                                <ChevronRight className='h-4 w-4' />
                                            </Button>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                className='h-7 w-7'
                                                onClick={() => setCurrentPage(totalPages)}
                                                disabled={currentPage === totalPages}>
                                                <ChevronsRight className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {errors.selectedDaysDate && <FormError>{errors.selectedDaysDate.message}</FormError>}
                    </div>
                )}

                <div className='flex justify-start gap-3 border-t pt-4'>
                    <Button type='button' variant='outline' onClick={() => reset()} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting}>
                        <Save className='mr-2 h-4 w-4' /> Save
                    </Button>
                </div>
            </form>
        </div>
    );
}
