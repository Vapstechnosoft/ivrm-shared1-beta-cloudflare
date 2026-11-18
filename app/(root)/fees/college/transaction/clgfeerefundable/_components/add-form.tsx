'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    useCollegeFeeRefundableHeads,
    useCollegeFeeRefundableList,
    useCollegeFeeRefundableStudentByAmst,
    useCollegeFeeRefundableStudents
} from '@/hooks/fees/college/useCollegeFeeRefundable';
import { useCollegeAcademicYears, useCollegeBranches, useCollegeCourses, useCollegeSemesters } from '@/hooks/fees/college/useTransactions';
import { cn } from '@/lib/utils';
import { collegeFeeRefundableSchema } from '@/schemas/fees/college/transactions/clgfeerefundable';
import { saveCollegeFeeRefundable } from '@/server/fees/college/transaction/clgfeerefundable';
import type {
    ICollegeFeeRefundableGroup,
    ICollegeFeeRefundableHeadItem,
    ICollegeFeeRefundableStudent
} from '@/types/fees/college/transaction/clgfeerefundable';
import type { ICollegeBranch, ICollegeCourse, ICollegeSemester } from '@/types/fees/college/transaction/clgfeewaivedoff';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, Eye, RotateCcw, Save, Search, Square } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

interface AddCollegeFeeRefundableFormProps {
    onSuccess?: () => void;
    pageData?: any;
    className?: string;
}

type FormFields = z.infer<typeof collegeFeeRefundableSchema.addOrUpdate>;

function extractArrayData<T = any>(data: any, preferredKeys: string[] = []): T[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.$values)) return data.$values;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.data?.$values)) return data.data.$values;

    const source = data.data && typeof data.data === 'object' && !Array.isArray(data.data) ? data.data : data;

    for (const key of preferredKeys) {
        if (Array.isArray(source[key])) return source[key];
        if (Array.isArray(source[key]?.$values)) return source[key].$values;
    }

    for (const key of Object.keys(source)) {
        if (Array.isArray(source[key]) && source[key].length > 0) return source[key];
    }

    return [];
}

const MODE_OF_PAYMENT_OPTIONS = ['Cash', 'Cheque', 'DD', 'Online', 'NEFT', 'RTGS', 'Other'];

export default function AddCollegeFeeRefundableForm({ onSuccess, pageData, className }: AddCollegeFeeRefundableFormProps) {
    const { refetchAll } = useCollegeFeeRefundableList();

    const [groupSearchQuery, setGroupSearchQuery] = useState('');
    const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
    const [groupList, setGroupList] = useState<ICollegeFeeRefundableGroup[]>([]);
    const [studentStats, setStudentStats] = useState<any[]>([]);
    const [feeHeadsState, setFeeHeadsState] = useState<
        Array<ICollegeFeeRefundableHeadItem & { isSelected: boolean; refundAmount: string; isRefundOver: boolean }>
    >([]);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(collegeFeeRefundableSchema.addOrUpdate),
        defaultValues: {
            fcR_Id: 0,
            asmaY_Id: '',
            amcO_Id: '',
            amB_Id: '',
            amsE_Id: '',
            amcsT_Id: '',
            fcR_Date: new Date(),
            fcR_RefundNo: '',
            fcR_ModeOfPayment: '',
            fcR_ChequeDDNo: 0,
            fcR_Bank: '',
            fcR_RefundRemarks: '',
            filterrefund: 'Refunable',
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
    const watchedMode = watch('fcR_ModeOfPayment');

    // Academic Years
    const { data: academicData } = useCollegeAcademicYears();
    const academicYears = useMemo(() => extractArrayData(academicData, ['yearlist', 'adcyear', 'years']), [academicData]);

    // Courses
    const selectedYearNum = watchedYearId ? Number(watchedYearId) : undefined;
    const { data: coursesData, isLoading: isCoursesLoading } = useCollegeCourses(selectedYearNum);
    const courses: ICollegeCourse[] = useMemo(
        () => extractArrayData<ICollegeCourse>(coursesData, ['courselist', 'courses']),
        [coursesData]
    );

    // Branches
    const selectedCourseNum = watchedCourseId ? Number(watchedCourseId) : undefined;
    const { data: branchesData, isLoading: isBranchesLoading } = useCollegeBranches(selectedYearNum, selectedCourseNum);
    const branches: ICollegeBranch[] = useMemo(
        () => extractArrayData<ICollegeBranch>(branchesData, ['branchlist', 'branches']),
        [branchesData]
    );

    // Semesters
    const selectedBranchNum = watchedBranchId ? Number(watchedBranchId) : undefined;
    const { data: semestersData, isLoading: isSemestersLoading } = useCollegeSemesters(
        selectedYearNum,
        selectedCourseNum,
        selectedBranchNum
    );
    const semesters: ICollegeSemester[] = useMemo(
        () => extractArrayData<ICollegeSemester>(semestersData, ['semisterlist', 'semesters']),
        [semestersData]
    );

    // Students
    const selectedSemNum = watchedSemId ? Number(watchedSemId) : undefined;
    const { data: studentsData, isLoading: isStudentsLoading } = useCollegeFeeRefundableStudents(
        selectedYearNum,
        selectedCourseNum,
        selectedBranchNum,
        selectedSemNum
    );
    const students: ICollegeFeeRefundableStudent[] = useMemo(
        () => extractArrayData<ICollegeFeeRefundableStudent>(studentsData, ['studentlist', 'students']),
        [studentsData]
    );

    const selectedStudentNum = watchedStudentId ? Number(watchedStudentId) : undefined;

    // Groups by Student & Refund Category
    const { data: groupsData } = useCollegeFeeRefundableStudentByAmst(
        selectedYearNum && selectedStudentNum && watchedRefundType
            ? { asmaY_Id: selectedYearNum, amcsT_Id: selectedStudentNum, filterrefund: watchedRefundType }
            : undefined
    );

    // Sync group list and statistics from API
    useEffect(() => {
        if (!groupsData) {
            setGroupList([]);
            setStudentStats([]);
            return;
        }
        const groups = extractArrayData<ICollegeFeeRefundableGroup>(groupsData, ['fillgroup', 'fillfeehead', 'grouplist', 'groups']);
        setGroupList(groups);

        const stats = extractArrayData<any>(groupsData, ['showstaticticsdetails', 'statistics']);
        setStudentStats(stats);
    }, [groupsData]);

    // Fee Heads via onselectgroup
    const { data: headsData, isLoading: isHeadsLoading } = useCollegeFeeRefundableHeads(
        selectedYearNum && selectedStudentNum && watchedRefundType && selectedGroupIds.length > 0
            ? { asmaY_Id: selectedYearNum, amcsT_Id: selectedStudentNum, filterrefund: watchedRefundType, multiplegroupF: selectedGroupIds }
            : undefined
    );

    // Sync fee heads from API
    useEffect(() => {
        if (!headsData) return;
        const heads = extractArrayData<ICollegeFeeRefundableHeadItem>(headsData, ['headlist', 'savetmpdata', 'heads', 'studentlist']);
        if (heads.length > 0) {
            setFeeHeadsState(
                heads.map((h) => ({
                    ...h,
                    isSelected: Boolean(h.isSelected || h.selected),
                    refundAmount: h.fcR_RefundAmount ? String(h.fcR_RefundAmount) : h.FR_RefundAmount ? String(h.FR_RefundAmount) : '',
                    isRefundOver: Boolean(h.isRefundOver || h.Selected1)
                }))
            );
        } else {
            setFeeHeadsState([]);
        }
    }, [headsData]);

    // Reset dependent state when student changes
    useEffect(() => {
        if (!watchedStudentId) {
            setGroupList([]);
            setSelectedGroupIds([]);
            setFeeHeadsState([]);
        }
    }, [watchedStudentId]);

    // Sync selected groups to form
    useEffect(() => {
        setValue('selectedGroups', selectedGroupIds.map(String), { shouldValidate: true });
    }, [selectedGroupIds, setValue]);

    // Sync selected heads to form checkedlist
    useEffect(() => {
        const activeList = feeHeadsState
            .filter((h) => h.isSelected && Number(h.refundAmount) > 0)
            .map((h) => ({
                fcsS_Id: Number(h.fcsS_Id || 0),
                fmH_Id: Number(h.fmH_Id || 0),
                ftI_Id: Number(h.ftI_Id || 0),
                fmG_Id: Number(h.fmG_Id || 0),
                fcR_RefundAmount: Number(h.refundAmount),
                fmH_FeeName: h.fmH_FeeName,
                ftI_Name: h.ftI_Name,
                fcsS_ToBePaid: Number(h.fcsS_ToBePaid || 0),
                fcsS_PaidAmount: Number(h.fcsS_PaidAmount || 0)
            }));
        setValue('checkedlist', activeList, { shouldValidate: true });
    }, [feeHeadsState, setValue]);

    const filteredGroups = useMemo(() => {
        if (!groupSearchQuery.trim()) return groupList;
        const q = groupSearchQuery.toLowerCase();
        return groupList.filter((g) => (g.fmG_GroupName || '').toLowerCase().includes(q));
    }, [groupList, groupSearchQuery]);

    const toggleGroup = (id: number) =>
        setSelectedGroupIds((prev) => (prev.includes(id) ? prev.filter((gId) => gId !== id) : [...prev, id]));

    const toggleAllGroups = () => {
        if (selectedGroupIds.length === groupList.length) setSelectedGroupIds([]);
        else setSelectedGroupIds(groupList.map((g) => Number(g.fmG_Id)));
    };

    const toggleHeadRow = (index: number) => {
        setFeeHeadsState((prev) =>
            prev.map((head, idx) => {
                if (idx === index) {
                    const nextSelected = !head.isSelected;
                    return { ...head, isSelected: nextSelected, refundAmount: nextSelected ? head.refundAmount || '' : '' };
                }
                return head;
            })
        );
    };

    const toggleAllHeads = () => {
        const allSelected = feeHeadsState.length > 0 && feeHeadsState.every((h) => h.isSelected);
        setFeeHeadsState((prev) =>
            prev.map((head) => ({ ...head, isSelected: !allSelected, refundAmount: !allSelected ? head.refundAmount || '' : '' }))
        );
    };

    const updateHeadAmount = (index: number, val: string) => {
        if (val !== '' && !/^\d*\.?\d*$/.test(val)) return;
        setFeeHeadsState((prev) => prev.map((head, idx) => (idx === index ? { ...head, refundAmount: val } : head)));
    };

    const toggleRefundOver = (index: number) => {
        setFeeHeadsState((prev) => prev.map((head, idx) => (idx === index ? { ...head, isRefundOver: !head.isRefundOver } : head)));
    };

    const handleReset = () => {
        reset({
            fcR_Id: 0,
            asmaY_Id: '',
            amcO_Id: '',
            amB_Id: '',
            amsE_Id: '',
            amcsT_Id: '',
            fcR_Date: new Date(),
            fcR_RefundNo: '',
            fcR_ModeOfPayment: '',
            fcR_ChequeDDNo: 0,
            fcR_Bank: '',
            fcR_RefundRemarks: '',
            filterrefund: 'Refunable',
            selectedGroups: [],
            checkedlist: []
        });
        setSelectedGroupIds([]);
        setGroupList([]);
        setStudentStats([]);
        setFeeHeadsState([]);
        setGroupSearchQuery('');
    };

    const onSubmit: SubmitHandler<FormFields> = async (formData) => {
        try {
            if (!formData.checkedlist || formData.checkedlist.length === 0) {
                toast.error('Please select at least one Fee Head and enter a valid Refund Amount greater than 0');
                return;
            }

            const zeroAmountItem = formData.checkedlist.find((item) => Number(item.fcR_RefundAmount) <= 0);
            if (zeroAmountItem) {
                toast.error('Entered amount for selected heads must be greater than zero');
                return;
            }

            const payload = {
                fcR_Id: Number(formData.fcR_Id || 0),
                asmaY_Id: Number(formData.asmaY_Id),
                amcsT_Id: Number(formData.amcsT_Id),
                fcR_Date: new Date(formData.fcR_Date).toISOString(),
                fcR_RefundNo: formData.fcR_RefundNo,
                fcR_ModeOfPayment: formData.fcR_ModeOfPayment,
                fcR_ChequeDDNo: Number(formData.fcR_ChequeDDNo || 0),
                fcR_ChequeDDDate: formData.fcR_ChequeDDDate ? new Date(formData.fcR_ChequeDDDate).toISOString() : undefined,
                fcR_Bank: formData.fcR_Bank || '',
                fcR_RefundRemarks: formData.fcR_RefundRemarks || '',
                savetmpdata: formData.checkedlist.map((item) => ({
                    fcsS_Id: Number(item.fcsS_Id),
                    fmH_Id: Number(item.fmH_Id),
                    ftI_Id: Number(item.ftI_Id),
                    fmG_Id: Number(item.fmG_Id),
                    fcR_RefundAmount: Number(item.fcR_RefundAmount)
                })),
                selectedRefundOverList: feeHeadsState
                    .filter((h) => h.isSelected && h.isRefundOver)
                    .map((item) => ({ fcsS_Id: Number(item.fcsS_Id) }))
            };

            const response = await saveCollegeFeeRefundable(payload);
            const status = response?.returnduplicatestatus || response?.returnval || response?.message;

            if (status === 'Saved' || status === 'Updated' || response?.success) {
                toast.success(`Record ${status || 'Saved'} Successfully`);
                refetchAll();
                handleReset();
                onSuccess?.();
            } else {
                toast.info(response?.message || `Record ${status || 'processed'}`);
                refetchAll();
                handleReset();
                onSuccess?.();
            }
        } catch (error: any) {
            toast.error(error.message ?? 'An error occurred while saving Refund details');
        }
    };

    const showChequeFields = watchedMode === 'Cheque' || watchedMode === 'DD';

    return (
        <form
            onSubmit={handleSubmit(onSubmit, (errs) => {
                const failedFields = Object.keys(errs).join(', ');
                toast.error(`Validation failed on: ${failedFields}`);
            })}
            className={cn('space-y-6', className)}>
            <div className='grid gap-6 lg:grid-cols-2'>
                {/* Left: Academic & Student Dropdowns */}
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
                                            setGroupList([]);
                                            setFeeHeadsState([]);
                                        }}>
                                        <SelectTrigger id='asmaY_Id'>
                                            <SelectValue placeholder='Select Academic Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicYears.map((ay: any) => (
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
                                            setGroupList([]);
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
                                            setGroupList([]);
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
                                            setGroupList([]);
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
                                            setGroupList([]);
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

                        {/* View Fee Details Button & Modal */}
                        {watchedStudentId && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        className='mt-2 w-full border-primary/30 text-primary hover:bg-primary/10'>
                                        <Eye className='mr-1.5 h-3.5 w-3.5' />
                                        View Fee Details
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className='max-w-3xl'>
                                    <DialogHeader>
                                        <DialogTitle>Student Fee Details</DialogTitle>
                                    </DialogHeader>
                                    <div className='max-h-[60vh] space-y-4 overflow-y-auto pt-2'>
                                        {studentStats.length > 0 && (
                                            <div className='space-y-2'>
                                                <h4 className='font-semibold text-foreground text-sm'>Payment Receipt Statistics</h4>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className='bg-muted/40'>
                                                            <TableHead>Receipt No</TableHead>
                                                            <TableHead>Receipt Date</TableHead>
                                                            <TableHead className='text-right'>Total Paid Amount</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {studentStats.map((stat, idx) => (
                                                            <TableRow key={idx}>
                                                                <TableCell className='font-medium'>{stat.fyP_ReceiptNo || 'N.A'}</TableCell>
                                                                <TableCell>
                                                                    {stat.fyP_ReceiptDate
                                                                        ? new Date(stat.fyP_ReceiptDate).toLocaleDateString('en-IN')
                                                                        : 'N.A'}
                                                                </TableCell>
                                                                <TableCell className='text-right font-semibold text-emerald-600'>
                                                                    &#8377;{' '}
                                                                    {Number(stat.fyP_TotalPaidAmount || 0).toLocaleString('en-IN', {
                                                                        minimumFractionDigits: 2
                                                                    })}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}

                                        {feeHeadsState.length > 0 && (
                                            <div className='space-y-2'>
                                                <h4 className='font-semibold text-foreground text-sm'>Fee Head Details</h4>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className='bg-muted/40'>
                                                            <TableHead>Fee Name</TableHead>
                                                            <TableHead>Installment</TableHead>
                                                            <TableHead className='text-right'>Total Payable</TableHead>
                                                            <TableHead className='text-right'>Paid Amount</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {feeHeadsState.map((head, idx) => (
                                                            <TableRow key={idx}>
                                                                <TableCell className='font-medium'>{head.fmH_FeeName}</TableCell>
                                                                <TableCell>{head.ftI_Name}</TableCell>
                                                                <TableCell className='text-right font-medium text-amber-600'>
                                                                    &#8377;{' '}
                                                                    {Number(head.fcsS_ToBePaid || 0).toLocaleString('en-IN', {
                                                                        minimumFractionDigits: 2
                                                                    })}
                                                                </TableCell>
                                                                <TableCell className='text-right font-medium text-emerald-600'>
                                                                    &#8377;{' '}
                                                                    {Number(head.fcsS_PaidAmount || 0).toLocaleString('en-IN', {
                                                                        minimumFractionDigits: 2
                                                                    })}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}

                                        {studentStats.length === 0 && feeHeadsState.length === 0 && (
                                            <div className='py-8 text-center text-muted-foreground text-sm'>
                                                No fee statistics or head details found for this student.
                                            </div>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </CardContent>
                </Card>

                {/* Right: Refund Details & Payment Info */}
                <Card className='border-border/60 shadow-sm'>
                    <CardContent className='space-y-4 pt-5'>
                        {/* Refund Date */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='fcR_Date' isRequired>
                                Refund Date
                            </Label>
                            <Controller
                                control={control}
                                name='fcR_Date'
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
                            <FormError>{errors.fcR_Date?.message}</FormError>
                        </div>

                        {/* Refund No */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='fcR_RefundNo' isRequired>
                                Voucher No
                            </Label>
                            <Controller
                                control={control}
                                name='fcR_RefundNo'
                                render={({ field }) => <InputText id='fcR_RefundNo' placeholder='Enter Voucher No' {...field} />}
                            />
                            <FormError>{errors.fcR_RefundNo?.message}</FormError>
                        </div>

                        {/* Mode of Payment */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='fcR_ModeOfPayment' isRequired>
                                Mode of Payment
                            </Label>
                            <Controller
                                control={control}
                                name='fcR_ModeOfPayment'
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger id='fcR_ModeOfPayment'>
                                            <SelectValue placeholder='Select Mode of Payment' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MODE_OF_PAYMENT_OPTIONS.map((m) => (
                                                <SelectItem key={m} value={m}>
                                                    {m}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormError>{errors.fcR_ModeOfPayment?.message}</FormError>
                        </div>

                        {/* Cheque/DD fields (conditional) */}
                        {showChequeFields && (
                            <div className='grid grid-cols-2 gap-3'>
                                <div className='space-y-1.5'>
                                    <Label htmlFor='fcR_ChequeDDNo'>Cheque/DD No</Label>
                                    <Controller
                                        control={control}
                                        name='fcR_ChequeDDNo'
                                        render={({ field }) => (
                                            <InputText id='fcR_ChequeDDNo' type='number' placeholder='Cheque/DD No' {...field} />
                                        )}
                                    />
                                </div>
                                <div className='space-y-1.5'>
                                    <Label htmlFor='fcR_ChequeDDDate'>Cheque/DD Date</Label>
                                    <Controller
                                        control={control}
                                        name='fcR_ChequeDDDate'
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
                                </div>
                                <div className='col-span-2 space-y-1.5'>
                                    <Label htmlFor='fcR_Bank'>Bank Name</Label>
                                    <Controller
                                        control={control}
                                        name='fcR_Bank'
                                        render={({ field }) => <InputText id='fcR_Bank' placeholder='Enter Bank Name' {...field} />}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Refund Remarks */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='fcR_RefundRemarks'>Refund Remarks</Label>
                            <Controller
                                control={control}
                                name='fcR_RefundRemarks'
                                render={({ field }) => (
                                    <InputText id='fcR_RefundRemarks' placeholder='Enter Remarks (optional)' {...field} />
                                )}
                            />
                        </div>

                        {/* Refundable Type Radio */}
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
                                            setGroupList([]);
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
                    </CardContent>
                </Card>
            </div>

            {/* Group Multi-Select Panel */}
            {watchedStudentId && (
                <Card className='border-border/60 shadow-sm'>
                    <CardContent className='pt-5'>
                        <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                                <Label isRequired>Fee Group List</Label>
                                {groupList.length > 0 && (
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        onClick={toggleAllGroups}
                                        className='h-7 px-2 text-primary text-xs hover:bg-primary/10'>
                                        {selectedGroupIds.length === groupList.length ? (
                                            <>
                                                <Square className='mr-1.5 h-3.5 w-3.5' />
                                                Deselect All
                                            </>
                                        ) : (
                                            <>
                                                <CheckSquare className='mr-1.5 h-3.5 w-3.5' />
                                                Select All
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                            {groupList.length > 4 && (
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
                            <div className='max-h-48 overflow-y-auto rounded-lg border bg-background p-2'>
                                {groupList.length === 0 ? (
                                    <div className='py-6 text-center text-muted-foreground text-xs'>
                                        No fee groups available. Select a student to load groups.
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
            )}

            {/* Fee Heads Dynamic Table */}
            {isHeadsLoading ? (
                <Card className='border-border/60 p-8 text-center'>
                    <div className='font-medium text-muted-foreground text-sm'>Loading Fee Heads...</div>
                </Card>
            ) : feeHeadsState.length > 0 ? (
                <Card className='border-primary/20 shadow-md transition-shadow hover:shadow-lg'>
                    <div className='flex items-center justify-between border-b bg-muted/40 px-5 py-3.5'>
                        <div className='flex items-center gap-2'>
                            <h3 className='font-semibold text-base text-foreground'>Fee Heads &amp; Refund Amount</h3>
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
                                        <TableHead className='w-12 text-center'>SLNO</TableHead>
                                        <TableHead className='w-12 text-center'>
                                            <input
                                                type='checkbox'
                                                className='h-4 w-4 rounded border-gray-300 accent-primary'
                                                checked={feeHeadsState.length > 0 && feeHeadsState.every((h) => h.isSelected)}
                                                onChange={toggleAllHeads}
                                            />
                                        </TableHead>
                                        <TableHead>Fee Head</TableHead>
                                        <TableHead>Installment</TableHead>
                                        <TableHead className='text-right'>Excess Amount</TableHead>
                                        <TableHead className='w-40 text-right'>Refund Amount</TableHead>
                                        <TableHead className='text-right'>Balance Amount</TableHead>
                                        <TableHead className='w-24 text-center'>Refund Over</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {feeHeadsState.map((head, index) => {
                                        const excessAmt = Number(head.Amountall ?? head.fcsS_ToBePaid ?? head.fcsS_PaidAmount ?? 0);
                                        const refundVal = Number(head.refundAmount || 0);
                                        const balAmt = head.balamt !== undefined ? Number(head.balamt) : Math.max(0, excessAmt - refundVal);

                                        return (
                                            <TableRow
                                                key={`${head.fmG_Id}-${head.fmH_Id}-${head.ftI_Id}-${index}`}
                                                className={cn(head.isSelected ? 'bg-primary/[0.03]' : '')}>
                                                <TableCell className='text-center font-medium text-muted-foreground text-xs'>
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className='text-center'>
                                                    <input
                                                        type='checkbox'
                                                        checked={head.isSelected}
                                                        onChange={() => toggleHeadRow(index)}
                                                        className='h-4 w-4 rounded border-gray-300 accent-primary'
                                                    />
                                                </TableCell>
                                                <TableCell className='font-medium text-foreground'>{head.fmH_FeeName}</TableCell>
                                                <TableCell>
                                                    <span className='rounded bg-muted px-2 py-0.5 font-medium text-xs'>
                                                        {head.ftI_Name}
                                                    </span>
                                                </TableCell>
                                                <TableCell className='text-right font-medium text-amber-600 dark:text-amber-400'>
                                                    &#8377; {excessAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell className='text-right'>
                                                    <div className='flex flex-col items-end gap-1'>
                                                        <InputText
                                                            type='text'
                                                            disabled={!head.isSelected}
                                                            value={head.refundAmount}
                                                            onChange={(e) => updateHeadAmount(index, e.target.value)}
                                                            placeholder='Refund Amount...'
                                                            className={cn(
                                                                'h-9 w-36 text-right font-semibold',
                                                                head.isSelected && !head.refundAmount
                                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                                    : ''
                                                            )}
                                                        />
                                                        {head.isSelected && !head.refundAmount && (
                                                            <span className='text-[10px] text-destructive'>Amount required</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className='text-right font-medium text-muted-foreground'>
                                                    &#8377; {balAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell className='text-center'>
                                                    <input
                                                        type='checkbox'
                                                        checked={head.isRefundOver}
                                                        onChange={() => toggleRefundOver(index)}
                                                        disabled={!head.isSelected}
                                                        className='h-4 w-4 rounded border-gray-300 accent-primary'
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
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
