'use client';

import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Eye, Loader2, Printer, RotateCcw, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import {
    useSophiaStudentTCApplyLoadData,
    useSophiaStudentTCApplyOnChangeClass,
    useSophiaStudentTCApplySave,
    useSophiaStudentTCApplyStudentList,
    useSophiaStudentTCApplyTCPdf,
    useSophiaStudentTCApplyViewStatus
} from '@/hooks/admission/preadmission/transactions/useSophiaStudentTCApply';

export default function StudentTCApplyPage() {
    const printRef = useRef<HTMLDivElement>(null);

    const { data: loadData, isLoading: isLoadDataLoading } = useSophiaStudentTCApplyLoadData();
    const classChangeMutation = useSophiaStudentTCApplyOnChangeClass();
    const studentListMutation = useSophiaStudentTCApplyStudentList();
    const saveMutation = useSophiaStudentTCApplySave();
    const tcPdfMutation = useSophiaStudentTCApplyTCPdf();
    const viewStatusMutation = useSophiaStudentTCApplyViewStatus();

    const normalizedLoadData = useMemo(() => {
        if (!loadData) return null;
        return (loadData as any).data || loadData;
    }, [loadData]);

    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);

    const [sectionList, setSectionList] = useState<any[]>([]);
    const [studentSearchList, setStudentSearchList] = useState<any[]>([]);
    const [allRemarks, setAllRemarks] = useState('');
    const [mainSearchQuery, setMainSearchQuery] = useState('');
    const [appliedSearchQuery, setAppliedSearchQuery] = useState('');

    useEffect(() => {
        if (normalizedLoadData && !academicYearId) {
            const currentYear = (normalizedLoadData as any)?.currentYear;
            if (Array.isArray(currentYear) && currentYear.length > 0) {
                setAcademicYearId(currentYear[0].asmaY_Id);
            }
        }
    }, [normalizedLoadData, academicYearId]);

    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [statusData, setStatusData] = useState<any[]>([]);
    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [pdfData, setPdfData] = useState<any[]>([]);

    const remarksOptions = [
        'Promoted to Nursery',
        'Promoted to Preparatory',
        'Promoted to Junior',
        'Promoted to Class I',
        'Promoted to Class II',
        'Promoted to Class III',
        'Promoted to Class IV',
        'Promoted to Class V',
        'Promoted to Class VI',
        'Promoted to Class VII',
        'Promoted to Class VIII',
        'Promoted to Class IX',
        'Promoted to Class X',
        'Promoted to Class XI',
        'Promoted to Class XII',
        'Not Promoted',
        'Other',
        '-'
    ];

    const filteredSearchList = useMemo(() => {
        if (!mainSearchQuery) return studentSearchList;
        const q = mainSearchQuery.toLowerCase();
        return studentSearchList.filter(
            (s) =>
                (s.StudentName || s.studentname || '').toLowerCase().includes(q) ||
                (s.AMST_AdmNo || s.amst_admno || '').toLowerCase().includes(q)
        );
    }, [studentSearchList, mainSearchQuery]);

    const filteredAppliedList = useMemo(() => {
        const list = (normalizedLoadData as any)?.studenttcapprovedlist || [];
        if (!appliedSearchQuery) return list;
        const q = appliedSearchQuery.toLowerCase();
        return list.filter(
            (s: any) =>
                (s.studentname || s.StudentName || '').toLowerCase().includes(q) ||
                (s.amst_admno || s.AMST_AdmNo || '').toLowerCase().includes(q)
        );
    }, [normalizedLoadData, appliedSearchQuery]);

    const onYearChange = (val: string) => {
        setAcademicYearId(Number(val));
        setClassId(null);
        setSectionId(null);
        setStudentSearchList([]);
    };

    const onClassChange = async (val: string) => {
        const cId = Number(val);
        setClassId(cId);
        setSectionId(null);
        setStudentSearchList([]);
        if (!academicYearId) return;

        try {
            const res = await classChangeMutation.mutateAsync({ ASMAY_Id: academicYearId, ASMCL_Id: cId });
            const list = res?.data || res?.sectionList || (Array.isArray(res) ? res : []);
            setSectionList(Array.isArray(list) ? list : []);
        } catch (e) {
            toast.error('Failed to load sections');
        }
    };

    const handleSearch = async () => {
        if (!academicYearId || !classId || !sectionId) {
            toast.error('Please select all required fields');
            return;
        }

        try {
            const res = await studentListMutation.mutateAsync({
                ASMAY_Id: academicYearId,
                ASMCL_Id: classId,
                ASMS_Id: sectionId
            });
            const list = res?.data || res?.studentlistsearch || (Array.isArray(res) ? res : []);
            if (Array.isArray(list) && list.length > 0) {
                setStudentSearchList(
                    list.map((s) => ({
                        ...s,
                        selected: false,
                        ASTC_TCDate: null,
                        ASTC_TCApplicationDate: new Date(),
                        ASTC_Remarks: ''
                    }))
                );
            } else {
                toast.error('No Records Found ..!');
                setStudentSearchList([]);
            }
        } catch (e) {
            toast.error('Failed to search students');
        }
    };

    const toggleSelectAll = (checked: boolean) => {
        setStudentSearchList((prev) => prev.map((s) => ({ ...s, selected: checked })));
    };

    const onStudentSelect = (idx: number, checked: boolean) => {
        const newList = [...studentSearchList];
        newList[idx].selected = checked;
        setStudentSearchList(newList);
    };

    const onFieldChange = (idx: number, field: string, val: any) => {
        const newList = [...studentSearchList];
        newList[idx][field] = val;
        setStudentSearchList(newList);
    };

    const applyUniversalRemarks = (val: string) => {
        setAllRemarks(val);
        if (!val) return;
        setStudentSearchList((prev) => prev.map((s) => (s.selected ? { ...s, ASTC_Remarks: val } : s)));
    };

    const handleSave = async () => {
        const selected = studentSearchList.filter((s) => s.selected);
        if (selected.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        const invalid = selected.some((s) => !s.ASTC_TCDate || !s.ASTC_TCApplicationDate || !s.ASTC_Remarks);
        if (invalid) {
            toast.error('Please fill Date of Leaving, Date and Remarks for all selected students');
            return;
        }

        const tcnumbering = (normalizedLoadData as any)?.admTransNumSetting?.[0];
        const payload = {
            studentTCdata: selected,
            tcflagexists: 'notexists',
            transnumconfigsettings: tcnumbering
        };

        try {
            const res = await saveMutation.mutateAsync(payload);
            if (res?.success || res?.returnval || res?.data?.returnval) {
                toast.success(res?.message || 'Record Saved Successfully...!');
                setStudentSearchList([]);
            } else {
                toast.error(res?.message || 'Failed to save record');
            }
        } catch (e) {
            toast.error('Failed to request TC');
        }
    };

    const handleViewStatus = async (item: any) => {
        if (!academicYearId) {
            toast.error('Academic Year not selected');
            return;
        }
        try {
            const res = await viewStatusMutation.mutateAsync({
                AMST_Id: item.amst_id || item.AMST_Id,
                ASMAY_Id: academicYearId
            });
            const list = res?.data || res?.studentapprovedpendingdetails || (Array.isArray(res) ? res : []);
            setStatusData(Array.isArray(list) ? list : []);
            setStatusModalOpen(true);
        } catch (e) {
            toast.error('Failed to load status');
        }
    };

    const handleViewPdf = async (item: any) => {
        try {
            const amstId = item.AMST_Id || item.amst_id || item.amst_Id;
            const res = await tcPdfMutation.mutateAsync({ AMST_Id: Number(amstId) });
            const list = res?.data || res?.studenttcpdf || (Array.isArray(res) ? res : [res]);
            if (list && list.length > 0) {
                setPdfData(list);
                setPdfModalOpen(true);
            } else {
                toast.error('No TC record found');
            }
        } catch (e) {
            toast.error('Failed to load PDF');
        }
    };

    const handleDownloadPdf = async (item: any) => {
        const loadingToast = toast.loading('Generating PDF...');
        try {
            const amstId = item.AMST_Id || item.amst_id || item.amst_Id;
            const res = await tcPdfMutation.mutateAsync({ AMST_Id: Number(amstId) });
            const list = res?.data || res?.studenttcpdf || (Array.isArray(res) ? res : [res]);
            if (!list || list.length === 0) {
                toast.dismiss(loadingToast);
                toast.error('No TC record found');
                return;
            }
            setPdfData(list);
            setTimeout(async () => {
                const downloadElement = document.getElementById('download-pdf-content');
                if (!downloadElement) {
                    toast.dismiss(loadingToast);
                    toast.error('PDF generation container not found');
                    return;
                }
                const pdf = new jsPDF('p', 'mm', [176, 250]);
                const pages = downloadElement.querySelectorAll('.print-page');
                for (let i = 0; i < pages.length; i++) {
                    const canvas = await html2canvas(pages[i] as HTMLElement, { scale: 2, useCORS: true });
                    const imgData = canvas.toDataURL('image/png');
                    if (i > 0) pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, 0, 176, 250);
                }
                pdf.save(`TC_${item.studentname || item.StudentName || 'Report'}.pdf`);
                toast.dismiss(loadingToast);
                toast.success('Downloaded successfully');
            }, 800);
        } catch (e) {
            toast.dismiss(loadingToast);
            toast.error('Failed to generate PDF');
        }
    };

    const handlePrint = useReactToPrint({ contentRef: printRef });

    const handleReset = () => {
        setAcademicYearId(null);
        setClassId(null);
        setSectionId(null);
        setStudentSearchList([]);
    };

    return (
        <div className='min-h-screen space-y-6 p-4'>
            <CollapsibleSection
                title='Student TC APPLY'
                description='Apply for student transfer certificates'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>
                <div className='bg-white p-6'>
                    <div className='mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3'>
                        <div className='space-y-4'>
                            <Label className='font-bold text-sm'>
                                Academic Year:<span className='text-red-500'>*</span>
                            </Label>
                            <Select value={academicYearId?.toString()} onValueChange={onYearChange}>
                                <SelectTrigger className='h-9 shadow-sm'>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {(normalizedLoadData as any)?.academicList?.map((item: any) => (
                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                            {item.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-4'>
                            <Label className='font-bold text-sm'>
                                Class:<span className='text-red-500'>*</span>
                            </Label>
                            <Select value={classId?.toString()} onValueChange={onClassChange}>
                                <SelectTrigger className='h-9 shadow-sm'>
                                    <SelectValue placeholder='Select Class' />
                                </SelectTrigger>
                                <SelectContent>
                                    {(normalizedLoadData as any)?.classlist?.map((item: any) => (
                                        <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                            {item.asmcL_ClassName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-4'>
                            <Label className='font-bold text-sm'>
                                Section:<span className='text-red-500'>*</span>
                            </Label>
                            <Select value={sectionId?.toString()} onValueChange={(v) => setSectionId(Number(v))}>
                                <SelectTrigger className='h-9 shadow-sm'>
                                    <SelectValue placeholder='Select Section' />
                                </SelectTrigger>
                                <SelectContent>
                                    {sectionList.map((item: any) => (
                                        <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                            {item.asmC_SectionName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className='mt-6 flex flex-wrap justify-center gap-4 border-t pt-8'>
                        <Button
                            size='sm'
                            onClick={handleSearch}
                            disabled={studentListMutation.isPending}
                            className='min-w-32 rounded-full bg-[#3f51b5] text-white uppercase shadow-lg hover:bg-[#303f9f]'>
                            {studentListMutation.isPending ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            ) : (
                                <Search className='mr-2 h-4 w-4' />
                            )}{' '}
                            SEARCH
                        </Button>
                        <Button
                            size='sm'
                            onClick={handleReset}
                            className='min-w-32 rounded-full bg-[#ff5722] text-white uppercase shadow-lg hover:bg-[#f4511e]'>
                            <RotateCcw className='mr-2 h-4 w-4' /> CANCEL
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {studentSearchList.length > 0 && (
                <div className='fade-in slide-in-from-top-4 animate-in space-y-4'>
                    <div className='flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm'>
                        <h3 className='font-bold text-indigo-900 text-lg'>STUDENT TC DATA</h3>
                        <div className='flex items-center gap-4'>
                            <div className='w-48'>
                                <Label className='font-bold text-[10px] text-red-500 uppercase'>Remarks for All Selected</Label>
                                <Select value={allRemarks} onValueChange={applyUniversalRemarks}>
                                    <SelectTrigger className='h-8 text-xs'>
                                        <SelectValue placeholder='-- Select --' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {remarksOptions.map((r) => (
                                            <SelectItem key={r} value={r}>
                                                {r}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='relative mt-4 w-48'>
                                <Search className='absolute top-2 left-2 h-4 w-4 text-muted-foreground' />
                                <Input
                                    placeholder='Search student...'
                                    value={mainSearchQuery}
                                    onChange={(e) => setMainSearchQuery(e.target.value)}
                                    className='h-8 border-gray-200 pl-8 text-xs'
                                />
                            </div>
                        </div>
                    </div>
                    <div className='overflow-hidden rounded-xl border bg-white shadow-sm'>
                        <Table>
                            <TableHeader className='bg-gray-50'>
                                <TableRow>
                                    <TableHead className='w-[10px] text-center'>SL.NO</TableHead>
                                    <TableHead className='w-[10px]'>
                                        <Checkbox
                                            checked={studentSearchList.length > 0 && studentSearchList.every((s) => s.selected)}
                                            onCheckedChange={(checked) => toggleSelectAll(checked as boolean)}
                                        />
                                    </TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Adm No.</TableHead>
                                    <TableHead className='w-[160px]'>Date of Leaving</TableHead>
                                    <TableHead className='w-[160px]'>Date</TableHead>
                                    <TableHead className='w-[180px]'>Remarks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSearchList.map((s, idx) => (
                                    <TableRow key={idx} className={s.selected ? 'bg-indigo-50/30' : ''}>
                                        <TableCell className='text-center'>{idx + 1}</TableCell>
                                        <TableCell>
                                            <Checkbox
                                                checked={s.selected}
                                                onCheckedChange={(checked) => onStudentSelect(idx, checked as boolean)}
                                            />
                                        </TableCell>
                                        <TableCell>{s.StudentName || s.studentname}</TableCell>
                                        <TableCell>{s.AMST_AdmNo || s.amst_admno}</TableCell>
                                        <TableCell>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant='outline'
                                                        size='sm'
                                                        className='h-8 w-full justify-start font-normal text-[11px]'>
                                                        {s.ASTC_TCDate ? format(new Date(s.ASTC_TCDate), 'dd/MM/yyyy') : 'Select Date'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent align='start' className='p-0'>
                                                    <DatePickerWithYear
                                                        mode='single'
                                                        selected={s.ASTC_TCDate ? new Date(s.ASTC_TCDate) : undefined}
                                                        onDayClick={(date) => onFieldChange(idx, 'ASTC_TCDate', date)}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </TableCell>
                                        <TableCell>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant='outline'
                                                        size='sm'
                                                        className='h-8 w-full justify-start font-normal text-[11px]'>
                                                        {s.ASTC_TCApplicationDate
                                                            ? format(new Date(s.ASTC_TCApplicationDate), 'dd/MM/yyyy')
                                                            : 'Select Date'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent align='start' className='p-0'>
                                                    <DatePickerWithYear
                                                        mode='single'
                                                        selected={s.ASTC_TCApplicationDate ? new Date(s.ASTC_TCApplicationDate) : undefined}
                                                        onDayClick={(date) => onFieldChange(idx, 'ASTC_TCApplicationDate', date)}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={s.ASTC_Remarks}
                                                onValueChange={(v) => onFieldChange(idx, 'ASTC_Remarks', v)}
                                                disabled={!s.selected}>
                                                <SelectTrigger className='h-8 text-[11px]'>
                                                    <SelectValue placeholder='-- Select --' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {remarksOptions.map((r) => (
                                                        <SelectItem key={r} value={r}>
                                                            {r}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className='flex justify-center gap-4 py-4'>
                        <Button
                            size='sm'
                            onClick={handleSave}
                            disabled={saveMutation.isPending}
                            className='min-w-32 rounded-full bg-[#3f51b5] text-white uppercase shadow-lg hover:bg-[#303f9f]'>
                            {saveMutation.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : 'Request'}
                        </Button>
                        <Button
                            size='sm'
                            variant='outline'
                            onClick={() => setStudentSearchList([])}
                            className='min-w-32 rounded-full border-red-500 text-red-500 uppercase hover:bg-red-50'>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            <div className='space-y-4'>
                <div className='relative flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm'>
                    <h3 className='mx-auto font-bold text-indigo-900 text-lg uppercase tracking-wider'>STUDENT TC APPLY DETAILS</h3>
                    <div className='absolute right-4 w-48'>
                        <Search className='absolute top-2 left-2 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder='Search details...'
                            value={appliedSearchQuery}
                            onChange={(e) => setAppliedSearchQuery(e.target.value)}
                            className='h-8 rounded-full border-gray-200 pl-8 text-xs focus-visible:ring-indigo-500'
                        />
                    </div>
                </div>
                <div className='overflow-hidden rounded-xl border bg-white shadow-sm'>
                    <Table>
                        <TableHeader className='bg-gray-50'>
                            <TableRow>
                                <TableHead className='w-[50px] text-center'>SL.NO</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead className='text-center'>Adm No.</TableHead>
                                <TableHead className='text-center'>View Status</TableHead>
                                <TableHead className='text-center'>View PDF</TableHead>
                                <TableHead className='text-center'>Status</TableHead>
                                {/* <TableHead className='text-center'>Download</TableHead> */}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAppliedList.length > 0 ? (
                                filteredAppliedList.map((temp: any, idx: number) => (
                                    <TableRow key={idx}>
                                        <TableCell className='text-center'>{idx + 1}</TableCell>
                                        <TableCell className='font-medium'>{temp.studentname || temp.StudentName}</TableCell>
                                        <TableCell className='text-center'>{temp.amst_admno || temp.AMST_AdmNo}</TableCell>
                                        <TableCell className='text-center'>
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                onClick={() => handleViewStatus(temp)}
                                                className='text-indigo-600'>
                                                <Eye className='h-4 w-4' />
                                            </Button>
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            {(temp.approvalstatus || temp.ApprovalStatus) === 'Approved' ? (
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() => handleViewPdf(temp)}
                                                    className='text-green-600'>
                                                    <Eye className='h-4 w-4' />
                                                </Button>
                                            ) : (
                                                <Badge variant='outline' className='border-red-200 text-[10px] text-red-500'>
                                                    Approval Pending
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            {(temp.approvalstatus || temp.ApprovalStatus) === 'Approved' ? (
                                                <Badge className='border-none bg-green-100 px-3 text-green-700'>Approved</Badge>
                                            ) : (
                                                <Badge variant='outline' className='border-red-200 text-red-500'>
                                                    {temp.approvalstatus || temp.ApprovalStatus || 'Pending'}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        {/* <TableCell className='text-center'>
                                        {(temp.approvalstatus || temp.ApprovalStatus) === 'Approved' ? (
                                            <Button variant='ghost' size='sm' onClick={() => handleDownloadPdf(temp)} className='text-blue-600'><Download className='h-4 w-4' /></Button>
                                        ) : (
                                            <span className='text-gray-300'>---</span>
                                        )}
                                    </TableCell> */}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className='py-8 text-center text-muted-foreground italic'>
                                        No records found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
                <DialogContent className='max-w-xl overflow-hidden p-0'>
                    <DialogHeader className='bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white'>
                        <DialogTitle className='font-bold text-lg uppercase tracking-wider'>Staff Approval Status</DialogTitle>
                    </DialogHeader>
                    <div className='p-6'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Approval Name</TableHead>
                                    <TableHead className='text-center'>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {statusData.map((s, idx) => (
                                    <TableRow key={idx} className={s.ASCAP_Status === 'Approved' ? 'bg-green-50/50' : 'bg-red-50/50'}>
                                        <TableCell className='font-medium'>{s.empname?.replace(/\n/g, ' ')}</TableCell>
                                        <TableCell className='text-center'>
                                            <Badge
                                                variant='outline'
                                                className={
                                                    s.ASCAP_Status === 'Approved'
                                                        ? 'border-green-200 text-green-600'
                                                        : 'border-red-200 text-red-500'
                                                }>
                                                {s.ASCAP_Status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className='flex justify-end border-t bg-gray-50 p-4'>
                        <Button size='sm' variant='outline' onClick={() => setStatusModalOpen(false)}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={pdfModalOpen} onOpenChange={setPdfModalOpen}>
                <DialogContent className='flex max-h-[95vh] max-w-4xl flex-col overflow-hidden p-0'>
                    <DialogHeader className='flex flex-row items-center justify-between space-y-0 border-b p-4'>
                        <DialogTitle className='font-bold text-base'>Transfer Certificate Preview</DialogTitle>
                        <div className='flex items-center gap-2 pr-6'>
                            <Button size='sm' onClick={handlePrint} className='h-8 bg-blue-600 hover:bg-blue-700'>
                                <Printer className='mr-2 h-4 w-4' /> Print / Download
                            </Button>
                            <Button variant='outline' size='sm' onClick={() => setPdfModalOpen(false)} className='h-8'>
                                <X className='h-4 w-4' />
                            </Button>
                        </div>
                    </DialogHeader>
                    <div className='scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex-1 overflow-y-auto bg-gray-100/50 p-8'>
                        <div
                            ref={printRef}
                            className='print-content mx-auto bg-white p-0 font-serif text-black shadow-2xl'
                            style={{ width: '176mm' }}>
                            {tcPdfMutation.isPending ? (
                                <div
                                    className='flex h-[500px] flex-col items-center justify-center text-muted-foreground'
                                    style={{ width: '176mm' }}>
                                    <Loader2 className='mb-4 h-8 w-8 animate-spin' />
                                    <p>Generating Certificate Preview...</p>
                                </div>
                            ) : Array.isArray(pdfData) && pdfData.length > 0 ? (
                                pdfData.map((report: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className='page-break-after-always print-page space-y-5 bg-white p-10 pt-24 pb-20 font-serif'
                                        style={{ minHeight: '250mm', width: '176mm' }}>
                                        <div className='mb-8 space-y-1 text-center'>
                                            <h1 className='times-new-roman inline-block border-black border-b-2 px-4 pb-0 font-bold text-[24px] uppercase leading-none tracking-widest'>
                                                TRANSFER CERTIFICATE
                                            </h1>
                                        </div>
                                        <div className='mb-4 flex justify-between border-black border-b pb-0 font-bold text-[13px] leading-none'>
                                            <span>
                                                Admission Number:
                                                <span className='times-new-roman'>{report.amsT_AdmNo || report.AMST_AdmNo || '---'}</span>
                                            </span>
                                            <span>
                                                Sl. No:
                                                <span className='times-new-roman'>{report.astC_TCNO || report.ASTC_TCNO || '---'}</span>
                                            </span>
                                        </div>
                                        <div className='times-new-roman space-y-2 text-[13px]' style={{ marginLeft: '26px' }}>
                                            {[
                                                {
                                                    label: '1. Name of Pupil',
                                                    value: (report.studentname || report.StudentName)?.toUpperCase()
                                                },
                                                {
                                                    label: "2. Father's Name",
                                                    value: (report.amsT_FatherName || report.AMST_FatherName)?.toUpperCase()
                                                },
                                                {
                                                    label: "3. Mother's Name",
                                                    value: (report.amsT_MotherName || report.AMST_MotherName)?.toUpperCase()
                                                },
                                                {
                                                    label: '4. Religion/Caste',
                                                    value: `${report.religion || ''} / ${report.caste || ''}`
                                                        .toLowerCase()
                                                        .replace(/\b\w/g, (l) => l.toUpperCase())
                                                },
                                                { label: '5. Nationality', value: report.nationality || 'Indian' },
                                                {
                                                    label: '6. Date of Birth',
                                                    value:
                                                        report.amsT_DOB || report.amst_dob
                                                            ? format(new Date(report.amsT_DOB || report.amst_dob), 'dd-MMM-yyyy')
                                                            : '---'
                                                },
                                                { label: '7. School Last Attended', value: report.Last_Class_Studied || '---' },
                                                {
                                                    label: '8. Date Of Admission',
                                                    value:
                                                        report.amsT_Date || report.amst_date
                                                            ? format(new Date(report.amsT_Date || report.amst_date), 'dd-MMM-yyyy')
                                                            : '---'
                                                },
                                                { label: '9. Conduct', value: report.astC_Conduct || 'Good' },
                                                {
                                                    label: '10. Date Of Leaving',
                                                    value:
                                                        report.astC_TCIssueDate || report.tcdatess || report.astC_TCDate
                                                            ? format(
                                                                  new Date(
                                                                      report.astC_TCIssueDate || report.tcdatess || report.astC_TCDate
                                                                  ),
                                                                  'dd-MMM-yyyy'
                                                              )
                                                            : '---'
                                                },
                                                {
                                                    label: '11. Studying In',
                                                    value: `${report.Last_Class_Studied || report.ASMCL_ClassName || '---'} ${report.asmC_SectionName || ''}`
                                                },
                                                { label: '12. Remarks', value: report.astC_Remarks || '-' }
                                            ].map((item, i) => (
                                                <div key={i} className='flex items-start'>
                                                    <span className='times-new-roman w-[190px] flex-shrink-0 font-medium'>
                                                        {item.label}
                                                    </span>
                                                    <span className='w-4'>:</span>
                                                    <span className='times-new-roman flex-1'>{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className='mt-4 flex justify-between border-black border-t pt-2 text-[13px]'>
                                            <div className='flex gap-1'>
                                                <span>PEN No.</span>
                                                <span className='times-new-roman'>: {report.AMST_PENNo || report.amst_penno || ''}</span>
                                            </div>
                                            <div className='flex gap-1'>
                                                <span>SATS No.</span>
                                                <span className='times-new-roman'>: {report.govtno || report.GOVTNO || ''}</span>
                                            </div>
                                        </div>
                                        <div className='mt-8 pt-2'>
                                            <p className='times-new-roman font-medium text-[16px]'>
                                                Certified that the above mentioned information is in accordance with the school register.
                                            </p>
                                        </div>
                                        <div className='mt-16 flex items-end justify-between text-[14px]' style={{ marginTop: '50px' }}>
                                            <span>Date: {format(new Date(), 'dd-MMM-yyyy')}</span>
                                            <div className='flex flex-col items-center' style={{ marginRight: '80px' }}>
                                                <div className='mb-1 w-18'></div>
                                                <span className='times-new-roman font-bold text-[16px] uppercase'>PRINCIPAL</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className='p-20 text-center text-muted-foreground italic' style={{ width: '176mm' }}>
                                    No certificate data to display.
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                @media print {
                    @page { size: B5; margin: 0; }
                    body * { visibility: hidden; }
                    .print-content, .print-content * { visibility: visible !important; }
                    .print-content { position: absolute; left: 0; top: 0; width: 176mm !important; display: block !important; }
                    .print-page { page-break-after: always !important; background: white !important; }
                }
                .times-new-roman { font-family: "Times New Roman", Times, serif !important; }
            `}</style>

            <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
                <div id='download-pdf-content' className='bg-white p-0 font-serif text-black' style={{ width: '176mm' }}>
                    {Array.isArray(pdfData) &&
                        pdfData.length > 0 &&
                        pdfData.map((report: any, idx: number) => (
                            <div
                                key={idx}
                                className='page-break-after-always print-page space-y-5 bg-white p-10 pt-24 pb-20 font-serif'
                                style={{ minHeight: '250mm', width: '176mm' }}>
                                <div className='mb-8 space-y-1 text-center'>
                                    <h1 className='times-new-roman inline-block border-black border-b-2 px-4 pb-0 font-bold text-[24px] uppercase leading-none tracking-widest'>
                                        TRANSFER CERTIFICATE
                                    </h1>
                                </div>
                                <div className='mb-4 flex justify-between border-black border-b pb-0 font-bold text-[13px] leading-none'>
                                    <span>Admission Number: {report.amsT_AdmNo || report.AMST_AdmNo || report.amst_admno || '---'}</span>
                                    <span>Sl. No: {report.astC_TCNO || report.ASTC_TCNO || report.astc_tcno || '---'}</span>
                                </div>
                                <table className='times-new-roman w-full border-collapse text-[15px] leading-loose'>
                                    <tbody>
                                        <tr>
                                            <td className='w-8 py-1'>1.</td>
                                            <td className='w-56 py-1'>Name of Pupil</td>
                                            <td className='w-4 py-1'>:</td>
                                            <td className='py-1 font-bold uppercase'>
                                                {report.StudentName || report.studentname || '---'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='py-1'>2.</td>
                                            <td className='py-1'>Father&apos;s Name</td>
                                            <td className='py-1'>:</td>
                                            <td className='py-1 font-bold uppercase'>
                                                {report.AMST_FatherName || report.amst_fathername || '---'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='py-1'>3.</td>
                                            <td className='py-1'>Mother&apos;s Name</td>
                                            <td className='py-1'>:</td>
                                            <td className='py-1 font-bold uppercase'>
                                                {report.AMST_MotherName || report.amst_mothername || '---'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='py-1'>4.</td>
                                            <td className='py-1'>Religion/Caste</td>
                                            <td className='py-1'>:</td>
                                            <td className='py-1'>
                                                {report.IVRMMR_Name || report.religion || '---'} /{' '}
                                                {report.IVRMMC_CasteName || report.caste || '---'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='py-1'>5.</td>
                                            <td className='py-1'>Nationality</td>
                                            <td className='py-1'>:</td>
                                            <td className='py-1'>{report.IVRMMN_NationalityName || report.nationality || '---'}</td>
                                        </tr>
                                        <tr>
                                            <td className='py-1'>6.</td>
                                            <td className='py-1'>Date of Birth</td>
                                            <td className='py-1'>:</td>
                                            <td className='py-1'>
                                                {report.AMST_DOB || report.amst_dob
                                                    ? format(new Date(report.AMST_DOB || report.amst_dob), 'dd-MMM-yyyy')
                                                    : '---'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='py-1'>7.</td>
                                            <td className='py-1'>School Last Attended</td>
                                            <td className='py-1'>:</td>
                                            <td className='py-1'>---</td>
                                        </tr>
                                        <tr>
                                            <td className='py-1'>8.</td>
                                            <td className='py-1'>Date of Admission</td>
                                            <td className='py-1'>:</td>
                                            <td className='py-1'>
                                                {report.AMST_Date || report.amst_date
                                                    ? format(new Date(report.AMST_Date || report.amst_date), 'dd-MMM-yyyy')
                                                    : '---'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='py-1'>9.</td>
                                            <td className='py-1'>Conduct</td>
                                            <td className='py-1'>:</td>
                                            <td className='py-1'>Good</td>
                                        </tr>
                                        <tr>
                                            <td className='py-1'>10.</td>
                                            <td className='py-1'>Date of Leaving</td>
                                            <td className='py-1'>:</td>
                                            <td className='py-1'>
                                                {report.ASTC_TCDate || report.astc_tcdate
                                                    ? format(new Date(report.ASTC_TCDate || report.astc_tcdate), 'dd-MMM-yyyy')
                                                    : '---'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='py-1'>11.</td>
                                            <td className='py-1'>Studying In</td>
                                            <td className='py-1'>:</td>
                                            <td className='py-1'>
                                                {report.ASMCL_ClassName || report.asmcl_classname || '---'}{' '}
                                                {report.ASMC_SectionName || report.asmc_sectionname || ''}
                                            </td>
                                        </tr>
                                        {report.ASTC_Remarks && (
                                            <tr>
                                                <td className='py-1'>12.</td>
                                                <td className='py-1'>Remarks</td>
                                                <td className='py-1'>:</td>
                                                <td className='py-1'>{report.ASTC_Remarks || report.astc_remarks || '---'}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <div className='times-new-roman mt-8 space-y-4 border-black border-t pt-8 text-[14px]'>
                                    <div className='flex justify-between font-bold'>
                                        <span>
                                            PEN No:{' '}
                                            <span className='times-new-roman'>{report.AMST_PENNo || report.amst_pen_no || '---'}</span>
                                        </span>
                                        <span>
                                            SATS No:{' '}
                                            <span className='times-new-roman'>{report.AMST_GovernmentNo || report.govtno || '---'}</span>
                                        </span>
                                    </div>
                                    <div className='flex justify-between font-bold'>
                                        <span>
                                            APAAR No:{' '}
                                            <span className='times-new-roman'>{report.AMST_APAARId || report.amst_apaar_id || '---'}</span>
                                        </span>
                                    </div>
                                    <div className='pt-4 italic'>
                                        Certified that the above mentioned information is in accordance with the school register.
                                    </div>
                                </div>
                                <div className='times-new-roman flex items-end justify-between pt-20 font-bold text-[16px]'>
                                    <div>Date: {format(new Date(), 'dd-MMM-yyyy')}</div>
                                    <div className='mr-16 flex flex-col items-center'>
                                        <div className='mb-2 h-10'></div>
                                        <span className='border-transparent border-t-2'>PRINCIPAL</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
