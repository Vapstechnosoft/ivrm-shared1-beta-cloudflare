'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
    getSections,
    getStudentDetails,
    getStudentsByClassSection,
    saveAndUpdatePDATransaction,
    savePDATransaction,
    searchStudents
} from '@/server/pda/transaction/pdatransactionsrs';
import type { IPDATransactionHead, IPDATransactionStudent } from '@/types/pda/transaction/pdatransactionsrs';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check, ChevronsUpDown, Plus, Save, Search, Trash2, XCircle } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PDATransactionFormProps {
    academicYears: { asmaY_Id: number; asmaY_Year: string }[];
    classes: { asmcL_Id: number; asmcL_ClassName: string }[];
    heads: IPDATransactionHead[];
    initialStudents: IPDATransactionStudent[];
    onSuccess: () => void;
    editData?: any;
}

export default function PDATransactionForm({
    academicYears,
    classes,
    heads,
    initialStudents,
    onSuccess,
    editData
}: PDATransactionFormProps) {
    const [filterData, setFilterData] = useState<'indivstd' | 'multiplestd' | 'multipleallstd'>('indivstd');
    const [studentFilter, setStudentFilter] = useState<
        'NameAdmno' | 'AdmNo' | 'regno' | 'Admnoname' | 'NameRegNo' | 'RegNoName' | 'left' | 'inactive'
    >('NameAdmno');

    const [selectedAsmayId, setSelectedAsmayId] = useState<string>('');
    const [selectedAmstId, setSelectedAmstId] = useState<string>('');
    const [transactionDate, setTransactionDate] = useState<Date>(new Date());
    const [trnType, setTrnType] = useState<'Debit' | 'Credit' | 'Cash'>('Debit');
    const [voucherNo, setVoucherNo] = useState('');

    const [students, setStudents] = useState<IPDATransactionStudent[]>(initialStudents);
    const [searchStudentList, setSearchStudentList] = useState('');
    const [studentSearchOpen, setStudentSearchOpen] = useState(false);
    const [selectedStudentInfo, setSelectedStudentInfo] = useState<any>(null);

    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [selectedSections, setSelectedSections] = useState<number[]>([]);
    const [bulkStudents, setBulkStudents] = useState<any[]>([]);
    const [allSelected, setAllSelected] = useState(false);

    const [singleStudentRows, setSingleStudentRows] = useState<any[]>([{ pdamH_Id: '', PDAEH_Amount: '', PDAE_Remarks: '' }]);

    const [bulkCommon, setBulkCommon] = useState({
        headId: '',
        amount: '',
        remarks: '',
        voucher: ''
    });

    const [bulkApplyFlags, setBulkApplyFlags] = useState({
        head: false,
        amount: false,
        remarks: false,
        voucher: false
    });

    const isEdit = !!editData;

    useEffect(() => {
        if (!isEdit) {
            setSelectedAmstId('');
            setSelectedStudentInfo(null);
            setStudents([]);
        }
    }, [studentFilter, filterData]);

    useEffect(() => {
        if (editData) {
            setFilterData('indivstd');
            setSelectedAsmayId(editData.asmay_Id?.toString() || '');
            setVoucherNo(editData.voucher_No || '');
            setTransactionDate(new Date(editData.pdaE_Date));
            setTrnType(editData.pdaR_ModeOfPayment || 'Debit');
            setSelectedStudentInfo(editData.studentInfo);
            setSelectedAmstId(editData.amst_Id?.toString() || '');
            setSingleStudentRows(editData.rows || []);
        }
    }, [editData]);

    const handleStudentSearch = async (query: string) => {
        let minLength = 2;
        if (studentFilter === 'regno') minLength = 6;
        else if (['AdmNo', 'Admnoname', 'RegNoName'].includes(studentFilter)) minLength = 4;
        else if (['NameAdmno', 'NameRegNo', 'left'].includes(studentFilter)) minLength = 3;

        if (query.length < minLength) return;

        try {
            const response = await searchStudents({
                filterinitialdata: studentFilter,
                searchfilter: query,
                ASMAY_ID: Number(selectedAsmayId)
            });
            if (response.success && response.data?.fillstudent?.$values) {
                setStudents(response.data.fillstudent.$values);
            }
        } catch (error) {
            console.error('Search failed', error);
        }
    };

    const handleStudentSelect = async (amstId: string) => {
        setSelectedAmstId(amstId);
        setStudentSearchOpen(false);
        try {
            const response = await getStudentDetails({
                Amst_Id: Number(amstId),
                ASMAY_ID: Number(selectedAsmayId)
            });
            if (response.success && response.data?.fillstudent?.$values?.[0]) {
                setSelectedStudentInfo(response.data.fillstudent.$values[0]);
            }
        } catch (error) {
            console.error('Fetch student details failed', error);
        }
    };

    const handleClassToggle = async (classId: number) => {
        const newSelected = selectedClasses.includes(classId)
            ? selectedClasses.filter((id) => id !== classId)
            : [...selectedClasses, classId];

        setSelectedClasses(newSelected);

        if (newSelected.length > 0) {
            try {
                const response = await getSections({
                    ASMAY_Id: Number(selectedAsmayId),
                    classlsttwo: newSelected.map((id) => ({ ASMCL_Id: id }))
                });
                if (response.success && response.data?.sectionlist?.$values) {
                    setSections(response.data.sectionlist.$values);
                }
            } catch (error) {
                console.error('Fetch sections failed', error);
            }
        } else {
            setSections([]);
            setSelectedSections([]);
        }
    };

    const handleSectionToggle = async (sectionId: number) => {
        const newSelected = selectedSections.includes(sectionId)
            ? selectedSections.filter((id) => id !== sectionId)
            : [...selectedSections, sectionId];

        setSelectedSections(newSelected);

        if (newSelected.length > 0) {
            try {
                const response = await getStudentsByClassSection({
                    ASMAY_Id: Number(selectedAsmayId),
                    classlsttwo: selectedClasses.map((id) => ({ ASMCL_Id: id })),
                    sectionlistarray: newSelected.map((id) => ({ AMSC_Id: id }))
                });
                if (response.success && response.data?.admsudentslist?.$values) {
                    const mapped = response.data.admsudentslist.$values.map((s: any) => ({
                        ...s,
                        isSelected: false,
                        pdamH_Id: '',
                        PDAEH_Amount: '',
                        PDAE_Remarks: '',
                        voucher_No: ''
                    }));
                    setBulkStudents(mapped);
                }
            } catch (error) {
                console.error('Fetch students failed', error);
            }
        } else {
            setBulkStudents([]);
        }
    };

    const handleAddRow = () => {
        setSingleStudentRows([...singleStudentRows, { pdamH_Id: '', PDAEH_Amount: '', PDAE_Remarks: '' }]);
    };

    const handleRemoveRow = (index: number) => {
        const newRows = [...singleStudentRows];
        newRows.splice(index, 1);
        setSingleStudentRows(newRows);
    };

    const handleBulkApply = () => {
        setBulkStudents((prev) =>
            prev.map((s) => {
                if (!s.isSelected) return s;
                return {
                    ...s,
                    pdamH_Id: bulkApplyFlags.head ? bulkCommon.headId : s.pdamH_Id,
                    PDAEH_Amount: bulkApplyFlags.amount ? bulkCommon.amount : s.PDAEH_Amount,
                    PDAE_Remarks: bulkApplyFlags.remarks ? bulkCommon.remarks : s.PDAE_Remarks,
                    voucher_No: bulkApplyFlags.voucher ? bulkCommon.voucher : s.voucher_No
                };
            })
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedAsmayId) {
            toast.error('Please select Academic Year');
            return;
        }

        try {
            let response;
            if (isEdit) {
                const data = {
                    ASMAY_Id: Number(selectedAsmayId),
                    PDAE_ID: editData.pdae_id,
                    savetmpdata: singleStudentRows.map((r) => ({
                        PDAE_ID: editData.pdae_id,
                        pdaeH_Id: r.pdaeH_Id,
                        PDAMH_Id: Number(r.pdamH_Id),
                        PDAEH_Amount: Number(r.PDAEH_Amount),
                        PDAE_Remarks: r.PDAE_Remarks
                    })),
                    Amst_Id: Number(selectedAmstId),
                    amount: singleStudentRows.reduce((sum, r) => sum + Number(r.PDAEH_Amount || 0), 0),
                    PDAE_Date: format(transactionDate, 'yyyy-MM-dd'),
                    PDAR_ModeOfPayment: trnType,
                    voucherno: voucherNo
                };
                response = await saveAndUpdatePDATransaction(data);
            } else {
                const data: any = {
                    ASMAY_Id: Number(selectedAsmayId),
                    PDAE_Date: format(transactionDate, 'yyyy-MM-dd'),
                    type: filterData,
                    PDAR_ModeOfPayment: trnType,
                    voucherno: voucherNo
                };

                if (filterData === 'indivstd') {
                    if (!selectedAmstId) return toast.error('Select Student');
                    data.Amst_Id = Number(selectedAmstId);
                    data.savetmpdata = singleStudentRows.map((r) => ({
                        pdamH_Id: Number(r.pdamH_Id),
                        PDAEH_Amount: Number(r.PDAEH_Amount),
                        PDAE_Remarks: r.PDAE_Remarks
                    }));
                    data.amount = singleStudentRows.reduce((sum, r) => sum + Number(r.PDAEH_Amount || 0), 0);
                } else if (filterData === 'multiplestd') {
                    const selected = bulkStudents.filter((s) => s.isSelected);
                    if (selected.length === 0) return toast.error('Select at least one student');
                    data.savetmpdata = selected.map((s) => ({
                        ...s,
                        pdamH_Id: Number(s.pdamH_Id),
                        PDAEH_Amount: Number(s.PDAEH_Amount)
                    }));
                    data.amount = selected.reduce((sum, s) => sum + Number(s.PDAEH_Amount || 0), 0);
                } else if (filterData === 'multipleallstd') {
                    const selected = students.filter((s) => s.selected);
                    if (selected.length === 0) return toast.error('Select at least one student');

                    data.studentlistarray = selected.map((s) => ({ Amst_Id: s.amst_Id }));
                    data.savetmpdata = singleStudentRows.map((r) => ({
                        pdamH_Id: Number(r.pdamH_Id),
                        PDAEH_Amount: Number(r.PDAEH_Amount),
                        PDAE_Remarks: r.PDAE_Remarks
                    }));
                    data.amount = singleStudentRows.reduce((sum, r) => sum + Number(r.PDAEH_Amount || 0), 0);
                }

                response = await savePDATransaction(data);
            }

            if (response.success) {
                toast.success('Transaction saved successfully');
                onSuccess();
            } else {
                toast.error(response.message || 'Failed to save');
            }
        } catch (error) {
            console.error('Save failed', error);
            toast.error('An error occurred');
        }
    };

    return (
        <form onSubmit={handleSubmit} className='fade-in animate-in space-y-8 duration-500'>
            {/* Mode Selection */}
            <div className='flex justify-center rounded-2xl border border-gray-100 bg-gray-50/50 p-4'>
                <RadioGroup
                    value={filterData}
                    onValueChange={(val) => setFilterData(val as any)}
                    className='flex flex-wrap gap-8'
                    disabled={isEdit}>
                    <div className='group flex items-center space-x-2'>
                        <RadioGroupItem value='indivstd' id='indivstd' className='border-primary text-primary' />
                        <Label htmlFor='indivstd' className='cursor-pointer font-semibold transition-colors group-hover:text-primary'>
                            Single Student
                        </Label>
                    </div>
                    <div className='group flex items-center space-x-2'>
                        <RadioGroupItem value='multiplestd' id='multiplestd' className='border-primary text-primary' />
                        <Label htmlFor='multiplestd' className='cursor-pointer font-semibold transition-colors group-hover:text-primary'>
                            Multiple Students
                        </Label>
                    </div>
                    <div className='group flex items-center space-x-2'>
                        <RadioGroupItem value='multipleallstd' id='multipleallstd' className='border-primary text-primary' />
                        <Label htmlFor='multipleallstd' className='cursor-pointer font-semibold transition-colors group-hover:text-primary'>
                            Multiple All Students
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            <div className='grid grid-cols-1 gap-8 md:grid-cols-12'>
                {/* Left Column - Filters */}
                <div className='space-y-6 md:col-span-4'>
                    <Card className='border-none bg-gray-50/30'>
                        <CardContent className='space-y-6 p-6'>
                            {/* Left column now only has Date and Mode */}

                            {/* Date Picker */}
                            <div className='space-y-2'>
                                <Label className='font-bold text-gray-700 text-sm'>Transaction Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant='outline' className='h-11 w-full justify-start rounded-xl text-left font-normal'>
                                            <CalendarIcon className='mr-2 h-4 w-4 text-primary' />
                                            {transactionDate ? format(transactionDate, 'PPP') : <span>Pick date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto rounded-xl p-0'>
                                        <Calendar mode='single' selected={transactionDate} onSelect={(d) => d && setTransactionDate(d)} />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Transaction Type */}
                            <div className='space-y-2'>
                                <Label className='font-bold text-gray-700 text-sm'>Transaction Mode</Label>
                                <RadioGroup value={trnType} onValueChange={(v) => setTrnType(v as any)} className='flex flex-col gap-2'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='Debit' id='trn-debit' />
                                        <Label htmlFor='trn-debit' className='font-medium text-xs'>
                                            Deduct from PDA (Debit)
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='Credit' id='trn-credit' />
                                        <Label htmlFor='trn-credit' className='font-medium text-xs'>
                                            Credit
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='Cash' id='trn-cash' />
                                        <Label htmlFor='trn-cash' className='font-medium text-xs'>
                                            Cash
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Student Search Filters (Moved from Right Column) */}
                            {filterData === 'indivstd' && (
                                <div className='space-y-4 border-gray-200 border-t pt-4'>
                                    <Label className='font-bold text-gray-500 text-xs uppercase tracking-wider'>Search Criteria</Label>

                                    <div className='grid grid-cols-1 gap-4'>
                                        <div className='flex flex-col gap-3'>
                                            <RadioGroup
                                                value={studentFilter}
                                                onValueChange={(v) => setStudentFilter(v as any)}
                                                className='grid grid-cols-2 gap-2'>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='regno' id='sf-regno' />
                                                    <Label htmlFor='sf-regno' className='cursor-pointer font-medium text-xs'>
                                                        Reg No.
                                                    </Label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='AdmNo' id='sf-admno' />
                                                    <Label htmlFor='sf-admno' className='cursor-pointer font-medium text-xs'>
                                                        Adm No.
                                                    </Label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='NameAdmno' id='sf-nameadm' />
                                                    <Label htmlFor='sf-nameadm' className='cursor-pointer font-medium text-xs'>
                                                        Name:Adm.No.
                                                    </Label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='Admnoname' id='sf-admname' />
                                                    <Label htmlFor='sf-admname' className='cursor-pointer font-medium text-xs'>
                                                        Adm.No.:Name
                                                    </Label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='NameRegNo' id='sf-namereg' />
                                                    <Label htmlFor='sf-namereg' className='cursor-pointer font-medium text-xs'>
                                                        Name:Reg.No.
                                                    </Label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='RegNoName' id='sf-regname' />
                                                    <Label htmlFor='sf-regname' className='cursor-pointer font-medium text-xs'>
                                                        Reg.No.:Name
                                                    </Label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='left' id='sf-left' />
                                                    <Label htmlFor='sf-left' className='cursor-pointer font-medium text-xs'>
                                                        Left
                                                    </Label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='inactive' id='sf-inactive' />
                                                    <Label htmlFor='sf-inactive' className='cursor-pointer font-medium text-xs'>
                                                        Deactivate
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Entry Form */}
                <div className='space-y-6 md:col-span-8'>
                    <Card className='overflow-hidden border-none shadow-sm'>
                        <CardContent className='space-y-8 p-8'>
                            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                <div className='space-y-2'>
                                    <Label className='font-bold text-sm'>
                                        Academic Year <span className='text-red-500'>*</span>
                                    </Label>
                                    <Select value={selectedAsmayId} onValueChange={setSelectedAsmayId} disabled={isEdit}>
                                        <SelectTrigger className='h-11 rounded-xl'>
                                            <SelectValue placeholder='Select Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicYears.map((y) => (
                                                <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                    {y.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {filterData === 'indivstd' && (
                                    <div className='space-y-2'>
                                        <Label className='font-bold text-sm'>
                                            {studentFilter === 'regno'
                                                ? 'Reg No.'
                                                : studentFilter === 'AdmNo'
                                                  ? 'Adm No.'
                                                  : studentFilter === 'NameAdmno'
                                                    ? 'Name:Adm.No.'
                                                    : studentFilter === 'Admnoname'
                                                      ? 'Adm.No.:Name'
                                                      : studentFilter === 'NameRegNo'
                                                        ? 'Name:Reg.No.'
                                                        : studentFilter === 'RegNoName'
                                                          ? 'Reg.No.:Name'
                                                          : studentFilter === 'left'
                                                            ? 'Left Student'
                                                            : studentFilter === 'inactive'
                                                              ? 'Deactivated Student'
                                                              : 'Student Name'}
                                            <span className='text-red-500'> *</span>
                                        </Label>
                                        <Popover open={studentSearchOpen} onOpenChange={setStudentSearchOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant='outline'
                                                    role='combobox'
                                                    aria-expanded={studentSearchOpen}
                                                    className='h-11 w-full justify-between rounded-xl'
                                                    disabled={isEdit || !selectedAsmayId}>
                                                    {selectedStudentInfo
                                                        ? `${selectedStudentInfo.amsT_FirstName} (${selectedStudentInfo.amsT_AdmNo})`
                                                        : 'Search Student...'}
                                                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-[400px] rounded-xl p-0' align='start'>
                                                <Command>
                                                    <CommandInput
                                                        placeholder='Type at least 2 chars...'
                                                        onValueChange={handleStudentSearch}
                                                    />
                                                    <CommandEmpty>No student found.</CommandEmpty>
                                                    <CommandGroup className='max-h-[300px] overflow-auto'>
                                                        {students.map((student) => (
                                                            <CommandItem
                                                                key={student.amst_Id}
                                                                value={student.amst_Id.toString()}
                                                                onSelect={() => handleStudentSelect(student.amst_Id.toString())}>
                                                                <Check
                                                                    className={cn(
                                                                        'mr-2 h-4 w-4',
                                                                        selectedAmstId === student.amst_Id.toString()
                                                                            ? 'opacity-100'
                                                                            : 'opacity-0'
                                                                    )}
                                                                />
                                                                {student.amsT_FirstName} :: {student.amsT_AdmNo}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            </div>

                            {/* Bulk Mode Selectors */}
                            {filterData === 'multiplestd' && (
                                <div className='slide-in-from-top-2 grid animate-in grid-cols-1 gap-6 border-t pt-6 md:grid-cols-2'>
                                    <div className='space-y-3'>
                                        <Label className='font-bold text-sm'>Select Classes</Label>
                                        <div className='h-32 space-y-2 overflow-auto rounded-xl border bg-gray-50/30 p-3'>
                                            {classes.map((c) => (
                                                <div key={c.asmcL_Id} className='flex items-center space-x-2'>
                                                    <Checkbox
                                                        id={`cls-${c.asmcL_Id}`}
                                                        checked={selectedClasses.includes(c.asmcL_Id)}
                                                        onCheckedChange={() => handleClassToggle(c.asmcL_Id)}
                                                    />
                                                    <Label htmlFor={`cls-${c.asmcL_Id}`} className='cursor-pointer font-medium text-xs'>
                                                        {c.asmcL_ClassName}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className='space-y-3'>
                                        <Label className='font-bold text-sm'>Select Sections</Label>
                                        <div className='h-32 space-y-2 overflow-auto rounded-xl border bg-gray-50/30 p-3'>
                                            {sections.length > 0 ? (
                                                sections.map((s) => (
                                                    <div key={s.AMSC_Id} className='flex items-center space-x-2'>
                                                        <Checkbox
                                                            id={`sec-${s.AMSC_Id}`}
                                                            checked={selectedSections.includes(s.AMSC_Id)}
                                                            onCheckedChange={() => handleSectionToggle(s.AMSC_Id)}
                                                        />
                                                        <Label htmlFor={`sec-${s.AMSC_Id}`} className='cursor-pointer font-medium text-xs'>
                                                            {s.asmc_sectionname}
                                                        </Label>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className='text-gray-400 text-xs italic'>Select class first</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Multiple All Students Selector */}
                            {filterData === 'multipleallstd' && (
                                <div className='slide-in-from-top-2 animate-in space-y-3 border-t pt-6'>
                                    <Label className='font-bold text-sm'>Select Students</Label>
                                    <div className='relative mb-2'>
                                        <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400' />
                                        <Input
                                            placeholder='Search in student list...'
                                            value={searchStudentList}
                                            onChange={(e) => setSearchStudentList(e.target.value)}
                                            className='h-10 rounded-xl border-gray-200 bg-gray-50/50 pl-9'
                                        />
                                    </div>
                                    <div className='h-48 space-y-2 overflow-auto rounded-xl border bg-gray-50/30 p-4'>
                                        <div className='mb-2 flex items-center space-x-2 border-b pb-2'>
                                            <Checkbox
                                                id='select-all-students'
                                                checked={students.length > 0 && students.every((s) => s.selected)}
                                                onCheckedChange={(v) => setStudents((prev) => prev.map((s) => ({ ...s, selected: !!v })))}
                                            />
                                            <Label htmlFor='select-all-students' className='cursor-pointer font-bold text-sm'>
                                                Select All Students
                                            </Label>
                                        </div>
                                        {students
                                            .filter((s) =>
                                                `${s.amsT_FirstName} ${s.amsT_LastName} ${s.amsT_AdmNo}`
                                                    .toLowerCase()
                                                    .includes(searchStudentList.toLowerCase())
                                            )
                                            .map((s, idx) => (
                                                <div key={s.amst_Id} className='flex items-center space-x-2'>
                                                    <Checkbox
                                                        id={`std-all-${s.amst_Id}`}
                                                        checked={!!s.selected}
                                                        onCheckedChange={(v) => {
                                                            setStudents((prev) =>
                                                                prev.map((item) =>
                                                                    item.amst_Id === s.amst_Id ? { ...item, selected: !!v } : item
                                                                )
                                                            );
                                                        }}
                                                    />
                                                    <Label htmlFor={`std-all-${s.amst_Id}`} className='cursor-pointer font-medium text-xs'>
                                                        {s.amsT_AdmNo} :: {s.amsT_FirstName} {s.amsT_LastName}
                                                    </Label>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className='overflow-hidden border-none shadow-sm'>
                        <CardContent className='space-y-8 p-8'>
                            {/* Single Student Mode Rows OR Multiple All Student Mode Rows */}
                            {(filterData === 'indivstd' || filterData === 'multipleallstd') && (
                                <div className='slide-in-from-top-4 animate-in space-y-4'>
                                    <div className='grid grid-cols-1 items-end gap-6 pb-4 md:grid-cols-2'>
                                        <div className='max-w-xs space-y-2'>
                                            <Label className='font-bold text-sm'>Voucher No.</Label>
                                            <Input
                                                value={voucherNo}
                                                onChange={(e) => setVoucherNo(e.target.value)}
                                                placeholder='Enter Voucher No'
                                                className='h-11 rounded-xl'
                                                disabled={isEdit}
                                            />
                                        </div>
                                        <div className='flex items-center justify-between'>
                                            <h4 className='font-bold text-gray-80 text-lg'>Expenditure Details</h4>
                                            <Button
                                                type='button'
                                                size='sm'
                                                onClick={handleAddRow}
                                                className='group inline-flex h-8 w-fit cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap text-nowrap rounded-lg bg-primary px-3 py-1 font-medium text-secondary-foreground text-xs shadow transition-all duration-300 ease-linear hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none'>
                                                <Plus className='mr-1 h-3 w-3' />
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                    <div className='overflow-auto rounded-2xl border'>
                                        <table className='w-full text-sm'>
                                            <thead className='border-b bg-gray-50'>
                                                <tr>
                                                    <th className='w-12 px-4 py-3 text-left font-bold'>#</th>
                                                    <th className='px-4 py-3 text-left font-bold'>Expenditure Head</th>
                                                    <th className='w-32 px-4 py-3 text-left font-bold'>Amount</th>
                                                    <th className='px-4 py-3 text-left font-bold'>Remarks</th>
                                                    <th className='w-16 px-4 py-3 text-center font-bold'>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className='divide-y'>
                                                {singleStudentRows.map((row, idx) => (
                                                    <tr key={idx} className='transition-colors hover:bg-gray-50/50'>
                                                        <td className='px-4 py-3 font-medium text-gray-500'>{idx + 1}</td>
                                                        <td className='px-4 py-3'>
                                                            <Select
                                                                value={row.pdamH_Id.toString()}
                                                                onValueChange={(v) => {
                                                                    const newRows = [...singleStudentRows];
                                                                    newRows[idx].pdamH_Id = v;
                                                                    setSingleStudentRows(newRows);
                                                                }}>
                                                                <SelectTrigger className='h-9 rounded-lg'>
                                                                    <SelectValue placeholder='Select Head' />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {heads.map((h) => (
                                                                        <SelectItem key={h.pdamH_Id} value={h.pdamH_Id.toString()}>
                                                                            {h.pdamH_HeadName}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </td>
                                                        <td className='px-4 py-3'>
                                                            <Input
                                                                type='number'
                                                                value={row.PDAEH_Amount}
                                                                onChange={(e) => {
                                                                    const newRows = [...singleStudentRows];
                                                                    newRows[idx].PDAEH_Amount = e.target.value;
                                                                    setSingleStudentRows(newRows);
                                                                }}
                                                                className='h-9 rounded-lg'
                                                            />
                                                        </td>
                                                        <td className='px-4 py-3'>
                                                            <Input
                                                                value={row.PDAE_Remarks}
                                                                onChange={(e) => {
                                                                    const newRows = [...singleStudentRows];
                                                                    newRows[idx].PDAE_Remarks = e.target.value;
                                                                    setSingleStudentRows(newRows);
                                                                }}
                                                                className='h-9 rounded-lg'
                                                            />
                                                        </td>
                                                        <td className='px-4 py-3 text-center'>
                                                            {singleStudentRows.length > 1 && (
                                                                <Button
                                                                    type='button'
                                                                    variant='ghost'
                                                                    size='icon'
                                                                    onClick={() => handleRemoveRow(idx)}
                                                                    className='rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600'>
                                                                    <Trash2 className='h-4 w-4' />
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Bulk Mode Grid */}
                            {filterData === 'multiplestd' && bulkStudents.length > 0 && (
                                <div className='fade-in animate-in space-y-6 duration-700'>
                                    <div className='space-y-4 rounded-2xl border border-blue-100/50 bg-blue-50/50 p-6'>
                                        <h4 className='flex items-center gap-2 font-bold text-blue-800 text-sm'>
                                            Bulk Application Tool
                                            <span className='font-normal text-blue-600 text-xs'>(Apply to selected students)</span>
                                        </h4>
                                        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                                            <div className='space-y-2'>
                                                <div className='flex items-center gap-2'>
                                                    <Checkbox
                                                        checked={bulkApplyFlags.head}
                                                        onCheckedChange={(v) => setBulkApplyFlags((p) => ({ ...p, head: !!v }))}
                                                    />
                                                    <Label className='text-xs'>Head</Label>
                                                </div>
                                                <Select
                                                    value={bulkCommon.headId}
                                                    onValueChange={(v) => setBulkCommon((p) => ({ ...p, headId: v }))}>
                                                    <SelectTrigger className='h-9 rounded-lg bg-white'>
                                                        <SelectValue placeholder='Head' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {heads.map((h) => (
                                                            <SelectItem key={h.pdamH_Id} value={h.pdamH_Id.toString()}>
                                                                {h.pdamH_HeadName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className='space-y-2'>
                                                <div className='flex items-center gap-2'>
                                                    <Checkbox
                                                        checked={bulkApplyFlags.amount}
                                                        onCheckedChange={(v) => setBulkApplyFlags((p) => ({ ...p, amount: !!v }))}
                                                    />
                                                    <Label className='text-xs'>Amount</Label>
                                                </div>
                                                <Input
                                                    type='number'
                                                    placeholder='Amount'
                                                    value={bulkCommon.amount}
                                                    onChange={(e) => setBulkCommon((p) => ({ ...p, amount: e.target.value }))}
                                                    className='h-9 rounded-lg bg-white'
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <div className='flex items-center gap-2'>
                                                    <Checkbox
                                                        checked={bulkApplyFlags.remarks}
                                                        onCheckedChange={(v) => setBulkApplyFlags((p) => ({ ...p, remarks: !!v }))}
                                                    />
                                                    <Label className='text-xs'>Remarks</Label>
                                                </div>
                                                <Input
                                                    placeholder='Remarks'
                                                    value={bulkCommon.remarks}
                                                    onChange={(e) => setBulkCommon((p) => ({ ...p, remarks: e.target.value }))}
                                                    className='h-9 rounded-lg bg-white'
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <div className='flex items-center gap-2'>
                                                    <Checkbox
                                                        checked={bulkApplyFlags.voucher}
                                                        onCheckedChange={(v) => setBulkApplyFlags((p) => ({ ...p, voucher: !!v }))}
                                                    />
                                                    <Label className='text-xs'>Voucher</Label>
                                                </div>
                                                <Input
                                                    placeholder='Voucher'
                                                    value={bulkCommon.voucher}
                                                    onChange={(e) => setBulkCommon((p) => ({ ...p, voucher: e.target.value }))}
                                                    className='h-9 rounded-lg bg-white'
                                                />
                                            </div>
                                        </div>
                                        <div className='flex justify-end'>
                                            <Button
                                                type='button'
                                                onClick={handleBulkApply}
                                                size='sm'
                                                className='rounded-lg bg-blue-600 px-6 text-white hover:bg-blue-700'>
                                                Apply
                                            </Button>
                                        </div>
                                    </div>

                                    <div className='overflow-auto rounded-2xl border'>
                                        <table className='w-full text-sm'>
                                            <thead className='border-b bg-gray-50'>
                                                <tr>
                                                    <th className='px-4 py-3 text-center'>
                                                        <Checkbox
                                                            checked={allSelected}
                                                            onCheckedChange={(v) => {
                                                                setAllSelected(!!v);
                                                                setBulkStudents((prev) => prev.map((s) => ({ ...s, isSelected: !!v })));
                                                            }}
                                                        />
                                                    </th>
                                                    <th className='px-4 py-3 text-left font-bold'>Student Name</th>
                                                    <th className='px-4 py-3 text-left font-bold'>Class/Section</th>
                                                    <th className='px-4 py-3 text-left font-bold'>Roll No</th>
                                                    <th className='px-4 py-3 text-left font-bold'>Head</th>
                                                    <th className='px-4 py-3 text-left font-bold'>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className='divide-y'>
                                                {bulkStudents.map((s, idx) => (
                                                    <tr
                                                        key={s.amst_Id}
                                                        className={cn(
                                                            'transition-colors hover:bg-gray-50',
                                                            s.isSelected && 'bg-blue-50/30'
                                                        )}>
                                                        <td className='px-4 py-3 text-center'>
                                                            <Checkbox
                                                                checked={s.isSelected}
                                                                onCheckedChange={(v) => {
                                                                    const newArr = [...bulkStudents];
                                                                    newArr[idx].isSelected = !!v;
                                                                    setBulkStudents(newArr);
                                                                    setAllSelected(newArr.every((x) => x.isSelected));
                                                                }}
                                                            />
                                                        </td>
                                                        <td className='px-4 py-3 font-medium'>
                                                            {s.amsT_FirstName} {s.amsT_LastName}
                                                        </td>
                                                        <td className='px-4 py-3 text-gray-500 text-xs'>
                                                            {s.asmcL_Classname} / {s.asmc_sectionname}
                                                        </td>
                                                        <td className='px-4 py-3'>{s.amaY_RollNo}</td>
                                                        <td className='px-4 py-3'>
                                                            <Select
                                                                value={s.pdamH_Id.toString()}
                                                                onValueChange={(v) => {
                                                                    const newArr = [...bulkStudents];
                                                                    newArr[idx].pdamH_Id = v;
                                                                    setBulkStudents(newArr);
                                                                }}>
                                                                <SelectTrigger className='h-8 w-32 rounded-md text-xs'>
                                                                    <SelectValue placeholder='Head' />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {heads.map((h) => (
                                                                        <SelectItem key={h.pdamH_Id} value={h.pdamH_Id.toString()}>
                                                                            {h.pdamH_HeadName}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </td>
                                                        <td className='px-4 py-3'>
                                                            <Input
                                                                type='number'
                                                                value={s.PDAEH_Amount}
                                                                onChange={(e) => {
                                                                    const newArr = [...bulkStudents];
                                                                    newArr[idx].PDAEH_Amount = e.target.value;
                                                                    setBulkStudents(newArr);
                                                                }}
                                                                className='h-8 w-24 rounded-md text-xs'
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Form Actions */}
                            <div className='flex justify-center gap-6 border-t pt-6'>
                                <Button
                                    type='submit'
                                    className='h-10 rounded-xl bg-primary px-6 text-sm shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95'>
                                    <Save className='mr-2 h-4 w-4' />
                                    {isEdit ? 'Update' : 'Save'}
                                </Button>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={() => window.location.reload()}
                                    className='h-10 rounded-xl border-gray-200 bg-white px-6 text-sm shadow-sm transition-all hover:scale-105 hover:bg-gray-50 active:scale-95'>
                                    <XCircle className='mr-2 h-4 w-4 text-gray-400' />
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
