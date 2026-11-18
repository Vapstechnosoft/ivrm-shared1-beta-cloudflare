'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { feesTrailAuditReportSchema } from '@/schemas/fees/reports';
import { getStudentandReceiptDropDown, getStudentandReceiptReport } from '@/server/fees/reports/feetrailauditreport';
import type { IFeeTrailAuditReport, IFeeTrailAuditReportforExcel } from '@/types/fees/reports/reports';
import type { IAcademicYear } from '@/types/staff-portal/classwork';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof feesTrailAuditReportSchema>;

export default function FeeTrailAuditReport() {
    type catg = 'receipt' | 'studentttt' | 'date';
    const userTypeOptions: { label: string; value: catg }[] = [
        { label: 'Receipt wise', value: 'receipt' },
        { label: 'Student Wise', value: 'studentttt' },
        { label: 'Date Wise', value: 'date' }
    ];
    type Status = 'IU' | 'D';
    const statusTypeOptions: { label: string; value: Status }[] = [
        { label: 'Save/Update', value: 'IU' },
        { label: 'Delete', value: 'D' }
    ];
    const [filters, setFilters] = useState({
        fromDate: new Date(),
        toDate: new Date()
    });

    const {
        handleSubmit,
        control,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feesTrailAuditReportSchema),
        defaultValues: {
            radio_val: 'receipt',
            statusType: 'IU',
            academicYearId: undefined
        }
    });
    const [studentSearch, setStudentSearch] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<IFeeTrailAuditReport | null>(null);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [update, setUpdate] = useState(true);
    const [save, setSave] = useState(true);
    const [user, setUser] = useState(false);
    const [students, setStudents] = useState<IFeeTrailAuditReport[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [reportData, setReportData] = useState<IFeeTrailAuditReportforExcel[]>([]);

    // Hooks
    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();

    useEffect(() => {
        if (academicError) {
            toast.error(academicError?.message || 'Failed to load academic years');
            setAcademicYears([]);
            return;
        }
        if (academicData?.data && Array.isArray(academicData.data)) {
            const formatted: IAcademicYear[] = academicData.data.map((item: any) => ({
                asmaY_Id: item.asmaY_Id ?? '',
                asmaY_Year: item.asmaY_Year ?? 'Unknown Year',
                asmaY_Order: item.asmaY_Order ?? 0
            }));
            setAcademicYears(formatted);
        }
    }, [academicData, academicError]);

    const radio_val = watch('radio_val');
    const academicYearId = watch('academicYearId');
    const statusType = watch('statusType');

    const handlePrint = () => {
        // const selected = reportData.filter((row) => selectedIds.includes(row.id));
        // if (!selected || selected.length === 0) {
        //   toast.error("No data selected to print");
        //   return;
        // }
        // const columnHeaders = [
        //   "SLNO",
        //   "Adm. NO.",
        //   "Student Name",
        //   "Class",
        //   "Section",
        //   "Roll No.",
        //   "Fee Group",
        //   ...(amntchecked ? ["Amount"] : []),
        // ];
        // const printableRows = selected.map((row, index) => {
        //   const baseRow = {
        //     SLNO: index + 1,
        //     "Adm. NO.": row.amsT_AdmNo || "",
        //     "Student Name": row.amsT_FirstName || "",
        //     Class: row.asmcL_ClassName || "",
        //     Section: row.asmC_SectionName || "",
        //     "Roll No.": row.amaY_RollNo || "",
        //     "Fee Group": row.fmG_GroupName || "",
        //   };
        //   if (amntchecked) {
        //     return {
        //       ...baseRow,
        //       Amount: row.amount || 0,
        //     };
        //   }
        //   return baseRow;
        // });
        // printTable(columnHeaders, printableRows, "Fee Group Wise Students Report");
    };
    const handleExportExcel = () => {
        const rowsToExport = reportData.filter((r) => selectedIds.includes(r.id));

        if (!rowsToExport || rowsToExport.length === 0) {
            toast.error('No data selected to export');
            return;
        }

        // exportToExcel(rowsToExport, "Fee Group Wise Students Report", amntchecked);
    };

    useEffect(() => {
        if (!studentSearch.trim()) {
            setStudents([]);
            return;
        }

        const fetchStudents = async () => {
            setLoadingStudents(true);
            try {
                const studentsArray = await getStudentandReceiptDropDown(radio_val, studentSearch, Number(academicYearId));
                const studentsData = JSON.parse(JSON.stringify(studentsArray.data || []));
                setStudents(studentsData || []);
            } catch (error) {
                console.error('Failed to fetch students:', error);
                setStudents([]);
            } finally {
                setLoadingStudents(false);
            }
        };

        fetchStudents();
    }, [studentSearch]);
    const toggleAllstudents = () => {
        if (selectedIds.length === reportData.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(reportData.map((r) => r.id));
        }
    };
    const toggleRow = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };
    useEffect(() => {
        setStudentSearch('');
        setSelectedStudent(null);
        // setSave(false);
        // setUpdate(false);
        setFilters((prev) => ({
            ...prev,
            fromDate: new Date(),
            toDate: new Date()
        }));
    }, [radio_val, academicYearId]);

    const handleCheckboxChange = (checked: boolean, type: 'save' | 'update') => {
        if (type === 'save') {
            setSave(checked);
            if (!save === false && update === false) {
                setUpdate(true);
            }
        } else if (type === 'update') {
            setUpdate(checked);
            if (!update === false && save === false) {
                setSave(true);
            }
        }
    };
    const onSubmit: SubmitHandler<FormFields> = async () => {
        try {
            if (radio_val === 'studentttt' || radio_val === 'receipt') {
                if (!selectedStudent) {
                    toast.error('Please select a student/Receipt No.');
                    return;
                }
            }

            let payload = {};
            payload = {
                report_Type: radio_val,
                amst_Id: radio_val === 'studentttt' ? selectedStudent?.amst_Id : 0,
                save_flag: statusType === 'IU' ? save : false,
                update_flag: statusType === 'IU' ? update : false,
                status_IU_D: statusType,
                receiptNo: radio_val === 'receipt' ? (selectedStudent?.fyP_Receipt_No ?? '') : '',
                fromdate: filters.fromDate.toISOString().split('T')[0],
                todate: filters.toDate.toISOString().split('T')[0],
                user_Status: user
            };
            const reportArray = await getStudentandReceiptReport(payload);
            const report = reportArray.data ?? [];
            const mapApiToReportRows = (apiData: any[]): IFeeTrailAuditReportforExcel[] => {
                return apiData.map((item, index) => ({
                    id: index + 1,
                    amount: item.amount,
                    amsT_SOL: item.amsT_SOL,
                    amsT_Id: item.amsT_Id,
                    amsT_FirstName: item.amsT_FirstName,
                    asmcL_ClassName: item.asmcL_ClassName,
                    asmC_SectionName: item.asmC_SectionName,
                    amsT_RegistrationNo: item.amsT_RegistrationNo,
                    amsT_AdmNo: item.amsT_AdmNo,
                    fmG_GroupName: item.fmG_GroupName,
                    amaY_RollNo: item.amaY_RollNo
                }));
            };
            const list = mapApiToReportRows(report);
            setReportData(list || []);
            if (list.length > 0) {
                toast.success(reportArray.message);
            } else {
                toast.info('No Data Found');
            }
            //    setReportData(report || []);
        } catch (error: any) {
            console.error('Error generating report:', error);
            toast.error(error.message || 'Failed to generate report');
            setReportData([]);
        } finally {
            //   setReportLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='p-8'>
                            <div className='space-y-8'>
                                <Card className='border bg-gray-50 p-5 shadow-sm'>
                                    <div className='flex flex-wrap items-center justify-center gap-10'>
                                        <Controller
                                            name='radio_val'
                                            control={control}
                                            render={({ field }) => (
                                                <div className='flex flex-wrap items-center justify-center gap-10'>
                                                    {userTypeOptions.map(({ label, value }) => (
                                                        <label key={value} className='flex cursor-pointer items-center gap-3'>
                                                            <input
                                                                type='radio'
                                                                name={field.name}
                                                                value={value}
                                                                checked={field.value === value}
                                                                onChange={() => field.onChange(value)}
                                                                className='h-5 w-5 accent-primary'
                                                            />
                                                            <span className='font-medium text-base'>{label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        />
                                    </div>
                                </Card>

                                <div className='flex items-center gap-12'>
                                    <div className='flex w-[420px] items-center gap-4'>
                                        <Label className='w-36 text-right'>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        <div className='flex-1'>
                                            <Controller
                                                name='academicYearId'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value?.toString()}
                                                        onValueChange={(v) => field.onChange(Number(v))}>
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue placeholder='--Select Academic Year--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {loadingAcademic ? (
                                                                <SelectItem value='loading' disabled>
                                                                    Loading academic years...
                                                                </SelectItem>
                                                            ) : academicYears.length === 0 ? (
                                                                <SelectItem value='nodata' disabled>
                                                                    No Result Found
                                                                </SelectItem>
                                                            ) : (
                                                                academicYears.map((item) => (
                                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                        {item.asmaY_Year}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.academicYearId && <FormError>{errors.academicYearId.message}</FormError>}
                                        </div>
                                    </div>

                                    <Card className='border bg-gray-50 p-5 shadow-sm'>
                                        <div className='flex flex-wrap items-center justify-center gap-10'>
                                            <Controller
                                                name='statusType'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='flex flex-wrap items-center justify-center gap-10'>
                                                        {statusTypeOptions.map(({ label, value }) => (
                                                            <label key={value} className='flex cursor-pointer items-center gap-3'>
                                                                <input
                                                                    type='radio'
                                                                    name={field.name}
                                                                    value={value}
                                                                    checked={field.value === value}
                                                                    onChange={() => field.onChange(value)}
                                                                    className='h-5 w-5 accent-primary'
                                                                />
                                                                <span className='font-medium text-base'>{label}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </Card>
                                </div>
                                <div className='flex items-center gap-12'>
                                    {radio_val === 'receipt' && (
                                        <div className='flex w-[420px] items-center gap-4'>
                                            <Label className='w-36 text-right'>
                                                Receipt <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='relative w-64'>
                                                <InputText
                                                    id='studentSearchInput'
                                                    type='text'
                                                    placeholder='Search Receipt...'
                                                    disabled={!academicYearId}
                                                    value={studentSearch}
                                                    onChange={(e) => {
                                                        setStudentSearch(e.target.value);
                                                        setSelectedStudent(null);
                                                    }}
                                                    className='flex rounded-md border border-gray-300 transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20'
                                                    autoComplete='off'
                                                />
                                                {studentSearch.trim() !== '' && !selectedStudent && (
                                                    <ul className='absolute top-full left-0 z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border bg-white shadow-md'>
                                                        {loadingStudents ? (
                                                            <li className='px-3 py-2 text-gray-500'>Loading...</li>
                                                        ) : students.length === 0 ? (
                                                            <li className='px-3 py-2 text-gray-500'>No Receipt found</li>
                                                        ) : (
                                                            students.map((student) => (
                                                                <li
                                                                    key={student.amst_Id}
                                                                    onClick={() => {
                                                                        setSelectedStudent(student);
                                                                        setStudentSearch(student.fyP_Receipt_No);
                                                                    }}
                                                                    className='cursor-pointer px-3 py-2 hover:bg-blue-100'>
                                                                    {student.fyP_Receipt_No}
                                                                </li>
                                                            ))
                                                        )}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {radio_val === 'studentttt' && (
                                        <div className='flex w-[420px] items-center gap-4'>
                                            <Label className='w-36 text-right'>
                                                Student <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='relative w-64'>
                                                <InputText
                                                    id='studentSearchInput'
                                                    type='text'
                                                    placeholder='Search student...'
                                                    disabled={!academicYearId}
                                                    value={studentSearch}
                                                    onChange={(e) => {
                                                        setStudentSearch(e.target.value);
                                                        setSelectedStudent(null);
                                                    }}
                                                    className='flex rounded-md border border-gray-300 transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20'
                                                    autoComplete='off'
                                                />
                                                {studentSearch.trim() !== '' && !selectedStudent && (
                                                    <ul className='absolute top-full left-0 z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border bg-white shadow-md'>
                                                        {loadingStudents ? (
                                                            <li className='px-3 py-2 text-gray-500'>Loading...</li>
                                                        ) : students.length === 0 ? (
                                                            <li className='px-3 py-2 text-gray-500'>No students found</li>
                                                        ) : (
                                                            students.map((student) => (
                                                                <li
                                                                    key={student.amst_Id}
                                                                    onClick={() => {
                                                                        setSelectedStudent(student);
                                                                        const stu = `${student.amsT_FirstName ?? ''} ${student.amsT_MiddleName ?? ''} ${student.amsT_LastName ?? ''}`;
                                                                        setStudentSearch(stu);
                                                                    }}
                                                                    className='cursor-pointer px-3 py-2 hover:bg-blue-100'>
                                                                    {student.amsT_FirstName} {student.amsT_MiddleName}{' '}
                                                                    {student.amsT_LastName}
                                                                </li>
                                                            ))
                                                        )}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {radio_val === 'date' && (
                                        <div className='grid grid-cols-2 gap-8 pl-10'>
                                            <div className='flex flex-col'>
                                                <Label htmlFor='toDate' className='font-medium'>
                                                    To Date:
                                                </Label>
                                                <input
                                                    id='toDate'
                                                    type='date'
                                                    value={filters.toDate ? format(filters.toDate, 'yyyy-MM-dd') : ''}
                                                    onChange={(e) =>
                                                        setFilters((prev) => ({
                                                            ...prev,
                                                            toDate: new Date(e.target.value)
                                                        }))
                                                    }
                                                    className='rounded border px-3 py-1'
                                                />
                                            </div>
                                            <div className='flex flex-col'>
                                                <Label htmlFor='fromDate' className='font-medium'>
                                                    From Date:
                                                </Label>
                                                <input
                                                    id='fromDate'
                                                    type='date'
                                                    value={filters.fromDate ? format(filters.fromDate, 'yyyy-MM-dd') : ''}
                                                    onChange={(e) =>
                                                        setFilters((prev) => ({
                                                            ...prev,
                                                            fromDate: new Date(e.target.value)
                                                        }))
                                                    }
                                                    className='rounded border px-3 py-1'
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {statusType === 'IU' && (
                                        <div className='grid grid-cols-2 gap-3 '>
                                            <div className='flex items-center space-x-2'>
                                                <Checkbox
                                                    checked={save}
                                                    onCheckedChange={(c: any) => handleCheckboxChange(c as boolean, 'save')}
                                                />
                                                <Label htmlFor='save' className='cursor-pointer text-sm'>
                                                    Save
                                                </Label>
                                            </div>

                                            <div className='flex items-center space-x-2'>
                                                <Checkbox
                                                    checked={update}
                                                    onCheckedChange={(c: any) => handleCheckboxChange(c as boolean, 'update')}
                                                />
                                                <Label htmlFor='update' className='cursor-pointer text-sm'>
                                                    Update
                                                </Label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {radio_val === 'date' && (
                                    <div className='pr-10 pl-10'>
                                        <Checkbox id='user' checked={user} onCheckedChange={(c: any) => setUser(c as boolean)} />
                                        <Label htmlFor='user' className='cursor-pointer text-sm'>
                                            User
                                        </Label>
                                    </div>
                                )}
                                <div>
                                    <div className='flex justify-end gap-4 border-t pt-8 pb-4'>
                                        <Button size='lg' variant='outline' className='px-12' onClick={() => window.location.reload()}>
                                            Cancel
                                        </Button>
                                        <Button type='submit' disabled={isSubmitting} className='px-12'>
                                            {isSubmitting ? 'Generating...' : 'Report'}
                                        </Button>
                                    </div>

                                    {reportData.length > 0 && (
                                        <CollapsibleSection defaultOpen={true}>
                                            <div className='rounded-lg border bg-white shadow-xl'>
                                                <div className='flex items-center justify-between border-b bg-gray-50 px-8 py-4'>
                                                    <h2 className='whitespace-nowrap font-bold text-2xl text-primary'>
                                                        Fee Trail Audit Report
                                                    </h2>
                                                    <div className='flex gap-2'>
                                                        <Button size='sm' className='h-8 px-3 text-xs' onClick={handleExportExcel}>
                                                            Export Excel
                                                        </Button>
                                                        <Button
                                                            size='sm'
                                                            variant='outline'
                                                            className='h-8 px-3 text-xs'
                                                            onClick={handlePrint}>
                                                            Export PDF
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className='overflow-x-auto px-8 pb-8'>
                                                    <table className='w-full border-collapse border border-gray-300 text-sm'>
                                                        <thead className='bg-primary text-white'>
                                                            <tr>
                                                                <th className='p-2 text-center'>
                                                                    <Checkbox
                                                                        checked={
                                                                            selectedIds.length === reportData.length &&
                                                                            reportData.length > 0
                                                                        }
                                                                        // indeterminate={
                                                                        //   selectedIds.length > 0 &&
                                                                        //   selectedIds.length < reportData.length
                                                                        // }
                                                                        onCheckedChange={toggleAllstudents}
                                                                    />
                                                                </th>
                                                                <th className='border px-2 py-2 text-center font-semibold'>Sl No</th>
                                                                <th className='border px-2 py-2 text-center font-semibold'>Student Name</th>
                                                                <th className='border px-2 py-2 text-center font-semibold'>Adm. NO.</th>
                                                                <th className='border px-2 py-2 text-center font-semibold'>Class</th>
                                                                <th className='border px-2 py-2 text-center font-semibold'>Section</th>
                                                                <th className='border px-2 py-2 text-center font-semibold'>Amount</th>

                                                                <th className='border px-2 py-2 text-center font-semibold'>Date</th>
                                                                <th className='border px-2 py-2 text-center font-semibold'>Time</th>
                                                                <th className='border px-2 py-2 text-center font-semibold'>Status</th>
                                                                <th className='border px-2 py-2 text-center font-semibold'>ip Adsress</th>
                                                                <th className='border px-2 py-2 text-center font-semibold'>mac Adsress</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {reportData.map((row, index) => (
                                                                <tr key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                    <td className='p-2 text-center'>
                                                                        <Checkbox
                                                                            checked={selectedIds.includes(row.id)}
                                                                            onCheckedChange={() => toggleRow(row.id)}
                                                                        />
                                                                    </td>
                                                                    <td className='border px-2 py-2 text-center'>{index + 1}</td>

                                                                    <td className='border px-2 py-2 text-right'>
                                                                        {row.amsT_FirstName || '-'}
                                                                    </td>
                                                                    <td className='border px-2 py-2 text-left'>{row.amsT_AdmNo}</td>
                                                                    <td className='border px-2 py-2 text-right'>
                                                                        {row.asmcL_ClassName?.toLocaleString() || '-'}
                                                                    </td>
                                                                    <td className='border px-2 py-2 text-right'>
                                                                        {row.asmC_SectionName?.toLocaleString() || '-'}
                                                                    </td>
                                                                    <td className='border px-2 py-2 text-right'>
                                                                        {row.amount?.toLocaleString() || '-'}
                                                                    </td>
                                                                    <td className='border px-2 py-2 text-right'>{'-'}</td>
                                                                    <td className='border px-2 py-2 text-right'>{'-'}</td>
                                                                    <td className='border px-2 py-2 text-right'>{'-'}</td>
                                                                    <td className='border px-2 py-2 text-right'>{'-'}</td>
                                                                    <td className='border px-2 py-2 text-right'>{'-'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </CollapsibleSection>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </form>
        </div>
    );
}
