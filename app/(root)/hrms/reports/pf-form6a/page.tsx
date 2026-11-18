'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { usePFForm6A } from '@/hooks/hrms/useReports';
import { getMasterInstitution } from '@/server/hrms/master-dropdown';
import { format } from 'date-fns';
import { Loader2, Printer, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface FilterFormValues {
    fromDate: Date | undefined;
    toDate: Date | undefined;
}

export default function PFForm6APage() {
    return (
        <FormProvider>
            <PFForm6AContent />
        </FormProvider>
    );
}

function PFForm6AContent() {
    const [reportData, setReportData] = useState<any[] | null>(null);
    const [fullReportData, setFullReportData] = useState<any>(null);
    const [institution, setInstitution] = useState<any>(null);
    const [fromDateStr, setFromDateStr] = useState('');
    const [toDateStr, setToDateStr] = useState('');

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
    const { control, handleSubmit, reset, watch } = useForm<FilterFormValues>({
        defaultValues: {
            fromDate: undefined,
            toDate: undefined
        }
    });

    const watchedFromDate = watch('fromDate');

    const handleCancel = () => {
        reset();
        setReportData(null);
        setFullReportData(null);
    };

    const { mutate: generateReport, isPending } = usePFForm6A();

    const onSubmit = (data: FilterFormValues) => {
        if (!data.fromDate || !data.toDate) {
            toast.error('Please select both From and To dates');
            return;
        }

        generateReport(
            {
                fromDate: data.fromDate!.toISOString(),
                toDate: data.toDate!.toISOString()
            },
            {
                onSuccess: (res) => {
                    if (res.success && res.data) {
                        const mappedData = Array.isArray(res.data) ? res.data : res.data.alldata || res.data.list || [];
                        setReportData(mappedData);
                        setFullReportData(res.data);
                        setFromDateStr(format(data.fromDate!, 'dd-MM-yyyy'));
                        setToDateStr(format(data.toDate!, 'dd-MM-yyyy'));
                        toast.success('Report generated successfully');
                    } else {
                        toast.error(res.message || 'No data found');
                    }
                }
            }
        );
    };

    const handlePrint = () => {
        // if (!reportData || reportData.length === 0) {
        //     toast.error('No data to print');
        //     return;
        // }

        // printPFForm6A(reportData, fullReportData, institution, fromDateStr, toDateStr);

        window.print();
    };

    const columns = [
        {
            id: 'slNo',
            header: 'SL.No',
            cell: ({ row }: any) => row.index + 1
        },
        {
            accessorKey: 'hrmE_PFAccNo',
            header: 'PF Acc No'
        },
        {
            accessorKey: 'hrmE_PFuAN',
            header: 'UAN'
        },
        {
            header: 'Employee Name',
            cell: ({ row }: any) => {
                const e = row.original;
                return `${e.hrmE_EmployeeFirstName || ''} ${e.hrmE_EmployeeMiddleName || ''} ${e.hrmE_EmployeeLastName || ''}`.trim();
            }
        },
        {
            accessorKey: 'amountofWages',
            header: 'Wages',
            cell: ({ row }: any) => Number(row.original.amountofWages || 0).toFixed(2)
        },
        {
            accessorKey: 'basicvalue',
            header: 'Basic',
            cell: ({ row }: any) => Number(row.original.basicvalue || 0).toFixed(2)
        },
        {
            accessorKey: 'davalue',
            header: 'DA',
            cell: ({ row }: any) => Number(row.original.davalue || 0).toFixed(2)
        },
        {
            accessorKey: 'hreS_EPF',
            header: 'EPF',
            cell: ({ row }: any) => Number(row.original.hreS_EPF || 0).toFixed(2)
        },
        {
            accessorKey: 'hreS_FPF',
            header: 'FPF',
            cell: ({ row }: any) => Number(row.original.hreS_FPF || 0).toFixed(2)
        },
        {
            accessorKey: 'hreS_Ac21',
            header: 'Ac 21',
            cell: ({ row }: any) => Number(row.original.hreS_Ac21 || 0).toFixed(2)
        },
        {
            accessorKey: 'hreS_Ac22',
            header: 'Ac 22',
            cell: ({ row }: any) => Number(row.original.hreS_Ac22 || 0).toFixed(2)
        },
        {
            accessorKey: 'hreS_Ac5',
            header: 'Ac 5',
            cell: ({ row }: any) => Number(row.original.hreS_Ac5 || 0).toFixed(2)
        }
    ];

    return (
        <div className='container min-h-screen space-y-4 p-2'>
            <style>{`
                @media print {
                    body {
                        background: white !important;
                        color: black !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-full-width {
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 8mm 12mm;
                    }
                }
            `}</style>

            <CollapsibleSection defaultOpen={true} title='Report Criteria' variant='outline' className='shadow-sm'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label>
                                From Date <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='fromDate'
                                control={control}
                                render={({ field }) => (
                                    <DatePicker date={field.value} setDate={field.onChange} placeholder='Select From Date' />
                                )}
                            />
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
                                        placeholder='Select To Date'
                                        disabled={watchedFromDate ? { before: watchedFromDate } : undefined}
                                    />
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
                        <div className='no-print flex gap-2'>
                            <Button variant='outline' size='sm' onClick={handlePrint} className='gap-2'>
                                <Printer className='h-4 w-4' />
                                Print
                            </Button>
                        </div>
                    }>
                    <div className='printable-content space-y-4 print:space-y-0'>
                        <div className='text-right'>
                            <h4 className='font-semibold text-lg'>Form 6A</h4>
                        </div>
                        <div className='space-y-1 text-center'>
                            <h4 className='font-semibold text-lg'>THE EMPLOYEES&apos; PROVIDENT FUND SCHEME, 1952(PARAGRAPH 43)</h4>
                            <h6 className='font-medium'> AND</h6>
                            <h4 className='font-semibold text-lg'>THE EMPLOYEE&apos;S PENSION SCHEME, 1995( PARAGRAPH 20 (4))</h4>
                            <h6 className='font-medium'>
                                Annual Statement OF Contribution for the currency period from{' '}
                                <span className='border-b font-semibold'>{fromDateStr}</span> to{' '}
                                <span className='border-b font-semibold'>{toDateStr}</span>
                            </h6>
                        </div>
                        <hr className='my-4' />
                        <div className='mt-5 mb-2.5'>
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
                                                    {fullReportData?.currentInstuteAddress || institution?.mI_Address1},{' '}
                                                    {institution?.ivrmmcT_Name} - {institution?.mI_Pincode}.
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className='w-1/3 py-1 font-medium'>Code No. of Factory/ Establishment :</td>
                                                <td className='border-b py-1 text-left'>
                                                    {fullReportData?.payrollStandard?.[0]?.hrC_PFAccNoPrefix ||
                                                        fullReportData?.payrollstandard?.[0]?.hrC_PFAccNoPrefix ||
                                                        'PF'}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className='col-span-4'>
                                    <table className='mt-2.5 table w-full'>
                                        <tbody>
                                            <tr>
                                                <td className='py-1 font-medium'>Stat. Rate of Contribution :</td>
                                                <td className='border-b py-1 text-left'>
                                                    {(
                                                        Number.parseFloat(
                                                            fullReportData?.payrollStandard?.[0]?.hrC_EPFPer ||
                                                                fullReportData?.payrollstandard?.[0]?.hrC_EPFPer ||
                                                                '0'
                                                        ) +
                                                            Number.parseFloat(
                                                                fullReportData?.payrollStandard?.[0]?.hrC_FPFPer ||
                                                                    fullReportData?.payrollstandard?.[0]?.hrC_FPFPer ||
                                                                    '0'
                                                            ) || 0
                                                    ).toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className='py-1 font-medium'>
                                                    No. of member voluntarily Contribution at a higher rate :
                                                </td>
                                                <td className='border-b py-1 text-left'></td>
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
                                data={reportData}
                                columns={columns}
                                totalItems={reportData.length}
                                isPaginationRequired={false}
                                isSearchRequired={false}
                                isLoading={isPending}
                            />
                        </div>

                        <div className='mt-8 grid grid-cols-12 gap-4'>
                            <div className='col-span-12'>
                                <div className='mt-10 mb-4'>
                                    <p className='font-medium'>Reconsilation of Remittance</p>
                                </div>
                            </div>

                            <div className='col-span-12'>
                                <div className='mt-2 space-y-4 text-gray-700 text-sm leading-relaxed'>
                                    <p>
                                        (1) Certified that the difference between the figures of total contribution and Administration
                                        charges remitted during the currency period and those shown under columns (5) to (7) above is shown
                                        due to the rounding of the amounts to the nearest rupee under the rates.
                                    </p>
                                    <p>
                                        (2) Certified the Form 3-A duly completed of all the members listed in this statement are enclosed
                                        except those already sent during the course of currency period for the final settlement of the
                                        concerned members account vide Remarks furnished against the names of respective members above.
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
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
