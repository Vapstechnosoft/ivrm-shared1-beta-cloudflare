'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2, Save, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { DatePicker } from '@/components/ui/date-picker';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError, Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    useGetCandidateInterviewByIdVMS,
    useGetCandidateInterviewListVMS,
    useSaveOrUpdateCandidateInterviewVMS,
    useToggleCandidateInterviewStatusVMS
} from '@/hooks/hrms/recruitment/transactions/useTransactions';
import { candidateInterviewListColumns } from './_components/columns';

// Define the static options from previous code
const ROUNDS_OPTIONS = [
    'Written',
    'Technical',
    'HR Round',
    'Department Head',
    'Managerial',
    'MD Round',
    'Face to Face',
    'Third Party',
    'Others'
];

const STATUS_OPTIONS = ['Upcoming', 'InProgress', 'Complete'];

const candidateInterviewSchema = z.object({
    hrcisC_Id: z.number().optional().default(0),
    candidateId: z.string().min(1, 'Candidate is required'),
    interviewDate: z.string().min(1, 'Interview date is required'),
    interviewRound: z.string().min(1, 'Interview round is required'),
    interviewerId: z.string().min(1, 'Interviewer is required'),
    interviewVenue: z.string().min(1, 'Interview venue is required'),
    status: z.string().min(1, 'Status is required'),
    notifyByEmail: z.boolean().optional().default(false),
    notifyBySMS: z.boolean().optional().default(false)
});

type FormFields = z.infer<typeof candidateInterviewSchema>;

export default function CandidateInterviewListPage() {
    const { data: response, isLoading, error, refetchAll } = useGetCandidateInterviewListVMS();
    console.log('reponse grd', response);
    return (
        <FormProvider<any>>
            <div className='min-h-screen'>
                <div className='container mx-auto space-y-6 px-4 py-6 md:px-6 lg:px-8'>
                    <CandidateInterviewListPageContent response={response} isLoading={isLoading} error={error} refetchAll={refetchAll} />
                </div>
            </div>
        </FormProvider>
    );
}

function CandidateInterviewListPageContent({
    response,
    isLoading,
    error,
    refetchAll
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetchAll: () => void;
}) {
    // Safe extraction of lists
    const gridData = useMemo(() => response?.data?.vmsCandidateInterviewList || response?.vmsCandidateInterviewList || [], [response]);
    const candidateList = useMemo(() => response?.data?.candidateDetailsList || response?.candidateDetailsList || [], [response]);
    const interviewerList = useMemo(() => response?.data?.interviewerList || response?.interviewerList || [], [response]);

    const tableProps = useDataTableProps(gridData);

    return (
        <>
            {/* Form Section */}
            <FormSections candidateList={candidateList} interviewerList={interviewerList} refetchList={refetchAll} />

            {/* Data Table Section */}
            <CollapsibleSection
                defaultOpen={true}
                title='Candidate Interview List'
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable<any>
                    {...tableProps}
                    columns={candidateInterviewListColumns}
                    isLoading={isLoading}
                    error={error}
                    showViewOptions={false}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading interviews...'
                    noDataTitle='No Interviews Found'
                    noDataDescription='No candidate interviews available'
                    errorTitle='Error Loading Interviews'
                />
            </CollapsibleSection>
        </>
    );
}

function FormSections({
    candidateList,
    interviewerList,
    refetchList
}: {
    candidateList: any[];
    interviewerList: any[];
    refetchList: () => void;
}) {
    const { isEditFormOpen, isToggleFormOpen, selectedRow, closeEditForm, closeToggleForm, editFormRef } = useFormContext<any>();

    const getRecordMutation = useGetCandidateInterviewByIdVMS();
    const saveOrUpdateMutation = useSaveOrUpdateCandidateInterviewVMS();
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(candidateInterviewSchema),
        defaultValues: {
            hrcisC_Id: 0,
            candidateId: '',
            interviewDate: '',
            interviewRound: '',
            interviewerId: '',
            interviewVenue: '',
            status: '',
            notifyByEmail: false,
            notifyBySMS: false
        }
    });

    // Helper to get interviewer display name
    const getInterviewerFullName = (item: any) => {
        if (!item) return '';
        const parts = [item.hrmE_EmployeeFirstName, item.hrmE_EmployeeMiddleName, item.hrmE_EmployeeLastName].filter(Boolean);
        if (parts.length > 0) return parts.join(' ');
        return item.employee_fullName || item.name || `Employee #${item.hrmE_Id || item.id}`;
    };

    // Helper to parse dates safely
    const parseDateString = (dateStr: string): string => {
        if (!dateStr) return '';

        const cleanStr = dateStr.split('T')[0].split(' ')[0].trim();
        const parts = cleanStr.split(/[-/]/);
        if (parts.length === 3) {
            if (parts[2].length === 4) {
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            } else if (parts[0].length === 4) {
                return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
            }
        }

        try {
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
                return format(parsedDate, 'yyyy-MM-dd');
            }
        } catch (_) {}

        return dateStr;
    };

    // Load full details when edit opens
    useEffect(() => {
        if (isEditFormOpen && selectedRow) {
            const id = selectedRow.hrcisC_Id || selectedRow.HRCISC_Id;

            // 1. Immediately bind row data
            setValue('hrcisC_Id', id || 0);
            setValue('candidateId', (selectedRow.hrcD_Id || selectedRow.HRCD_Id || '').toString());
            setValue('interviewRound', selectedRow.hrcisC_InterviewRounds || '');
            setValue('status', selectedRow.hrcisC_Status || '');

            if (selectedRow.hrcisC_InterviewDate) {
                setValue('interviewDate', parseDateString(selectedRow.hrcisC_InterviewDate));
            }

            setIsLoadingDetails(true);

            // 2. Fetch full details from backend
            getRecordMutation.mutate(id, {
                onSuccess: (res) => {
                    let record = res?.data || res;
                    if (record) {
                        // Extract completed status if present in completedintvw
                        let completedStatus = '';
                        if (record.completedintvw && Array.isArray(record.completedintvw) && record.completedintvw.length > 0) {
                            completedStatus = record.completedintvw[0].hrciS_Status || record.completedintvw[0].HRCIS_Status || '';
                        }

                        // Extract from array if nested under vmsEditValue or vmsCandidateInterviewList
                        if (record.vmsEditValue && Array.isArray(record.vmsEditValue)) {
                            record = record.vmsEditValue[0];
                        } else if (record.vmsCandidateInterviewList && Array.isArray(record.vmsCandidateInterviewList)) {
                            record = record.vmsCandidateInterviewList[0];
                        } else if (Array.isArray(record)) {
                            record = record[0];
                        }

                        const targetHrcisCId = record.hrcisC_Id ?? record.HRCISC_Id ?? id;
                        const targetCandidateId = record.hrcD_Id ?? record.HRCD_Id ?? '';
                        const targetInterviewRound = record.hrcisC_InterviewRounds ?? record.HRCISC_InterviewRounds ?? '';
                        const targetStatus =
                            record.hrcisC_Status ??
                            record.HRCISC_Status ??
                            record.hrciS_Status ??
                            record.HRCIS_Status ??
                            completedStatus ??
                            selectedRow.hrcisC_Status ??
                            '';
                        const targetInterviewDate =
                            record.hrcisC_InterviewDateTime ?? record.hrcisC_InterviewDate ?? record.HRCISC_InterviewDate ?? '';
                        const targetInterviewerId = record.hrcisC_Interviewer ?? record.hrmE_Id ?? record.HRME_Id ?? record.id ?? '';
                        const targetInterviewVenue =
                            record.hrcisC_InterviewVenue ?? record.HRCISC_InterviewVenue ?? record.hrcisC_Venue ?? '';
                        const targetNotifyByEmail =
                            record.hrcisC_NotifyEmail ??
                            record.hrcisC_NotificationEmail ??
                            record.HRCISC_NotificationEmail ??
                            record.notifyByEmail ??
                            false;
                        const targetNotifyBySMS =
                            record.hrcisC_NotifySMS ??
                            record.hrcisC_NotificationSMS ??
                            record.HRCISC_NotificationSMS ??
                            record.notifyBySMS ??
                            false;

                        setValue('hrcisC_Id', Number(targetHrcisCId));
                        setValue('candidateId', targetCandidateId.toString());
                        setValue('interviewRound', targetInterviewRound);
                        setValue('status', targetStatus);

                        if (targetInterviewDate) {
                            setValue('interviewDate', parseDateString(targetInterviewDate));
                        }

                        setValue('interviewerId', targetInterviewerId.toString());
                        setValue('interviewVenue', targetInterviewVenue);
                        setValue('notifyByEmail', !!targetNotifyByEmail);
                        setValue('notifyBySMS', !!targetNotifyBySMS);
                    }
                    setIsLoadingDetails(false);
                },
                onError: () => {
                    setIsLoadingDetails(false);
                }
            });
        } else {
            reset({
                hrcisC_Id: 0,
                candidateId: '',
                interviewDate: '',
                interviewRound: '',
                interviewerId: '',
                interviewVenue: '',
                status: '',
                notifyByEmail: false,
                notifyBySMS: false
            });
        }
    }, [isEditFormOpen, selectedRow, setValue, reset]);

    const onSubmit: SubmitHandler<FormFields> = (data) => {
        const candidate = candidateList.find((cand) => (cand.hrcD_Id || cand.HRCD_Id).toString() === data.candidateId);
        const hrcD_FullName = candidate ? candidate.hrcD_FullName : selectedRow?.hrcD_FullName || '';

        const payload = {
            hrcisC_Id: data.hrcisC_Id || 0,
            hrcD_Id: Number(data.candidateId),
            hrcD_FullName: hrcD_FullName,
            rdotype: selectedRow?.rdotype || '',
            hrcisC_InterviewRounds: data.interviewRound,
            hrcisC_InterviewDateTime: data.interviewDate ? new Date(data.interviewDate).toISOString() : new Date().toISOString(),
            hrcisC_InterviewVenue: data.interviewVenue,
            hrcisC_ActiveFlg: selectedRow ? (selectedRow.hrcisC_ActiveFlg ?? selectedRow.HRCISC_ActiveFlg ?? true) : true,
            hrcisC_Interviewer: Number(data.interviewerId),
            hrcisC_Status: data.status,
            hrcisC_NotifyEmail: data.notifyByEmail,
            hrcisC_NotifySMS: data.notifyBySMS
        };

        saveOrUpdateMutation.mutate(payload, {
            onSuccess: (res) => {
                if (res?.success) {
                    closeEditForm();
                    refetchList();
                }
            }
        });
    };

    return (
        <>
            {isEditFormOpen && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Candidate Interview'
                        description='Modify the details of the candidate interview below'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='mr-1 h-4 w-4 text-destructive' /> Close
                            </Button>

                            {isLoadingDetails ? (
                                <div className='flex h-48 items-center justify-center gap-2'>
                                    <Loader2 className='h-8 w-8 animate-spin text-primary' />
                                    <span className='text-muted-foreground'>Loading record details...</span>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-2'>
                                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                        {/* Left Column */}
                                        <div className='space-y-4'>
                                            {/* Candidate Name */}
                                            <div className='space-y-2'>
                                                <Label htmlFor='candidateId'>Candidate Name</Label>
                                                <Controller
                                                    control={control}
                                                    name='candidateId'
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger id='candidateId'>
                                                                <SelectValue placeholder='Select Candidate' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {candidateList.map((cand) => (
                                                                    <SelectItem key={cand.hrcD_Id} value={cand.hrcD_Id.toString()}>
                                                                        {cand.hrcD_FullName}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.candidateId && <FormError>{errors.candidateId.message}</FormError>}
                                            </div>

                                            {/* Interview Date */}
                                            <div className='space-y-2'>
                                                <Label htmlFor='interviewDate'>Interview Date</Label>
                                                <Controller
                                                    control={control}
                                                    name='interviewDate'
                                                    render={({ field }) => (
                                                        <DatePicker
                                                            date={field.value ? new Date(field.value) : undefined}
                                                            setDate={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                                            placeholder='Select Interview Date'
                                                        />
                                                    )}
                                                />
                                                {errors.interviewDate && <FormError>{errors.interviewDate.message}</FormError>}
                                            </div>

                                            {/* Interview Venue */}
                                            <div className='space-y-2'>
                                                <Label htmlFor='interviewVenue'>Interview Venue</Label>
                                                <Controller
                                                    control={control}
                                                    name='interviewVenue'
                                                    render={({ field }) => (
                                                        <Textarea
                                                            id='interviewVenue'
                                                            placeholder='Enter Interview Venue'
                                                            rows={3}
                                                            {...field}
                                                        />
                                                    )}
                                                />
                                                {errors.interviewVenue && <FormError>{errors.interviewVenue.message}</FormError>}
                                            </div>

                                            {/* Status */}
                                            <div className='space-y-2'>
                                                <Label htmlFor='status'>Status</Label>
                                                <Controller
                                                    control={control}
                                                    name='status'
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger id='status'>
                                                                <SelectValue placeholder='Select Status' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {STATUS_OPTIONS.map((opt) => (
                                                                    <SelectItem key={opt} value={opt}>
                                                                        {opt}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.status && <FormError>{errors.status.message}</FormError>}
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div className='space-y-4'>
                                            {/* Interview Rounds */}
                                            <div className='space-y-2'>
                                                <Label htmlFor='interviewRound'>Interview Round</Label>
                                                <Controller
                                                    control={control}
                                                    name='interviewRound'
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger id='interviewRound'>
                                                                <SelectValue placeholder='Select Round' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {ROUNDS_OPTIONS.map((opt) => (
                                                                    <SelectItem key={opt} value={opt}>
                                                                        {opt}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.interviewRound && <FormError>{errors.interviewRound.message}</FormError>}
                                            </div>

                                            {/* Interviewer Name */}
                                            <div className='space-y-2'>
                                                <Label htmlFor='interviewerId'>Interviewer Name</Label>
                                                <Controller
                                                    control={control}
                                                    name='interviewerId'
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger id='interviewerId'>
                                                                <SelectValue placeholder='Select Interviewer' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {interviewerList.map((inter) => (
                                                                    <SelectItem
                                                                        key={inter.id || inter.hrmE_Id}
                                                                        value={(inter.id || inter.hrmE_Id).toString()}>
                                                                        {getInterviewerFullName(inter)}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.interviewerId && <FormError>{errors.interviewerId.message}</FormError>}
                                            </div>

                                            {/* Notify Candidate By */}
                                            <div className='space-y-4 rounded-lg border border-border bg-muted/20 p-4'>
                                                <Label className='font-semibold text-sm'>Notify Candidate By</Label>
                                                <div className='flex flex-col gap-3 pt-1'>
                                                    <div className='flex items-center space-x-2'>
                                                        <Controller
                                                            control={control}
                                                            name='notifyByEmail'
                                                            render={({ field }) => (
                                                                <Checkbox
                                                                    id='notifyByEmail'
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                />
                                                            )}
                                                        />
                                                        <Label htmlFor='notifyByEmail' className='cursor-pointer select-none font-normal'>
                                                            E-Mail
                                                        </Label>
                                                    </div>
                                                    <div className='flex items-center space-x-2'>
                                                        <Controller
                                                            control={control}
                                                            name='notifyBySMS'
                                                            render={({ field }) => (
                                                                <Checkbox
                                                                    id='notifyBySMS'
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                />
                                                            )}
                                                        />
                                                        <Label htmlFor='notifyBySMS' className='cursor-pointer select-none font-normal'>
                                                            SMS
                                                        </Label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className='flex justify-end gap-3 border-border border-t pt-4'>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            onClick={closeEditForm}
                                            className='border-none bg-amber-500 text-white hover:bg-amber-600 hover:text-white'>
                                            <X className='mr-2 h-4 w-4' /> Cancel
                                        </Button>
                                        <Button
                                            type='submit'
                                            disabled={saveOrUpdateMutation.isPending}
                                            className='border-none bg-blue-600 text-white hover:bg-blue-700'>
                                            {saveOrUpdateMutation.isPending ? (
                                                <>
                                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className='mr-2 h-4 w-4' /> Save & Publish
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isToggleFormOpen && selectedRow && (
                <ToggleCandidateInterviewForm rowData={selectedRow} onClose={closeToggleForm} onSuccess={refetchList} />
            )}
        </>
    );
}

function ToggleCandidateInterviewForm({
    rowData,
    onClose,
    onSuccess
}: {
    rowData: any;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const toggleStatusMutation = useToggleCandidateInterviewStatusVMS();
    const isActive = rowData.hrcisC_ActiveFlg;

    const handleConfirm = () => {
        const id = Number(rowData.hrcisC_Id || rowData.HRCISC_Id);
        toggleStatusMutation.mutate(id, {
            onSuccess: (res: any) => {
                if (res?.success) {
                    onSuccess();
                    onClose();
                }
            }
        });
    };

    return (
        <AdaptiveDialog title={isActive ? 'Deactivate Record' : 'Activate Record'} isOpen={true} onClose={onClose}>
            <div className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} the interview for{' '}
                        <strong>{rowData.hrcD_FullName}</strong>?
                    </p>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={onClose} type='button'>
                        Cancel
                    </Button>
                    <Button
                        type='button'
                        onClick={handleConfirm}
                        isLoading={toggleStatusMutation.isPending}
                        variant={isActive ? 'destructive' : 'default'}>
                        {isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </AdaptiveFooter>
            </div>
        </AdaptiveDialog>
    );
}
