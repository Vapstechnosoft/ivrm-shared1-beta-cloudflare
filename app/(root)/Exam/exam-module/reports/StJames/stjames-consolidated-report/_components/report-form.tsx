'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { type StJamesConsolidateReportSchema, stJamesConsolidateReportSchema } from '@/schemas/exam/exam-module/reports';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { getStjamesConsolidatedReport } from '@/server/exam/exam-module/reports/stjames-consolidated-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface ReportFormProps {
    onReportGenerated: (data: any, params: any) => void;
    onReset: () => void;
}

export const ReportForm = ({ onReportGenerated, onReset }: ReportFormProps) => {
    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const academicYears = academicData?.data || [];

    // Dropdown States
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const { data: session } = useSession();

    // Loading States
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);

    const methods = useForm<StJamesConsolidateReportSchema>({
        resolver: zodResolver(stJamesConsolidateReportSchema)
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const watchYear = useWatch({ control, name: 'asmaY_Id' });
    const watchClass = useWatch({ control, name: 'asmcL_Id' });

    // Load Classes
    useEffect(() => {
        if (!watchYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const { data } = await getClassDropDownByAcademicYearlist(Number(watchYear));
                setClasses(Array.isArray(data) ? data : []);
                setValue('asmcL_Id', 0 as any);
                setValue('asmS_Id', 0 as any);
            } catch {
                toast.error('Failed to load classes');
            } finally {
                setLoadingClasses(false);
            }
        })();
    }, [watchYear, setValue]);

    // Load Sections
    useEffect(() => {
        if (!watchYear || !watchClass) return;
        (async () => {
            try {
                setLoadingSections(true);
                const { data } = await getSectionsDropDownByAcademicYearandClasslist(Number(watchYear), Number(watchClass));
                setSections(Array.isArray(data) ? data : []);
                setValue('asmS_Id', 0 as any);
            } catch {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [watchYear, watchClass, setValue]);

    const onSubmit = async (data: StJamesConsolidateReportSchema) => {
        try {
            const payload = {
                mI_Id: (session?.user as any)?.mi_id || (session?.user as any)?.mI_Id || 0,
                asmaY_Id: Number(data.asmaY_Id),
                asmcL_Id: Number(data.asmcL_Id),
                asmS_Id: Number(data.asmS_Id)
            };
            console.log('payload>>>>', payload);
            const response = await getStjamesConsolidatedReport(payload);
            console.log('response>>>>', response);
            if (response?.success && response.data) {
                const asmaY_Year = academicYears.find((y: any) => String(y.asmaY_Id) === String(data.asmaY_Id))?.asmaY_Year || '';
                const asmcL_ClassName = classes.find((c: any) => String(c.asmcL_Id) === String(data.asmcL_Id))?.asmcL_ClassName || '';
                const asmC_SectionName = sections.find((s: any) => String(s.asmS_Id) === String(data.asmS_Id))?.asmC_SectionName || '';

                onReportGenerated(
                    {
                        ...response.data,
                        asmaY_Year,
                        asmcL_ClassName,
                        asmC_SectionName
                    },
                    data
                );
                toast.success('Report generated successfully');
            } else {
                toast.error(response?.message || 'No data found for the selected criteria');
            }
        } catch (error: any) {
            console.error('Report submission error:', error);
            toast.error(error?.message || 'Failed to generate report');
        }
    };

    const handleClear = () => {
        reset({
            asmaY_Id: 0 as any,
            asmcL_Id: 0 as any,
            asmS_Id: 0 as any
        });
        setClasses([]);
        setSections([]);
        onReset();
    };

    return (
        <div className='mx-auto w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md'>
            <div className='mb-4 flex items-center justify-between border-b pb-2'>
                <h3 className='font-semibold text-gray-800 text-lg'>Progress Card Report</h3>
            </div>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Academic Year */}
                        <div className='space-y-2'>
                            <Controller
                                control={control}
                                name='asmaY_Id'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        <div className='flex-1'>
                                            <Select
                                                onValueChange={(val) => field.onChange(Number(val))}
                                                value={field.value ? String(field.value) : ''}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Academic Year' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {academicYearLoading ? (
                                                        <SelectItem value='0' disabled>
                                                            Academic Years are loading...
                                                        </SelectItem>
                                                    ) : academicYears.length === 0 ? (
                                                        <SelectItem value='0' disabled>
                                                            No Academic Years found
                                                        </SelectItem>
                                                    ) : (
                                                        academicYears.map((y: any) => (
                                                            <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                                {y.asmaY_Year}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    </div>
                                )}
                            />
                        </div>

                        {/* Class */}
                        <div className='space-y-2'>
                            <Label>
                                Class <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='asmcL_Id'
                                render={({ field, fieldState }) => (
                                    <>
                                        <Select
                                            onValueChange={(val) => field.onChange(Number(val))}
                                            value={field.value ? String(field.value) : ''}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Class' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loadingClasses ? (
                                                    <SelectItem value='0' disabled>
                                                        Loading...
                                                    </SelectItem>
                                                ) : classes.length === 0 ? (
                                                    <SelectItem value='0' disabled>
                                                        No Classes found
                                                    </SelectItem>
                                                ) : (
                                                    classes.map((cls) => (
                                                        <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                            {cls.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </>
                                )}
                            />
                        </div>

                        {/* Section */}
                        <div className='space-y-2'>
                            <Label>
                                Section <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='asmS_Id'
                                render={({ field, fieldState }) => (
                                    <>
                                        <Select
                                            onValueChange={(val) => field.onChange(Number(val))}
                                            value={field.value ? String(field.value) : ''}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Section' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loadingSections ? (
                                                    <SelectItem value='0' disabled>
                                                        Loading...
                                                    </SelectItem>
                                                ) : sections.length === 0 ? (
                                                    <SelectItem value='0' disabled>
                                                        No Sections found
                                                    </SelectItem>
                                                ) : (
                                                    sections.map((sec) => (
                                                        <SelectItem key={sec.asmS_Id} value={String(sec.asmS_Id)}>
                                                            {sec.asmC_SectionName}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </>
                                )}
                            />
                        </div>

                        {/* Empty cell for layout */}
                        <div className='hidden md:block'></div>
                    </div>

                    <div className='mt-8 flex justify-center gap-4 border-t pt-6'>
                        <Button type='submit' disabled={isSubmitting} className='w-fit min-w-[100px]'>
                            {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null} Report
                        </Button>
                        <Button
                            type='button'
                            variant='destructive'
                            onClick={handleClear}
                            disabled={isSubmitting}
                            className='w-fit min-w-[100px]'>
                            Cancel
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
