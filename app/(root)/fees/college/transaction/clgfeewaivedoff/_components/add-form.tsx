'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    useCollegeAcademicYears,
    useCollegeBranches,
    useCollegeCourses,
    useCollegeFeeGroups,
    useCollegeFeeHeads,
    useCollegeFeeWaivedOffList,
    useCollegeSemesters,
    useCollegeStudents
} from '@/hooks/fees/college/useTransactions';
import { cn } from '@/lib/utils';
import { collegeFeeWaivedOffSchema } from '@/schemas/fees/college/transactions/clgfeewaivedoff';
import { saveCollegeFeeWaivedOff } from '@/server/fees/college/transaction/clgfeewaivedoff';
import type {
    ICollegeAcademicYear,
    ICollegeBranch,
    ICollegeCourse,
    ICollegeFeeGroup,
    ICollegeFeeHeadItem,
    ICollegeSemester,
    ICollegeStudent
} from '@/types/fees/college/transaction/clgfeewaivedoff';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, DollarSign, RotateCcw, Save, Search, Square } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

interface AddCollegeFeeWaivedOffFormProps {
    onSuccess?: () => void;
    pageData?: any;
    className?: string;
}

type FormFields = z.infer<typeof collegeFeeWaivedOffSchema.addOrUpdate>;

function extractArrayData<T = any>(data: any, preferredKeys: string[] = []): T[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.$values)) return data.$values;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.data?.$values)) return data.data.$values;

    const source = data.data && typeof data.data === 'object' && !Array.isArray(data.data) ? data.data : data;

    for (const key of preferredKeys) {
        if (Array.isArray(source[key]) && source[key].length > 0) {
            return source[key];
        }
        if (Array.isArray(source[key]?.$values) && source[key].$values.length > 0) {
            return source[key].$values;
        }
    }

    for (const key of Object.keys(source)) {
        if (Array.isArray(source[key]) && source[key].length > 0) {
            return source[key];
        }
    }

    return [];
}

export default function AddCollegeFeeWaivedOffForm({ onSuccess, pageData, className }: AddCollegeFeeWaivedOffFormProps) {
    const { refetchAll } = useCollegeFeeWaivedOffList();

    // Local state for fee heads table and selections
    const [groupSearchQuery, setGroupSearchQuery] = useState('');
    const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
    const [feeHeadsState, setFeeHeadsState] = useState<
        Array<
            ICollegeFeeHeadItem & {
                isSelected: boolean;
                waivedOffAmount: string;
            }
        >
    >([]);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(collegeFeeWaivedOffSchema.addOrUpdate),
        defaultValues: {
            fcswO_Id: 0,
            asmaY_Id: '',
            amcO_Id: '',
            amB_Id: '',
            amsE_Id: '',
            amcsT_Id: '',
            fcswO_Date: new Date(),
            filterrefund: 'NonRefunable',
            selectedGroups: [],
            checkedlist: []
        },
        mode: 'onChange'
    });

    const watchedYearId = watch('asmaY_Id');
    const watchedCourseId = watch('amcO_Id');
    const watchedBranchId = watch('amB_Id');
    const watchedSemId = watch('amsE_Id');
    const watchedStudentId = watch('amcsT_Id');
    const watchedRefundType = watch('filterrefund');

    // 1. Academic Years list
    const { data: academicData, isLoading: isAcademicLoading } = useCollegeAcademicYears();
    const academicYears: ICollegeAcademicYear[] = useMemo(() => {
        return extractArrayData<ICollegeAcademicYear>(academicData, ['yearlist', 'adcyear', 'years']);
    }, [academicData]);

    // 2. Courses Hook
    const selectedYearNum = watchedYearId ? Number(watchedYearId) : undefined;
    const { data: coursesData, isLoading: isCoursesLoading } = useCollegeCourses(selectedYearNum);
    const courses: ICollegeCourse[] = useMemo(() => {
        return extractArrayData<ICollegeCourse>(coursesData, ['courselist', 'courses']);
    }, [coursesData]);

    // 3. Branches Hook
    const selectedCourseNum = watchedCourseId ? Number(watchedCourseId) : undefined;
    const { data: branchesData, isLoading: isBranchesLoading } = useCollegeBranches(selectedYearNum, selectedCourseNum);
    const branches: ICollegeBranch[] = useMemo(() => {
        return extractArrayData<ICollegeBranch>(branchesData, ['branchlist', 'branches']);
    }, [branchesData]);

    // 4. Semesters Hook
    const selectedBranchNum = watchedBranchId ? Number(watchedBranchId) : undefined;
    const { data: semestersData, isLoading: isSemestersLoading } = useCollegeSemesters(
        selectedYearNum,
        selectedCourseNum,
        selectedBranchNum
    );
    const semesters: ICollegeSemester[] = useMemo(() => {
        return extractArrayData<ICollegeSemester>(semestersData, ['semisterlist', 'semesters']);
    }, [semestersData]);

    // 5. Students Hook
    const selectedSemNum = watchedSemId ? Number(watchedSemId) : undefined;
    const { data: studentsData, isLoading: isStudentsLoading } = useCollegeStudents(
        selectedYearNum,
        selectedCourseNum,
        selectedBranchNum,
        selectedSemNum
    );
    const students: ICollegeStudent[] = useMemo(() => {
        return extractArrayData<ICollegeStudent>(studentsData, ['studentlist', 'students']);
    }, [studentsData]);

    // 6. Groups Hook
    const selectedStudentNum = watchedStudentId ? Number(watchedStudentId) : undefined;
    const { data: groupsData, isLoading: isGroupsLoading } = useCollegeFeeGroups(selectedYearNum, selectedStudentNum, watchedRefundType);
    const groups: ICollegeFeeGroup[] = useMemo(() => {
        return extractArrayData<ICollegeFeeGroup>(groupsData, ['grouplist', 'groups']);
    }, [groupsData]);

    // Filtered Groups for search
    const filteredGroups = useMemo(() => {
        if (!groupSearchQuery.trim()) return groups;
        const q = groupSearchQuery.toLowerCase();
        return groups.filter((g) => (g.fmG_GroupName || '').toLowerCase().includes(q));
    }, [groups, groupSearchQuery]);

    // 7. Fee Heads Hook
    const multipleGroupString = useMemo(() => {
        if (selectedGroupIds.length === 0) return undefined;
        return selectedGroupIds.join(',');
    }, [selectedGroupIds]);

    const { data: headsData, isLoading: isHeadsLoading } = useCollegeFeeHeads(
        selectedYearNum && selectedStudentNum && watchedRefundType && multipleGroupString
            ? {
                  ASMAY_Id: selectedYearNum,
                  AMCST_Id: selectedStudentNum,
                  filterrefund: watchedRefundType,
                  multiplegroup: multipleGroupString
              }
            : undefined
    );

    // Sync fetched Fee Heads to local state
    useEffect(() => {
        const fetchedHeads = extractArrayData<ICollegeFeeHeadItem>(headsData, ['headlist', 'heads']);
        if (fetchedHeads && fetchedHeads.length > 0) {
            setFeeHeadsState(
                fetchedHeads.map((head) => ({
                    ...head,
                    isSelected: Boolean(head.xyz || head.selected),
                    waivedOffAmount: head.fcswO_WaivedOffAmount ? String(head.fcswO_WaivedOffAmount) : ''
                }))
            );
        } else {
            setFeeHeadsState([]);
        }
    }, [headsData]);

    // Sync selected groups with react-hook-form
    useEffect(() => {
        setValue('selectedGroups', selectedGroupIds.map(String), { shouldValidate: true });
    }, [selectedGroupIds, setValue]);

    // Sync selected heads with react-hook-form
    useEffect(() => {
        const activeList = feeHeadsState
            .filter((h) => h.isSelected && Number(h.waivedOffAmount) > 0)
            .map((h) => ({
                fmG_Id: Number(h.fmG_Id || 0),
                fmH_Id: Number(h.fmH_Id || 0),
                ftI_Id: Number(h.ftI_Id || 0),
                fcmaS_Id: Number(h.fcmaS_Id || 0),
                fcswO_WaivedOffAmount: Number(h.waivedOffAmount),
                fmH_FeeName: h.fmH_FeeName,
                ftI_Name: h.ftI_Name,
                fcsS_ToBePaid: Number(h.fcsS_ToBePaid || 0),
                fcsS_PaidAmount: Number(h.fcsS_PaidAmount || 0)
            }));
        setValue('checkedlist', activeList, { shouldValidate: true });
    }, [feeHeadsState, setValue]);

    // Group toggle handlers
    const toggleGroup = (id: number) => {
        setSelectedGroupIds((prev) => (prev.includes(id) ? prev.filter((gId) => gId !== id) : [...prev, id]));
    };

    const toggleAllGroups = () => {
        if (selectedGroupIds.length === groups.length) {
            setSelectedGroupIds([]);
        } else {
            setSelectedGroupIds(groups.map((g) => Number(g.fmG_Id)));
        }
    };

    // Fee head row handlers
    const toggleHeadRow = (index: number) => {
        setFeeHeadsState((prev) =>
            prev.map((head, idx) => {
                if (idx === index) {
                    const nextSelected = !head.isSelected;
                    return {
                        ...head,
                        isSelected: nextSelected,
                        waivedOffAmount: nextSelected ? head.waivedOffAmount || '' : ''
                    };
                }
                return head;
            })
        );
    };

    const toggleAllHeads = () => {
        const allSelected = feeHeadsState.length > 0 && feeHeadsState.every((h) => h.isSelected);
        setFeeHeadsState((prev) =>
            prev.map((head) => ({
                ...head,
                isSelected: !allSelected,
                waivedOffAmount: !allSelected ? head.waivedOffAmount || '' : ''
            }))
        );
    };

    const updateHeadAmount = (index: number, val: string) => {
        // allow numeric and decimal input only
        if (val !== '' && !/^\d*\.?\d*$/.test(val)) return;
        setFeeHeadsState((prev) =>
            prev.map((head, idx) => {
                if (idx === index) {
                    return {
                        ...head,
                        waivedOffAmount: val
                    };
                }
                return head;
            })
        );
    };

    // Reset Form
    const handleReset = () => {
        reset({
            fcswO_Id: 0,
            asmaY_Id: '',
            amcO_Id: '',
            amB_Id: '',
            amsE_Id: '',
            amcsT_Id: '',
            fcswO_Date: new Date(),
            filterrefund: 'NonRefunable',
            selectedGroups: [],
            checkedlist: []
        });
        setSelectedGroupIds([]);
        setFeeHeadsState([]);
        setGroupSearchQuery('');
    };

    // Form submission
    const onSubmit: SubmitHandler<FormFields> = async (formData) => {
        try {
            if (!formData.checkedlist || formData.checkedlist.length === 0) {
                toast.error('Please select at least one Fee Head and enter a valid Waived Off Amount greater than 0');
                return;
            }

            const zeroAmountItem = formData.checkedlist.find((item) => Number(item.fcswO_WaivedOffAmount) <= 0);
            if (zeroAmountItem) {
                toast.error('Entered amount for selected heads must be greater than zero');
                return;
            }

            const payload = {
                fcswO_Id: Number(formData.fcswO_Id || 0),
                FCSWO_Id: Number(formData.fcswO_Id || 0),
                asmaY_Id: Number(formData.asmaY_Id),
                ASMAY_Id: Number(formData.asmaY_Id),
                amcsT_Id: Number(formData.amcsT_Id),
                AMCST_Id: Number(formData.amcsT_Id),
                fcswO_Date: new Date(formData.fcswO_Date).toISOString(),
                FCSWO_Date: new Date(formData.fcswO_Date).toISOString(),
                checkedlist: formData.checkedlist.map((item) => ({
                    fmG_Id: Number(item.fmG_Id),
                    FMG_Id: Number(item.fmG_Id),
                    fmH_Id: Number(item.fmH_Id),
                    FMH_Id: Number(item.fmH_Id),
                    ftI_Id: Number(item.ftI_Id),
                    FTI_Id: Number(item.ftI_Id),
                    fcmaS_Id: Number(item.fcmaS_Id || 0),
                    FCMAS_Id: Number(item.fcmaS_Id || 0),
                    fcswO_WaivedOffAmount: Number(item.fcswO_WaivedOffAmount),
                    FCSWO_WaivedOffAmount: Number(item.fcswO_WaivedOffAmount)
                }))
            };

            const response = await saveCollegeFeeWaivedOff(payload);

            const status = response?.returnduplicatestatus || response?.returnval || response?.message;
            if (status === 'Saved' || status === 'Updated' || response?.success) {
                toast.success(`Record ${status || 'Saved'} Successfully`);
                refetchAll();
                handleReset();
                onSuccess?.();
            } else if (status === 'adjusted') {
                toast.warning('Record already adjusted / refunded');
                refetchAll();
            } else {
                toast.info(response?.message || `Record ${status || 'processed'}`);
                refetchAll();
                handleReset();
                onSuccess?.();
            }
        } catch (error: any) {
            toast.error(error.message ?? 'An error occurred while saving Waived Off details');
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit, (errs) => {
                console.log('Form errors:', errs);
                const failedFields = Object.keys(errs).join(', ');
                toast.error(`Validation failed on: ${failedFields}. Check console for details.`);
            })}
            className={cn('space-y-6', className)}>
            <div className='grid gap-6 lg:grid-cols-2'>
                {/* Left Column: Academic & Student Dropdowns */}
                <Card className='border-border/60 shadow-sm'>
                    <CardContent className='space-y-4 pt-5'>
                        {/* Academic Year */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='asmaY_Id' isRequired>
                                Academic Year
                            </Label>
                            <Controller
                                control={control}
                                name='asmaY_Id'
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            setValue('amcO_Id', '');
                                            setValue('amB_Id', '');
                                            setValue('amsE_Id', '');
                                            setValue('amcsT_Id', '');
                                            setSelectedGroupIds([]);
                                            setFeeHeadsState([]);
                                        }}>
                                        <SelectTrigger id='asmaY_Id'>
                                            <SelectValue placeholder='Select Academic Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicYears.map((ay) => (
                                                <SelectItem key={ay.asmaY_Id} value={String(ay.asmaY_Id)}>
                                                    {ay.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormError>{errors.asmaY_Id?.message}</FormError>
                        </div>

                        {/* Course */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='amcO_Id' isRequired>
                                Course
                            </Label>
                            <Controller
                                control={control}
                                name='amcO_Id'
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        disabled={!watchedYearId || isCoursesLoading}
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            setValue('amB_Id', '');
                                            setValue('amsE_Id', '');
                                            setValue('amcsT_Id', '');
                                            setSelectedGroupIds([]);
                                            setFeeHeadsState([]);
                                        }}>
                                        <SelectTrigger id='amcO_Id'>
                                            <SelectValue placeholder={isCoursesLoading ? 'Loading courses...' : 'Select Course'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map((c) => (
                                                <SelectItem key={c.amcO_Id} value={String(c.amcO_Id)}>
                                                    {c.amcO_CourseName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormError>{errors.amcO_Id?.message}</FormError>
                        </div>

                        {/* Branch */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='amB_Id' isRequired>
                                Branch
                            </Label>
                            <Controller
                                control={control}
                                name='amB_Id'
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        disabled={!watchedCourseId || isBranchesLoading}
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            setValue('amsE_Id', '');
                                            setValue('amcsT_Id', '');
                                            setSelectedGroupIds([]);
                                            setFeeHeadsState([]);
                                        }}>
                                        <SelectTrigger id='amB_Id'>
                                            <SelectValue placeholder={isBranchesLoading ? 'Loading branches...' : 'Select Branch'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches.map((b) => (
                                                <SelectItem key={b.amB_Id} value={String(b.amB_Id)}>
                                                    {b.amB_BranchName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormError>{errors.amB_Id?.message}</FormError>
                        </div>

                        {/* Semester */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='amsE_Id' isRequired>
                                Semester
                            </Label>
                            <Controller
                                control={control}
                                name='amsE_Id'
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        disabled={!watchedBranchId || isSemestersLoading}
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            setValue('amcsT_Id', '');
                                            setSelectedGroupIds([]);
                                            setFeeHeadsState([]);
                                        }}>
                                        <SelectTrigger id='amsE_Id'>
                                            <SelectValue placeholder={isSemestersLoading ? 'Loading semesters...' : 'Select Semester'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {semesters.map((s) => (
                                                <SelectItem key={s.amsE_Id} value={String(s.amsE_Id)}>
                                                    {s.amsE_SEMName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormError>{errors.amsE_Id?.message}</FormError>
                        </div>

                        {/* Student */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='amcsT_Id' isRequired>
                                Student Name
                            </Label>
                            <Controller
                                control={control}
                                name='amcsT_Id'
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        disabled={!watchedSemId || isStudentsLoading}
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            setSelectedGroupIds([]);
                                            setFeeHeadsState([]);
                                        }}>
                                        <SelectTrigger id='amcsT_Id'>
                                            <SelectValue placeholder={isStudentsLoading ? 'Loading students...' : 'Select Student'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.map((st) => (
                                                <SelectItem key={st.amcsT_Id} value={String(st.amcsT_Id)}>
                                                    {st.amcsT_FirstName} {st.amcsT_AdmNo ? `(${st.amcsT_AdmNo})` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormError>{errors.amcsT_Id?.message}</FormError>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Date, Refundable Toggle & Fee Groups Multi-select */}
                <Card className='border-border/60 shadow-sm'>
                    <CardContent className='space-y-5 pt-5'>
                        {/* Waived Off Date */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='fcswO_Date' isRequired>
                                Waived Off Date
                            </Label>
                            <Controller
                                control={control}
                                name='fcswO_Date'
                                render={({ field }) => (
                                    <DatePicker
                                        date={field.value}
                                        setDate={(d) => {
                                            if (d) field.onChange(d);
                                        }}
                                        placeholder='Select Date'
                                    />
                                )}
                            />
                            <FormError>{errors.fcswO_Date?.message}</FormError>
                        </div>

                        {/* Refundable / Non-Refundable Radio Options */}
                        <div className='rounded-lg border bg-muted/30 p-3.5'>
                            <Label className='mb-2.5 block font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                                Refund Category
                            </Label>
                            <Controller
                                control={control}
                                name='filterrefund'
                                render={({ field }) => (
                                    <RadioGroup
                                        value={field.value}
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            setSelectedGroupIds([]);
                                            setFeeHeadsState([]);
                                        }}
                                        className='flex flex-row gap-6'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='NonRefunable' id='r_nonrefundable' />
                                            <Label htmlFor='r_nonrefundable' className='cursor-pointer font-medium'>
                                                Non Refundable
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Refunable' id='r_refundable' />
                                            <Label htmlFor='r_refundable' className='cursor-pointer font-medium'>
                                                Refundable
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        {/* Group List Multi-Select */}
                        <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                                <Label isRequired>Group List</Label>
                                {groups.length > 0 && (
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        onClick={toggleAllGroups}
                                        className='h-7 px-2 text-primary text-xs hover:bg-primary/10'>
                                        {selectedGroupIds.length === groups.length ? (
                                            <>
                                                <Square className='mr-1.5 h-3.5 w-3.5' /> Deselect All
                                            </>
                                        ) : (
                                            <>
                                                <CheckSquare className='mr-1.5 h-3.5 w-3.5' /> Select All
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>

                            {/* Search filter for groups */}
                            {groups.length > 4 && (
                                <div className='relative'>
                                    <Search className='-translate-y-1/2 absolute top-1/2 left-2.5 h-3.5 w-3.5 text-muted-foreground' />
                                    <InputText
                                        value={groupSearchQuery}
                                        onChange={(e) => setGroupSearchQuery(e.target.value)}
                                        placeholder='Search groups...'
                                        className='h-8 pl-8 text-xs'
                                    />
                                </div>
                            )}

                            {/* Groups container */}
                            <div className='max-h-48 overflow-y-auto rounded-lg border bg-background p-2'>
                                {isGroupsLoading ? (
                                    <div className='py-6 text-center text-muted-foreground text-xs'>Loading fee groups...</div>
                                ) : groups.length === 0 ? (
                                    <div className='py-6 text-center text-muted-foreground text-xs'>
                                        {watchedStudentId
                                            ? 'No fee groups found for this student.'
                                            : 'Select a student to load fee groups.'}
                                    </div>
                                ) : (
                                    <div className='grid grid-cols-1 gap-1 sm:grid-cols-2'>
                                        {filteredGroups.map((grp) => {
                                            const isChecked = selectedGroupIds.includes(Number(grp.fmG_Id));
                                            return (
                                                <button
                                                    key={grp.fmG_Id}
                                                    type='button'
                                                    onClick={() => toggleGroup(Number(grp.fmG_Id))}
                                                    className={cn(
                                                        'flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors',
                                                        isChecked
                                                            ? 'bg-primary/10 font-medium text-primary'
                                                            : 'text-foreground hover:bg-accent/50'
                                                    )}>
                                                    <div
                                                        className={cn(
                                                            'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                                                            isChecked
                                                                ? 'border-primary bg-primary text-primary-foreground'
                                                                : 'border-muted-foreground/40'
                                                        )}>
                                                        {isChecked && <CheckSquare className='h-3 w-3' />}
                                                    </div>
                                                    <span className='truncate'>{grp.fmG_GroupName}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <FormError>{errors.selectedGroups?.message}</FormError>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Fee Heads Dynamic Table */}
            {isHeadsLoading ? (
                <Card className='border-border/60 p-8 text-center'>
                    <div className='font-medium text-muted-foreground text-sm'>Loading Fee Heads...</div>
                </Card>
            ) : feeHeadsState.length > 0 ? (
                <Card className='border-primary/20 shadow-md transition-shadow hover:shadow-lg'>
                    <div className='flex items-center justify-between border-b bg-muted/40 px-5 py-3.5'>
                        <div className='flex items-center gap-2'>
                            <DollarSign className='h-4 w-4 text-primary' />
                            <h3 className='font-semibold text-base text-foreground'>Fee Heads & Waived Off Amount</h3>
                            <span className='rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs'>
                                {feeHeadsState.filter((h) => h.isSelected).length} of {feeHeadsState.length} Selected
                            </span>
                        </div>
                        <Button type='button' variant='outline' size='sm' onClick={toggleAllHeads} className='h-8 text-xs'>
                            {feeHeadsState.every((h) => h.isSelected) ? 'Deselect All' : 'Select All'}
                        </Button>
                    </div>

                    <CardContent className='p-0'>
                        <div className='overflow-x-auto'>
                            <Table>
                                <TableHeader>
                                    <TableRow className='bg-muted/20'>
                                        <TableHead className='w-12 text-center'>
                                            <input
                                                type='checkbox'
                                                className='h-4 w-4 rounded border-gray-300 accent-primary'
                                                checked={feeHeadsState.length > 0 && feeHeadsState.every((h) => h.isSelected)}
                                                onChange={toggleAllHeads}
                                            />
                                        </TableHead>
                                        <TableHead className='w-12 text-center'>SLNO</TableHead>
                                        <TableHead>Fee Name</TableHead>
                                        <TableHead>Installment</TableHead>
                                        <TableHead className='text-right'>Balance</TableHead>
                                        <TableHead className='text-right'>Paid Amount</TableHead>
                                        <TableHead className='w-48 text-right'>Waived Off Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {feeHeadsState.map((head, index) => (
                                        <TableRow
                                            key={`${head.fmG_Id}-${head.fmH_Id}-${head.ftI_Id}-${index}`}
                                            className={cn(head.isSelected ? 'bg-primary/[0.03]' : '')}>
                                            <TableCell className='text-center'>
                                                <input
                                                    type='checkbox'
                                                    checked={head.isSelected}
                                                    onChange={() => toggleHeadRow(index)}
                                                    className='h-4 w-4 rounded border-gray-300 accent-primary'
                                                />
                                            </TableCell>
                                            <TableCell className='text-center font-medium text-muted-foreground text-xs'>
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className='font-medium text-foreground'>{head.fmH_FeeName}</TableCell>
                                            <TableCell>
                                                <span className='rounded bg-muted px-2 py-0.5 font-medium text-xs'>{head.ftI_Name}</span>
                                            </TableCell>
                                            <TableCell className='text-right font-medium text-amber-600 dark:text-amber-400'>
                                                ₹ {Number(head.fcsS_ToBePaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className='text-right font-medium text-emerald-600 dark:text-emerald-400'>
                                                ₹ {Number(head.fcsS_PaidAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                <div className='flex flex-col items-end gap-1'>
                                                    <InputText
                                                        type='text'
                                                        disabled={!head.isSelected}
                                                        value={head.waivedOffAmount}
                                                        onChange={(e) => updateHeadAmount(index, e.target.value)}
                                                        placeholder='0.00'
                                                        className={cn(
                                                            'h-9 w-36 text-right font-semibold',
                                                            head.isSelected && !head.waivedOffAmount
                                                                ? 'border-destructive focus-visible:ring-destructive'
                                                                : ''
                                                        )}
                                                    />
                                                    {head.isSelected && !head.waivedOffAmount && (
                                                        <span className='text-[10px] text-destructive'>Amount required</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            {/* Form Actions */}
            <div className='flex items-center justify-center gap-3 pt-2'>
                <Button
                    type='submit'
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className='min-w-32 shadow-md transition-all hover:scale-105 hover:shadow-lg'>
                    <Save className='mr-2 h-4 w-4' />
                    Save
                </Button>
                <Button
                    type='button'
                    variant='outline'
                    onClick={handleReset}
                    className='min-w-32 hover:bg-destructive/10 hover:text-destructive'>
                    <RotateCcw className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
            </div>
        </form>
    );
}
