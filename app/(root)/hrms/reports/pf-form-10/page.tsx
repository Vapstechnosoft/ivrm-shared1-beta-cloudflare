'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveYearDropdown } from '@/hooks/hrms/useMasters';
import { usePFForm10 } from '@/hooks/hrms/useReports';
import { getMasterInstitution } from '@/server/hrms/master-dropdown';
import { format } from 'date-fns';
import { Loader2, Printer, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { printPFForm10 } from './_components/pf-form10-print';

const MONTH_LIST = [
    { id: 1, name: 'January' },
    { id: 2, name: 'February' },
    { id: 3, name: 'March' },
    { id: 4, name: 'April' },
    { id: 5, name: 'May' },
    { id: 6, name: 'June' },
    { id: 7, name: 'July' },
    { id: 8, name: 'August' },
    { id: 9, name: 'September' },
    { id: 10, name: 'October' },
    { id: 11, name: 'November' },
    { id: 12, name: 'December' }
];

interface FilterFormValues {
    year: string;
    month: string;
}

export default function PFForm10Page() {
    return (
        <FormProvider>
            <PFForm10Content />
        </FormProvider>
    );
}

function PFForm10Content() {
    const [reportData, setReportData] = useState<any>(null);
    const [institution, setInstitution] = useState<any>(null);
    const [reportMonth, setReportMonth] = useState('');
    const [reportYear, setReportYear] = useState('');
    const [resetKey, setResetKey] = useState(0);

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                const res = await getMasterInstitution();
                if (res?.data) {
                    setInstitution(Array.isArray(res.data) ? res.data[0] : res.data);
                }
            } catch (error) {
                console.error('Error fetching institution:', error);
            }
        };
        fetchInstitution();
    }, []);
    const { control, handleSubmit, reset } = useForm<FilterFormValues>({
        defaultValues: {
            year: '',
            month: ''
        }
    });

    const handleCancel = () => {
        reset();
        setReportData(null);
        setResetKey((prev) => prev + 1);
    };

    const { data: yearsData, isLoading: isleaveYearLoading } = useLeaveYearDropdown();
    const { mutate: generateReport, isPending } = usePFForm10();

    console.log('Report Data:', reportData);

    const onSubmit = (data: FilterFormValues) => {
        if (!data.year || !data.month) {
            toast.error('Please select Year and Month');
            return;
        }

        const selectedYearObj = yearsData?.data?.find((y: any) => y.hrmlY_Id.toString() === data.year);
        const yearInt = Number.parseInt(selectedYearObj?.hrmlY_LeaveYear?.split('-')[0] || data.year);

        const selectedMonthObj = MONTH_LIST.find((m) => m.id.toString() === data.month);
        const monthName = selectedMonthObj?.name || '';

        generateReport(
            {
                hreS_Year: yearInt,
                hreS_Month: monthName
            },
            {
                onSuccess: (res) => {
                    if (res.success && res.data) {
                        setReportData(res.data);
                        setReportMonth(monthName);
                        setReportYear(yearInt.toString());
                        
                        if (res?.data?.pfreport && res?.data?.pfreport.length > 0) {
                            toast.success('Report generated successfully');
                        } else {
                            toast.warning('No data found for this selected criteria');
                        }
                    } else {
                        toast.error(res.message || 'Failed to generate report');
                    }
                }
            }
        );
    };

    const handlePrint = () => {
        if (!reportData) {
            toast.error('No data to print');
            return;
        }

        printPFForm10(reportData, institution, reportMonth, reportYear);
    };

    return (
        <div className='container min-h-screen space-y-4 p-2'>
            {/* <div className='flex items-center justify-between'>
                <h2 className='text-2xl font-bold tracking-tight'>PF Form 10</h2>
            </div> */}

            <CollapsibleSection defaultOpen={true} title='Report Criteria' variant='outline' className='shadow-sm'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label>
                                Year <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='year'
                                control={control}
                                key={resetKey}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger disabled={isleaveYearLoading}>
                                            <SelectValue placeholder={isleaveYearLoading ? 'Loading...' : 'Select Year'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearsData?.data?.map((y: any) => (
                                                <SelectItem key={y.hrmlY_Id} value={y.hrmlY_Id.toString()}>
                                                    {y.hrmlY_LeaveYear}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Month <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='month'
                                control={control}
                                key={resetKey}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger disabled={isleaveYearLoading}>
                                            <SelectValue placeholder={isleaveYearLoading ? 'Loading...' : 'Select Month'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MONTH_LIST.map((m) => (
                                                <SelectItem key={m.id} value={m.id.toString()}>
                                                    {m.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    <div className='flex justify-end gap-2'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleCancel}
                            disabled={isPending}
                            className='w-32 rounded-xl border-orange-500 text-orange-600 transition-all hover:bg-orange-50'>
                            <X className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                        <Button type='submit' disabled={isPending} className='w-32 rounded-xl transition-all'>
                            {isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                            Generate
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
                        <div className='flex gap-2'>
                            <Button variant='outline' size='sm' onClick={handlePrint} className='gap-2'>
                                <Printer className='h-4 w-4' />
                                Print
                            </Button>
                        </div>
                    }>
                    <div className='text-right'>
                        <h4 className='font-semibold text-lg'>Form 10</h4>
                    </div>
                    <div className='space-y-1 text-center'>
                        <h4 className='font-semibold text-lg'>The Employees' Provident Fund Scheme, 1952[ Paragraph 36 (2) (a)]</h4>
                        <h6 className='font-medium'> AND</h6>
                        <h4 className='font-semibold text-lg'>The Employees' Pension Fund Scheme, 1995[ Para 20 (4)]</h4>
                    </div>
                    <hr className='my-4' />
                    <div className='mt-5 mb-2.5'>
                        <div className='col-span-12 space-y-2'>
                            <p>
                                Return of the members leaving service during the month of{' '}
                                <span className='border-b font-semibold'>
                                    {reportMonth} - {reportYear}
                                </span>
                            </p>
                            <p>To be sent to the Commissioner with Form 2 (EPF & EPS)</p>
                        </div>
                        <div className='mt-4 grid grid-cols-12 gap-4'>
                            <div className='col-span-8'>
                                <table className='mt-2.5 table w-full'>
                                    <tbody>
                                        <tr>
                                            <td className='w-1/3 py-1 font-medium'>Name of Establishment :</td>
                                            <td className='border-b py-1 text-left'>{institution?.mI_Name}</td>
                                        </tr>
                                        <tr>
                                            <td className='w-1/3 py-1 font-medium'> Address of the Factory/ Establishment :</td>
                                            <td className='border-b py-1 text-left'>
                                                {reportData?.currentInstuteAddress || institution?.mI_Address1}, {institution?.ivrmmcT_Name}{' '}
                                                - {institution?.mI_Pincode}.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className='col-span-4'>
                                <table className='mt-2.5 table w-full'>
                                    <tbody>
                                        <tr>
                                            <td className='py-1 font-medium'>Code No. of Factory/ Establishment :</td>
                                            <td className='border-b py-1 text-left'>
                                                {reportData?.payrollStandard?.[0]?.hrC_PFAccNoPrefix ||
                                                    reportData?.payrollstandard?.[0]?.hrC_PFAccNoPrefix ||
                                                    'PF'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='py-1'></td>
                                            <td className='py-1'></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className='relative mt-8 overflow-x-auto'>
                        {/* {isPending && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        )} */}
                        <table className='w-full border-collapse border border-gray-400 text-sm'>
                            <thead>
                                <tr className='bg-gray-150'>
                                    <th className='border border-gray-400 p-2 text-center font-bold text-xs'>S. No</th>
                                    <th className='border border-gray-400 p-2 text-center font-bold text-xs'>Account No.</th>
                                    <th className='border border-gray-400 p-2 text-center font-bold text-xs'>
                                        Name of the Member
                                        <br />
                                        (in BLOCK letters)
                                    </th>
                                    <th className='border border-gray-400 p-2 text-center font-bold text-xs'>
                                        Father's Name or Husband's Name
                                        <br />
                                        in case of married women
                                    </th>
                                    <th className='border border-gray-400 p-2 text-center font-bold text-xs'>Date of Leaving Service</th>
                                    <th className='border border-gray-400 p-2 text-center font-bold text-xs'>Reason for Leaving Service</th>
                                    <th className='border border-gray-400 p-2 text-center font-bold text-xs'>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(reportData.alldata || reportData.pfreport || []).length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className='border border-gray-400 p-8 text-center text-gray-500'>
                                            No records found
                                        </td>
                                    </tr>
                                ) : (
                                    (reportData.alldata || reportData.pfreport || []).map((item: any, idx: number) => {
                                        const empName =
                                            `${item.hrmE_EmployeeFirstName || ''} ${item.hrmE_EmployeeMiddleName || ''} ${item.hrmE_EmployeeLastName || ''}`
                                                .trim()
                                                .toUpperCase();
                                        const dol = item.hrmE_DOL ? format(new Date(item.hrmE_DOL), 'dd-MM-yyyy') : '';
                                        const fatherOrHusband = item.hrmE_FatherName || item.fatherHusbandName || '';
                                        return (
                                            <tr key={idx} className='transition-colors hover:bg-gray-50'>
                                                <td className='border border-gray-400 p-2 text-center'>{idx + 1}</td>
                                                <td className='border border-gray-400 p-2 text-center'>{item.hrmE_PFAccNo || ''}</td>
                                                <td className='border border-gray-400 p-2 font-medium'>{empName}</td>
                                                <td className='border border-gray-400 p-2'>{fatherOrHusband}</td>
                                                <td className='border border-gray-400 p-2 text-center'>{dol}</td>
                                                <td className='border border-gray-400 p-2'>{item.hrmE_LeavingReason || ''}</td>
                                                <td className='border border-gray-400 p-2'>{item.remarks || ''}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className='mt-8 grid grid-cols-12 gap-4'>
                        <div className='col-span-12'>
                            <div className='mt-10 space-y-4 text-sm leading-relaxed'>
                                <p>Date :</p>
                                <p>
                                    Please state whether the member is (a) retiring according to para 69 (1) (a) or (b) of the scheme; (b)
                                    leaving India for permanent settlement abroad; (c) retrenched; (d) ordinarily dismissed for serious and
                                    willful misconduct; (e) discharged; (f) resigning from or leaving service; (g) taking up employment
                                    elsewhere (the name and address of the new employer should be stated) ; (h) dead.
                                </p>
                                <p>
                                    (1) A request for deduction from the account of a member dismissed for serious and willful misconduct
                                    should be reported by the following &ldquo;certified that the member mentioned at Sr. No.
                                    &nbsp;________________________ &nbsp; Shri. &nbsp;________________________ was dismissed from the
                                    service for willful misconduct. I recommend that the employer&apos;s contribution for
                                    &nbsp;________________________&nbsp; should be forfeited from his account in the fund. A copy of order
                                    of dismissal is enclosed.&rdquo;
                                </p>
                                <p>
                                    (2) In case of discharge from service, the following certificate should be filled. Certified that the
                                    member mentioned in Sr. No.&nbsp; ________________________ &nbsp; Shri. &nbsp;________________________
                                    was paid/ unpaid retrenchment compensation of Rs.&nbsp;____________________________ &nbsp; under the
                                    Industrial Disputes Act, 1947
                                </p>
                                <p>
                                    Certified that the difference between the total of the contribution shown under cols. 3, 4a and 4b of
                                    the above table and that arrived at on the total wages shown in col. 2 at the prescribed rate is solely
                                    due to rounding off of contribution to the nearest rupee under the rules.
                                </p>
                            </div>
                        </div>

                        <div className='col-span-12 flex justify-end'>
                            <div className='mt-12 text-center'>
                                <label className='clearfix border-black border-t px-8 pt-2 font-medium'>
                                    Signature of the employer with Official Seal
                                </label>
                            </div>
                        </div>
                        <div className='col-span-12'>
                            <div className='mt-4 text-gray-700 text-sm'>
                                <p>
                                    Note: Please furnish details of the membership in remarks column if the employee was a member of
                                    Employees&apos; Provident Fund and Employees&apos; Pension scheme before joining yourself/ factory. i.e.
                                    Account No. and/ or the name and particulars of the last employer.
                                </p>
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
