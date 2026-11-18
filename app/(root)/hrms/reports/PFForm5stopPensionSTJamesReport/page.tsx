'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveYearDropdown } from '@/hooks/hrms/useMasters';
import { usePFForm5 } from '@/hooks/hrms/useReports';
import { getMasterInstitution } from '@/server/hrms/master-dropdown';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Loader2, Printer, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { printPFForm5 } from './_components/pf-form5-print';

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

export default function PFForm5Page() {
    return (
        <FormProvider>
            <PFForm5Content />
        </FormProvider>
    );
}

function PFForm5Content() {
    const [reportData, setReportData] = useState<any>(null);
    const [institution, setInstitution] = useState<any>(null);
    const [reportMonth, setReportMonth] = useState('');
    const [reportYear, setReportYear] = useState('');
    const [formKey, setFormKey] = useState(0);

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
        reset({
            year: '',
            month: ''
        });
        setReportData(null);
        setReportMonth('');
        setReportYear('');
        setFormKey((prev) => prev + 1);
    };

    const { data: yearsData } = useLeaveYearDropdown();
    const { mutate: generateReport, isPending } = usePFForm5();

    const onSubmit = (data: FilterFormValues) => {
        if (!data.year || !data.month) {
            toast.error('Please select Year and Month');
            return;
        }

        const selectedYearObj = yearsData?.data?.find((y: any) => y.hrmlY_Id.toString() === data.year);
        const yearString = selectedYearObj?.hrmlY_LeaveYear?.split('-')[0] || data.year;

        const selectedMonthObj = MONTH_LIST.find((m) => m.id.toString() === data.month);
        const monthName = selectedMonthObj?.name || '';

        generateReport(
            {
                hreS_Year: yearString,
                hreS_Month: monthName
            },
            {
                onSuccess: (res) => {
                    console.log('form 5 st james response', res);
                    if (res.success && res.data) {
                        setReportData(res.data);
                        setReportMonth(monthName);
                        setReportYear(yearString);
                        toast.success('Report generated successfully');
                    } else {
                        toast.error(res.message || 'No data found');
                    }
                }
            }
        );
    };

    const handlePrint = () => {
        if (!reportData || !reportData.pfreportdetails || reportData.pfreportdetails.length === 0) {
            toast.error('No data to print');
            return;
        }

        printPFForm5(reportData, institution, reportMonth, reportYear);
    };

    const headerStyle: React.CSSProperties = {
        fontWeight: 'bold',
        color: 'black',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        textAlign: 'center',
        lineHeight: '1.2',
        fontSize: '14px'
    };

    const columns: ColumnDef<any>[] = [
        {
            id: 'slNo',
            header: () => <div style={headerStyle}>SL.No</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.index + 1}</div>,
            size: 80
        },
        {
            accessorKey: 'hrmE_PFAccNo',
            header: () => <div style={headerStyle}>Account No</div>,
            cell: ({ row }: any) => {
                const e = row.original;
                return <div className='text-center'>{e?.hrmE_PFAccNo || '-'}</div>;
            }
        },
        {
            id: 'employeeName',
            header: () => (
                <div style={headerStyle}>
                    Name of the Member <br /> (in BLOCK letters)
                </div>
            ),
            cell: ({ row }: any) => {
                const e = row.original;
                return (
                    <div className='text-center'>
                        {`${e.hrmE_EmployeeFirstName || ''} ${e.hrmE_EmployeeMiddleName || ''} ${e.hrmE_EmployeeLastName || ''}`
                            .trim()
                            .toUpperCase()}
                    </div>
                );
            },
            size: 200
        },
        {
            accessorKey: 'fatherHusbandName',
            header: () => (
                <div style={headerStyle}>
                    Father's Name or Husband's Name <br />
                    in case of married women
                </div>
            ),
            cell: ({ row }: any) => {
                const e = row.original;
                return <div className='text-center'>{`${e.fatherHusbandName || '-'}`.trim().toUpperCase()}</div>;
            },
            size: 300
        },
        {
            id: 'hrmE_PensionStoppedDate',
            header: () => <div style={headerStyle}>Date of Stop Pension</div>,
            cell: ({ row }: any) => {
                const e = row.original;
                return (
                    <div className='text-center'>
                        {e?.hrmE_PensionStoppedDate || e?.hrmE_DOL
                            ? format(new Date(e?.hrmE_PensionStoppedDate || e?.hrmE_DOL), 'dd-MM-yyyy')
                            : '-'}
                    </div>
                );
            }
        },
        {
            id: 'hrmE_LeavingReason',
            header: () => <div style={headerStyle}>Reason</div>,
            cell: ({ row }: any) => {
                const e = row.original;
                if (e.hrmE_RetiredFlg) {
                    return <div className='text-center'>Stop Pension</div>;
                } else {
                    return <div className='text-center'>{e?.hrmE_LeavingReason ? e.hrmE_LeavingReason : '-'}</div>;
                }
            }
        },
        {
            id: 'remarks',
            header: () => <div style={headerStyle}>Remarks</div>,
            cell: ({ row }: any) => <div className='text-center'>{row?.remarks ? row.remarks : '-'}</div>
        }
    ];

    return (
        <div className='container min-h-screen space-y-4 p-2'>
            <CollapsibleSection key={formKey} defaultOpen={true} title='PF Form 5 Report Criteria' variant='outline' className='shadow-sm'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label>
                                Year <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='year'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Year' />
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
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Month' />
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
                        <Button type='submit' disabled={isPending} className='w-32 rounded-xl transition-all'>
                            {isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                            Generate
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleCancel}
                            disabled={isPending}
                            className='w-32 rounded-xl transition-all'>
                            <X className='mr-2 h-4 w-4' />
                            CANCEL
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
                    {/* <div className="text-right">
                        <h4 className="font-semibold text-lg">Form 5</h4>
                    </div> */}
                    <div className='space-y-1 text-center'>
                        <h4 className='font-semibold text-blue-600 text-lg'>FORM NO. 5(P.S.)</h4>
                        <h4 className='font-semibold text-blue-600 text-lg'>
                            The Employees' Provident Fund Scheme, 1952[ Paragraph 36 (2) (a)]
                        </h4>
                        <h6 className='font-semibold text-blue-600 text-sm'> AND</h6>
                        <h4 className='font-semibold text-blue-600 text-lg'> The Employees' Pension Fund Scheme, 1995[ Para 20 (4)]</h4>
                    </div>
                    <hr className='my-4' />
                    <div className='mt-5 mb-2.5'>
                        <div className='col-span-12 space-y-2'>
                            <p>
                                Return of Members of Leaving Service during the month of{' '}
                                <span className='border-b font-semibold'>
                                    {reportMonth} - {reportYear}
                                </span>
                            </p>
                        </div>
                        <div className='mt-4 grid grid-cols-12 gap-4'>
                            <div className='col-span-8'>
                                <table className='mt-2.5 table w-full'>
                                    <tbody>
                                        <tr>
                                            <td className='w-1/3 py-1 font-medium'>Name of Establishment :</td>
                                            <td className='border-b py-1 text-left'>St. James' School</td>
                                        </tr>
                                        <tr>
                                            <td className='w-1/3 py-1 font-medium'> Address of the Factory/ Establishment :</td>
                                            <td className='border-b py-1 text-left'>
                                                {/* {reportData?.currentInstuteAddress || institution?.mI_Address1}, {institution?.ivrmmcT_Name} - {institution?.mI_Pincode}. */}
                                                165, Acharya Jagadish Chandra Bose Road, Entally, Kolkata, West Bengal 700014, Kolkata -
                                                700014.
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
                                                {/* {reportData?.payrollStandard?.[0]?.hrC_PFAccNoPrefix || reportData?.payrollstandard?.[0]?.hrC_PFAccNoPrefix || ''} */}
                                                WB/19651
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

                    <div className='mt-8'>
                        <GenericDataTable
                            data={reportData.alldata || reportData.pfreportdetails || []}
                            columns={columns}
                            totalItems={(reportData.alldata || reportData.pfreportdetails || []).length}
                            isPaginationRequired={false}
                            isSearchRequired={false}
                            isLoading={isPending}
                        />
                    </div>

                    <div className='mt-8 grid grid-cols-12 gap-4'>
                        <div className='col-span-12'>
                            <div className='mt-4 text-gray-700 text-sm'>
                                <p>
                                    Note : Please state whether the member is (a) retiring according to para 69 (1) (a) or (b) of the
                                    scheme; (b) leaving India for permanent settlement abroad; (c) retrenched; (d) ordinarily dismissed for
                                    serious and willful misconduct; (e) discharged; (f) resigning from or leaving service; (g) taking up
                                    employment elsewhere (the name and address of the new employer should be stated); (h) dead; (i) attained
                                    age of 58 years.
                                </p>
                            </div>
                        </div>
                        <div className='col-span-12 flex justify-between'>
                            <div className='mt-12 text-center'>
                                <label className='border-black border-t px-8 pt-2 font-medium'>Date</label>
                            </div>
                            <div className='mt-12 text-center'>
                                <label className='clearfix border-black border-t px-8 pt-2 font-medium'>
                                    Signature of the employer with Official Seal
                                </label>
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
