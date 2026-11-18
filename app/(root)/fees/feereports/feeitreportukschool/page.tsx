'use client';

import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { feeReceiptLogo, useStudentDropDown } from '@/hooks/fees/useReports';
import { feeItReportUKSchool } from '@/schemas/fees/reports';
import { feeItReceipt, studentFilterDropDown } from '@/server/fees/reports/fee_it_report_ukschool';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof feeItReportUKSchool>;

interface IAcademicYear {
    asmaY_Id: string | number;
    asmaY_Year: string;
    asmaY_Order?: number;
}

interface IStudentData {
    amst_Id: number;
    amsT_FirstName: string;
    amsT_MiddleName?: string;
    amsT_LastName: string;
}
interface ReportData {
    studentsnames: Studentsname[];
    reportdatelist: Reportdatelist[];
}

interface Studentsname {
    stuname: string;
    amsT_RegistrationNo: string;
    amsT_AdmNo: string;
    amsT_DOB: string;
    fatherName: string;
    motherName: string;
    asmaY_Year: string;
    className: string;
    sectionName: string;
    clientName: string;
    insAddress: string;
}

interface Reportdatelist {
    recpNo: string;
    dateOfRecp: string;
    remarks: string;
    tot: number;
    amsT_Id: number;
    amsT_FirstName: string;
}

export default function FeeItReportUKSchool() {
    const {
        handleSubmit,
        control,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeItReportUKSchool),
        defaultValues: {
            studentId: undefined,
            academicYearId: undefined,
            Date: new Date().toISOString().split('T')[0],
            fathername: false,
            mothername: false,
            className: false
        }
    });

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [studentDataList, setstudentData] = useState<IStudentData[]>([]);
    const [showReport, setShowReport] = useState(false);
    const [receiptReports, setReceiptReports] = useState<ReportData | null>(null);
    const [logodata, setlogodata] = useState('');
    const [filters, setFilters] = useState({
        userType: '' as 'Name : Reg.No' | 'Reg.No : Name'
    });
    const printRef = useRef<HTMLDivElement>(null);
    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();

    const { data: studentData, isLoading: loadingStudent, error: studentError } = useStudentDropDown();
    const { data: logoResponse, error: logoerror } = feeReceiptLogo();

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
    useEffect(() => {
        if (studentError) {
            toast.error(studentError?.message || 'Failed to load Student Data');
            setstudentData([]);
            return;
        }
        if (studentData?.data && Array.isArray(studentData.data)) {
            const formatted: IStudentData[] = studentData.data.map((item: any) => ({
                amsT_FirstName: item.amsT_FirstName ?? '',
                amst_Id: item.amst_Id ?? 0,
                amsT_MiddleName: item.amsT_MiddleName ?? '',
                amsT_LastName: item.amsT_LastName ?? ''
            }));
            setstudentData(formatted);
        }
    }, [studentData, studentError]);

    useEffect(() => {
        if (logoerror) {
            toast.error(logoerror.message || 'Failed to load logo');
            return;
        }

        if (logoResponse) {
            try {
                // Convert to JSON in case it's a string
                const parsed = typeof logoResponse === 'string' ? JSON.parse(logoResponse) : logoResponse;

                if (parsed?.data) {
                    setlogodata(parsed.data);
                }
            } catch (err) {
                console.error('Failed to parse logo response', err);
            }
        }
    }, [logoResponse, logoerror]);

    useEffect(() => {
        if (!filters.userType) return;
        const filterStudents = async () => {
            try {
                const studentsArray = await studentFilterDropDown(
                    filters.userType === 'Name : Reg.No' ? 'NameRegNo' : filters.userType === 'Reg.No : Name' ? 'RegNoName' : ''
                );
                const studentsData = JSON.parse(JSON.stringify(studentsArray.data || []));
                setstudentData(studentsData || []);
            } catch (error) {
                console.error('Failed to fetch students:', error);
                setstudentData([]);
            }
        };

        filterStudents();
    }, [filters.userType]);

    const uniqueStudentDataList = studentDataList.filter(
        (student, index, self) => index === self.findIndex((s) => s.amst_Id === student.amst_Id)
    );
    const fatherName = watch('fathername');
    //   const motherName = watch("mothername");
    //   const className = watch("className");
    const handlePrint = () => {
        if (!printRef.current) return;

        const printContent = printRef.current.innerHTML;

        // Create print window
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
      <html>
        <head>
          <title>Fee Receipt Report</title>
          <style>
            @media print {
              body {
                margin: 0;
                padding: 20px;
              }
              .print-break {
                page-break-before: always;
              }
              table {
                border-collapse: collapse;
                width: 100%;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f3f4f6;
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        setShowReport(false);
        try {
            const apiData = await feeItReceipt(Number(data.studentId), Number(data.academicYearId));
            const responseJson = typeof apiData === 'string' ? JSON.parse(apiData) : apiData;

            if (responseJson?.data) {
                // Store the COMPLETE data object
                setReceiptReports(responseJson.data);
                setShowReport(true);
                toast.success('Report Generated Successfully');
            }
        } catch (error: any) {
            console.error('Error generating report:', error);
            toast.error(error.message || 'Failed to generate report');
            setShowReport(false);
        }
    };

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='place-items-center p-8'>
                            <div className='space-y-8'>
                                <div className='flex items-center gap-12'>
                                    {(['Name : Reg.No', 'Reg.No : Name'] as const).map((type) => (
                                        <label key={type} className='flex cursor-pointer items-center gap-3'>
                                            <input
                                                type='radio'
                                                name='userType'
                                                checked={filters.userType === type}
                                                onChange={() => setFilters((prev) => ({ ...prev, userType: type }))}
                                                className='h-5 w-5 text-primary'
                                            />
                                            <span className='font-medium text-base'>{type}</span>
                                        </label>
                                    ))}

                                    <div className='flex w-[420px] items-center gap-4'>
                                        <Label className='w-36 text-right'>
                                            Student Name <span className='text-red-500'>*</span>
                                        </Label>

                                        <div className='flex-1'>
                                            <Controller
                                                name='studentId'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value?.toString()}
                                                        onValueChange={(v) => field.onChange(Number(v))}>
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue placeholder='--Select Student Name--' />
                                                        </SelectTrigger>

                                                        <SelectContent>
                                                            {loadingStudent ? (
                                                                <SelectItem value='loading' disabled>
                                                                    Loading...
                                                                </SelectItem>
                                                            ) : (
                                                                uniqueStudentDataList.map((item: IStudentData) => (
                                                                    <SelectItem key={item.amst_Id} value={item.amst_Id.toString()}>
                                                                        {filters.userType === 'Name : Reg.No'
                                                                            ? `${item.amsT_FirstName ?? ''} ${item.amsT_MiddleName ?? ''} ${item.amsT_LastName ?? ''}`
                                                                            : filters.userType === 'Reg.No : Name'
                                                                              ? ` ${item.amsT_FirstName ?? ''} ${item.amsT_MiddleName ?? ''} ${item.amsT_LastName ?? ''}`
                                                                              : `${item.amsT_FirstName ?? ''} ${item.amsT_MiddleName ?? ''} ${item.amsT_LastName ?? ''}`}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.studentId && <FormError>{errors.studentId.message}</FormError>}
                                        </div>
                                    </div>
                                </div>

                                <div className='mt-4 flex items-center gap-12'>
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
                                                                    Loading...
                                                                </SelectItem>
                                                            ) : (
                                                                academicYears?.map((item: any) => (
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

                                    <div className='flex w-[420px] items-center gap-4'>
                                        <Label htmlFor='Date'>
                                            Date: <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='Date'
                                            control={control}
                                            render={({ field }) => (
                                                <div className='flex-1'>
                                                    <Input id='toDate' type='date' {...field} className='w-full rounded border px-3 py-1' />
                                                    {errors.Date && <FormError>{errors.Date.message}</FormError>}
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                                <Card>
                                    <div className='flex items-center justify-center gap-12 p-5'>
                                        <div className=' flex items-center gap-12'>
                                            <div className='flex items-center gap-3'>
                                                <Controller
                                                    name='fathername'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <input
                                                            type='checkbox'
                                                            checked={field.value ?? false}
                                                            onChange={(e) => field.onChange(e.target.checked)}
                                                            className='h-4 w-4'
                                                        />
                                                    )}
                                                />
                                                <Label className='font-medium'>Father Name</Label>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <Controller
                                                    name='mothername'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <input
                                                            type='checkbox'
                                                            checked={field.value ?? false}
                                                            onChange={(e) => field.onChange(e.target.checked)}
                                                            className='h-4 w-4'
                                                        />
                                                    )}
                                                />
                                                <Label className='font-medium'>Mother Name</Label>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <Controller
                                                    name='className'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <input
                                                            type='checkbox'
                                                            checked={field.value ?? false}
                                                            onChange={(e) => field.onChange(e.target.checked)}
                                                            className='h-4 w-4'
                                                        />
                                                    )}
                                                />
                                                <Label className='font-medium'>Class Name</Label>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <div>
                                    <div className='flex justify-end gap-4 border-t pt-8'>
                                        <Button
                                            size='lg'
                                            variant='outline'
                                            className='px-8'
                                            onClick={() => window.location.reload()}
                                            type='button'>
                                            Cancel
                                        </Button>
                                        <Button type='submit' disabled={isSubmitting} className='px-12'>
                                            {isSubmitting ? 'Generating...' : 'Report'}
                                        </Button>
                                    </div>
                                    {showReport && receiptReports && (
                                        <div ref={printRef}>
                                            <CollapsibleSection defaultOpen={true}>
                                                <div className='mt-10 rounded-lg border bg-white shadow-xl'>
                                                    <div className='flex items-center justify-between border-b bg-primary/5 px-8 py-6'>
                                                        <div className='mb-6 text-center'>
                                                            <h2 className='font-bold text-2xl text-primary'>Report Grid View</h2>
                                                        </div>

                                                        <div className='flex gap-2'>
                                                            <Button size='sm' onClick={handlePrint} className='h-8 px-3 text-xs'>
                                                                Print
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {receiptReports.studentsnames?.map((report: any, index: any) => (
                                                        <div
                                                            key={index + 1}
                                                            className={`border-b pb-8 last:border-b-0 ${index > 0 ? 'mt-8' : ''}`}>
                                                            <div
                                                                className={`mx-auto max-w-6xl bg-white p-6 text-black print:p-0 ${index > 0 ? 'print:break-before-page' : ''}`}>
                                                                <div className='flex items-center gap-4 border-b pb-4'>
                                                                    <div className='text-center'>
                                                                        {logodata && (
                                                                            <img src={logodata} alt='Institute Logo' className='mx-auto' />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <h5 className='my-4 text-center font-bold'>Student Information</h5>
                                                                <div className='mt-4 text-sm'>
                                                                    <table className='w-full border-collapse'>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td className='py-1 align-top font-semibold'>Date</td>
                                                                                <td className='w-2/5 py-1 align-top'>
                                                                                    : {new Date().toLocaleDateString()}
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className='py-1 align-top font-semibold'>
                                                                                    Student Name
                                                                                </td>
                                                                                <td className='py-1 align-top'>: {report.stuname || ''}</td>
                                                                            </tr>
                                                                            {fatherName === true && (
                                                                                <tr>
                                                                                    <td className='py-1 align-top font-semibold'>
                                                                                        Father Name
                                                                                    </td>
                                                                                    <td className='py-1 align-top'>
                                                                                        : {report.fatherName || ''}
                                                                                    </td>
                                                                                </tr>
                                                                            )}
                                                                            <tr>
                                                                                <td className='py-1 align-top font-semibold'>
                                                                                    Mother Name
                                                                                </td>
                                                                                <td className='py-1 align-top'>
                                                                                    : {report.motherName || ''}
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className='py-1 align-top font-semibold'>Class Name</td>
                                                                                <td className='py-1 align-top'>
                                                                                    : {report.className || ''}
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className='py-1 align-top font-semibold'>
                                                                                    Section Name
                                                                                </td>
                                                                                <td className='py-1 align-top'>
                                                                                    : {report.sectionName || ''}
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className='py-1 align-top font-semibold'>
                                                                                    Secession Name
                                                                                </td>
                                                                                <td>: {''}</td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>

                                                                <table className='w-full border-collapse border text-xs'>
                                                                    <thead className='bg-gray-100'>
                                                                        <tr>
                                                                            <th className='border p-1'>SL.NO</th>
                                                                            <th className='border p-1'>Details</th>
                                                                            <th className='border p-1'>Date</th>
                                                                            <th className='border p-1'>ReceiptNo</th>
                                                                            <th className='border p-1'>Amount</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {receiptReports.reportdatelist?.map((row: any, index: any) => (
                                                                            <tr key={row.slNo}>
                                                                                <td className='border p-1 text-center'>{index + 1}</td>
                                                                                <td className='border p-1'>{row.remarks}</td>
                                                                                <td className='border p-1 text-center'>
                                                                                    {row.dateOfRecp
                                                                                        ? new Date(row.dateOfRecp).toLocaleDateString(
                                                                                              'en-GB'
                                                                                          )
                                                                                        : ''}
                                                                                </td>
                                                                                <td className='border p-1 text-right'>
                                                                                    {row.recpNo ?? ''}
                                                                                </td>
                                                                                <td className='border p-1 text-right'>
                                                                                    ₹{row.tot?.toLocaleString('en-IN') ?? '0'}
                                                                                </td>
                                                                            </tr>
                                                                        ))}

                                                                        <tr className='bg-gray-50 font-bold'>
                                                                            <td className='border p-1 text-right' colSpan={3}>
                                                                                NET AMOUNT
                                                                            </td>
                                                                            <td className='border p-1 text-right'>{}</td>
                                                                            <td className='border p-1 text-right'>
                                                                                ₹
                                                                                {receiptReports.reportdatelist
                                                                                    .reduce((sum: any, row: any) => sum + (row.tot || 0), 0)
                                                                                    .toLocaleString('en-IN')}
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>

                                                                <div className='mt-4 text-sm'>
                                                                    <p>
                                                                        <b>
                                                                            This is a computer Generated Receipt does not require signature
                                                                        </b>
                                                                    </p>
                                                                </div>
                                                                <div className='mt-10 flex justify-end'>
                                                                    <p className=' pt-2 text-sm'>Manager </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CollapsibleSection>
                                        </div>
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
