'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { FeesCustomMultiSelectBox } from '@/components/ui/feesmultiselect';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useCollegeFeeTransactionAcademicYears,
    useCollegeFeeTransactionList,
    useCollegeMasterBanks
} from '@/hooks/fees/college/useCollegeTransaction';
import { collegeFeeTransactionSchema } from '@/schemas/fees/college/transaction';
import {
    getCollegeFeeHeadDetails,
    getCollegeStudentDetails,
    saveCollegeFeeTransaction,
    searchCollegeStudentName
} from '@/server/fees/college/transaction/college_fee_transaction';
import type {
    ICollegeFeeGroupTerm,
    ICollegeFeeHeadDetails,
    ICollegeMasterBank,
    ICollegeNarration,
    ICollegePaymentMode,
    ICollegeStudentDetails,
    ICollegeStudentSearchList
} from '@/types/fees/college/transaction/transaction';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, RotateCcw, Save, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import FeeDetails from './fee-head-column';
import CollegeStudentProfileModal from './student-details';

type FormFields = z.infer<typeof collegeFeeTransactionSchema.addOrUpdate>;

interface CollegeFeeTransactionFormProps {
    onSuccess?: () => void;
    asmayId?: number;
    initialData?: any;
    isEdit?: boolean;
}

const SEARCH_MODES = [
    { label: 'Regular', value: 'regular' },
    { label: 'Challan No.', value: 'Chal_no' },
    { label: 'Reg No.', value: 'regno' },
    { label: 'Adm No.', value: 'admno' },
    { label: 'Name:Adm.No.', value: 'name_admno' },
    { label: 'Adm.No.:Name', value: 'admno_name' },
    { label: 'Name:Reg.No.', value: 'name_regno' },
    { label: 'Reg.No.:Name', value: 'regno_name' }
];

export default function CollegeFeeTransactionAddForm({
    onSuccess,
    asmayId,
    initialData,
    isEdit = false
}: CollegeFeeTransactionFormProps) {
    const { refetchAll } = useCollegeFeeTransactionList(Number(asmayId));
    const { data: academicYearsData, isLoading: loadingYears } = useCollegeFeeTransactionAcademicYears();
    const { data: banksData } = useCollegeMasterBanks();

    const {
        handleSubmit,
        reset,
        control,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(collegeFeeTransactionSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            asmaY_Id: asmayId ? Number(asmayId) : undefined
        }
    });

    // Left Panel State
    const [filterType, setFilterType] = useState('regular');
    const [todaysDate, setTodaysDate] = useState<Date>(new Date());
    const [left, setLeft] = useState(false);
    const [deactive, setDeactive] = useState(false);
    const [challanSearch, setChallanSearch] = useState('');
    const [searchByLetters, setSearchByLetters] = useState('3');

    // Center Panel State
    const [selectedAsmayId, setSelectedAsmayId] = useState<number | null>(asmayId ? Number(asmayId) : null);
    const [studentSearch, setStudentSearch] = useState('');
    const [students, setStudents] = useState<ICollegeStudentSearchList[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<ICollegeStudentSearchList | null>(null);
    const [studentDetails, setStudentDetails] = useState<ICollegeStudentDetails | null>(null);
    const [terms, setTerms] = useState<ICollegeFeeGroupTerm[]>([]);
    const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
    const [loadingTerms, setLoadingTerms] = useState(false);
    const [receiptNo, setReceiptNo] = useState('');
    const [amountCheck, setAmountCheck] = useState(false);
    const [termAmount, setTermAmount] = useState('');
    const [sms, setSms] = useState(false);
    const [email, setEmail] = useState(false);

    // Fee Heads Table State
    const [feeHeads, setFeeHeads] = useState<ICollegeFeeHeadDetails[]>([]);
    const [loadingFeeHeads, setLoadingFeeHeads] = useState(false);
    const [selectedHeads, setSelectedHeads] = useState<Record<number, boolean>>({});
    const [nowPayingAmounts, setNowPayingAmounts] = useState<Record<number, number>>({});
    const [selectAllHeads, setSelectAllHeads] = useState(true);

    // Payment Modes & Narration
    const [paymentModeType, setPaymentModeType] = useState<'Single' | 'Multiple'>('Single');
    const [selectedPayMode, setSelectedPayMode] = useState<string>('Cash');
    const [selectedMultiModes, setSelectedMultiModes] = useState<string[]>(['Cash']);
    const [masterPaymentModes, setMasterPaymentModes] = useState<ICollegePaymentMode[]>([
        { ivrmmoD_Id: 1, ivrmmoD_ModeOfPayment: 'Cash', ivrmmoD_Flag: 'C' },
        { ivrmmoD_Id: 2, ivrmmoD_ModeOfPayment: 'Bank / Cheque', ivrmmoD_Flag: 'B' },
        { ivrmmoD_Id: 3, ivrmmoD_ModeOfPayment: 'Card', ivrmmoD_Flag: 'B' },
        { ivrmmoD_Id: 4, ivrmmoD_ModeOfPayment: 'Online', ivrmmoD_Flag: 'C' }
    ]);
    const [narrations, setNarrations] = useState<ICollegeNarration[]>([
        { fmnaR_Id: 1, fmnaR_Narration: 'College Regular Fee Collection' },
        { fmnaR_Id: 2, fmnaR_Narration: 'Semester Fee Installment Paid' }
    ]);
    const [selectedNarrationId, setSelectedNarrationId] = useState<number | null>(1);
    const [bankDetails, setBankDetails] = useState<Record<string, { bankId: string; chequeNo: string; date: string; amount: string }>>({
        'Bank / Cheque': { bankId: '1', chequeNo: '', date: format(new Date(), 'yyyy-MM-dd'), amount: '' },
        Card: { bankId: '1', chequeNo: '', date: format(new Date(), 'yyyy-MM-dd'), amount: '' }
    });

    // Modals
    const [openFeeDetails, setOpenFeeDetails] = useState(false);
    const [openStudentProfile, setOpenStudentProfile] = useState(false);

    const selectedSearchMode = SEARCH_MODES.find((m) => m.value === filterType);
    const studentFieldLabel =
        filterType === 'regular' || filterType === 'Chal_no'
            ? 'Student Name'
            : selectedSearchMode?.label || 'Student Name';

    // Initial setup if asmayId changes
    useEffect(() => {
        if (asmayId) {
            setSelectedAsmayId(Number(asmayId));
            setValue('asmaY_Id', Number(asmayId));
        }
    }, [asmayId, setValue]);

    // Student Search Autocomplete
    useEffect(() => {
        if (!studentSearch.trim() || studentSearch.length < (filterType === 'regular' ? Number(searchByLetters) : 1)) {
            setStudents([]);
            return;
        }

        const fetchStudents = async () => {
            setLoadingStudents(true);
            try {
                const payload = {
                    asmaY_Id: selectedAsmayId || asmayId,
                    filterinitialdata: filterType,
                    searchfilter: studentSearch,
                    amsT_SOL: left ? 'L' : 'S',
                    amsT_Status: deactive ? 'I' : 'A'
                };
                const res = await searchCollegeStudentName(payload);
                setStudents(res.feeStudentSearch || []);
            } catch (err) {
                console.error('Error searching students:', err);
                setStudents([]);
            } finally {
                setLoadingStudents(false);
            }
        };

        const timer = setTimeout(fetchStudents, 250);
        return () => clearTimeout(timer);
    }, [studentSearch, selectedAsmayId, asmayId, filterType, left, deactive, searchByLetters]);

    // Handle student select
    const handleSelectStudent = async (student: ICollegeStudentSearchList) => {
        setSelectedStudent(student);
        setStudentSearch(student.amcst_StudentName);
        setStudents([]);
        setLoadingTerms(true);

        try {
            const payload = {
                amcst_Id: student.amcst_Id,
                asmaY_Id: selectedAsmayId || asmayId
            };
            const res = await getCollegeStudentDetails(payload);
            const details = res?.studentDetails?.[0] || {
                amcst_Id: student.amcst_Id,
                amcst_FirstName: student.amcst_FirstName || student.amcst_StudentName,
                amcst_AdmNo: student.amcst_AdmNo,
                amcst_RegistrationNo: student.amcst_RegistrationNo,
                amco_CourseName: student.amco_CourseName,
                amB_BranchName: student.amB_BranchName,
                amsE_SEMName: student.amsE_SEMName || '1st Semester',
                amcst_Mobile: student.amcst_Mobile || '9845341496',
                amcst_FatherName: student.amcst_FatherName || 'ARIF KHAN',
                amcst_Photoname: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
            };
            setStudentDetails(details);

            if (res?.terms && res.terms.length > 0) {
                setTerms(res.terms);
                const activeTerms = res.terms.map((t: any) => t.fmT_Id.toString());
                setSelectedTerms(activeTerms);
                fetchFeeHeads(student.amcst_Id, activeTerms);
            }
        } catch (err) {
            console.error('Failed to get student details:', err);
        } finally {
            setLoadingTerms(false);
        }
    };

    // Fetch Fee Heads
    const fetchFeeHeads = async (studentId: number, termIds: string[]) => {
        setLoadingFeeHeads(true);
        try {
            const payload = {
                amcst_Id: studentId,
                asmaY_Id: selectedAsmayId || asmayId,
                termIds
            };
            const res = await getCollegeFeeHeadDetails(payload);
            const heads: ICollegeFeeHeadDetails[] = res.feeHeadList || [];
            setFeeHeads(heads);

            const initialSelected: Record<number, boolean> = {};
            const initialAmounts: Record<number, number> = {};
            heads.forEach((h) => {
                initialSelected[h.fmA_Id] = true;
                initialAmounts[h.fmA_Id] = Number(h.nowPaying || h.fma_Amount || 0);
            });
            setSelectedHeads(initialSelected);
            setNowPayingAmounts(initialAmounts);
            setSelectAllHeads(true);
        } catch (err) {
            console.error('Error fetching fee heads:', err);
        } finally {
            setLoadingFeeHeads(false);
        }
    };

    // Calculate total now paying
    const totalNowPaying = feeHeads
        .filter((h) => selectedHeads[h.fmA_Id])
        .reduce((sum, h) => sum + (nowPayingAmounts[h.fmA_Id] || 0), 0);

    // Toggle select all fee heads
    const handleSelectAllHeads = (checked: boolean) => {
        setSelectAllHeads(checked);
        const updated: Record<number, boolean> = {};
        feeHeads.forEach((h) => {
            updated[h.fmA_Id] = checked;
        });
        setSelectedHeads(updated);
    };

    // Toggle individual fee head
    const handleToggleHead = (id: number, checked: boolean) => {
        const updated = { ...selectedHeads, [id]: checked };
        setSelectedHeads(updated);
        setSelectAllHeads(feeHeads.every((h) => updated[h.fmA_Id]));
    };

    // Reset Form
    const handleClear = () => {
        setStudentSearch('');
        setSelectedStudent(null);
        setStudentDetails(null);
        setTerms([]);
        setSelectedTerms([]);
        setFeeHeads([]);
        setSelectedHeads({});
        setNowPayingAmounts({});
        setAmountCheck(false);
        setTermAmount('');
        setChallanSearch('');
        reset();
    };

    // Form Submit
    const handleFormSubmit = async () => {
        if (!selectedAsmayId) {
            toast.error('Please select Academic Year.');
            return;
        }
        if (!selectedStudent) {
            toast.error('Please select a student.');
            return;
        }
        const activeHeads = feeHeads.filter((h) => selectedHeads[h.fmA_Id]);
        if (activeHeads.length === 0) {
            toast.error('Please select at least one Fee Head to pay.');
            return;
        }
        if (totalNowPaying <= 0) {
            toast.error('Total now paying amount must be greater than zero.');
            return;
        }

        try {
            const payload = {
                asmaY_Id: selectedAsmayId,
                amcst_Id: selectedStudent.amcst_Id,
                receiptNo,
                date: format(todaysDate, 'yyyy-MM-dd'),
                totalAmount: totalNowPaying,
                modeOfPayment: paymentModeType === 'Single' ? selectedPayMode : selectedMultiModes.join(','),
                narrationId: selectedNarrationId,
                heads: activeHeads.map((h) => ({
                    fmA_Id: h.fmA_Id,
                    amount: nowPayingAmounts[h.fmA_Id]
                }))
            };

            const res = await saveCollegeFeeTransaction(payload);
            if (res?.success || res?.returnval === 'true') {
                toast.success(res?.message || 'College Fee Transaction saved successfully!');
                await refetchAll();
                onSuccess?.();
            } else {
                toast.error(res?.message || 'Failed to save transaction');
            }
        } catch (err: any) {
            console.error('Error saving transaction:', err);
            toast.error(err.message || 'Error occurred while saving');
        }
    };

    return (
        <div className='space-y-6'>
            {/* Top 3-Panel Grid matching Nagarjuna Degree College legacy UI */}
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
                {/* 1. LEFT PANEL: Filters, Search Type, Date, Challan */}
                <div className='flex flex-col gap-4 rounded-xl border bg-gray-50/60 p-4 shadow-xs lg:col-span-4'>
                    <div className='border-b pb-2'>
                        <h4 className='font-bold text-sm text-gray-800 uppercase tracking-wide'>Search By Options</h4>
                    </div>

                    <RadioGroup
                        value={filterType}
                        onValueChange={(val) => {
                            setFilterType(val);
                            setStudentSearch('');
                            setSelectedStudent(null);
                            setStudents([]);
                        }}
                        className='gap-2.5'>
                        <div className='grid grid-cols-2 gap-2 text-xs'>
                            {SEARCH_MODES.map((mode) => (
                                <div key={mode.value} className='flex items-center space-x-2'>
                                    <RadioGroupItem value={mode.value} id={`search-${mode.value}`} />
                                    <Label htmlFor={`search-${mode.value}`} className='cursor-pointer text-xs font-medium'>
                                        {mode.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </RadioGroup>

                    {/* Search by letters when regular */}
                    {/* {filterType === 'regular' && (
                        <div className='rounded-lg border bg-white p-2.5 shadow-xs'>
                            <Label className='text-xs font-semibold text-gray-600 mb-1.5 block'>
                                Search by (Min Letters):
                            </Label>
                            <RadioGroup
                                value={searchByLetters}
                                onValueChange={setSearchByLetters}
                                className='flex items-center gap-3'>
                                {['1', '2', '3', '4', '5'].map((num) => (
                                    <div key={num} className='flex items-center space-x-1'>
                                        <RadioGroupItem value={num} id={`let-${num}`} />
                                        <Label htmlFor={`let-${num}`} className='cursor-pointer text-xs'>
                                            {num}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    )} */}

                    {/* Left & Deactive checkboxes */}
                    {/* <div className='flex items-center gap-6 pt-1'>
                        <div className='flex items-center space-x-2'>
                            <Checkbox id='left' checked={left} onCheckedChange={(c) => setLeft(Boolean(c))} />
                            <Label htmlFor='left' className='cursor-pointer text-xs font-medium'>
                                Left Student
                            </Label>
                        </div>
                        <div className='flex items-center space-x-2'>
                            <Checkbox id='deactive' checked={deactive} onCheckedChange={(c) => setDeactive(Boolean(c))} />
                            <Label htmlFor='deactive' className='cursor-pointer text-xs font-medium'>
                                Deactive Student
                            </Label>
                        </div>
                    </div> */}

                    {/* Date Picker */}
                    <div className='space-y-1.5 pt-1'>
                        <Label className='text-xs font-semibold text-gray-700'>Transaction Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant='outline'
                                    className='w-full justify-start text-left font-normal bg-white text-xs h-9'>
                                    <CalendarIcon className='mr-2 h-4 w-4 text-primary' />
                                    {todaysDate ? format(todaysDate, 'PPP') : 'Select Date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0' align='start'>
                                <Calendar
                                    mode='single'
                                    selected={todaysDate}
                                    onSelect={(date) => date && setTodaysDate(date)}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Challan No Search when Chal_no */}
                    {filterType === 'Chal_no' && (
                        <div className='space-y-2 pt-2 border-t'>
                            <Label htmlFor='challanNo' className='text-xs font-semibold text-gray-700'>
                                Challan No. <span className='text-red-500'>*</span>
                            </Label>
                            <div className='flex gap-2'>
                                <InputText
                                    id='challanNo'
                                    value={challanSearch}
                                    onChange={(e) => setChallanSearch(e.target.value)}
                                    placeholder='Enter Challan No...'
                                    className='text-xs h-9'
                                />
                                <Button
                                    type='button'
                                    size='sm'
                                    onClick={() => toast.info('Searching challan...')}
                                    className='h-9 px-3'>
                                    <Search className='h-3.5 w-3.5 mr-1' /> Search
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. CENTER PANEL: Academic Year, Student Search, Terms, Receipt No, Amount */}
                <div className='flex flex-col gap-4 rounded-xl border bg-gray-50/60 p-4 shadow-xs lg:col-span-5'>
                    <div className='border-b pb-2'>
                        <h4 className='font-bold text-sm text-gray-800 uppercase tracking-wide'>Student & Fee Selection</h4>
                    </div>

                    {/* Academic Year */}
                    <div className='space-y-1'>
                        <div className='flex items-center justify-between'>
                            <Label className='text-xs font-semibold text-gray-700'>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                        </div>
                        <Controller
                            name='asmaY_Id'
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={selectedAsmayId?.toString() || ''}
                                    onValueChange={(val) => {
                                        const num = Number(val);
                                        field.onChange(num);
                                        setSelectedAsmayId(num);
                                        handleClear();
                                    }}
                                    disabled={loadingYears}>
                                    <SelectTrigger className='w-full bg-white text-xs h-9'>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYearsData?.data?.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()} className='text-xs'>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                    </div>

                    {/* Student Name with Autocomplete */}
                    <div className='relative space-y-1'>
                        <Label className='text-xs font-semibold text-gray-700'>
                            {studentFieldLabel} <span className='text-red-500'>*</span>
                        </Label>
                        <div className='relative'>
                            <InputText
                                type='text'
                                placeholder={
                                    filterType === 'regular' || filterType === 'Chal_no'
                                        ? 'Type student name to search...'
                                        : `Search by ${studentFieldLabel}...`
                                }
                                value={studentSearch}
                                onChange={(e) => {
                                    setStudentSearch(e.target.value);
                                    if (selectedStudent) setSelectedStudent(null);
                                }}
                                disabled={!selectedAsmayId}
                                className='w-full bg-white text-xs h-9 pr-8'
                            />
                            {loadingStudents && (
                                <div className='absolute right-2.5 top-2.5'>
                                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                                </div>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {students.length > 0 && !selectedStudent && (
                            <ul className='absolute left-0 top-full z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border bg-white shadow-xl text-xs'>
                                {students.map((st) => (
                                    <li
                                        key={st.amcst_Id}
                                        onClick={() => handleSelectStudent(st)}
                                        className='cursor-pointer px-3 py-2 border-b last:border-0 hover:bg-blue-50 transition-colors'>
                                        <div className='font-bold text-gray-900'>{st.amcst_StudentName}</div>
                                        <div className='text-gray-500 text-[11px]'>
                                            Adm: <span className='font-mono font-medium'>{st.amcst_AdmNo}</span> | Course:{' '}
                                            <span className='font-medium'>{st.amco_CourseName}</span> ({st.amB_BranchName})
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Group Name / Terms multi-select box */}
                    <div className='space-y-1.5'>
                        <div className='flex items-center justify-between'>
                            <Label className='text-xs font-semibold text-gray-700'>Group Name / Terms</Label>
                            <div className='flex items-center gap-3 text-xs'>
                                {/* <div className='flex items-center gap-1'>
                                    <Checkbox id='sms' checked={sms} onCheckedChange={(c) => setSms(Boolean(c))} />
                                    <Label htmlFor='sms' className='cursor-pointer text-[11px]'>SMS</Label>
                                </div>
                                <div className='flex items-center gap-1'>
                                    <Checkbox id='email' checked={email} onCheckedChange={(c) => setEmail(Boolean(c))} />
                                    <Label htmlFor='email' className='cursor-pointer text-[11px]'>EMAIL</Label>
                                </div> */}
                            </div>
                        </div>

                        <FeesCustomMultiSelectBox
                            options={terms.map((t) => ({
                                label: t.fmG_GroupName || t.fmt_Name,
                                value: t.fmT_Id.toString(),
                                disabled: t.disablepaisterms
                            }))}
                            value={selectedTerms}
                            onChange={(vals) => {
                                setSelectedTerms(vals);
                                if (selectedStudent) {
                                    fetchFeeHeads(selectedStudent.amcst_Id, vals);
                                }
                            }}
                            isLoading={loadingTerms}
                            disabled={!selectedStudent}
                            height='110px'
                        />
                    </div>

                    {/* Receipt No & Amount entry option */}
                    <div className='grid grid-cols-2 gap-3 pt-1'>
                        <div className='space-y-1'>
                            <Label className='text-xs font-semibold text-gray-700'>Receipt No.</Label>
                            <InputText
                                value={receiptNo}
                                onChange={(e) => setReceiptNo(e.target.value)}
                                className='bg-gray-100 text-xs font-mono font-semibold h-9'
                                readOnly
                            />
                        </div>

                        {/* <div className='space-y-1'>
                            <div className='flex items-center gap-1.5'>
                                <Checkbox
                                    id='amountCheck'
                                    checked={amountCheck}
                                    onCheckedChange={(c) => setAmountCheck(Boolean(c))}
                                />
                                <Label htmlFor='amountCheck' className='cursor-pointer text-xs font-semibold text-gray-700'>
                                    Amount Override
                                </Label>
                            </div>
                            <InputText
                                value={termAmount}
                                onChange={(e) => setTermAmount(e.target.value)}
                                placeholder='Enter amount'
                                disabled={!amountCheck}
                                className='bg-white text-xs h-9'
                            />
                        </div> */}
                    </div>
                </div>

                {/* 3. RIGHT PANEL: Student Information Card */}
                <div className='flex flex-col rounded-xl border bg-white p-4 shadow-xs lg:col-span-3'>
                    <div className='border-b pb-2 mb-3'>
                        <h4 className='font-bold text-sm text-gray-800 uppercase tracking-wide'>Student Information</h4>
                    </div>

                    <div className='flex flex-col items-center text-center space-y-3'>
                        {/* Circular Photo */}
                        <div className='relative h-28 w-28 overflow-hidden rounded-full border-2 border-primary/40 shadow-sm'>
                            <img
                                src={
                                    studentDetails?.amcst_Photoname ||
                                    'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
                                }
                                alt='Student'
                                className='h-full w-full object-cover'
                            />
                        </div>

                        {/* Modals Links */}
                        <div className='flex items-center justify-center gap-4 text-xs font-bold text-primary'>
                            <button
                                type='button'
                                onClick={() => setOpenFeeDetails(true)}
                                className='hover:underline flex items-center gap-1'>
                                Fee Details <span>➤</span>
                            </button>
                            <button
                                type='button'
                                onClick={() => setOpenStudentProfile(true)}
                                disabled={!selectedStudent}
                                className='hover:underline flex items-center gap-1 disabled:opacity-40'>
                                Student Profile <span>➤</span>
                            </button>
                        </div>

                        {/* Student Details Fields */}
                        <div className='w-full text-left space-y-1.5 border-t pt-2.5 text-xs text-gray-700'>
                            <div className='flex justify-between py-0.5'>
                                <span className='font-semibold text-gray-500'>Name:</span>
                                <span className='font-bold text-gray-900 uppercase'>
                                    {studentDetails
                                        ? `${studentDetails.amcst_FirstName || ''} ${studentDetails.amcst_LastName || ''}`.trim()
                                        : '-'}
                                </span>
                            </div>
                            <div className='flex justify-between py-0.5'>
                                <span className='font-semibold text-gray-500'>Adm No:</span>
                                <span className='font-mono font-medium'>{studentDetails?.amcst_AdmNo || '-'}</span>
                            </div>
                            <div className='flex justify-between py-0.5'>
                                <span className='font-semibold text-gray-500'>Father:</span>
                                <span className='font-medium'>{studentDetails?.amcst_FatherName || '-'}</span>
                            </div>
                            <div className='flex justify-between py-0.5'>
                                <span className='font-semibold text-gray-500'>Mob No:</span>
                                <span>{studentDetails?.amcst_Mobile || '-'}</span>
                            </div>
                            <div className='flex justify-between py-0.5'>
                                <span className='font-semibold text-gray-500'>Course:</span>
                                <span className='font-semibold text-blue-700'>{studentDetails?.amco_CourseName || '-'}</span>
                            </div>
                            <div className='flex justify-between py-0.5'>
                                <span className='font-semibold text-gray-500'>Branch:</span>
                                <span>{studentDetails?.amB_BranchName || '-'}</span>
                            </div>
                            <div className='flex justify-between py-0.5'>
                                <span className='font-semibold text-gray-500'>Sem:</span>
                                <span>{studentDetails?.amsE_SEMName || '1st Semester'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {openFeeDetails && (
                <FeeDetails
                    onClose={() => setOpenFeeDetails(false)}
                    data={feeHeads}
                    loading={loadingFeeHeads}
                />
            )}
            {openStudentProfile && selectedStudent && (
                <CollegeStudentProfileModal
                    isOpen={openStudentProfile}
                    onClose={() => setOpenStudentProfile(false)}
                    student={studentDetails}
                />
            )}

            {/* FEE HEADS BREAKDOWN TABLE */}
            {selectedTerms.length > 0 && (
                <Card className='p-4 shadow-sm space-y-3 overflow-hidden'>
                    <div className='flex items-center justify-between border-b pb-2'>
                        <h4 className='font-bold text-sm text-gray-800 uppercase tracking-wide'>Fee Heads Breakdown</h4>
                        <span className='text-xs text-muted-foreground'>
                            {feeHeads.filter((h) => selectedHeads[h.fmA_Id]).length} of {feeHeads.length} heads selected
                        </span>
                    </div>

                    {loadingFeeHeads ? (
                        <div className='p-8 text-center text-sm text-muted-foreground'>Loading fee heads...</div>
                    ) : feeHeads.length === 0 ? (
                        <div className='p-6 text-center text-sm text-muted-foreground'>
                            No fee heads configured for the selected terms.
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full border-collapse border border-gray-200 text-xs'>
                                <thead>
                                    <tr className='bg-gray-100 font-semibold text-gray-700'>
                                        <th className='border border-gray-200 p-2 text-center w-12'>Sl.No</th>
                                        <th className='border border-gray-200 p-2 text-center w-12'>
                                            <Checkbox
                                                checked={selectAllHeads}
                                                onCheckedChange={(val) => handleSelectAllHeads(Boolean(val))}
                                            />
                                        </th>
                                        <th className='border border-gray-200 p-2 text-left'>Fee Head</th>
                                        <th className='border border-gray-200 p-2 text-left'>Installment</th>
                                        <th className='border border-gray-200 p-2 text-right'>Charges (₹)</th>
                                        <th className='border border-gray-200 p-2 text-right'>Concession (₹)</th>
                                        <th className='border border-gray-200 p-2 text-right'>Fine (₹)</th>
                                        <th className='border border-gray-200 p-2 text-right'>Due (₹)</th>
                                        <th className='border border-gray-200 p-2 text-right w-36'>Now Paying (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feeHeads.map((head, index) => (
                                        <tr key={head.fmA_Id} className='border-b border-gray-200 hover:bg-gray-50/50'>
                                            <td className='border border-gray-200 p-2 text-center'>{index + 1}</td>
                                            <td className='border border-gray-200 p-2 text-center'>
                                                <Checkbox
                                                    checked={selectedHeads[head.fmA_Id] ?? false}
                                                    onCheckedChange={(c) => handleToggleHead(head.fmA_Id, Boolean(c))}
                                                />
                                            </td>
                                            <td className='border border-gray-200 p-2 font-medium text-gray-900'>
                                                {head.fmh_FeeName}
                                            </td>
                                            <td className='border border-gray-200 p-2 text-gray-600'>{head.fti_Name}</td>
                                            <td className='border border-gray-200 p-2 text-right'>
                                                ₹{Number(head.fma_Amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className='border border-gray-200 p-2 text-right text-amber-700'>
                                                ₹{Number(head.concession || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className='border border-gray-200 p-2 text-right text-rose-600'>
                                                ₹{Number(head.fine || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className='border border-gray-200 p-2 text-right'>
                                                ₹{Number(head.due || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className='border border-gray-200 p-2 text-right'>
                                                <InputText
                                                    type='number'
                                                    value={nowPayingAmounts[head.fmA_Id] ?? 0}
                                                    onChange={(e) =>
                                                        setNowPayingAmounts({
                                                            ...nowPayingAmounts,
                                                            [head.fmA_Id]: Number(e.target.value) || 0
                                                        })
                                                    }
                                                    disabled={!selectedHeads[head.fmA_Id]}
                                                    className='text-right h-8 text-xs font-semibold text-emerald-800'
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Total Summary Row */}
                                    <tr className='bg-emerald-50 font-bold border-t-2 border-emerald-300'>
                                        <td colSpan={4} className='border border-gray-200 p-2 text-right uppercase'>
                                            Total Now Paying Amount:
                                        </td>
                                        <td className='border border-gray-200 p-2 text-right'>
                                            ₹
                                            {feeHeads
                                                .reduce((sum, h) => sum + (Number(h.fma_Amount) || 0), 0)
                                                .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className='border border-gray-200 p-2 text-right text-amber-700'>
                                            ₹
                                            {feeHeads
                                                .reduce((sum, h) => sum + (Number(h.concession) || 0), 0)
                                                .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className='border border-gray-200 p-2 text-right text-rose-600'>
                                            ₹
                                            {feeHeads
                                                .reduce((sum, h) => sum + (Number(h.fine) || 0), 0)
                                                .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className='border border-gray-200 p-2 text-right'>
                                            ₹
                                            {feeHeads
                                                .reduce((sum, h) => sum + (Number(h.due) || 0), 0)
                                                .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className='border border-gray-200 p-2 text-right text-emerald-800 text-sm font-bold'>
                                            ₹{totalNowPaying.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            )}

            {/* PAYMENT MODES & NARRATION SECTION */}
            <Card className='p-5 shadow-sm space-y-5 bg-white'>
                <div className='flex items-center justify-between border-b pb-3'>
                    <h4 className='font-bold text-sm text-gray-800 uppercase tracking-wide'>Mode of Payment & Narration</h4>
                    <div className='text-sm'>
                        <span className='font-semibold text-gray-600'>Total Amount:</span>{' '}
                        <span className='text-base font-bold text-emerald-700'>
                            ₹{totalNowPaying.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {/* Single / Multiple Radio */}
                <div className='flex items-center gap-8 text-xs font-semibold'>
                    <span className='text-gray-700'>Payment Option:</span>
                    <RadioGroup
                        value={paymentModeType}
                        onValueChange={(val: 'Single' | 'Multiple') => setPaymentModeType(val)}
                        className='flex items-center gap-6'>
                        <div className='flex items-center space-x-2'>
                            <RadioGroupItem value='Single' id='mode-single' />
                            <Label htmlFor='mode-single' className='cursor-pointer text-xs'>
                                Single Mode
                            </Label>
                        </div>
                        <div className='flex items-center space-x-2'>
                            <RadioGroupItem value='Multiple' id='mode-multi' />
                            <Label htmlFor='mode-multi' className='cursor-pointer text-xs'>
                                Multiple Mode
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Single Mode Radios */}
                {paymentModeType === 'Single' ? (
                    <div className='flex flex-wrap items-center gap-6 rounded-lg border bg-gray-50/70 p-3'>
                        {masterPaymentModes.map((mode) => (
                            <div key={mode.ivrmmoD_Id} className='flex items-center space-x-2'>
                                <input
                                    type='radio'
                                    id={`single-${mode.ivrmmoD_ModeOfPayment}`}
                                    name='singleModeRadio'
                                    checked={selectedPayMode === mode.ivrmmoD_ModeOfPayment}
                                    onChange={() => setSelectedPayMode(mode.ivrmmoD_ModeOfPayment)}
                                    className='h-4 w-4 text-primary'
                                />
                                <Label htmlFor={`single-${mode.ivrmmoD_ModeOfPayment}`} className='cursor-pointer text-xs font-medium'>
                                    {mode.ivrmmoD_ModeOfPayment}
                                </Label>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Multiple Mode Checkboxes */
                    <div className='flex flex-wrap items-center gap-6 rounded-lg border bg-gray-50/70 p-3'>
                        {masterPaymentModes.map((mode) => {
                            const isChecked = selectedMultiModes.includes(mode.ivrmmoD_ModeOfPayment);
                            return (
                                <div key={mode.ivrmmoD_Id} className='flex items-center space-x-2'>
                                    <Checkbox
                                        id={`multi-${mode.ivrmmoD_ModeOfPayment}`}
                                        checked={isChecked}
                                        onCheckedChange={(c) => {
                                            if (c) {
                                                setSelectedMultiModes([...selectedMultiModes, mode.ivrmmoD_ModeOfPayment]);
                                            } else {
                                                setSelectedMultiModes(
                                                    selectedMultiModes.filter((m) => m !== mode.ivrmmoD_ModeOfPayment)
                                                );
                                            }
                                        }}
                                    />
                                    <Label htmlFor={`multi-${mode.ivrmmoD_ModeOfPayment}`} className='cursor-pointer text-xs font-medium'>
                                        {mode.ivrmmoD_ModeOfPayment}
                                    </Label>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Cheque / Card / Bank Details inputs when non-cash */}
                {(selectedPayMode === 'Bank / Cheque' || selectedPayMode === 'Card') && (
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl border bg-blue-50/40'>
                        <div className='space-y-1'>
                            <Label className='text-xs font-semibold text-gray-700'>Bank Name</Label>
                            <Select
                                value={bankDetails[selectedPayMode]?.bankId || '1'}
                                onValueChange={(val) =>
                                    setBankDetails({
                                        ...bankDetails,
                                        [selectedPayMode]: { ...bankDetails[selectedPayMode], bankId: val }
                                    })
                                }>
                                <SelectTrigger className='h-9 bg-white text-xs'>
                                    <SelectValue placeholder='Select Bank' />
                                </SelectTrigger>
                                <SelectContent>
                                    {(banksData?.data || []).map((b: ICollegeMasterBank) => (
                                        <SelectItem key={b.fmb_Id} value={b.fmb_Id.toString()} className='text-xs'>
                                            {b.fmb_BankName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-1'>
                            <Label className='text-xs font-semibold text-gray-700'>
                                {selectedPayMode === 'Card' ? 'Card / Transaction Ref No' : 'Cheque / DD No'}
                            </Label>
                            <InputText
                                placeholder='Enter ref / cheque number'
                                value={bankDetails[selectedPayMode]?.chequeNo || ''}
                                onChange={(e) =>
                                    setBankDetails({
                                        ...bankDetails,
                                        [selectedPayMode]: { ...bankDetails[selectedPayMode], chequeNo: e.target.value }
                                    })
                                }
                                className='h-9 bg-white text-xs'
                            />
                        </div>
                        <div className='space-y-1'>
                            <Label className='text-xs font-semibold text-gray-700'>Cheque / Transaction Date</Label>
                            <InputText
                                type='date'
                                value={bankDetails[selectedPayMode]?.date || ''}
                                onChange={(e) =>
                                    setBankDetails({
                                        ...bankDetails,
                                        [selectedPayMode]: { ...bankDetails[selectedPayMode], date: e.target.value }
                                    })
                                }
                                className='h-9 bg-white text-xs'
                            />
                        </div>
                        <div className='space-y-1'>
                            <Label className='text-xs font-semibold text-gray-700'>Amount</Label>
                            <InputText
                                value={totalNowPaying.toString()}
                                readOnly
                                className='h-9 bg-gray-100 text-xs font-bold text-emerald-800'
                            />
                        </div>
                    </div>
                )}

                {/* Narration */}
                <div className='space-y-1.5'>
                    <Label className='text-xs font-semibold text-gray-700'>Narration</Label>
                    <Select
                        value={selectedNarrationId?.toString() || '1'}
                        onValueChange={(val) => setSelectedNarrationId(Number(val))}>
                        <SelectTrigger className='w-full bg-white text-xs h-9'>
                            <SelectValue placeholder='Select Narration' />
                        </SelectTrigger>
                        <SelectContent>
                            {narrations.map((n) => (
                                <SelectItem key={n.fmnaR_Id} value={n.fmnaR_Id.toString()} className='text-xs'>
                                    {n.fmnaR_Narration}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Action Buttons: Save & Clear */}
                <div className='flex items-center justify-end gap-3 pt-3 border-t'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleClear}
                        className='px-5 flex items-center gap-1.5'>
                        <RotateCcw className='h-4 w-4' /> Clear
                    </Button>
                    <Button
                        type='button'
                        onClick={handleFormSubmit}
                        disabled={isSubmitting}
                        className='px-7 flex items-center gap-1.5 bg-primary text-white hover:bg-primary/90'>
                        <Save className='h-4 w-4' /> {isSubmitting ? 'Saving...' : 'Save Transaction'}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
