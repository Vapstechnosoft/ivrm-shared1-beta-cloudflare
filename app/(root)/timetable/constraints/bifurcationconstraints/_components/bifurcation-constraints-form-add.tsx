'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usebifurcationAcademicYear } from '@/hooks/timetable/constraints/bifurcationconstraints';
import {
    useBifurcationConstraints,
    usePeriodDropdown,
    useSectionDropdownBifurcationConstraints,
    useStaffDropdownBifurcationConstraints,
    useSubjectDropdownBifurcationConstraints,
    useTimeTableCategoryDropDownData
} from '@/hooks/timetable/useMasters';
import { bifurcationConstraintsSchema, combinationTempSchema } from '@/schemas/timetable/constraints/bifurcationconstraints';
import {
    getBifurcationConstraintsEditDetails,
    getBifurcationViewData,
    getClassDetails,
    saveBifurcationConstraintsDetail
} from '@/server/timetable/constraints/bifurcationconstraints';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

interface BifurcationConstraintsFormProps {
    selectedRow?: any;
    onSuccess?: () => void;
    onCancel?: () => void;
}

type FormFields = z.infer<typeof bifurcationConstraintsSchema.save>;

const findListByKeys = (data: any, candidateKeys: string[]): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const target = data?.data !== undefined && data?.data !== null ? data.data : data;
    if (Array.isArray(target)) return target;
    if (!target || typeof target !== 'object') return [];

    for (const key of candidateKeys) {
        const foundKey = Object.keys(target).find((k) => k.toLowerCase() === key.toLowerCase());
        if (foundKey) {
            const val = target[foundKey];
            if (Array.isArray(val) && val.length > 0) return val;
            if (val?.$values && Array.isArray(val.$values) && val.$values.length > 0) return val.$values;
            if (Array.isArray(val)) return val;
        }
    }

    if (target.$values && Array.isArray(target.$values)) return target.$values;

    return [];
};

const extractList = (data: any, preferredKey?: string): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const target = data?.data !== undefined && data?.data !== null ? data.data : data;
    if (Array.isArray(target)) return target;
    if (!target || typeof target !== 'object') return [];

    if (preferredKey) {
        const foundKey = Object.keys(target).find((k) => k.toLowerCase() === preferredKey.toLowerCase());
        if (foundKey) {
            const val = target[foundKey];
            if (Array.isArray(val)) return val;
            if (val?.$values && Array.isArray(val.$values)) return val.$values;
        }
    }

    if (target.$values && Array.isArray(target.$values)) return target.$values;

    return [];
};

export default function BifurcationConstraintsForm({ onSuccess, selectedRow, onCancel }: BifurcationConstraintsFormProps) {
    const { refetchAll } = useBifurcationConstraints();

    // Local state for dropdowns
    const [classList, setClassList] = useState<any[]>([]);
    const [isClassLoading, setIsClassLoading] = useState(false);

    const form = useForm<FormFields>({
        resolver: zodResolver(bifurcationConstraintsSchema.save),
        mode: 'onChange',
        defaultValues: {
            TTB_ID: 0,
            ASMAY_Id: 0,
            TTMC_Id: 0,
            TTB_BifurcationName: '',
            TTB_NoOfPeriods: 0,
            TTB_BefAftApplFlag: false,
            TTB_BefAftFalg: '',
            TTMP_Id: 0,
            TTB_ConsecutiveFlag: false,
            TTB_NoOfConPeriods: 0,
            TTB_NoOfConDays: 0,
            combinationlist: [],
            ASMCL_Id_temp: 0,
            ASMS_Id_temp: 0,
            HRME_Id_temp: 0,
            ISMS_Id_temp: 0
        }
    });

    const {
        data: categorydropdowndata,
        isLoading: categorydropdownloading,
        error: categorydropdownerror
    } = useTimeTableCategoryDropDownData();
    const categoryList = extractList(categorydropdowndata, 'catelist');

    const {
        data: academicyeardata,
        isLoading: academicyearloading,
        error: academicyearerror
    } = usebifurcationAcademicYear();
    const academicList = extractList(academicyeardata, 'academiclist');

    const {
        data: periodListData,
        isLoading: perioddataloading,
        error: perioddataError
    } = usePeriodDropdown();
    const periodList = extractList(periodListData, 'periodlist');

    const {
        data: sectionListFromHook,
        isLoading: sectiondataloading
    } = useSectionDropdownBifurcationConstraints();
    const sectionList = extractList(sectionListFromHook, 'sectionlist');

    const {
        data: staffListNew,
        isLoading: staffdataloading,
        error: staffdataError
    } = useStaffDropdownBifurcationConstraints();
    const staffList = extractList(staffListNew, 'stafflist');

    const {
        data: subjectListNew,
        isLoading: subjectdataloading,
        error: subjectdataError
    } = useSubjectDropdownBifurcationConstraints();
    const subjectList = extractList(subjectListNew, 'subjectlist');

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'combinationlist'
    });

    const fetchClasses = async (categoryId: number): Promise<any[]> => {
        if (!categoryId) {
            setClassList([]);
            return [];
        }
        setIsClassLoading(true);
        try {
            const res = await getClassDetails(Number(categoryId));
            const list =
                findListByKeys(res, ['classlist', 'querydata', 'data']) ||
                (Array.isArray(res) ? res : []);
            setClassList(list || []);
            return list || [];
        } catch (error) {
            console.error('Failed to load class list', error);
            setClassList([]);
            return [];
        } finally {
            setIsClassLoading(false);
        }
    };

    // Edit Mode: Fetch and Bind data
    useEffect(() => {
        let isMounted = true;

        const fetchEditData = async () => {
            const editId = selectedRow?.ttB_Id || selectedRow?.ttB_ID || selectedRow?.TTB_Id || selectedRow?.TTB_ID;
            if (!editId) return;

            try {
                let editRes: any = null;
                try {
                    editRes = await getBifurcationConstraintsEditDetails(Number(editId));
                    console.info('Bifurcation Edit Res:', editRes);
                } catch (err) {
                    console.error('Failed to fetch bifurcation edit details:', err);
                }

                const editDataObj = editRes?.data || editRes || {};

                const mainList = findListByKeys(editDataObj, [
                    'editdetailslist',
                    'editdetails',
                    'editlist',
                    'bifurcationdetails',
                    'bifurcationlist',
                    'detailslist'
                ]);

                const data =
                    (Array.isArray(mainList) && mainList.length > 0 ? mainList[0] : null) ||
                    (editDataObj?.ttB_Id || editDataObj?.TTB_Id ? editDataObj : null) ||
                    selectedRow;

                // Extract combination list from edit response or fallback to getBifurcationViewData
                let combos = findListByKeys(editDataObj, [
                    'bifurcationlist',
                    'detailslist',
                    'bifurcationdetaillist',
                    'bifurcationdetails',
                    'viewdata',
                    'savedarray'
                ]);

                if (!combos || combos.length === 0) {
                    try {
                        const viewRes = await getBifurcationViewData(Number(editId));
                        console.info('Bifurcation View Res:', viewRes);
                        combos = findListByKeys(viewRes, ['viewdata', 'bifurcationlist', 'detailslist', 'data']);
                    } catch (err) {
                        console.error('Failed to fetch view data fallback:', err);
                    }
                }

                if (!isMounted) return;

                let asmayId = Number(data?.asmaY_Id || data?.ASMAY_Id || data?.asmay_id || selectedRow?.asmaY_Id || 0);
                let ttmcId = Number(data?.ttmC_Id || data?.TTMC_Id || data?.ttmc_id || selectedRow?.ttmC_Id || 0);

                // Fallback: match by academic year name if asmayId not directly present
                if (!asmayId && (selectedRow?.acdYear || data?.acdYear || selectedRow?.asmaY_Year || data?.asmaY_Year)) {
                    const yearName = String(selectedRow?.acdYear || data?.acdYear || selectedRow?.asmaY_Year || data?.asmaY_Year || '').trim().toLowerCase();
                    const matchedYear = academicList.find((y: any) => {
                        const yName = String(y.asmaY_Year || y.ASMAY_Year || y.academicYear || '').trim().toLowerCase();
                        return yName === yearName;
                    });
                    if (matchedYear) {
                        asmayId = Number(matchedYear.asmaY_Id || matchedYear.ASMAY_Id || matchedYear.id || 0);
                    }
                }

                // Fallback: match by category name if ttmcId not directly present
                if (!ttmcId && (selectedRow?.categoryName || data?.categoryName || selectedRow?.ttmC_CategoryName || data?.ttmC_CategoryName)) {
                    const catName = String(selectedRow?.categoryName || data?.categoryName || selectedRow?.ttmC_CategoryName || data?.ttmC_CategoryName || '').trim().toLowerCase();
                    const matchedCat = categoryList.find((c: any) => {
                        const cName = String(c.ttmC_CategoryName || c.TTMC_CategoryName || c.categoryName || '').trim().toLowerCase();
                        return cName === catName;
                    });
                    if (matchedCat) {
                        ttmcId = Number(matchedCat.ttmC_Id || matchedCat.TTMC_Id || matchedCat.id || 0);
                    }
                }

                const ttbId = Number(data?.ttB_Id || data?.ttB_ID || data?.TTB_Id || data?.TTB_ID || editId);
                const bifurcationName = String(
                    data?.ttB_BifurcationName ||
                    data?.TTB_BifurcationName ||
                    data?.bifricationName ||
                    data?.bifurcationName ||
                    selectedRow?.bifricationName ||
                    selectedRow?.ttB_BifurcationName ||
                    ''
                );
                const noOfPeriods = Number(
                    data?.ttB_NoOfPeriods ||
                    data?.TTB_NoOfPeriods ||
                    data?.noOfPeriods ||
                    selectedRow?.periodname ||
                    selectedRow?.ttB_NoOfPeriods ||
                    0
                );

                const befAftAppl =
                    data?.ttB_BefAftApplFlag === true ||
                    data?.ttB_BefAftApplFlag === 1 ||
                    data?.ttB_BefAftApplFlag === '1' ||
                    data?.TTB_BefAftApplFlag === true ||
                    data?.TTB_BefAftApplFlag === 1 ||
                    selectedRow?.ttB_BefAftApplFlag === true ||
                    selectedRow?.ttB_BefAftApplFlag === 1;

                let befAftCond = String(
                    data?.ttB_BefAftFalg ||
                    data?.TTB_BefAftFalg ||
                    data?.ttB_BefAftFlag ||
                    data?.TTB_BefAftFlag ||
                    selectedRow?.ttB_BefAftFalg ||
                    ''
                ).trim();
                if (befAftCond.toLowerCase().includes('before')) befAftCond = 'Before';
                else if (befAftCond.toLowerCase().includes('after')) befAftCond = 'After';

                const ttmpId = Number(data?.ttmP_Id || data?.TTMP_Id || data?.ttmp_id || selectedRow?.ttmP_Id || 0);

                const conFlag =
                    data?.ttB_ConsecutiveFlag === true ||
                    data?.ttB_ConsecutiveFlag === 1 ||
                    data?.ttB_ConsecutiveFlag === '1' ||
                    data?.TTB_ConsecutiveFlag === true ||
                    data?.TTB_ConsecutiveFlag === 1 ||
                    selectedRow?.ttB_ConsecutiveFlag === true ||
                    selectedRow?.ttB_ConsecutiveFlag === 1;

                const noOfConPeriods = Number(data?.ttB_NoOfConPeriods || data?.TTB_NoOfConPeriods || selectedRow?.ttB_NoOfConPeriods || 0);
                const noOfConDays = Number(data?.ttB_NoOfConDays || data?.TTB_NoOfConDays || selectedRow?.ttB_NoOfConDays || 0);

                // Fetch classes for this category so class dropdown is immediately populated
                let loadedClasses: any[] = [];
                if (ttmcId) {
                    loadedClasses = await fetchClasses(ttmcId);
                }

                const mappedCombinations = (combos || []).map((item: any) => {
                    const cid = Number(item.asmcL_Id || item.ASMCL_Id || item.asmcl_id || 0);
                    const sid = Number(item.asmS_Id || item.ASMS_Id || item.asms_id || item.asmC_Id || item.ASMC_Id || 0);
                    const hid = Number(item.hrmE_Id || item.HRME_Id || item.hrme_id || 0);
                    const iid = Number(item.ismS_Id || item.ISMS_Id || item.isms_id || 0);

                    const className =
                        item.className ||
                        item.asmcL_ClassName ||
                        item.ASMCL_ClassName ||
                        loadedClasses.find((c: any) => Number(c.asmcL_Id || c.ASMCL_Id) === cid)?.asmcL_ClassName ||
                        '';

                    const sectioname =
                        item.sectioname ||
                        item.sectionName ||
                        item.asmC_SectionName ||
                        item.asmS_SectionName ||
                        item.ASMC_SectionName ||
                        sectionList.find((s: any) => Number(s.asmS_Id || s.asmC_Id || s.ASMS_Id) === sid)?.asmC_SectionName ||
                        sectionList.find((s: any) => Number(s.asmS_Id || s.asmC_Id || s.ASMS_Id) === sid)?.asmS_SectionName ||
                        '';

                    const staffname =
                        item.staffname ||
                        item.staffName ||
                        item.hrmE_EmployeeName ||
                        item.hrmE_EmployeeFirstName ||
                        item.HRME_EmployeeName ||
                        staffList.find((st: any) => Number(st.hrmE_Id || st.HRME_Id) === hid)?.staffName ||
                        staffList.find((st: any) => Number(st.hrmE_Id || st.HRME_Id) === hid)?.hrmE_EmployeeFirstName ||
                        '';

                    const subjectname =
                        item.subjectname ||
                        item.subjectName ||
                        item.ismS_SubjectName ||
                        item.ISMS_SubjectName ||
                        subjectList.find((sub: any) => Number(sub.ismS_Id || sub.ISMS_Id) === iid)?.ismS_SubjectName ||
                        subjectList.find((sub: any) => Number(sub.ismS_Id || sub.ISMS_Id) === iid)?.subjectName ||
                        '';

                    return {
                        ttbD_Id: Number(item.ttbD_Id || item.TTBD_Id || item.ttbd_id || 0),
                        ASMCL_Id: cid,
                        ASMS_Id: sid,
                        HRME_Id: hid,
                        ISMS_Id: iid,
                        className,
                        sectioname,
                        staffname,
                        subjectname
                    };
                });

                reset({
                    TTB_ID: ttbId,
                    ASMAY_Id: asmayId,
                    TTMC_Id: ttmcId,
                    TTB_BifurcationName: bifurcationName,
                    TTB_NoOfPeriods: noOfPeriods,
                    TTB_BefAftApplFlag: befAftAppl,
                    TTB_BefAftFalg: befAftCond,
                    TTMP_Id: ttmpId,
                    TTB_ConsecutiveFlag: conFlag,
                    TTB_NoOfConPeriods: noOfConPeriods,
                    TTB_NoOfConDays: noOfConDays,
                    combinationlist: mappedCombinations,
                    ASMCL_Id_temp: 0,
                    ASMS_Id_temp: 0,
                    HRME_Id_temp: 0,
                    ISMS_Id_temp: 0
                });
            } catch (error) {
                console.error('Failed to load edit details', error);
            }
        };

        fetchEditData();

        return () => {
            isMounted = false;
        };
    }, [selectedRow, reset, academicList, categoryList, sectionList, staffList, subjectList]);

    // Secondary effect: Sync Academic Year and Category if dropdown data loads after initial fetch
    useEffect(() => {
        if (!selectedRow) return;

        const currentAsmay = form.getValues('ASMAY_Id');
        if ((!currentAsmay || currentAsmay === 0) && academicList.length > 0) {
            const yearName = String(selectedRow?.acdYear || selectedRow?.asmaY_Year || '').trim().toLowerCase();
            if (yearName) {
                const matched = academicList.find((y: any) => {
                    const yName = String(y.asmaY_Year || y.ASMAY_Year || y.academicYear || '').trim().toLowerCase();
                    return yName === yearName;
                });
                if (matched) {
                    const yId = Number(matched.asmaY_Id || matched.ASMAY_Id || matched.id || 0);
                    if (yId) setValue('ASMAY_Id', yId);
                }
            }
        }

        const currentTtmc = form.getValues('TTMC_Id');
        if ((!currentTtmc || currentTtmc === 0) && categoryList.length > 0) {
            const catName = String(selectedRow?.categoryName || selectedRow?.ttmC_CategoryName || '').trim().toLowerCase();
            if (catName) {
                const matched = categoryList.find((c: any) => {
                    const cName = String(c.ttmC_CategoryName || c.TTMC_CategoryName || c.categoryName || '').trim().toLowerCase();
                    return cName === catName;
                });
                if (matched) {
                    const cId = Number(matched.ttmC_Id || matched.TTMC_Id || matched.id || 0);
                    if (cId) {
                        setValue('TTMC_Id', cId);
                        fetchClasses(cId);
                    }
                }
            }
        }
    }, [academicList, categoryList, selectedRow, setValue]);

    const handleCategoryChange = async (categoryId: number) => {
        setValue('ASMCL_Id_temp', 0);
        setValue('ASMS_Id_temp', 0);
        setValue('HRME_Id_temp', 0);
        setValue('ISMS_Id_temp', 0);
        if (categoryId) {
            await fetchClasses(categoryId);
        } else {
            setClassList([]);
        }
    };

    const handleClassChange = (classId: number) => {
        setValue('ASMS_Id_temp', 0);
        setValue('HRME_Id_temp', 0);
        setValue('ISMS_Id_temp', 0);
    };

    const handleSectionChange = (sectionId: number) => {
        setValue('HRME_Id_temp', 0);
        setValue('ISMS_Id_temp', 0);
    };

    const handleReset = () => {
        reset({
            TTB_ID: 0,
            ASMAY_Id: 0,
            TTMC_Id: 0,
            TTB_BifurcationName: '',
            TTB_NoOfPeriods: 0,
            TTB_BefAftApplFlag: false,
            TTB_BefAftFalg: '',
            TTMP_Id: 0,
            TTB_ConsecutiveFlag: false,
            TTB_NoOfConPeriods: 0,
            TTB_NoOfConDays: 0,
            combinationlist: [],
            ASMCL_Id_temp: 0,
            ASMS_Id_temp: 0,
            HRME_Id_temp: 0,
            ISMS_Id_temp: 0
        });
        setClassList([]);
    };

    const handleAddCombination = () => {
        const tempValues = {
            ASMCL_Id: watch('ASMCL_Id_temp'),
            ASMS_Id: watch('ASMS_Id_temp'),
            HRME_Id: watch('HRME_Id_temp'),
            ISMS_Id: watch('ISMS_Id_temp')
        };

        const result = combinationTempSchema.safeParse(tempValues);
        if (!result.success) {
            toast.error(result.error.errors[0].message);
            return;
        }

        const currentList = watch('combinationlist') || [];
        const isDuplicate = currentList.some(
            (item) =>
                item.ASMCL_Id === tempValues.ASMCL_Id &&
                item.ASMS_Id === tempValues.ASMS_Id &&
                item.HRME_Id === tempValues.HRME_Id &&
                item.ISMS_Id === tempValues.ISMS_Id
        );
        if (isDuplicate) {
            toast.error('This combination is already added');
            return;
        }

        // Get Names for Display
        const className = classList.find((c) => Number(c.asmcL_Id || c.ASMCL_Id) === Number(tempValues.ASMCL_Id))?.asmcL_ClassName;
        const sectionName =
            sectionList.find((c: any) => Number(c.asmS_Id || c.asmC_Id) === Number(tempValues.ASMS_Id))?.asmC_SectionName ||
            sectionList.find((c: any) => Number(c.asmS_Id || c.asmC_Id) === Number(tempValues.ASMS_Id))?.asmS_SectionName ||
            sectionList.find((c: any) => Number(c.asmS_Id || c.asmC_Id) === Number(tempValues.ASMS_Id))?.sectionName;
        const staffName =
            staffList.find((c: any) => Number(c.hrmE_Id || c.HRME_Id) === Number(tempValues.HRME_Id))?.staffName ||
            staffList.find((c: any) => Number(c.hrmE_Id || c.HRME_Id) === Number(tempValues.HRME_Id))?.hrmE_EmployeeFirstName ||
            staffList.find((c: any) => Number(c.hrmE_Id || c.HRME_Id) === Number(tempValues.HRME_Id))?.hrmE_EmployeeName;
        const subjectName =
            subjectList.find((c: any) => Number(c.ismS_Id || c.ISMS_Id) === Number(tempValues.ISMS_Id))?.ismS_SubjectName ||
            subjectList.find((c: any) => Number(c.ismS_Id || c.ISMS_Id) === Number(tempValues.ISMS_Id))?.subjectName;

        append({
            ...tempValues,
            ttbD_Id: 0,
            className: className || '',
            sectioname: sectionName || '',
            staffname: staffName || '',
            subjectname: subjectName || ''
        });

        // Reset Temp fields
        setValue('ASMCL_Id_temp', 0);
        setValue('ASMS_Id_temp', 0);
        setValue('HRME_Id_temp', 0);
        setValue('ISMS_Id_temp', 0);
    };

    const watchedBefAftFlag = watch('TTB_BefAftApplFlag');
    const watchedConsecutiveFlag = watch('TTB_ConsecutiveFlag');

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                ttB_ID: data.TTB_ID || 0,
                ttB_Id: data.TTB_ID || 0,
                asmaY_Id: data.ASMAY_Id,
                ttmC_Id: data.TTMC_Id,
                ttB_NoOfPeriods: data.TTB_NoOfPeriods,
                ttB_BifurcationName: data.TTB_BifurcationName,
                ttB_BefAftApplFlag: data.TTB_BefAftApplFlag ? 1 : 0,
                ttB_BefAftFalg: data.TTB_BefAftApplFlag ? (data.TTB_BefAftFalg || '') : '',
                ttmP_Id: data.TTB_BefAftApplFlag ? (data.TTMP_Id || 0) : 0,
                ttB_ConsecutiveFlag: data.TTB_ConsecutiveFlag ? 1 : 0,
                ttB_NoOfConPeriods: data.TTB_ConsecutiveFlag ? (data.TTB_NoOfConPeriods || 0) : 0,
                ttB_NoOfConDays: data.TTB_ConsecutiveFlag ? (data.TTB_NoOfConDays || 0) : 0,
                combinationlist: data.combinationlist.map((item) => ({
                    ttbD_Id: item.ttbD_Id || 0,
                    ttB_Id: data.TTB_ID || 0,
                    asmcL_Id: item.ASMCL_Id,
                    asmS_Id: item.ASMS_Id,
                    hrmE_Id: item.HRME_Id,
                    ismS_Id: item.ISMS_Id,
                    ttbD_ActiveFlag: true
                }))
            };

            console.info('Bifurcation Payload:', payload);
            const response = await saveBifurcationConstraintsDetail(payload);
            if (response.success) {
                toast.success(response.message || 'Saved successfully');
                handleReset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to save');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 rounded-md border bg-white p-6 shadow-sm'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Left Column */}
                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <Label>
                            Academic Year<span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='ASMAY_Id'
                            control={control}
                            render={({ field }) => (
                                <Select
                                    key={`asmay-${field.value || 'empty'}`}
                                    onValueChange={(value) => {
                                        field.onChange(value ? Number(value) : 0);
                                    }}
                                    value={field.value && field.value !== 0 ? field.value.toString() : undefined}>
                                    <SelectTrigger className='h-11 border-purple-100'>
                                        <SelectValue placeholder='-- Select Year --' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicyearloading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading Years...
                                            </SelectItem>
                                        ) : academicyearerror ? (
                                            <SelectItem value='error' disabled>
                                                Error loading Years
                                            </SelectItem>
                                        ) : (
                                            academicList.map((y: any) => {
                                                const yId = y.asmaY_Id ?? y.ASMAY_Id ?? y.asmaY_ID ?? y.id;
                                                const yName = y.asmaY_Year ?? y.ASMAY_Year ?? y.academicYear ?? y.year;
                                                if (!yId) return null;
                                                return (
                                                    <SelectItem key={String(yId)} value={String(yId)}>
                                                        {yName}
                                                    </SelectItem>
                                                );
                                            })
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ASMAY_Id && <p className='text-red-500 text-xs'>{errors.ASMAY_Id.message}</p>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Bifurcation Name <span className='text-red-500'>*</span>
                        </Label>
                        <InputText {...register('TTB_BifurcationName')} error={errors.TTB_BifurcationName?.message} />
                    </div>

                    <div className='space-y-4 rounded-md border bg-gray-50 p-4'>
                        <div className='flex items-center space-x-2'>
                            <Controller
                                control={control}
                                name='TTB_BefAftApplFlag'
                                render={({ field }) => (
                                    <Checkbox
                                        checked={Boolean(field.value)}
                                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                        id='ba_flag'
                                    />
                                )}
                            />
                            <Label htmlFor='ba_flag' className='font-semibold'>
                                Before After Constraints
                            </Label>
                        </div>

                        {watchedBefAftFlag && (
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label>
                                        Condition <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        control={control}
                                        name='TTB_BefAftFalg'
                                        render={({ field }) => (
                                            <Select
                                                key={`condition-${field.value || 'empty'}`}
                                                onValueChange={field.onChange}
                                                value={field.value || undefined}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='--Select--' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='Before'>Before</SelectItem>
                                                    <SelectItem value='After'>After</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.TTB_BefAftFalg && <FormError>{errors.TTB_BefAftFalg.message}</FormError>}
                                </div>
                                <div className='space-y-2'>
                                    <Label>
                                        Period <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        control={control}
                                        name='TTMP_Id'
                                        render={({ field }) => (
                                            <Select
                                                key={`ttmp-${field.value || 'empty'}`}
                                                onValueChange={(value) => {
                                                    field.onChange(value ? Number(value) : 0);
                                                }}
                                                value={field.value && field.value !== 0 ? field.value.toString() : undefined}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Period' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {perioddataloading ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading Periods
                                                        </SelectItem>
                                                    ) : perioddataError ? (
                                                        <SelectItem value='error' disabled>
                                                            Error loading Periods
                                                        </SelectItem>
                                                    ) : (
                                                        periodList.map((item: any) => {
                                                            const pId = item.ttmP_Id ?? item.TTMP_Id ?? item.ttmP_ID ?? item.id;
                                                            const pName = item.ttmP_PeriodName ?? item.TTMP_PeriodName ?? item.periodName;
                                                            if (!pId) return null;
                                                            return (
                                                                <SelectItem key={String(pId)} value={String(pId)}>
                                                                    {pName}
                                                                </SelectItem>
                                                            );
                                                        })
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.TTMP_Id && <FormError>{errors.TTMP_Id.message}</FormError>}
                                </div>
                            </div>
                        )}
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
                                    key={`ttmc-${field.value || 'empty'}`}
                                    onValueChange={(val) => {
                                        const numVal = val ? Number(val) : 0;
                                        field.onChange(numVal);
                                        handleCategoryChange(numVal);
                                    }}
                                    value={field.value && field.value !== 0 ? field.value.toString() : undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categorydropdownloading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading Categories
                                            </SelectItem>
                                        ) : categorydropdownerror ? (
                                            <SelectItem value='error' disabled>
                                                Error loading Categories
                                            </SelectItem>
                                        ) : (
                                            categoryList.map((item: any) => {
                                                const cId = item.ttmC_Id ?? item.TTMC_Id ?? item.ttmC_ID ?? item.id;
                                                const cName = item.ttmC_CategoryName ?? item.TTMC_CategoryName ?? item.categoryName ?? item.name;
                                                if (!cId) return null;
                                                return (
                                                    <SelectItem key={String(cId)} value={String(cId)}>
                                                        {cName}
                                                    </SelectItem>
                                                );
                                            })
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.TTMC_Id && <FormError>{errors.TTMC_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            No of Period <span className='text-red-500'>*</span>
                        </Label>
                        <InputText type='number' {...register('TTB_NoOfPeriods')} error={errors.TTB_NoOfPeriods?.message} />
                    </div>

                    <div className='space-y-4 rounded-md border bg-gray-50 p-4'>
                        <div className='flex items-center space-x-2'>
                            <Controller
                                control={control}
                                name='TTB_ConsecutiveFlag'
                                render={({ field }) => (
                                    <Checkbox
                                        checked={Boolean(field.value)}
                                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                        id='con_flag'
                                    />
                                )}
                            />
                            <Label htmlFor='con_flag' className='font-semibold'>
                                Consecutive Constraints
                            </Label>
                        </div>

                        {watchedConsecutiveFlag && (
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label>
                                        No of Consecutive Period <span className='text-red-500'>*</span>
                                    </Label>
                                    <InputText
                                        type='number'
                                        {...register('TTB_NoOfConPeriods')}
                                        error={errors.TTB_NoOfConPeriods?.message}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label>
                                        Day <span className='text-red-500'>*</span>
                                    </Label>
                                    <InputText type='number' {...register('TTB_NoOfConDays')} error={errors.TTB_NoOfConDays?.message} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <hr className='my-4' />

            {/* Combination Section */}
            <div className='space-y-4'>
                <h3 className='font-medium text-lg'>Combination Details</h3>
                <div className='grid grid-cols-1 items-end gap-4 rounded-md border bg-gray-50 p-4 md:grid-cols-5'>
                    <div className='space-y-2'>
                        <Label>
                            Class <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ASMCL_Id_temp'
                            render={({ field }) => (
                                <Select
                                    key={`class-temp-${field.value || 'empty'}`}
                                    onValueChange={(val) => {
                                        const numVal = val ? Number(val) : 0;
                                        field.onChange(numVal);
                                        handleClassChange(numVal);
                                    }}
                                    value={field.value && field.value !== 0 ? field.value.toString() : undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isClassLoading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading Classes...
                                            </SelectItem>
                                        ) : classList.length === 0 ? (
                                            <SelectItem value='none' disabled>
                                                No Classes Found
                                            </SelectItem>
                                        ) : (
                                            classList.map((item: any) => {
                                                const cId = item.asmcL_Id ?? item.ASMCL_Id ?? item.asmcL_ID ?? item.id;
                                                const cName = item.asmcL_ClassName ?? item.ASMCL_ClassName ?? item.className;
                                                if (!cId) return null;
                                                return (
                                                    <SelectItem key={String(cId)} value={String(cId)}>
                                                        {cName}
                                                    </SelectItem>
                                                );
                                            })
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label>
                            Section <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ASMS_Id_temp'
                            render={({ field }) => (
                                <Select
                                    key={`section-temp-${field.value || 'empty'}`}
                                    onValueChange={(val) => {
                                        const numVal = val ? Number(val) : 0;
                                        field.onChange(numVal);
                                        handleSectionChange(numVal);
                                    }}
                                    value={field.value && field.value !== 0 ? field.value.toString() : undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectiondataloading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading Sections...
                                            </SelectItem>
                                        ) : (
                                            sectionList.map((item: any) => {
                                                const sId = item.asmS_Id ?? item.asmC_Id ?? item.ASMS_Id ?? item.ASMC_Id ?? item.id;
                                                const sName = item.asmC_SectionName ?? item.asmS_SectionName ?? item.sectionName ?? item.ASMC_SectionName;
                                                if (!sId) return null;
                                                return (
                                                    <SelectItem key={String(sId)} value={String(sId)}>
                                                        {sName}
                                                    </SelectItem>
                                                );
                                            })
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label>
                            Staff <span className='text-red-500'>*</span>
                        </Label>

                        <Controller
                            control={control}
                            name='HRME_Id_temp'
                            render={({ field }) => (
                                <Select
                                    key={`staff-temp-${field.value || 'empty'}`}
                                    onValueChange={(val) => field.onChange(val ? Number(val) : 0)}
                                    value={field.value && field.value !== 0 ? field.value.toString() : undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {staffdataloading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading Staff...
                                            </SelectItem>
                                        ) : staffdataError ? (
                                            <SelectItem value='error' disabled>
                                                Error loading Staff
                                            </SelectItem>
                                        ) : (
                                            staffList.map((item: any) => {
                                                const hId = item.hrmE_Id ?? item.HRME_Id ?? item.hrmE_ID ?? item.id;
                                                const hName = item.staffName ?? item.hrmE_EmployeeFirstName ?? item.hrmE_EmployeeName ?? item.HRME_EmployeeName;
                                                if (!hId) return null;
                                                return (
                                                    <SelectItem key={String(hId)} value={String(hId)}>
                                                        {hName}
                                                    </SelectItem>
                                                );
                                            })
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label>
                            Subject <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ISMS_Id_temp'
                            render={({ field }) => (
                                <Select
                                    key={`subject-temp-${field.value || 'empty'}`}
                                    onValueChange={(val) => field.onChange(val ? Number(val) : 0)}
                                    value={field.value && field.value !== 0 ? field.value.toString() : undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjectdataloading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading Subjects...
                                            </SelectItem>
                                        ) : subjectdataError ? (
                                            <SelectItem value='error' disabled>
                                                Error loading Subjects
                                            </SelectItem>
                                        ) : (
                                            subjectList.map((item: any) => {
                                                const sId = item.ismS_Id ?? item.ISMS_Id ?? item.ismS_ID ?? item.id;
                                                const sName = item.ismS_SubjectName ?? item.ISMS_SubjectName ?? item.subjectName;
                                                if (!sId) return null;
                                                return (
                                                    <SelectItem key={String(sId)} value={String(sId)}>
                                                        {sName}
                                                    </SelectItem>
                                                );
                                            })
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <div className='pb-2'>
                        <Button type='button' onClick={handleAddCombination} variant='secondary'>
                            <Plus className='mr-2 h-4 w-4' /> Add
                        </Button>
                    </div>
                </div>

                {errors.combinationlist && <FormError>{errors.combinationlist.message}</FormError>}
                {errors.combinationlist?.root && <FormError>{errors.combinationlist.root.message}</FormError>}

                {fields.length > 0 && (
                    <Table className='border'>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Class</TableHead>
                                <TableHead>Section</TableHead>
                                <TableHead>Staff</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead className='w-[80px]'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.map((field: any, index) => (
                                <TableRow key={field.id}>
                                    <TableCell>{field.className || '-'}</TableCell>
                                    <TableCell>{field.sectioname || '-'}</TableCell>
                                    <TableCell>{field.staffname || '-'}</TableCell>
                                    <TableCell>{field.subjectname || '-'}</TableCell>
                                    <TableCell>
                                        <Button type='button' variant='ghost' size='icon' onClick={() => remove(index)}>
                                            <Trash className='h-4 w-4 text-red-500' />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={onCancel || handleReset}
                    disabled={isSubmitting}
                    className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                    Reset
                </Button>
                <Button
                    type='submit'
                    disabled={isSubmitting}
                    className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                    isLoading={isSubmitting}
                    loadingText='Saving...'>
                    <div className='flex items-center'>
                        <Save className='mr-2 h-4 w-4' />
                        Save
                    </div>
                </Button>
            </div>
        </form>
    );
}
