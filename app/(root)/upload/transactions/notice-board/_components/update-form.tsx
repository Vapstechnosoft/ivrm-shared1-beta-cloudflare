'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { type INoticeBoard, noticeBoardSchema } from '@/schemas/upload/transactions/notice-board.schema';
import { uploadDocument } from '@/server/fees/trasactions/waived_off';
import {
    editNoticeBoardRecord,
    getNoticeBoardDepartments,
    getNoticeBoardDesignations,
    getNoticeBoardSections,
    getNoticeBoardStudents,
    saveNoticeBoardDetail
} from '@/server/upload/transactions/notice-board/server-action';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Eye, Loader2, Minus, Plus, Save, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface UpdateNoticeBoardFormProps {
    onSuccess: () => void;
    selectedRow: any;
    yearList: any[];
    classList: any[];
    deptList: any[];
    desgList: any[];
    routeList: any[];
    feeGroupList: any[];
    feeTermList: any[];
}

export default function UpdateNoticeBoardForm({
    onSuccess,
    selectedRow,
    yearList,
    classList,
    deptList,
    desgList,
    routeList,
    feeGroupList,
    feeTermList
}: UpdateNoticeBoardFormProps) {
    const [isUrlMode, setIsUrlMode] = useState(false);
    const [sections, setSections] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [filteredDesgList, setFilteredDesgList] = useState<any[]>(desgList);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isStartDateOpen, setIsStartDateOpen] = useState(false);
    const [isEndDateOpen, setIsEndDateOpen] = useState(false);
    const [isDisplayDateOpen, setIsDisplayDateOpen] = useState(false);
    const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

    const methods = useForm<INoticeBoard>({
        resolver: zodResolver(noticeBoardSchema)
    });

    const {
        control,
        handleSubmit,
        setValue,
        register,
        reset,
        formState: { isSubmitting }
    } = methods;

    const {
        fields: attachmentFields,
        append,
        remove,
        update
    } = useFieldArray({
        control,
        name: 'intB_FilePath_Array'
    });

    const {
        fields: urlFields,
        append: appendUrl,
        remove: removeUrl
    } = useFieldArray({
        control,
        name: 'intB_UrlPath_Array'
    });

    const asmaY_Id = useWatch({ control, name: 'asmaY_Id' });
    const intB_StartDate = useWatch({ control, name: 'intB_StartDate' });
    const check_student = useWatch({ control, name: 'check_student' });
    const check_staff = useWatch({ control, name: 'check_staff' });
    const intB_DispalyDisableFlg = useWatch({ control, name: 'intB_DispalyDisableFlg' });
    const asmcL_Id = useWatch({ control, name: 'asmcL_Id' });
    const asmS_Id = useWatch({ control, name: 'asmS_Id' });
    const select_route = useWatch({ control, name: 'select_route' });
    const fee_def = useWatch({ control, name: 'fee_def' });
    const hrmd_Id = useWatch({ control, name: 'hrmd_Id' });
    const hrmdeS_Id = useWatch({ control, name: 'hrmdeS_Id' });
    const amsT_Id = useWatch({ control, name: 'amsT_Id' });
    const ismS_Id = useWatch({ control, name: 'ismS_Id' });
    const hrmE_Id = useWatch({ control, name: 'hrmE_Id' });

    // Load initial edit data
    useEffect(() => {
        const loadEditData = async () => {
            try {
                const res = (await editNoticeBoardRecord({ intB_Id: selectedRow.intB_Id })) as any;
                if (res?.success && res.data?.editdetails?.length > 0) {
                    const data = res.data.editdetails[0];
                    const attachments = res.data.attachementlist || [];
                    const classes = res.data.studentList1 || [];
                    const departments = res.data.studentList2 || [];
                    const designations = res.data.studentList3 || [];
                    const studentsList = res.data.studentList4 || [];

                    // Populate basic fields
                    reset({
                        intB_Id: data.intB_Id,
                        asmaY_Id: data.asmaY_Id || data.ASMAY_Id || data.asmay_Id || data.asmay_id,
                        ntB_TTSylabusFlg: data.ntB_TTSylabusFlg || data.NTB_TTSylabusFlg,
                        intB_Title: data.intB_Title || data.INTB_Title,
                        intB_Description: data.intB_Description || data.INTB_Description,
                        intB_StartDate: new Date(data.intB_StartDate || data.INTB_StartDate),
                        intB_EndDate: new Date(data.intB_EndDate || data.INTB_EndDate),
                        intB_DisplayDate:
                            data.intB_DisplayDate || data.INTB_DisplayDate
                                ? new Date(data.intB_DisplayDate || data.INTB_DisplayDate)
                                : null,
                        intB_DispalyDisableFlg: data.intB_DispalyDisableFlg ?? data.INTB_DispalyDisableFlg,
                        intB_ActiveFlag: data.intB_ActiveFlag ?? data.INTB_ActiveFlag,

                        check_student: data.intB_ToStudentFlg ?? data.INTB_ToStudentFlg,
                        check_staff: data.intB_ToStaffFlg ?? data.INTB_ToStaffFlg,
                        select_route: data.routeflag || false,
                        fee_def: data.fee_def || false,

                        // Mapping selection lists with correct ID keys from backend (handles multiple casing options)
                        asmcL_Id: (classes || []).map((c: any) => ({ asmcL_Id: c.asmcL_Id || c.asmcl_Id })).filter((i: any) => i.asmcL_Id),
                        asmS_Id: (res.data.sectionlist || [])
                            .map((s: any) => ({ asmS_Id: s.ASMS_Id || s.asmS_Id || s.asms_Id }))
                            .filter((i: any) => i.asmS_Id),
                        amsT_Id: (studentsList || [])
                            .map((s: any) => ({ amsT_Id: s.AMST_Id || s.amsT_Id || s.amst_Id }))
                            .filter((i: any) => i.amsT_Id),
                        ismS_Id: (res.data.subjectlist || [])
                            .map((s: any) => ({ ismS_Id: s.ISMS_Id || s.ismS_Id || s.isms_Id }))
                            .filter((i: any) => i.ismS_Id),

                        hrmd_Id: (departments || [])
                            .map((d: any) => ({ hrmd_Id: d.HRMDC_ID || d.hrmd_Id || d.hrmdC_ID || d.hrmdc_Id || d.hrmd_ID || 0 }))
                            .filter((i: any) => i.hrmd_Id),
                        hrmdeS_Id: (designations || [])
                            .map((d: any) => ({ hrmdeS_Id: d.HRMDES_Id || d.hrmdeS_Id || d.hrmdes_Id || d.hrmdes_id || 0 }))
                            .filter((i: any) => i.hrmdeS_Id),
                        hrmE_Id: (res.data.staffList || [])
                            .map((e: any) => ({ hrmE_Id: e.hrmE_Id || e.hrme_Id || e.hrmE_ID || e.hrme_ID || 0 }))
                            .filter((i: any) => i.hrmE_Id),

                        routeList: (res.data.routearray || [])
                            .map((r: any) => ({ trmR_Id: r.trmR_Id || r.trmr_Id || r.trmR_ID || r.trmr_ID || 0 }))
                            .filter((i: any) => i.trmR_Id),
                        feeGroupList: (res.data.defgrparray || [])
                            .map((f: any) => ({ fmg_Id: f.fmg_Id || f.fmg_id || f.fmG_Id || f.fmG_ID || 0 }))
                            .filter((i: any) => i.fmg_Id),
                        feeTermList: (res.data.fee_terms || [])
                            .map((f: any) => ({ fmT_Id: f.fmT_Id || f.fmt_Id || f.fmT_ID || f.fmt_ID || 0 }))
                            .filter((i: any) => i.fmT_Id),

                        // Map attachments
                        intB_FilePath_Array:
                            attachments.length > 0
                                ? attachments.map((att: any) => ({
                                      intbfL_Id: att.intbfL_Id,
                                      intbfL_FilePath: att.intbfL_FilePath || att.intB_FilePath || att.intbfl_FilePath || '',
                                      fileName: att.intbfL_FileName || att.fileName || att.filename || 'Attachment'
                                  }))
                                : [{ intbfL_FilePath: '', fileName: '' }],
                        intB_UrlPath_Array: []
                    } as any);
                }
            } catch (error) {
                console.error('Error loading edit details:', error);
                toast.error('Failed to load record details');
            } finally {
                setIsInitialLoading(false);
            }
        };

        loadEditData();
    }, [selectedRow.intB_Id, reset]);

    // Cascading Dropdowns: Designations after Department Selection
    useEffect(() => {
        if (!isInitialLoading && check_staff && hrmd_Id && hrmd_Id.length > 0) {
            const payload = {
                departmentlist: hrmd_Id.map((id: any) => ({ hrmdC_ID: id.hrmd_Id }))
            };
            getNoticeBoardDepartments(payload).then((res: any) => {
                const list = res?.data || res?.desglist || [];
                setFilteredDesgList(list);
            });
        } else if (!isInitialLoading) {
            setFilteredDesgList(desgList);
        }
    }, [hrmd_Id, check_staff, desgList, isInitialLoading]);

    // Cascading Dropdowns: Sections
    useEffect(() => {
        if (!isInitialLoading && asmcL_Id && asmcL_Id.length > 0) {
            const payload = {
                asmaY_Id: asmaY_Id,
                classlsttwo: asmcL_Id
            };
            getNoticeBoardSections(payload).then((res) => {
                setSections((res.data as any[]) || (res.sectionlistarray as any[]) || []);
            });
        } else if (!isInitialLoading) {
            setSections([]);
            if (asmS_Id && asmS_Id.length > 0) setValue('asmS_Id', []);
        }
    }, [asmcL_Id, asmaY_Id, setValue, isInitialLoading, asmS_Id]);

    // Cascading Dropdowns: Students & Subjects
    useEffect(() => {
        if (!isInitialLoading && asmS_Id && asmS_Id.length > 0) {
            const payload = {
                asmaY_Id: asmaY_Id,
                classlsttwo: asmcL_Id,
                sectionlistarray: asmS_Id
            };
            getNoticeBoardStudents(payload).then((res) => {
                setStudents((res.data as any[]) || (res.studentlist as any[]) || []);
                setSubjects((res.data2 as any[]) || (res.subjectlist as any[]) || []);
            });
        } else if (!isInitialLoading) {
            setStudents([]);
            setSubjects([]);
            if (amsT_Id && amsT_Id.length > 0) setValue('amsT_Id', []);
            if (ismS_Id && ismS_Id.length > 0) setValue('ismS_Id', []);
        }
    }, [asmS_Id, asmcL_Id, asmaY_Id, setValue, isInitialLoading, amsT_Id, ismS_Id]);

    // Cascading Dropdowns: Employees after Selecting Designations
    useEffect(() => {
        if (!isInitialLoading && check_staff && (hrmd_Id?.length || hrmdeS_Id?.length)) {
            const payload = {
                departmentlist: (hrmd_Id || []).map((id: any) => ({ hrmdC_ID: id.hrmd_Id })),
                designationlist: (hrmdeS_Id || []).map((id: any) => ({ hrmdeS_Id: id.hrmdeS_Id }))
            };
            getNoticeBoardDesignations(payload).then((res: any) => {
                if (res?.staffList) {
                    setEmployees(res.staffList);
                } else if (res?.data) {
                    setEmployees(res.data);
                }
            });
        } else if (!isInitialLoading) {
            setEmployees([]);
            if (hrmE_Id && hrmE_Id.length > 0) setValue('hrmE_Id', []);
        }
    }, [check_staff, hrmd_Id, hrmdeS_Id, setValue, isInitialLoading, hrmE_Id]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            update(index, { ...attachmentFields[index], fileName: 'Uploading...', file: file });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('FileName', file.name);
            formData.append('ContentType', file.type);
            formData.append('subContainerName', 'NoticeUpload');

            const response = await uploadDocument(formData);

            if (response.success && response.data) {
                update(index, {
                    intbfL_FilePath: response.data,
                    fileName: file.name
                });
                toast.success('File uploaded successfully');
            } else {
                throw new Error(response.message || 'Upload failed');
            }
        } catch (error: any) {
            update(index, { intbfL_FilePath: '', fileName: '' });
            toast.error(`Upload failed: ${error.message}`);
        }
    };

    const onSubmit = async (data: INoticeBoard) => {
        try {
            // Map form data to the specific payload structure required by the backend
            const payload = {
                INTB_Id: data.intB_Id,
                INTB_Title: data.intB_Title,
                INTB_Description: data.intB_Description || '',
                ASMAY_Id: data.asmaY_Id,
                INTB_StartDate: data.intB_StartDate.toISOString(),
                INTB_EndDate: data.intB_EndDate.toISOString(),
                INTB_DisplayDate: data.intB_DisplayDate ? data.intB_DisplayDate.toISOString() : new Date().toISOString(),
                INTB_Attachment: 'string',
                INTB_FilePath: 'string',
                NTB_TTSylabusFlg: data.ntB_TTSylabusFlg,
                INTB_DispalyDisableFlg: data.intB_DispalyDisableFlg,
                INTB_ToStaffFlg: data.check_staff,
                INTB_ToStudentFlg: data.check_student,
                getclass: false,
                classlsttwo: data.check_student ? (data.asmcL_Id || []).map((c) => ({ ASMCL_Id: c.asmcL_Id })) : [],
                sectionlistarray: data.check_student
                    ? (data.asmS_Id || []).map((s) => {
                          const sectionInfo = sections.find((sec) => (sec.ASMS_Id || sec.asmS_Id || sec.asms_Id) === s.asmS_Id);
                          return {
                              ASMS_Id: s.asmS_Id,
                              ASMCL_Id:
                                  sectionInfo?.asmcL_Id ||
                                  sectionInfo?.asmcl_Id ||
                                  sectionInfo?.ASMCL_Id ||
                                  data.asmcL_Id?.[0]?.asmcL_Id ||
                                  0
                          };
                      })
                    : [],
                studentarray: data.check_student ? (data.amsT_Id || []).map((s) => ({ AMST_Id: s.amsT_Id })) : [],
                employeearraylist: data.check_staff ? (data.hrmE_Id || []).map((e) => ({ HRME_Id: e.hrmE_Id })) : [],
                FilePath_Array: [
                    ...(data.intB_FilePath_Array || []),
                    ...(isUrlMode ? data.intB_UrlPath_Array || [] : [])
                ]
                    .map((f) => ({
                        FileName: f.fileName || '',
                        INTBFL_FilePath: f.intbfL_FilePath || ''
                    }))
                    .filter((f) => f.INTBFL_FilePath && f.INTBFL_FilePath.trim() !== ''),
                fee_def: data.check_student ? data.fee_def : false,
                routeflag: data.check_student ? data.select_route : false,
                defgrparray: data.check_student && data.fee_def ? (data.feeGroupList || []).map((f) => ({ FMG_Id: f.fmg_Id })) : [],
                defarray: data.check_student && data.fee_def ? (data.feeTermList || []).map((f) => ({ FMT_Id: f.fmT_Id })) : [],
                routearray: data.check_student ? (data.routeList || []).map((r) => ({ TRMR_Id: r.trmR_Id })) : []
            };

            const result = await saveNoticeBoardDetail(payload);
            const isSuccess =
                result?.success === true ||
                result?.returnval === true ||
                result?.returnval === 'true' ||
                result?.returnVal === true ||
                result?.returnVal === 'true' ||
                result?.returnval === 'Save' ||
                result?.returnval === 'Update' ||
                result?.returnVal === 'Saved' ||
                result?.returnVal === 'Saved successfully';

            if (isSuccess) {
                const successMsg =
                    (typeof result?.message === 'string' && result.message) ||
                    (typeof result?.returnVal === 'string' && result.returnVal) ||
                    'Notice updated successfully';
                toast.success(successMsg);
                onSuccess();
            } else if (result?.returnval === false || result?.dulicate === true || result?.duplicate === true) {
                toast.error(typeof result?.message === 'string' ? result.message : 'Notice already exists or duplicate record found.');
            } else {
                toast.error(typeof result?.message === 'string' ? result.message : 'Failed to update notice');
            }
        } catch (error: any) {
            console.error('Update Error:', error);
            toast.error(error?.message || error || 'Error occurred while updating notice');
        }
    };

    const onError = (errors: any) => {
        console.error('Validation errors:', errors);
        const errorValues = Object.values(errors);
        if (errorValues.length > 0) {
            const firstError: any = errorValues[0];
            const message =
                firstError?.message ||
                firstError?.root?.message ||
                (Array.isArray(firstError) && firstError[0]?.message) ||
                'Please fill all required fields correctly.';
            toast.error(typeof message === 'string' ? message : 'Please fill all required fields correctly.');
        }
    };

    if (isInitialLoading) {
        return (
            <div className='flex h-64 items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        );
    }

    return (
        <div className='flex w-full flex-col gap-6'>
            <form onSubmit={handleSubmit(onSubmit, onError)} className='flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-md'>
                {/* Selection Type Toggles */}
                <div className='flex flex-wrap gap-6 border-b pb-4'>
                    <Controller
                        control={control}
                        name='check_student'
                        render={({ field }) => (
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                        field.onChange(checked);
                                    }}
                                />
                                <Label className='font-semibold'>Student</Label>
                            </div>
                        )}
                    />
                    <Controller
                        control={control}
                        name='check_staff'
                        render={({ field }) => (
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                        field.onChange(checked);
                                    }}
                                />
                                <Label className='font-semibold'>Staff</Label>
                            </div>
                        )}
                    />
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {/* Academic Year */}
                    <Controller
                        control={control}
                        name='asmaY_Id'
                        render={({ field, fieldState }) => (
                            <div>
                                <Label>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(yearList || []).map((year: any) => (
                                            <SelectItem
                                                key={year.asmaY_Id || year.asmay_Id}
                                                value={(year.asmaY_Id || year.asmay_Id || '').toString()}>
                                                {year.asmaY_Year || year.asmay_year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                            </div>
                        )}
                    />

                    {/* Notice Type */}
                    <Controller
                        control={control}
                        name='ntB_TTSylabusFlg'
                        render={({ field, fieldState }) => (
                            <div>
                                <Label>
                                    Notice Type <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Notice Type' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='TT'>TimeTable</SelectItem>
                                        <SelectItem value='S'>Syllabus</SelectItem>
                                        <SelectItem value='P'>Portion</SelectItem>
                                        <SelectItem value='O'>Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                            </div>
                        )}
                    />

                    {/* Notice Title */}
                    <div>
                        <Label>
                            Notice Title <span className='text-red-500'>*</span>
                        </Label>
                        <Input placeholder='Enter Notice Title' {...register('intB_Title')} />
                        {methods.formState.errors.intB_Title && <FormError>{methods.formState.errors.intB_Title.message}</FormError>}
                    </div>

                    {/* Start Date */}
                    <Controller
                        control={control}
                        name='intB_StartDate'
                        render={({ field, fieldState }) => (
                            <div className='flex flex-col'>
                                <Label>
                                    Start Date <span className='text-red-500'>*</span>
                                </Label>
                                <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={'outline'}
                                            className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                            {field.value ? format(field.value, 'dd/MM/yyyy') : <span>Pick a date</span>}
                                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <Calendar
                                            mode='single'
                                            selected={field.value}
                                            onSelect={(date) => {
                                                field.onChange(date);
                                                setIsStartDateOpen(false);
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                            </div>
                        )}
                    />

                    {/* End Date */}
                    <Controller
                        control={control}
                        name='intB_EndDate'
                        render={({ field, fieldState }) => (
                            <div className='flex flex-col'>
                                <Label>
                                    End Date <span className='text-red-500'>*</span>
                                </Label>
                                <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={'outline'}
                                            className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                            {field.value ? format(field.value, 'dd/MM/yyyy') : <span>Pick a date</span>}
                                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <Calendar
                                            mode='single'
                                            selected={field.value}
                                            disabled={(date) => {
                                                if (!intB_StartDate) return false;
                                                const start = new Date(intB_StartDate);
                                                start.setHours(0, 0, 0, 0);
                                                return date < start;
                                            }}
                                            onSelect={(date) => {
                                                field.onChange(date);
                                                setIsEndDateOpen(false);
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                            </div>
                        )}
                    />

                    {/* Display Date Toggle */}
                    <div className='flex items-end pb-2'>
                        <Controller
                            control={control}
                            name='intB_DispalyDisableFlg'
                            render={({ field }) => (
                                <div className='flex items-center space-x-2'>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} id='display-date-check-edit' />
                                    <Label htmlFor='display-date-check-edit' className='cursor-pointer font-normal'>
                                        Display Date
                                    </Label>
                                </div>
                            )}
                        />
                    </div>

                    {/* Display Date Picker */}
                    {intB_DispalyDisableFlg && (
                        <Controller
                            control={control}
                            name='intB_DisplayDate'
                            render={({ field, fieldState }) => (
                                <div className='flex flex-col'>
                                    <Label>
                                        Display Date <span className='text-red-500'>*</span>
                                    </Label>
                                    <Popover open={isDisplayDateOpen} onOpenChange={setIsDisplayDateOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={'outline'}
                                                className={cn(
                                                    'w-full pl-3 text-left font-normal',
                                                    !field.value && 'text-muted-foreground'
                                                )}>
                                                {field.value ? format(field.value, 'dd/MM/yyyy') : <span>Pick a date</span>}
                                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <Calendar
                                                mode='single'
                                                selected={field.value || undefined}
                                                onSelect={(date) => {
                                                    field.onChange(date);
                                                    setIsDisplayDateOpen(false);
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </div>
                            )}
                        />
                    )}

                    <div className='col-span-1 md:col-span-2 lg:col-span-3'>
                        <Label>Description</Label>
                        <Textarea placeholder='Enter Description' {...register('intB_Description')} className='min-h-[80px]' />
                    </div>
                </div>

                {/* Attachments Section */}
                <div className='space-y-4 rounded-md border bg-gray-50/30 p-4 shadow-sm'>
                    <h3 className='font-bold text-gray-800 text-lg'>Attachments</h3>
                    <div className='overflow-x-auto'>
                        <table className='w-full table-auto border-collapse border bg-white text-left text-sm'>
                            <thead className='bg-muted/50'>
                                <tr>
                                    <th className='w-12 border p-2 text-center'>SL NO</th>
                                    <th className='border p-2 text-center'>Upload File</th>
                                    <th className='border p-2 text-center'>File Name</th>
                                    <th className='w-20 border p-2 text-center'>View</th>
                                    <th className='w-24 border p-2 text-center'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attachmentFields.map((field, index) => (
                                    <tr key={field.id} className='border-b transition-colors hover:bg-gray-50/50'>
                                        <td className='border p-2 text-center'>{index + 1}</td>
                                        <td className='border p-2'>
                                            <div className='flex justify-center'>
                                                <input
                                                    type='file'
                                                    className='hidden'
                                                    ref={(el) => {
                                                        if (el) fileInputRefs.current[index] = el;
                                                    }}
                                                    onChange={(e) => handleFileUpload(e, index)}
                                                />
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    size='sm'
                                                    onClick={() => fileInputRefs.current[index]?.click()}
                                                    className='h-9 w-full border-dashed'>
                                                    <Upload className='mr-2 h-4 w-4' /> Browse
                                                </Button>
                                            </div>
                                        </td>
                                        <td className='border p-2'>
                                            <Controller
                                                control={control}
                                                name={`intB_FilePath_Array.${index}.fileName`}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        readOnly
                                                        placeholder='No file'
                                                        className='h-9 bg-muted/20'
                                                    />
                                                )}
                                            />
                                        </td>
                                        <td className='border p-2 text-center'>
                                            <Controller
                                                control={control}
                                                name={`intB_FilePath_Array.${index}.intbfL_FilePath`}
                                                render={({ field }) => (
                                                    <Button
                                                        type='button'
                                                        variant='ghost'
                                                        size='sm'
                                                        disabled={!field.value}
                                                        onClick={() => window.open(field.value, '_blank')}>
                                                        <Eye className={cn('h-4 w-4', field.value ? 'text-blue-600' : 'text-gray-300')} />
                                                    </Button>
                                                )}
                                            />
                                        </td>
                                        <td className='border p-2 text-center'>
                                            <div className='flex justify-center gap-1'>
                                                {index === attachmentFields.length - 1 && (
                                                    <Button
                                                        type='button'
                                                        size='icon'
                                                        variant='outline'
                                                        className='h-8 w-8'
                                                        onClick={() => append({ intbfL_FilePath: '', fileName: '' })}>
                                                        <Plus className='h-4 w-4' />
                                                    </Button>
                                                )}
                                                {attachmentFields.length > 1 && (
                                                    <Button
                                                        type='button'
                                                        size='icon'
                                                        variant='destructive'
                                                        className='h-8 w-8'
                                                        onClick={() => remove(index)}>
                                                        <Minus className='h-4 w-4' />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className='pt-1'>
                        <span className='font-semibold text-red-500 text-xs'>
                            Accept File: jpg, jpeg, png, doc, ppt, excel, mp3, mp4, wmv, pdf
                        </span>
                    </div>
                    <div className='flex items-center space-x-2 pt-2'>
                        <Checkbox
                            id='url-mode-edit'
                            checked={isUrlMode}
                            onCheckedChange={(c) => {
                                const val = !!c;
                                setIsUrlMode(val);
                                if (val && urlFields.length === 0) {
                                    appendUrl({ intbfL_FilePath: '', fileName: '' });
                                }
                            }}
                        />
                        <Label htmlFor='url-mode-edit' className='cursor-pointer font-semibold text-xs'>
                            Use URLs instead of Files
                        </Label>
                    </div>

                    {isUrlMode && (
                        <div className='overflow-x-auto pt-4'>
                            <table className='w-full table-auto border-collapse border bg-white text-left text-sm'>
                                <thead className='bg-muted/50'>
                                    <tr>
                                        <th className='w-12 border p-2 text-center'>SL NO</th>
                                        <th className='border p-2 text-center'>URL</th>
                                        <th className='border p-2 text-center'>Label</th>
                                        <th className='w-20 border p-2 text-center'>View</th>
                                        <th className='w-24 border p-2 text-center'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {urlFields.map((field, index) => (
                                        <tr key={field.id} className='border-b transition-colors hover:bg-gray-50/50'>
                                            <td className='border p-2 text-center'>{index + 1}</td>
                                            <td className='border p-2'>
                                                <Controller
                                                    control={control}
                                                    name={`intB_UrlPath_Array.${index}.intbfL_FilePath`}
                                                    render={({ field }) => (
                                                        <Input {...field} placeholder='Enter URL' className='h-9' />
                                                    )}
                                                />
                                            </td>
                                            <td className='border p-2'>
                                                <Controller
                                                    control={control}
                                                    name={`intB_UrlPath_Array.${index}.fileName`}
                                                    render={({ field }) => (
                                                        <Input {...field} placeholder='Enter Label' className='h-9' />
                                                    )}
                                                />
                                            </td>
                                            <td className='border p-2 text-center'>
                                                <Controller
                                                    control={control}
                                                    name={`intB_UrlPath_Array.${index}.intbfL_FilePath`}
                                                    render={({ field }) => (
                                                        <Button
                                                            type='button'
                                                            variant='ghost'
                                                            size='sm'
                                                            disabled={!field.value}
                                                            onClick={() => window.open(field.value, '_blank')}>
                                                            <Eye className={cn('h-4 w-4', field.value ? 'text-blue-600' : 'text-gray-300')} />
                                                        </Button>
                                                    )}
                                                />
                                            </td>
                                            <td className='border p-2 text-center'>
                                                <div className='flex justify-center gap-1'>
                                                    {index === urlFields.length - 1 && (
                                                        <Button
                                                            type='button'
                                                            size='icon'
                                                            variant='outline'
                                                            className='h-8 w-8'
                                                            onClick={() => appendUrl({ intbfL_FilePath: '', fileName: '' })}>
                                                            <Plus className='h-4 w-4' />
                                                        </Button>
                                                    )}
                                                    {urlFields.length > 1 && (
                                                        <Button
                                                            type='button'
                                                            size='icon'
                                                            variant='destructive'
                                                            className='h-8 w-8'
                                                            onClick={() => removeUrl(index)}>
                                                            <Minus className='h-4 w-4' />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Student Targeting Logic */}
                {check_student && (
                    <div className='space-y-6 border-t border-dashed pt-4'>
                        <div className='flex flex-wrap items-center gap-6 rounded-lg bg-blue-50/30 p-4'>
                            <Controller
                                control={control}
                                name='select_route'
                                render={({ field }) => (
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        <Label className='font-semibold text-blue-900'>Select Route</Label>
                                    </div>
                                )}
                            />
                            <Controller
                                control={control}
                                name='fee_def'
                                render={({ field }) => (
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        <Label className='font-semibold text-red-900'>Fee Defaulters</Label>
                                    </div>
                                )}
                            />
                        </div>

                        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                            {select_route && (
                                <Controller
                                    control={control}
                                    name='routeList'
                                    render={({ field }) => (
                                        <CustomMultiSelectBox
                                            label='Routes'
                                            options={(routeList || []).map((r: any) => ({
                                                label: r.trmR_RouteName || r.trmr_routename || r.trmR_routeName || '',
                                                value: (r.trmR_Id || r.trmr_Id || r.trmR_id || '').toString()
                                            }))}
                                            value={field.value?.map((v) => v.trmR_Id?.toString()).filter((id): id is string => !!id) || []}
                                            onChange={(vals) => field.onChange((vals || []).map((v) => ({ trmR_Id: Number(v) })))}
                                            isSearchRequired
                                        />
                                    )}
                                />
                            )}
                            {fee_def && (
                                <>
                                    <Controller
                                        control={control}
                                        name='feeGroupList'
                                        render={({ field }) => (
                                            <CustomMultiSelectBox
                                                label='Fee Groups'
                                                options={(feeGroupList || []).map((f: any) => ({
                                                    label: f.fmG_Name || f.fmg_GroupName || f.fmg_groupname || f.fmG_groupName || '',
                                                    value: (f.fmG_Id || f.fmg_Id || f.fmg_id || f.fmG_id || '').toString()
                                                }))}
                                                value={
                                                    field.value?.map((v) => v.fmg_Id?.toString()).filter((id): id is string => !!id) || []
                                                }
                                                onChange={(vals) => field.onChange((vals || []).map((v) => ({ fmg_Id: Number(v) })))}
                                                isSearchRequired
                                            />
                                        )}
                                    />
                                    <Controller
                                        control={control}
                                        name='feeTermList'
                                        render={({ field }) => (
                                            <CustomMultiSelectBox
                                                label='Fee Terms'
                                                options={(feeTermList || []).map((f: any) => ({
                                                    label: f.fmT_Name || f.fmt_Name || f.fmt_name || f.fmT_name || '',
                                                    value: (f.fmT_Id || f.fmt_Id || f.fmt_id || f.fmT_id || '').toString()
                                                }))}
                                                value={
                                                    field.value?.map((v) => v.fmT_Id?.toString()).filter((id): id is string => !!id) || []
                                                }
                                                onChange={(vals) => field.onChange((vals || []).map((v) => ({ fmT_Id: Number(v) })))}
                                                isSearchRequired
                                            />
                                        )}
                                    />
                                </>
                            )}
                        </div>

                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                            <Controller
                                control={control}
                                name='asmcL_Id'
                                render={({ field }) => (
                                    <CustomMultiSelectBox
                                        label='Classes'
                                        isRequired
                                        options={(classList || []).map((c: any) => ({
                                            label: c.asmcL_ClassName || c.asmcl_classname || c.asmcL_className || '',
                                            value: (c.asmcL_Id || c.asmcl_Id || c.asmcL_id || '').toString()
                                        }))}
                                        value={field.value?.map((v) => v.asmcL_Id?.toString()).filter((id): id is string => !!id) || []}
                                        onChange={(vals) => field.onChange((vals || []).map((v) => ({ asmcL_Id: Number(v) })))}
                                        isSearchRequired
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name='asmS_Id'
                                render={({ field }) => (
                                    <CustomMultiSelectBox
                                        label='Sections'
                                        options={(sections || [])
                                            .map((s: any) => ({
                                                label: s.ASMC_SectionName || s.asmC_SectionName || s.asmc_sectionname || '',
                                                value: (s.ASMS_Id || s.asmS_Id || s.asms_Id || '').toString()
                                            }))
                                            .filter((opt) => opt.value)}
                                        value={field.value?.map((v) => v.asmS_Id?.toString()).filter((id): id is string => !!id) || []}
                                        onChange={(vals) => field.onChange((vals || []).map((v) => ({ asmS_Id: Number(v) })))}
                                        isSearchRequired
                                        disabled={!asmcL_Id?.length}
                                    />
                                )}
                            />
                            {/* <Controller
                                control={control}
                                name="ismS_Id"
                                render={({ field }) => (
                                    <CustomMultiSelectBox
                                        label="Subjects"
                                        options={(subjects || []).map((s: any) => ({ 
                                            label: s.ISMS_SubjectName || s.ismS_SubjectName || s.isms_subjectname || '', 
                                            value: (s.ISMS_Id || s.ismS_Id || s.isms_Id || '').toString() 
                                        })).filter(opt => opt.value)}
                                        value={field.value?.map((v) => v.ismS_Id?.toString()).filter((id): id is string => !!id) || []}
                                        onChange={(vals) => field.onChange((vals || []).map((v) => ({ ismS_Id: Number(v) })))}
                                        isSearchRequired
                                        disabled={!asmS_Id?.length}
                                    />
                                )}
                            /> */}
                            <Controller
                                control={control}
                                name='amsT_Id'
                                render={({ field, fieldState }) => (
                                    <div className='flex flex-col'>
                                        <CustomMultiSelectBox
                                            label='Students'
                                            isRequired
                                            options={Array.from(
                                                new Map(
                                                    (students || []).map((s: any) => [
                                                        (s.AMST_Id || s.amsT_Id || s.amst_Id || '').toString(),
                                                        s
                                                    ])
                                                ).values()
                                            )
                                                .map((s: any) => ({
                                                    label:
                                                        `${s.studentname || s.AMST_FirstName || s.amsT_FirstName || s.amst_firstname || ''}${s.AMST_AdmNo || s.amst_admno ? ` (${s.AMST_AdmNo || s.amst_admno})` : ''}` ||
                                                        '',
                                                    value: (s.AMST_Id || s.amsT_Id || s.amst_Id || '').toString()
                                                }))
                                                .filter((opt) => opt.value)}
                                            value={field.value?.map((v) => v.amsT_Id?.toString()).filter((id): id is string => !!id) || []}
                                            onChange={(vals) => field.onChange((vals || []).map((v) => ({ amsT_Id: Number(v) })))}
                                            isSearchRequired
                                            disabled={!asmS_Id?.length}
                                        />
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                )}

                {/* Staff Targeting Logic */}
                {check_staff && (
                    <div className='grid grid-cols-1 gap-4 rounded-lg border-t border-dashed bg-orange-50/20 p-4 pt-4 md:grid-cols-3'>
                        <Controller
                            control={control}
                            name='hrmd_Id'
                            render={({ field }) => (
                                <CustomMultiSelectBox
                                    label='Departments'
                                    options={(deptList || [])
                                        .map((d: any) => ({
                                            label:
                                                d.HRMDC_Name ||
                                                d.HRMD_DepartmentName ||
                                                d.hrmd_DepartmentName ||
                                                d.hrmd_departmentname ||
                                                d.hrmdc_Name ||
                                                '',
                                            value: (d.HRMDC_ID || d.HRMD_Id || d.hrmd_Id || d.hrmd_id || d.hrmdc_Id || '').toString()
                                        }))
                                        .filter((opt) => opt.value)}
                                    value={field.value?.map((v) => v.hrmd_Id?.toString()).filter((id): id is string => !!id) || []}
                                    onChange={(vals) => field.onChange((vals || []).map((v) => ({ hrmd_Id: Number(v) })))}
                                    isSearchRequired
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name='hrmdeS_Id'
                            render={({ field }) => (
                                <CustomMultiSelectBox
                                    label='Designations'
                                    options={(filteredDesgList || [])
                                        .map((d: any) => ({
                                            label:
                                                d.HRMDES_DesignationName ||
                                                d.hrmdes_DesignationName ||
                                                d.hrmdeS_DesignationName ||
                                                d.hrmdes_designationname ||
                                                '',
                                            value: (d.HRMDES_Id || d.hrmdeS_Id || d.hrmdes_Id || d.hrmdes_id || '').toString()
                                        }))
                                        .filter((opt) => opt.value)}
                                    value={field.value?.map((v) => v.hrmdeS_Id?.toString()).filter((id): id is string => !!id) || []}
                                    onChange={(vals) => field.onChange((vals || []).map((v) => ({ hrmdeS_Id: Number(v) })))}
                                    isSearchRequired
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name='hrmE_Id'
                            render={({ field, fieldState }) => (
                                <div className='flex flex-col'>
                                    <CustomMultiSelectBox
                                        label='Employees'
                                        isRequired
                                        options={(employees || [])
                                            .map((e: any) => ({
                                                label: e.userEmpName || e.HRME_EmployeeName || e.hrmE_EmployeeName || e.hrme_employeename || '',
                                                value: (e.HRME_Id || e.hrmE_Id || e.hrme_Id || '').toString()
                                            }))
                                            .filter((opt) => opt.value)}
                                        value={field.value?.map((v) => v.hrmE_Id?.toString()).filter((id): id is string => !!id) || []}
                                        onChange={(vals) => field.onChange((vals || []).map((v) => ({ hrmE_Id: Number(v) })))}
                                        isSearchRequired
                                        disabled={!hrmd_Id?.length && !hrmdeS_Id?.length}
                                    />
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </div>
                            )}
                        />
                    </div>
                )}

                <div className='flex justify-center gap-2 pt-6'>
                    <Button type='submit' disabled={isSubmitting} className='min-w-[120px] shadow-lg'>
                        {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
                        UPDATE NOTICE
                    </Button>
                    <Button type='button' variant='destructive' onClick={() => onSuccess()} className='min-w-[120px]'>
                        <X className='mr-2 h-4 w-4' /> CANCEL
                    </Button>
                </div>
            </form>
        </div>
    );
}
