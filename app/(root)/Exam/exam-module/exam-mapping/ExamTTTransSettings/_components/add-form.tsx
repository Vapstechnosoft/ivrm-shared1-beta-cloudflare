'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExamTTTransSettings } from '@/hooks/exam/exammodule/exam-mapping';
import { examTTTransSettingsSchema } from '@/schemas/exam/exam-module/exam-mapping';
import {
    getExamTTTransViewRecords,
    getSubjectGroupsAndExamsBySection,
    getSubjectListAndTimeSlots,
    saveExamTTTransSettings
} from '@/server/exam/exam-module/exam-mapping/exam-tt-trans-settings';
import { getExamAcademicYearDropdown } from '@/server/exam/exam-module/masters/exam';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist
} from '@/server/exam/exam-module/reports/cumulative-report';
import type { IExamTTTransSettings } from '@/types/exam/exam-module/exam-mapping';
import { Loader2 } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

interface SubjectRow {
    ismS_Id: number;
    ismS_SubjectName: string;
    check_save: number;
    exttS_Date: string;
    ettS_Id: string;
}

interface Props {
    onSuccess?: () => void;
    editData?: IExamTTTransSettings;
}

export default function AddExamTTTransSettingsForm({ onSuccess, editData }: Props) {
    const { refetchAll } = useExamTTTransSettings();

    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [acYearLoading, setAcYearLoading] = useState(false);

    const [isPending, startTransition] = useTransition();
    const [loadingCascade, setLoadingCascade] = useState(false);

    const [asmay, setAsmay] = useState('');
    const [asmcl, setAsmcl] = useState('');
    const [asms, setAsms] = useState('');
    const [eme, setEme] = useState('');
    const [emg, setEmg] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [exttId, setExttId] = useState(0);

    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [subjectGroups, setSubjectGroups] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [timeSlots, setTimeSlots] = useState<any[]>([]);
    const [mainList, setMainList] = useState<SubjectRow[]>([]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load Academic Years on Mount
    useEffect(() => {
        const fetchAcademicYears = async () => {
            try {
                setAcYearLoading(true);
                const res = await getExamAcademicYearDropdown();
                const yearData = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
                setAcademicYears(yearData);
            } catch (err: any) {
                toast.error(err?.message || 'Failed to load academic years');
            } finally {
                setAcYearLoading(false);
            }
        };

        fetchAcademicYears();
    }, []);

    // Pre-populate on edit
    useEffect(() => {
        if (!editData) return;
        (async () => {
            try {
                setAsmay(String(editData.asmaY_Id));
                setAsmcl(String(editData.asmcL_Id));
                setAsms(String(editData.asmS_Id));
                setEme(String(editData.emE_Id));
                setEmg(String(editData.emG_Id));
                setFromDate(editData.extT_FromDate?.split('T')[0] ?? '');
                setToDate(editData.extT_EndDate?.split('T')[0] ?? '');
                setExttId(editData.extT_Id);

                // Load classes for that year
                const clsRes = await getClassDropDownByAcademicYearlist(editData.asmaY_Id);
                setClasses(clsRes?.data ?? []);

                // Load sections
                const secRes = await getSectionsDropDownByAcademicYearandClasslist(editData.asmaY_Id, editData.asmcL_Id);
                setSections(secRes?.data ?? []);

                // Load subject groups & exams
                const sgRes = await getSubjectGroupsAndExamsBySection(editData.asmS_Id, editData.asmcL_Id, editData.asmaY_Id);
                setSubjectGroups(sgRes?.data?.subject_group ?? []);
                setExams(sgRes?.data?.examlist ?? []);

                // Load subjects
                const subRes = await getSubjectListAndTimeSlots({
                    ASMS_Id: editData.asmS_Id,
                    ASMCL_Id: editData.asmcL_Id,
                    ASMAY_Id: editData.asmaY_Id,
                    EMG_Id: editData.emG_Id,
                    EME_Id: editData.emE_Id
                });
                const { data: listedit } = await getExamTTTransViewRecords(editData.extT_Id);

                setTimeSlots(subRes?.data?.time_slot ?? []);

                const subjects: any[] = subRes?.data?.subject_name ?? [];
                const merged: SubjectRow[] = subjects.map((s: any) => {
                    const match = listedit?.find((e: any) => e.ismS_Id === s.ismS_Id);
                    return match
                        ? {
                              ismS_Id: s.ismS_Id,
                              ismS_SubjectName: s.ismS_SubjectName,
                              check_save: 1,
                              exttS_Date: match.slotdate?.split('T')[0] ?? '',
                              ettS_Id: String(match.ettS_Id)
                          }
                        : { ismS_Id: s.ismS_Id, ismS_SubjectName: s.ismS_SubjectName, check_save: 0, exttS_Date: '', ettS_Id: '' };
                });
                setMainList(merged);
            } catch {
                toast.error('Failed to load edit data');
            }
        })();
    }, [editData]);

    // Handle explicit resets on change
    function handleAcademicYearChange(val: string) {
        setAsmay(val);
        setAsmcl('');
        setAsms('');
        setEme('');
        setEmg('');
        setClasses([]);
        setSections([]);
        setSubjectGroups([]);
        setExams([]);
        setMainList([]);
    }

    function handleClassChange(val: string) {
        setAsmcl(val);
        setAsms('');
        setEme('');
        setEmg('');
        setSections([]);
        setSubjectGroups([]);
        setExams([]);
        setMainList([]);
    }

    function handleSectionChange(val: string) {
        setAsms(val);
        setEme('');
        setEmg('');
        setSubjectGroups([]);
        setExams([]);
        setMainList([]);
    }

    function handleSubjectGroupChange(val: string) {
        setEmg(val);
        setMainList([]);
    }

    const isEditMode = !!editData;

    // 1. Fetch Classes
    useEffect(() => {
        if (!asmay || isEditMode) return;
        async function fetchClasses() {
            setLoadingCascade(true);
            try {
                const res = await getClassDropDownByAcademicYearlist(Number(asmay));
                setClasses(res?.data ?? []);
            } catch {
                toast.error('Failed to load classes');
            } finally {
                setLoadingCascade(false);
            }
        }
        fetchClasses();
    }, [asmay, isEditMode]);

    // 2. Fetch Sections
    useEffect(() => {
        if (!asmay || !asmcl || isEditMode) return;
        async function fetchSections() {
            setLoadingCascade(true);
            try {
                const res = await getSectionsDropDownByAcademicYearandClasslist(Number(asmay), Number(asmcl));
                setSections(res?.data ?? []);
            } catch {
                toast.error('Failed to load sections');
            } finally {
                setLoadingCascade(false);
            }
        }
        fetchSections();
    }, [asmay, asmcl, isEditMode]);

    // 3. Fetch Subject Groups & Exams
    useEffect(() => {
        if (!asmay || !asmcl || !asms || isEditMode) return;
        async function fetchSubjectGroups() {
            setLoadingCascade(true);
            try {
                const res = await getSubjectGroupsAndExamsBySection(Number(asms), Number(asmcl), Number(asmay));
                setSubjectGroups(res?.data?.subject_group ?? []);
                setExams(res?.data?.examlist ?? []);
            } catch {
                toast.error('Failed to load subject groups');
            } finally {
                setLoadingCascade(false);
            }
        }
        fetchSubjectGroups();
    }, [asmay, asmcl, asms, isEditMode]);

    // 4. Fetch Subjects & Time Slots
    useEffect(() => {
        if (!asmay || !asmcl || !asms || !emg || !eme || isEditMode) return;
        async function fetchSubjects() {
            setLoadingCascade(true);
            try {
                const res = await getSubjectListAndTimeSlots({
                    ASMS_Id: Number(asms),
                    ASMCL_Id: Number(asmcl),
                    ASMAY_Id: Number(asmay),
                    EMG_Id: Number(emg),
                    EME_Id: Number(eme) || 0
                });
                setTimeSlots(res?.data?.time_slot ?? []);
                const subjects: any[] = res?.data?.subject_name ?? [];
                setMainList(
                    subjects.map((s: any) => ({
                        ismS_Id: s.ismS_Id,
                        ismS_SubjectName: s.ismS_SubjectName,
                        check_save: s.check_save ?? 0,
                        exttS_Date: s.exttS_Date ? new Date(s.exttS_Date).toISOString().split('T')[0] : '',
                        ettS_Id: String(s.ettS_Id ?? '')
                    }))
                );
            } catch {
                toast.error('Failed to load subjects');
            } finally {
                setLoadingCascade(false);
            }
        }
        fetchSubjects();
    }, [emg, asms, asmcl, asmay, eme, isEditMode]);

    function updateRow(idx: number, field: keyof SubjectRow, value: any) {
        setMainList((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
        if (field === 'check_save') {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[`row_${idx}_date`];
                delete next[`row_${idx}_timeSlot`];
                return next;
            });
        }
    }

    function validate() {
        const checkedRowsWithIndices = mainList.map((row, index) => ({ row, index })).filter((item) => item.row.check_save === 1);

        const payloadToValidate = {
            ASMAY_Id: Number(asmay) || 0,
            ASMCL_Id: Number(asmcl) || 0,
            ASMS_Id: asms === '' ? -1 : Number(asms),
            EMG_Id: Number(emg) || 0,
            EME_Id: Number(eme) || 0,
            EXTT_FromDate: fromDate,
            EXTT_EndDate: toDate,
            TempararyArrayList: checkedRowsWithIndices.map((item) => ({
                ISMS_Id: Number(item.row.ismS_Id),
                ISMS_SubjectName: item.row.ismS_SubjectName,
                check_save: 1 as const,
                EXTTS_Date: item.row.exttS_Date,
                ETTS_Id: Number(item.row.ettS_Id) || 0
            }))
        };

        const result = examTTTransSettingsSchema.addOrUpdate.safeParse(payloadToValidate);
        if (!result.success) {
            const errs: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path;
                if (path.length === 1) {
                    const field = path[0];
                    if (field === 'ASMAY_Id') errs.asmay = issue.message;
                    else if (field === 'ASMCL_Id') errs.asmcl = issue.message;
                    else if (field === 'ASMS_Id') errs.asms = issue.message;
                    else if (field === 'EMG_Id') errs.emg = issue.message;
                    else if (field === 'EME_Id') errs.eme = issue.message;
                    else if (field === 'EXTT_FromDate') errs.fromDate = issue.message;
                    else if (field === 'EXTT_EndDate') errs.toDate = issue.message;
                    else if (field === 'TempararyArrayList') errs.mainList = issue.message;
                } else if (path[0] === 'TempararyArrayList' && path.length > 1) {
                    const checkedIndex = Number(path[1]);
                    const fieldName = path[2];
                    const originalIndex = checkedRowsWithIndices[checkedIndex]?.index;
                    if (originalIndex !== undefined) {
                        if (fieldName === 'EXTTS_Date') {
                            errs[`row_${originalIndex}_date`] = issue.message;
                        } else if (fieldName === 'ETTS_Id') {
                            errs[`row_${originalIndex}_timeSlot`] = issue.message;
                        }
                    }
                }
            });
            setErrors(errs);
            const firstErrorMsg = result.error.issues[0]?.message || 'Please fill in all mandatory fields';
            toast.error(firstErrorMsg);
            return false;
        }

        setErrors({});
        return true;
    }

    function handleSave() {
        if (!validate()) return;
        const checkedRows = mainList.filter((r) => r.check_save);

        startTransition(async () => {
            try {
                const payload = {
                    ASMS_Id: Number(asms) || 0,
                    ASMCL_Id: Number(asmcl),
                    ASMAY_Id: Number(asmay),
                    EME_Id: Number(eme),
                    EMG_Id: Number(emg),
                    EXTT_FromDate: fromDate ? new Date(fromDate).toISOString() : null,
                    EXTT_EndDate: toDate ? new Date(toDate).toISOString() : null,
                    EXTT_Id: Number(exttId) || 0,
                    TempararyArrayList: checkedRows.map((r) => ({
                        ISMS_Id: Number(r.ismS_Id),
                        check_save: '1',
                        EXTTS_Date: r.exttS_Date ? new Date(r.exttS_Date).toISOString() : null,
                        ETTS_Id: Number(r.ettS_Id),
                        ISMS_SubjectName: r.ismS_SubjectName
                    }))
                };

                const res = await saveExamTTTransSettings(payload);

                if (res?.success === true) {
                    toast.success(res?.message || 'Saved successfully');
                    refetchAll?.();
                    onSuccess?.();
                } else if (res?.success === false) {
                    toast.error(res?.message || 'Failed to save');
                    return;
                }
            } catch (err: any) {
                console.error(err);
                toast.error(err?.message || 'Failed to save');
            }
        });
    }

    function handleReset() {
        setAsmay('');
        setAsmcl('');
        setAsms('');
        setEme('');
        setEmg('');
        setFromDate('');
        setToDate('');
        setClasses([]);
        setSections([]);
        setSubjectGroups([]);
        setExams([]);
        setMainList([]);
        setExttId(0);
        setErrors({});
    }

    return (
        <div className='flex w-full flex-col gap-6'>
            <div className='flex flex-col gap-6 rounded-2xl bg-white p-2'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* Left Column */}
                    <div className='flex flex-col gap-4'>
                        <div>
                            <Label>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                            <Select key={asmay} value={asmay || undefined} onValueChange={handleAcademicYearChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {acYearLoading ? (
                                        <SelectItem value='_' disabled>
                                            Loading...
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
                            {errors.asmay && <FormError>{errors.asmay}</FormError>}
                        </div>

                        <div>
                            <Label>
                                Class <span className='text-red-500'>*</span>
                            </Label>
                            <Select
                                key={asmcl}
                                value={asmcl || undefined}
                                onValueChange={handleClassChange}
                                disabled={!asmay || loadingCascade}>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingCascade ? 'Loading...' : 'Select Class'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((c: any) => (
                                        <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                            {c.asmcL_ClassName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.asmcl && <FormError>{errors.asmcl}</FormError>}
                        </div>

                        <div>
                            <Label>
                                Section <span className='text-red-500'>*</span>
                            </Label>
                            <Select
                                key={asms}
                                value={asms || undefined}
                                onValueChange={handleSectionChange}
                                disabled={!asmcl || loadingCascade}>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingCascade ? 'Loading...' : 'Select Section'} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='0'>All</SelectItem>
                                    {sections.map((s: any) => (
                                        <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>
                                            {s.asmC_SectionName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.asms && <FormError>{errors.asms}</FormError>}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className='flex flex-col gap-4'>
                        <div>
                            <Label>
                                Subject Group <span className='text-red-500'>*</span>
                            </Label>
                            <Select
                                key={emg}
                                value={emg || undefined}
                                onValueChange={handleSubjectGroupChange}
                                disabled={!asms || loadingCascade}>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingCascade ? 'Loading...' : 'Select Subject Group'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjectGroups.map((g: any) => (
                                        <SelectItem key={g.emG_Id} value={String(g.emG_Id)}>
                                            {g.emG_GroupName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.emg && <FormError>{errors.emg}</FormError>}
                        </div>

                        <div>
                            <Label>
                                Exam Name <span className='text-red-500'>*</span>
                            </Label>
                            <Select key={eme} value={eme || undefined} onValueChange={setEme} disabled={!asms}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Exam' />
                                </SelectTrigger>
                                <SelectContent>
                                    {exams.map((e: any) => (
                                        <SelectItem key={e.emE_Id} value={String(e.emE_Id)}>
                                            {e.emE_ExamName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.eme && <FormError>{errors.eme}</FormError>}
                        </div>

                        <div className='flex w-full flex-row gap-4'>
                            <div className='flex-1'>
                                <Label>
                                    From Date <span className='text-red-500'>*</span>
                                </Label>
                                <Input type='date' value={fromDate} onChange={(e) => setFromDate(e.target.value)} className='w-full' />
                                {errors.fromDate && <FormError>{errors.fromDate}</FormError>}
                            </div>

                            <div className='flex-1'>
                                <Label>
                                    To Date <span className='text-red-500'>*</span>
                                </Label>
                                <Input
                                    type='date'
                                    value={toDate}
                                    min={fromDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className='w-full'
                                />
                                {errors.toDate && <FormError>{errors.toDate}</FormError>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subject Grid */}
                {mainList.length > 0 && (
                    <div className='mt-6'>
                        <Label>Exam Time Table</Label>
                        {errors.mainList && <FormError>{errors.mainList}</FormError>}

                        <div className='mt-3 overflow-x-auto'>
                            <div className='overflow-hidden rounded-xl border border-gray-300 shadow-sm'>
                                <table className='w-full border-separate border-spacing-0'>
                                    <thead>
                                        <tr className='border-gray-300 border-b bg-gray-50 text-left font-normal text-[#78716C]'>
                                            <th className='w-[80px] border-gray-300 border-r px-3 py-2 text-center font-normal first:rounded-tl-xl'>
                                                Select
                                            </th>
                                            <th className='border-gray-300 border-r px-3 py-2 font-normal'>Subject</th>
                                            <th className='border-gray-300 border-r px-3 py-2 font-normal'>Exam Date</th>
                                            <th className='px-3 py-2 font-normal last:rounded-tr-xl'>Time Slot</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mainList.map((row, idx) => (
                                            <tr
                                                key={row.ismS_Id}
                                                className='border-gray-300 border-t text-sm transition-colors duration-200 hover:bg-accent/90 [&>*]:px-2 [&>*]:py-1'>
                                                <td className='border-gray-300 border-r px-3 text-center'>
                                                    <Checkbox
                                                        checked={!!row.check_save}
                                                        onCheckedChange={(c) => updateRow(idx, 'check_save', c ? 1 : 0)}
                                                    />
                                                </td>
                                                <td className='border-gray-300 border-r px-3 font-medium'>{row.ismS_SubjectName}</td>
                                                <td className='border-gray-300 border-r px-3'>
                                                    <Input
                                                        type='date'
                                                        value={row.exttS_Date}
                                                        min={fromDate}
                                                        max={toDate}
                                                        disabled={!row.check_save}
                                                        onChange={(e) => updateRow(idx, 'exttS_Date', e.target.value)}
                                                        className='w-full max-w-[200px]'
                                                    />
                                                    {errors[`row_${idx}_date`] && <FormError>{errors[`row_${idx}_date`]}</FormError>}
                                                </td>
                                                <td className='px-3 py-2'>
                                                    <Select
                                                        key={row.ettS_Id}
                                                        value={row.ettS_Id || undefined}
                                                        onValueChange={(v) => updateRow(idx, 'ettS_Id', v)}
                                                        disabled={!row.check_save}>
                                                        <SelectTrigger className='w-full max-w-[250px]'>
                                                            <SelectValue placeholder='--Select Time Slot--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {timeSlots.map((t: any) => (
                                                                <SelectItem key={t.ettS_Id} value={String(t.ettS_Id)}>
                                                                    {t.ettS_SessionName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors[`row_${idx}_timeSlot`] && (
                                                        <FormError>{errors[`row_${idx}_timeSlot`]}</FormError>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div className='mt-4 flex w-fit gap-3'>
                    <Button type='button' onClick={handleSave} disabled={isPending} className='w-fit'>
                        {isPending ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Saving...
                            </>
                        ) : (
                            'Save'
                        )}
                    </Button>
                    <Button type='button' variant='outline' onClick={handleReset} className='w-fit'>
                        Reset
                    </Button>
                </div>
            </div>
        </div>
    );
}
