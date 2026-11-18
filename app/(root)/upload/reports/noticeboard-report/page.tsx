'use client';

import { Button } from '@/components/ui/button';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { DateField } from '@/components/ui/dateField';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getNoticeBoardInitialData, getNoticeBoardReport } from '@/server/upload/reports/noticeboard-report';
import type { INoticeBoardAttachment, INoticeBoardReport } from '@/types/upload/reports/noticeboard-report';
import { AttachmentViewModal } from './_components/attachment-view-modal';
import { NoticeBoardReportTable } from './_components/noticeboard-report-table';

/* ---------------- Schema ---------------- */
const formSchema = z.object({
    asmay_id: z.string().nonempty('Academic Year is required'),
    fromdate: z.date({ required_error: 'From date is required' }),
    todate: z.date({ required_error: 'To date is required' }),
    classarray: z.array(z.string()).optional()
});

type FormFields = z.infer<typeof formSchema>;

export default function NoticeBoardUploadReportPage() {
    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState<INoticeBoardReport[]>([]);
    const [initialData, setInitialData] = useState<any>(null);
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);

    // Attachment Modal State
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
    const [selectedAttachments, setSelectedAttachments] = useState<INoticeBoardAttachment[]>([]);

    /* ---------------- Form ---------------- */
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            asmay_id: '',
            classarray: []
        }
    });

    /* ---------------- Load Initial Data ---------------- */
    useEffect(() => {
        const load = async () => {
            try {
                const res = await getNoticeBoardInitialData();
                if (res.success && res.data) {
                    setInitialData(res.data);
                } else {
                    toast.error(res.message || 'Failed to load initial data');
                }
            } catch (error) {
                toast.error('An error occurred while loading data');
            } finally {
                setIsLoadingInitial(false);
            }
        };
        load();
    }, []);

    const classList = (initialData?.classes || []).map((cls: any) => ({
        label: cls.ASMCL_ClassName,
        value: String(cls.ASMCL_Id)
    }));

    const academicYears = initialData?.academicYear || [];

    /* ---------------- Academic Year Change ---------------- */
    const handleYearChange = (value: string) => {
        const year = academicYears.find((y: any) => String(y.asmaY_Id) === value);
        if (year) {
            setValue('asmay_id', value);
            setValue('fromdate', new Date(year.asmaY_From_Date));
            setValue('todate', new Date(year.asmaY_To_Date));
        }
    };

    /* ---------------- Submit ---------------- */
    const onSubmit = async (values: FormFields) => {
        try {
            const payload = {
                ASMAY_Id: Number(values.asmay_id),
                fromdate: values.fromdate.toISOString().split('T')[0],
                todate: values.todate.toISOString().split('T')[0],
                classarray: (values.classarray ?? []).length > 0 ? values.classarray?.map((id) => ({ ASMCL_Id: Number(id) })) : undefined
            };

            const response = await getNoticeBoardReport(payload);
            if (response.success && response.data?.report) {
                setReportData(response.data.report);
                setShowReport(true);
                if (response.data.report.length === 0) {
                    toast.info('No records found for the selected criteria');
                }
            } else {
                toast.error(response.message || 'Failed to generate report');
            }
        } catch (error) {
            toast.error('Error generating report');
        }
    };

    /* ---------------- View Attachment ---------------- */
    const handleViewAttachment = async (item: INoticeBoardReport) => {
        if (item.Filepath) {
            setSelectedAttachments([
                {
                    intbfL_FileName: item.FileName,
                    intbfL_FilePath: item.Filepath,
                    intB_Attachment: null,
                    intB_Id: item.Id
                }
            ]);
            setIsAttachmentModalOpen(true);
        } else {
            toast.error('No attachments found');
        }
    };

    /* ---------------- Cancel ---------------- */
    const handleCancel = () => {
        reset();
        setShowReport(false);
        setReportData([]);
    };

    if (isLoadingInitial) {
        return (
            <div className='flex h-[60vh] items-center justify-center'>
                <Spinner className='h-8 w-8' />
            </div>
        );
    }

    return (
        <div className='fade-in container mx-auto animate-in space-y-6 p-6 duration-500'>
            <CollapsibleSection title='NoticeBoard Report' defaultOpen>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                    <div className='grid grid-cols-1 items-end gap-6 md:grid-cols-4'>
                        {/* Academic Year */}
                        <Controller
                            control={control}
                            name='asmay_id'
                            render={({ field, fieldState }) => (
                                <div className='space-y-2'>
                                    <Label className='font-semibold text-sm'>
                                        Academic Year <span className='text-destructive'>*</span>
                                    </Label>
                                    <Select onValueChange={handleYearChange} value={field.value}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='--Select Academic Year--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicYears.map((year: any) => (
                                                <SelectItem key={year.asmaY_Id} value={String(year.asmaY_Id)}>
                                                    {year.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </div>
                            )}
                        />

                        {/* From Date */}
                        <Controller
                            control={control}
                            name='fromdate'
                            render={({ field, fieldState }) => (
                                <DateField field={field} fieldState={fieldState} label='From Date' placeholder='From Date' required />
                            )}
                        />

                        {/* To Date */}
                        <Controller
                            control={control}
                            name='todate'
                            render={({ field, fieldState }) => (
                                <DateField field={field} fieldState={fieldState} label='To Date' placeholder='To Date' required />
                            )}
                        />

                        {/* Class */}
                        <Controller
                            control={control}
                            name='classarray'
                            render={({ field, fieldState }) => (
                                <div className='space-y-2'>
                                    <Label className='font-semibold text-sm'>Class Name</Label>
                                    <CustomMultiSelectBox
                                        options={classList}
                                        value={field.value ?? []}
                                        onChange={field.onChange}
                                        placeholder='--Select Class--'
                                        height='200px'
                                        isSearchRequired
                                    />
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </div>
                            )}
                        />
                    </div>

                    <div className='flex justify-center gap-4 border-t pt-4'>
                        <Button type='submit' disabled={isSubmitting} size='lg' className='px-8 shadow-md'>
                            {isSubmitting ? (
                                <>
                                    <Spinner className='mr-2 h-4 w-4' /> Generating...
                                </>
                            ) : (
                                'Report'
                            )}
                        </Button>
                        <Button type='button' variant='destructive' onClick={handleCancel} size='lg' className='px-8 shadow-md'>
                            Cancel
                        </Button>
                    </div>
                </form>
            </CollapsibleSection>

            {showReport && (
                <CollapsibleSection title='NoticeBoard Upload Report List' defaultOpen>
                    <div className='rounded-lg bg-card p-2'>
                        <NoticeBoardReportTable data={reportData} onViewAttachment={handleViewAttachment} />
                    </div>
                </CollapsibleSection>
            )}

            <AttachmentViewModal
                isOpen={isAttachmentModalOpen}
                onClose={() => setIsAttachmentModalOpen(false)}
                attachments={selectedAttachments}
            />
        </div>
    );
}
