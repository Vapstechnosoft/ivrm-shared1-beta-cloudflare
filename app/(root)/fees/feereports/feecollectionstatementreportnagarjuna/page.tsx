'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { feeCollectionstatementNagarjunaSchema } from '@/schemas/fees/reports';
import { feeClassWiseDueListreportSophia } from '@/server/fees/reports/sophia_reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { exportToExcel, printTable } from './excelandprint';

type FormFields = z.infer<typeof feeCollectionstatementNagarjunaSchema>;

interface IAcademicYear {
    asmaY_Id: string | number;
    asmaY_Year: string;
    asmaY_Order?: number;
}
export interface IFeeItemWiseReportofSophia {
    id: number;
    fee_ItemName: string;
    actual: number;
    paid: number;
    fine: number;
    discount: number;
    excess: number;
    asmcL_Id: any;
    asmcL_ClassName: string;
    asmcL_Order: any;
    asmS_Id: any;
    asmC_SectionName: any;
}
export default function FeeCollectionStatementReportNagarjuna() {
    const {
        handleSubmit,
        control,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeCollectionstatementNagarjunaSchema),
        defaultValues: {
            academicYearId: undefined,
            organizationId: undefined,
            radio_val: 'All'
        }
    });

    const organizationList = [
        'Nagarjuna Pre-University College, Yelahanka',
        'Nagarjuna Degree College, Yelahanka',
        'Ngarjuna PU College,Chikkaballapura',
        'Nagarjuna College of Managemnet studies'
    ];

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [reportData, setReportData] = useState<IFeeItemWiseReportofSophia[]>([]);

    type catg = 'All' | 'Branchwise' | 'Hostel' | 'Transport';
    const userTypeOptions: { label: string; value: catg }[] = [
        { label: 'All', value: 'All' },
        { label: 'Branchwise/Classwise', value: 'Branchwise' },
        { label: 'Hostel', value: 'Hostel' },
        { label: 'Transport', value: 'Transport' }
    ];

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

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                fmT_Ids: [],
                customflag: 'ITEMWISE',
                asmaY_Id: data.academicYearId,
                radioval: '',
                active: 0,
                deactive: 0,
                left: 0
            };

            const apiData = await feeClassWiseDueListreportSophia(payload);
            // biome-ignore lint/suspicious/noConsoleLog: <explanation>
            console.log('apiData', apiData);
            const responseJson = typeof apiData === 'string' ? JSON.parse(apiData) : apiData;
            if (responseJson?.data) {
                const report = responseJson.data ?? [];
                const mapApiToReportRows = (apiData: any[]): IFeeItemWiseReportofSophia[] => {
                    return apiData.map((item, index) => ({
                        id: index + 1,
                        fee_ItemName: item.fee_ItemName,
                        actual: item.actual,
                        paid: item.paid,
                        balance: item.balance,
                        fine: item.fine,
                        discount: item.discount,
                        excess: item.excess,
                        asmcL_Id: item.asmcL_Id,
                        asmcL_ClassName: item.asmcL_ClassName,
                        asmS_Id: item.asmS_Id,
                        asmC_SectionName: item.asmC_SectionName,
                        asmcL_Order: item.asmcL_Order
                    }));
                };
                const list = mapApiToReportRows(report);

                setReportData(list || []);
                // setReportData(responseJson.data);
                // setShowReport(true);
                toast.success('Report Generated Successfully');
                // setReportData(responseJson.data);
                if (list.length > 0) {
                    toast.success('Report Generated Successfully');
                } else {
                    toast.error('No Data Found');
                }
            } else {
                toast.error(responseJson.message || 'No Data Found');
            }
        } catch (error: any) {
            console.error('Error generating report:', error);
            toast.error(error.message || 'Failed to generate report');
        }
    };
    const handleExport = () => {
        exportToExcel(reportData, 'Fee-Item-Wise-Report');
    };

    const handlePrint = () => {
        const columnHeaders = ['Sl No', 'Item Name', 'Actual Amount', 'Paid Amount', 'Fine', 'Discount', 'Excess'];

        const printableRows = reportData.map((row, index) => {
            const baseRow = {
                'Sl No': index + 1,
                'Item Name': row.fee_ItemName || '',
                'Actual Amount': row.actual || '',
                'Paid Amount': row.paid || '',
                Fine: row.fine || '',
                Discount: row.discount || '',
                Excess: row.excess || ''
            };
            return baseRow;
        });
        printTable(columnHeaders, printableRows, 'Fee-Item-Wise-Report');
    };
    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='place-items-center p-8'>
                            <div className='space-y-8'>
                                <div className='flex items-center gap-12'>
                                    <div className='flex items-center gap-4'>
                                        <Label className='w-36 text-right'>
                                            Organization <span className='text-red-500'>*</span>
                                        </Label>
                                        <div className='flex-1'>
                                            <Controller
                                                name='organizationId'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value?.toString()}
                                                        onValueChange={(v) => field.onChange(Number(v))}>
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue placeholder='--Select Organization Name--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {loadingAcademic ? (
                                                                <SelectItem value='loading' disabled>
                                                                    Loading...
                                                                </SelectItem>
                                                            ) : (
                                                                organizationList?.map((item: any, index) => (
                                                                    <SelectItem key={index + 1} value={index.toString()}>
                                                                        {item}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.organizationId && <FormError>{errors.organizationId.message}</FormError>}
                                        </div>
                                    </div>
                                </div>
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
                                </div>
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
                                </div>
                            </div>
                        </div>
                        {reportData.length > 0 && (
                            <div className='mx-10 mt-10'>
                                {/* Loading State */}
                                <CollapsibleSection
                                    defaultOpen={true}
                                    variant='default'
                                    size='lg'
                                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                                    <div className='flex items-center justify-between border-b bg-primary/5 px-8 py-6'>
                                        <div className='mb-6 text-center'>
                                            <h2 className='font-bold text-2xl text-primary'>Fee Collection Statement Report</h2>
                                        </div>
                                        <div className='flex gap-3'>
                                            <div className='mb-4 flex justify-end gap-2'>
                                                <Button size='sm' className='h-8 w-auto px-3 text-xs' onClick={handleExport}>
                                                    Export Excel
                                                </Button>

                                                <Button
                                                    size='sm'
                                                    variant='outline'
                                                    className='h-8 w-auto px-3 text-xs'
                                                    onClick={handlePrint}>
                                                    Print
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        {/* Table */}
                                        <div className='overflow-x-auto px-8 pb-8'>
                                            <table className='w-full border-collapse border border-gray-300 text-sm'>
                                                <thead className='bg-primary text-white'>
                                                    <tr>
                                                        <th className='border px-2 py-2 text-center font-semibold'>Sl No</th>
                                                        <th className='border px-2 py-2 text-center font-semibold'>Brach Name</th>
                                                        <th className='border px-2 py-2 text-center font-semibold'>Year</th>
                                                        <th className='border px-2 py-2 text-center font-semibold'>Actual Student</th>
                                                        <th className='border px-2 py-2 text-center font-semibold'>Fee Fixed</th>
                                                        <th className='border px-2 py-2 text-center font-semibold'>Concession</th>
                                                        <th className='border px-2 py-2 text-center font-semibold'>Net Fee</th>
                                                        <th className='border px-2 py-2 text-center font-semibold'>Collected</th>
                                                        <th className='border px-2 py-2 text-center font-semibold'>Net Due</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reportData.map((row, index) => (
                                                        <tr key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                            <td className='border px-2 py-2 text-center'>{index + 1}</td>
                                                            <td className='border px-2 py-2 text-left'>{row.fee_ItemName}</td>
                                                            <td className='border px-2 py-2 text-right'>
                                                                {row.actual?.toLocaleString() || '-'}
                                                            </td>
                                                            <td className='border px-2 py-2 text-right'>
                                                                {row.paid?.toLocaleString() || '-'}
                                                            </td>
                                                            <td className='border px-2 py-2 text-right'>
                                                                {row.fine?.toLocaleString() || '-'}
                                                            </td>
                                                            <td className='border px-2 py-2 text-right'>
                                                                {row.discount?.toLocaleString() || '-'}
                                                            </td>
                                                            <td className='border px-2 py-2 text-right'>
                                                                {row.excess?.toLocaleString() || '-'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>
                        )}
                    </Card>
                </div>
            </form>
        </div>
    );
}
