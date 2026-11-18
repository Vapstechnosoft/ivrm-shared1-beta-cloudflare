'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useAcademicYearDropDownMasterDayClasswise,
    useCategoryDropDownMasterDayClasswise,
    useConsecutive
} from '@/hooks/timetable/constraints/consecutive';
import { consecutiveConstraintsSchema } from '@/schemas/timetable/constraints/consecutive';
import {
    getConsecutiveConstraintsEditDetails,
    getStaffDropDownMasterDayClasswise,
    getSubjectDropDownMasterDayClasswise,
    getTransactionClassDropdown,
    saveConsecutiveConstraintsDetail
} from '@/server/timetable/constraints/consecutive';
import { getSectionDropdownByClassCategory as getSectionByClassFixing } from '@/server/timetable/constraints/fixing';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof consecutiveConstraintsSchema.save>;

const extractList = (data: any, preferredKey?: string) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const target = data?.data !== undefined ? data.data : data;
    if (Array.isArray(target)) return target;
    if (!target) return [];
    if (preferredKey && Array.isArray(target[preferredKey])) return target[preferredKey];
    const keys = [
        'academiclist',
        'catelist',
        'classlist',
        'sectionlist',
        'stafflist',
        'subjectlist',
        'staffbyall',
        'subjectbystaff',
        'sectionbyclass',
        'classbycategory',
        'categorylist',
        'classDrpDwn',
        'sectDrpDwn',
        'consecutivelstedit'
    ];
    for (const key of keys) {
        if (Array.isArray(target[key])) return target[key];
    }
    return [];
};

// Returns the first value that converts to a positive number, otherwise 0
const firstId = (...values: any[]): number => {
    for (const v of values) {
        const n = Number(v);
        if (n > 0) return n;
    }
    return 0;
};

const norm = (v: any) => String(v ?? '').trim().toLowerCase();

const EMPTY_VALUES = {
    TTC_Id: 0,
    ASMAY_Id: undefined,
    TTMC_Id: undefined,
    ASMCL_Id: undefined,
    ASMS_Id: undefined,
    HRME_Id: undefined,
    ISMS_Id: undefined,
    TTC_NoOfConDays: 1,
    TTC_NoOfConPeriods: 1,
    TTC_NoOfPeriods: 0,
    TTC_BefAftApplFlag: false,
    TTC_BefAftFalg: undefined,
    TTC_BefAftPeriod: 0
} as any;

interface ConsecutiveConstraintsFormProps {
    editData?: any;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function ConsecutiveConstraintsForm({ editData, onSuccess, onCancel }: ConsecutiveConstraintsFormProps) {
    const { refetchAll } = useConsecutive();
    const [classList, setClassList] = useState<any[]>([]);
    const [isClassLoading, setIsClassLoading] = useState(false);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [isSectionLoading, setIsSectionLoading] = useState(false);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [isStaffLoading, setIsStaffLoading] = useState(false);
    const [subjectList, setSubjectList] = useState<any[]>([]);
    const [isSubjectLoading, setIsSubjectLoading] = useState(false);

    // Prevents the edit effect from running more than once for the same record
    const loadedForId = useRef<number | string | null>(null);

    const form = useForm<FormFields>({
        resolver: zodResolver(consecutiveConstraintsSchema.save),
        mode: 'onChange',
        defaultValues: EMPTY_VALUES
    });

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = form;

    const handleReset = () => {
        reset(EMPTY_VALUES);
        setClassList([]);
        setSectionList([]);
        setStaffList([]);
        setSubjectList([]);
        if (editData && onCancel) {
            onCancel();
        }
    };

    const watchedConDays = watch('TTC_NoOfConDays');
    const watchedConPeriods = watch('TTC_NoOfConPeriods');
    const watchedBefAftFlag = watch('TTC_BefAftApplFlag');

    // Dropdown hooks
    const { data: academicData, isLoading: academicLoading } = useAcademicYearDropDownMasterDayClasswise();
    const academicList = extractList(academicData, 'academiclist').filter((item: any) => item.asmaY_Id > 0 && item.asmaY_Year);

    const { data: categoryData } = useCategoryDropDownMasterDayClasswise();
    const categoryList = extractList(categoryData, 'catelist').filter((item: any) => item.ttmC_Id > 0 && item.ttmC_CategoryName);

    // ---------- Fetch helpers (each one sets its own state and returns the list) ----------

    const fetchClasses = async (yearId: number, categoryId: number) => {
        if (!yearId || !categoryId) {
            setClassList([]);
            return [];
        }
        setIsClassLoading(true);
        try {
            const data = await getTransactionClassDropdown(yearId, categoryId);
            const list = extractList(data, 'classbycategory').filter((item: any) => item.asmcL_Id > 0 && item.asmcL_ClassName);
            setClassList(list);
            return list;
        } catch (error) {
            console.error('Error fetching classes:', error);
            toast.error('Failed to load classes');
            return [];
        } finally {
            setIsClassLoading(false);
        }
    };

    const fetchSections = async (yearId: number, categoryId: number, classId: number) => {
        if (!yearId || !categoryId || !classId) {
            setSectionList([]);
            return [];
        }
        setIsSectionLoading(true);
        try {
            const data = await getSectionByClassFixing(yearId, classId, categoryId);
            const list = extractList(data, 'get_period_section1').filter(
                (item: any) => (item.asmS_Id || item.asmC_Id) > 0 && (item.asmS_SectionName || item.asmC_SectionName)
            );
            setSectionList(list);
            return list;
        } catch (error) {
            console.error('Error fetching sections:', error);
            toast.error('Failed to load sections');
            return [];
        } finally {
            setIsSectionLoading(false);
        }
    };

    const fetchStaff = async (yearId: number, categoryId: number, classId: number, sectionId: number) => {
        if (!yearId || !categoryId || !classId || !sectionId) {
            setStaffList([]);
            return [];
        }
        setIsStaffLoading(true);
        try {
            const data = await getStaffDropDownMasterDayClasswise({
                ASMAY_Id: yearId,
                TTMC_Id: categoryId,
                ASMCL_Id: classId,
                ASMS_Id: sectionId
            });
            const list = extractList(data, 'stafflist').filter(
                (item: any) => item.hrmE_Id > 0 && (item.staffName || item.hrmE_EmployeeFirstName)
            );
            setStaffList(list);
            return list;
        } catch (error) {
            console.error('Error fetching staff:', error);
            toast.error('Failed to load staff');
            return [];
        } finally {
            setIsStaffLoading(false);
        }
    };

    const fetchSubjects = async (yearId: number, categoryId: number, classId: number, sectionId: number, staffId: number) => {
        if (!yearId || !categoryId || !classId || !sectionId || !staffId) {
            setSubjectList([]);
            return [];
        }
        setIsSubjectLoading(true);
        try {
            const data = await getSubjectDropDownMasterDayClasswise({
                ASMAY_Id: yearId,
                TTMC_Id: categoryId,
                ASMCL_Id: classId,
                ASMS_Id: sectionId,
                HRME_Id: staffId
            });
            const list = extractList(data, 'subjectlist').filter((item: any) => item.ismS_Id > 0 && item.ismS_SubjectName);
            setSubjectList(list);
            return list;
        } catch (error) {
            console.error('Error fetching subjects:', error);
            toast.error('Failed to load subjects');
            return [];
        } finally {
            setIsSubjectLoading(false);
        }
    };

    // ---------- Cascading change handlers (use getValues to avoid stale closures) ----------

    const handleAcademicYearChange = (yearId: number) => {
        setValue('ASMAY_Id', yearId);
        setValue('TTMC_Id', 0);
        setValue('ASMCL_Id', 0);
        setValue('ASMS_Id', 0);
        setValue('HRME_Id', 0);
        setValue('ISMS_Id', 0);
        setClassList([]);
        setSectionList([]);
        setStaffList([]);
        setSubjectList([]);
    };

    const handleCategoryChange = async (categoryId: number) => {
        setValue('TTMC_Id', categoryId);
        setValue('ASMCL_Id', 0);
        setValue('ASMS_Id', 0);
        setValue('HRME_Id', 0);
        setValue('ISMS_Id', 0);
        setClassList([]);
        setSectionList([]);
        setStaffList([]);
        setSubjectList([]);
        const { ASMAY_Id } = form.getValues();
        if (ASMAY_Id && categoryId) {
            await fetchClasses(ASMAY_Id, categoryId);
        }
    };

    const handleClassChange = async (classId: number) => {
        setValue('ASMCL_Id', classId);
        setValue('ASMS_Id', 0);
        setValue('HRME_Id', 0);
        setValue('ISMS_Id', 0);
        setSectionList([]);
        setStaffList([]);
        setSubjectList([]);
        const { ASMAY_Id, TTMC_Id } = form.getValues();
        if (ASMAY_Id && TTMC_Id && classId) {
            await fetchSections(ASMAY_Id, TTMC_Id, classId);
        }
    };

    const handleSectionChange = async (sectionId: number) => {
        setValue('ASMS_Id', sectionId);
        setValue('HRME_Id', 0);
        setValue('ISMS_Id', 0);
        setStaffList([]);
        setSubjectList([]);
        const { ASMAY_Id, TTMC_Id, ASMCL_Id } = form.getValues();
        if (ASMAY_Id && TTMC_Id && ASMCL_Id && sectionId) {
            await fetchStaff(ASMAY_Id, TTMC_Id, ASMCL_Id, sectionId);
        }
    };

    const handleStaffChange = async (staffId: number) => {
        setValue('HRME_Id', staffId);
        setValue('ISMS_Id', 0);
        setSubjectList([]);
        const { ASMAY_Id, TTMC_Id, ASMCL_Id, ASMS_Id } = form.getValues();
        if (ASMAY_Id && TTMC_Id && ASMCL_Id && ASMS_Id && staffId) {
            await fetchSubjects(ASMAY_Id, TTMC_Id, ASMCL_Id, ASMS_Id, staffId);
        }
    };

    // ---------- Calculate total periods ----------
    useEffect(() => {
        const days = Number(watchedConDays) || 0;
        const periods = Number(watchedConPeriods) || 0;
        setValue('TTC_NoOfPeriods', days * periods);
    }, [watchedConDays, watchedConPeriods, setValue]);

    // ---------- Edit mode ----------
    useEffect(() => {
        if (!editData) {
            loadedForId.current = null;
            reset(EMPTY_VALUES);
            setClassList([]);
            setSectionList([]);
            setStaffList([]);
            setSubjectList([]);
            return;
        }

        // Wait until academic year and category lists are ready
        if (academicLoading || academicList.length === 0 || categoryList.length === 0) {
            return;
        }

        const d = editData;
        const editId =
            d?.ttC_Id ||
            d?.TTC_Id ||
            d?.ttC_ID ||
            d?.ttfConsecutive_Id ||
            d?.TTFConsecutive_Id ||
            d?.id ||
            (Array.isArray(d) && (d[0]?.ttC_Id || d[0]?.TTC_Id || d[0]?.ttfConsecutive_Id));

        // Run once per record
        const guardKey = editId || 'no-id';
        if (loadedForId.current === guardKey) return;
        loadedForId.current = guardKey;

        const fetchEditDetails = async () => {
            let editRecord: any = d;

            if (editId) {
                try {
                    const apiResponse = await getConsecutiveConstraintsEditDetails(Number(editId));
                    console.info('Consecutive Edit API Response:', apiResponse);
                    const rawEdit = apiResponse?.data !== undefined ? apiResponse.data : apiResponse;
                    const editList =
                        (Array.isArray(rawEdit?.consecutivelstedit) && rawEdit.consecutivelstedit) ||
                        (Array.isArray(rawEdit?.consecutivelist) && rawEdit.consecutivelist) ||
                        (Array.isArray(rawEdit?.editdetails) && rawEdit.editdetails) ||
                        (Array.isArray(rawEdit?.editlist) && rawEdit.editlist) ||
                        (Array.isArray(rawEdit) && rawEdit) ||
                        [];
                    if (editList.length > 0) {
                        editRecord = editList[0];
                    } else if (rawEdit && typeof rawEdit === 'object') {
                        editRecord = rawEdit;
                    }
                } catch (err) {
                    console.error('Failed to fetch edit details from API, falling back to row data:', err);
                }
            }

            // 1. Academic Year
            let asmayId = firstId(editRecord?.asmaY_Id, editRecord?.ASMAY_Id, editRecord?.asmay_id, d?.asmaY_Id, d?.ASMAY_Id);
            if (!asmayId) {
                const yearStr = norm(editRecord?.asmayYear || d?.asmayYear || editRecord?.asmaY_Year);
                if (yearStr) {
                    const m = academicList.find((y: any) => norm(y.asmaY_Year || y.ASMAY_Year) === yearStr);
                    if (m) asmayId = firstId(m.asmaY_Id, m.ASMAY_Id);
                }
            }

            // 2. Category
            let ttmcId = firstId(editRecord?.ttmC_Id, editRecord?.TTMC_Id, editRecord?.ttmc_id, d?.ttmC_Id, d?.TTMC_Id);
            if (!ttmcId) {
                const catStr = norm(editRecord?.categoryName || d?.categoryName || editRecord?.ttmC_CategoryName);
                if (catStr) {
                    const m = categoryList.find((c: any) => norm(c.ttmC_CategoryName || c.TTMC_CategoryName) === catStr);
                    if (m) ttmcId = firstId(m.ttmC_Id, m.TTMC_Id);
                }
            }

            // 3. Class (always load list with our own fetch)
            let asmclId = firstId(editRecord?.asmcL_Id, editRecord?.ASMCL_Id, editRecord?.asmcl_id, d?.asmcL_Id, d?.ASMCL_Id);
            const loadedClasses = asmayId && ttmcId ? await fetchClasses(asmayId, ttmcId) : [];
            if (!asmclId) {
                const clsStr = norm(editRecord?.className || d?.className || editRecord?.asmcL_ClassName);
                if (clsStr) {
                    const m = loadedClasses.find((c: any) => norm(c.asmcL_ClassName) === clsStr);
                    if (m) asmclId = firstId(m.asmcL_Id);
                }
            }

            // 4. Section
            let asmsId = firstId(
                editRecord?.asmS_Id,
                editRecord?.ASMS_Id,
                editRecord?.asms_id,
                editRecord?.asmC_Id,
                d?.asmS_Id,
                d?.ASMS_Id
            );
            const loadedSections = asmayId && ttmcId && asmclId ? await fetchSections(asmayId, ttmcId, asmclId) : [];
            if (!asmsId) {
                const secStr = norm(
                    editRecord?.sectionName || d?.sectionName || editRecord?.asmC_SectionName || editRecord?.asmS_SectionName
                );
                if (secStr) {
                    const m = loadedSections.find((s: any) => norm(s.asmS_SectionName || s.asmC_SectionName) === secStr);
                    if (m) asmsId = firstId(m.asmS_Id, m.asmC_Id);
                }
            }

            // 5. Staff
            let hrmeId = firstId(editRecord?.hrmE_Id, editRecord?.HRME_Id, editRecord?.hrme_id, d?.hrmE_Id, d?.HRME_Id);
            const loadedStaff =
                asmayId && ttmcId && asmclId && asmsId ? await fetchStaff(asmayId, ttmcId, asmclId, asmsId) : [];
            if (!hrmeId) {
                const stStr = norm(editRecord?.staffName || d?.staffName);
                if (stStr) {
                    const m = loadedStaff.find((s: any) => norm(s.staffName || s.hrmE_EmployeeFirstName) === stStr);
                    if (m) hrmeId = firstId(m.hrmE_Id);
                }
            }

            // 6. Subject
            let ismsId = firstId(editRecord?.ismS_Id, editRecord?.ISMS_Id, editRecord?.isms_id, d?.ismS_Id, d?.ISMS_Id);
            const loadedSubjects =
                asmayId && ttmcId && asmclId && asmsId && hrmeId
                    ? await fetchSubjects(asmayId, ttmcId, asmclId, asmsId, hrmeId)
                    : [];
            if (!ismsId) {
                const subStr = norm(editRecord?.subjectName || d?.subjectName || editRecord?.ismS_SubjectName);
                if (subStr) {
                    const m = loadedSubjects.find((s: any) => norm(s.ismS_SubjectName) === subStr);
                    if (m) ismsId = firstId(m.ismS_Id);
                }
            }

            console.info('Edit resolved IDs', { asmayId, ttmcId, asmclId, asmsId, hrmeId, ismsId });

            // 7. Numbers and flags
            const conDays = Number(editRecord?.ttC_NoOfConDays ?? editRecord?.TTC_NoOfConDays ?? d?.ttC_NoOfConDays ?? 1);
            const conPeriods = Number(editRecord?.ttC_NoOfConPeriods ?? editRecord?.TTC_NoOfConPeriods ?? d?.ttC_NoOfConPeriods ?? 1);
            const noOfPeriods = Number(
                editRecord?.ttC_NoOfPeriods ?? editRecord?.TTC_NoOfPeriods ?? d?.noOfPeriods ?? conDays * conPeriods
            );

            const befAftApplFlag = Boolean(
                editRecord?.ttC_BefAftApplFlag === true ||
                    editRecord?.ttC_BefAftApplFlag === 1 ||
                    editRecord?.TTC_BefAftApplFlag === true ||
                    editRecord?.TTC_BefAftApplFlag === 1
            );

            let befAftFalg = String(editRecord?.ttC_BefAftFalg ?? editRecord?.TTC_BefAftFalg ?? '').trim();
            if (befAftFalg.toLowerCase().startsWith('b')) befAftFalg = '1';
            else if (befAftFalg.toLowerCase().startsWith('a')) befAftFalg = '2';

            const befAftPeriod = Number(editRecord?.ttC_BefAftPeriod ?? editRecord?.TTC_BefAftPeriod ?? 0);

            reset({
                TTC_Id: Number(editId || 0),
                ASMAY_Id: asmayId || undefined,
                TTMC_Id: ttmcId || undefined,
                ASMCL_Id: asmclId || undefined,
                ASMS_Id: asmsId || undefined,
                HRME_Id: hrmeId || undefined,
                ISMS_Id: ismsId || undefined,
                TTC_NoOfConDays: conDays,
                TTC_NoOfConPeriods: conPeriods,
                TTC_NoOfPeriods: noOfPeriods,
                TTC_BefAftApplFlag: befAftApplFlag,
                TTC_BefAftFalg: befAftFalg || undefined,
                TTC_BefAftPeriod: befAftPeriod
            } as any);
        };

        fetchEditDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editData, academicLoading, academicList.length, categoryList.length]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                ttC_Id: data.TTC_Id || 0,
                ttmC_Id: data.TTMC_Id,
                asmaY_Id: data.ASMAY_Id,
                asmcL_Id: data.ASMCL_Id,
                hrmE_Id: data.HRME_Id,
                asmS_Id: data.ASMS_Id,
                ismS_Id: data.ISMS_Id,
                ttC_NoOfConDays: data.TTC_NoOfConDays,
                ttC_NoOfConPeriods: data.TTC_NoOfConPeriods,
                ttC_NoOfPeriods: data.TTC_NoOfPeriods || 0,
                ttC_RemPeriods: data.TTC_NoOfPeriods || 0,
                ttC_AllotPeriods: data.TTC_NoOfPeriods || 0,
                ttC_BefAftApplFlag: data.TTC_BefAftApplFlag ? 1 : 0,
                ttC_BefAftFalg: Number(data.TTC_BefAftFalg) || 0,
                ttC_BefAftPeriod: data.TTC_BefAftPeriod || 0,
                ttC_AllotedFlag: 'N'
            };

            const response = await saveConsecutiveConstraintsDetail(payload);
            console.log('response', response);

            if (response.success) {
                toast.success(response.message);
                reset(EMPTY_VALUES);
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occured');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 rounded-md border bg-white p-6 shadow-sm'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Left Column */}
                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <Label>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ASMAY_Id'
                            render={({ field }) => (
                                <Select
                                    key={field.value || 'empty'}
                                    value={field.value ? String(field.value) : undefined}
                                    onValueChange={(val) => {
                                        handleAcademicYearChange(Number(val));
                                    }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicList.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ASMAY_Id && <FormError>{errors.ASMAY_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Class <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ASMCL_Id'
                            render={({ field }) => (
                                <Select
                                    key={`${field.value || 'empty'}-${classList.length}`}
                                    value={field.value ? String(field.value) : undefined}
                                    onValueChange={(val) => handleClassChange(Number(val))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isClassLoading ? 'Loading...' : '--Select--'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classList.map((item: any) => (
                                            <SelectItem key={item.asmcL_Id} value={String(item.asmcL_Id)}>
                                                {item.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ASMCL_Id && <FormError>{errors.ASMCL_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Staff <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='HRME_Id'
                            render={({ field }) => (
                                <Select
                                    key={`${field.value || 'empty'}-${staffList.length}`}
                                    value={field.value ? String(field.value) : undefined}
                                    onValueChange={(val) => handleStaffChange(Number(val))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isStaffLoading ? 'Loading...' : '--Select--'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {staffList.map((item: any) => (
                                            <SelectItem key={item.hrmE_Id} value={String(item.hrmE_Id)}>
                                                {item.staffName || item.hrmE_EmployeeFirstName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.HRME_Id && <FormError>{errors.HRME_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Total No of Consecutive Days <span className='text-red-500'>*</span>
                        </Label>
                        <InputText type='number' {...register('TTC_NoOfConDays')} error={errors.TTC_NoOfConDays?.message} />
                    </div>
                </div>

                {/* Right Column */}
                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <Label>
                            Category <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='TTMC_Id'
                            render={({ field }) => (
                                <Select
                                    key={field.value || 'empty'}
                                    value={field.value ? String(field.value) : undefined}
                                    onValueChange={(val) => handleCategoryChange(Number(val))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoryList.map((item: any) => (
                                            <SelectItem key={item.ttmC_Id} value={String(item.ttmC_Id)}>
                                                {item.ttmC_CategoryName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.TTMC_Id && <FormError>{errors.TTMC_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Section <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ASMS_Id'
                            render={({ field }) => (
                                <Select
                                    key={`${field.value || 'empty'}-${sectionList.length}`}
                                    value={field.value ? String(field.value) : undefined}
                                    onValueChange={(val) => handleSectionChange(Number(val))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isSectionLoading ? 'Loading...' : '--Select--'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectionList.map((item: any) => (
                                            <SelectItem
                                                key={item.asmS_Id || item.asmC_Id}
                                                value={String(item.asmS_Id || item.asmC_Id)}>
                                                {item.asmS_SectionName || item.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ASMS_Id && <FormError>{errors.ASMS_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Subject <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ISMS_Id'
                            render={({ field }) => (
                                <Select
                                    key={`${field.value || 'empty'}-${subjectList.length}`}
                                    value={field.value ? String(field.value) : undefined}
                                    onValueChange={(val) => field.onChange(Number(val))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isSubjectLoading ? 'Loading...' : '--Select--'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjectList.map((item: any) => (
                                            <SelectItem key={item.ismS_Id} value={String(item.ismS_Id)}>
                                                {item.ismS_SubjectName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ISMS_Id && <FormError>{errors.ISMS_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Total No of Consecutive Periods <span className='text-red-500'>*</span>
                        </Label>
                        <InputText type='number' {...register('TTC_NoOfConPeriods')} error={errors.TTC_NoOfConPeriods?.message} />
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-6 pt-4 md:grid-cols-2'>
                <div className='space-y-2'>
                    <Label>Calculated Total Periods</Label>
                    <InputText {...register('TTC_NoOfPeriods')} disabled className='bg-gray-100' />
                </div>
            </div>

            <div className='mt-4 space-y-4 rounded-md border bg-gray-50 p-4'>
                <div className='flex items-center space-x-2'>
                    <Controller
                        control={control}
                        name='TTC_BefAftApplFlag'
                        render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id='ba_flag' />}
                    />
                    <Label htmlFor='ba_flag' className='font-semibold'>
                        Before After Consecutive
                    </Label>
                </div>

                {watchedBefAftFlag && (
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label>
                                Condition <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='TTC_BefAftFalg'
                                render={({ field }) => (
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={field.onChange}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='1'>Before</SelectItem>
                                            <SelectItem value='2'>After</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.TTC_BefAftFalg && <FormError>{errors.TTC_BefAftFalg.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Period <span className='text-red-500'>*</span>
                            </Label>
                            <InputText type='number' {...register('TTC_BefAftPeriod')} error={errors.TTC_BefAftPeriod?.message} />
                        </div>
                    </div>
                )}
            </div>

            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                    {editData ? 'Cancel' : 'Reset'}
                </Button>
                <Button
                    type='submit'
                    disabled={isSubmitting}
                    className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                    isLoading={isSubmitting}
                    loadingText='Saving...'>
                    <div className='flex items-center'>
                        <Save className='mr-2 h-4 w-4' /> {editData ? 'Update' : 'Save Consecutive Constraint'}
                    </div>
                </Button>
            </div>
        </form>
    );
}