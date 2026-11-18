'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { uploadDocument } from '@/server/document_upload';
import {
    getNDASectionsForInteraction,
    getRecipientsByRole,
    getStudentsForInteraction,
    saveInteractionData
} from '@/server/staff-portal/interactions';
import type { IFILESLISTdata, IInteractionsInitialData, IRecipient } from '@/types/staff-portal/interactions';
import { Calendar, Clock, Download, Eye, FileText, Loader2, Plus, Search, Send, Trash2, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ComposeTabProps {
    data: IInteractionsInitialData;
    mode: 'Group' | 'Individual';
    onCancel: () => void;
    onSuccess: () => void;
}
export const dynamic = 'force-dynamic';
export function ComposeTab({ data, mode, onCancel, onSuccess }: ComposeTabProps) {
    const [userFlag, setUserFlag] = useState<string>('');
    const [recipients, setRecipients] = useState<IRecipient[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [students, setStudents] = useState<IRecipient[]>([]);

    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
    const [selectedGroupItems, setSelectedGroupItems] = useState<number[]>([]);

    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [selectedYear, setSelectedYear] = useState<string>(() => {
        const activeYear = data.allacademicyear?.find((y) => y.is_Active || y.asmaY_ActiveFlag === 1);
        return activeYear?.asmaY_Id?.toString() || data.allacademicyear?.[0]?.asmaY_Id?.toString() || '';
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const [files, setFiles] = useState<{ name: string; file: File | null; path?: string }[]>([{ name: '', file: null }]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    // Preview state
    const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: string } | null>(null);
    const [xlsxPreviewData, setXlsxPreviewData] = useState<any[][] | null>(null);
    const [docxPreviewHtml, setDocxPreviewHtml] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const roleFlg = data.roletype?.[0]?.ivrmrT_Role || 'Student';
    const isStudentRole = roleFlg === 'Student' || roleFlg === 'Staff';
    const config = data.configflag?.[0] || {};

    const availableUserTypes = useMemo(() => {
        if (!isStudentRole) {
            const types = [];
            if (data.chatwithstudent !== false) types.push({ id: 'Student', label: 'Student' });
            if (data.chatwithstaff !== false) types.push({ id: 'Teachers', label: 'Teachers' });

            if (mode === 'Individual' && data.chatwithstaff !== false) {
                if (config.ivrmgC_EnableHODIntFlg) types.push({ id: 'HOD', label: 'HOD' });
                types.push({ id: 'Principal', label: 'Principal' });
                if (config.ivrmgC_EnableASIntFlg) types.push({ id: 'AS', label: 'Academic Supervisor' });
                if (config.ivrmgC_EnableECIntFlg) types.push({ id: 'EC', label: 'Exam Coordinator' });
            }
            return types;
        } else {
            const types = [];
            types.push({ id: 'SubjectTeacher', label: 'Subject Teacher' });
            types.push({ id: 'ClassTeacher', label: 'Class Teacher' });
            if (config.ivrmgC_EnableSTHODIntFlg) types.push({ id: 'HOD', label: 'HOD' });
            types.push({ id: 'Principal', label: 'Principal' });
            return types;
        }
    }, [isStudentRole, data, config, mode]);

    useEffect(() => {
        if (!userFlag || !selectedYear) return;
        const fetchDetails = async () => {
            setIsLoadingDetails(true);
            try {
                const res = await getRecipientsByRole(roleFlg, userFlag, Number(selectedYear));
                if (res.success && res.data) {
                    const dataObj = res.data as any;
                    let detailList = Array.isArray(dataObj) ? dataObj : dataObj.getdetails || [];

                    // Handle JSON-serialized filter data if present (special case for some flags like ClassTeacher)
                    const rawData = Array.isArray(dataObj) ? dataObj : dataObj.getdetails || dataObj.data || [];
                    if (Array.isArray(rawData) && rawData.length > 0 && rawData[0].IVRM_Interaction_filter) {
                        try {
                            detailList = JSON.parse(rawData[0].IVRM_Interaction_filter);
                        } catch (e) {
                            console.error('Failed to parse IVRM_Interaction_filter:', e);
                        }
                    }

                    // Precision deduplication to ensure frontend matches backend record count exactly
                    const uniqueList: any[] = [];
                    const seenKeys = new Set();
                    detailList.forEach((item: any) => {
                        const id = item.HRME_Id || item.AMST_Id || item.ASMCL_Id || 'no-id';
                        const className = item.ASMCL_ClassName || item.classname || 'no-class';
                        const sectionName = item.ASMC_SectionName || item.sectionname || 'no-section';
                        const key = `${id}-${className}-${sectionName}`;

                        if (!seenKeys.has(key)) {
                            seenKeys.add(key);
                            uniqueList.push(item);
                        }
                    });

                    setRecipients(uniqueList);
                } else {
                    setRecipients([]);
                }
            } catch (error) {
                toast.error('Failed to load recipients');
            } finally {
                setIsLoadingDetails(false);
            }
        };
        fetchDetails();

        setSelectedClass('');
        setSections([]);
        setSelectedSection('');
        setStudents([]);
        setSelectedRecipientId('');
        setSelectedGroupItems([]);
    }, [userFlag, selectedYear, roleFlg]);

    const classList = useMemo(() => {
        if (userFlag !== 'Student') return [];
        const uniqueClasses: any[] = [];
        const seenIds = new Set();

        recipients.forEach((item: any) => {
            if (item.ASMCL_Id && !seenIds.has(item.ASMCL_Id)) {
                seenIds.add(item.ASMCL_Id);
                uniqueClasses.push(item);
            }
        });
        return uniqueClasses;
    }, [recipients, userFlag]);

    const handleClassChange = async (classId: string) => {
        setSelectedClass(classId);
        setSelectedSection('');
        setStudents([]);

        setIsLoadingDetails(true);
        try {
            const res = await getNDASectionsForInteraction(Number(classId), Number(selectedYear), roleFlg);
            if (res.success && res.data) {
                const sectionList = Array.isArray(res.data) ? res.data : res.data.sectionList || [];
                setSections(sectionList);
            }
        } catch (error) {
            toast.error('Failed to load sections');
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleSectionChange = async (sectionId: string) => {
        setSelectedSection(sectionId);
        setIsLoadingDetails(true);
        try {
            const res = await getStudentsForInteraction(Number(selectedClass), Number(sectionId));
            if (res.success && res.data) {
                const studentList = Array.isArray(res.data) ? res.data : res.data.get_student || [];

                // Deduplicate students
                const uniqueStudents: any[] = [];
                const seenStudentIds = new Set();
                studentList.forEach((s: any) => {
                    if (s.AMST_Id && !seenStudentIds.has(s.AMST_Id)) {
                        seenStudentIds.add(s.AMST_Id);
                        uniqueStudents.push(s);
                    } else if (!s.AMST_Id) {
                        uniqueStudents.push(s);
                    }
                });

                setStudents(uniqueStudents);
            }
        } catch (error) {
            toast.error('Failed to load students');
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        const list = userFlag === 'Student' ? students : recipients;
        if (checked) {
            const allIds = list.map((item) => (userFlag === 'Student' ? item.AMST_Id : item.HRME_Id)).filter((id): id is number => !!id);
            setSelectedGroupItems(allIds);
        } else {
            setSelectedGroupItems([]);
        }
    };

    const toggleItemSelection = (id: number) => {
        setSelectedGroupItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            const newFiles = [...files];
            newFiles[index] = { name: file.name, file: file };
            setFiles(newFiles);
        }
    };

    const addNewFile = () => setFiles([...files, { name: '', file: null }]);
    const removeFile = (index: number) => setFiles(files.filter((_, i) => i !== index));

    const handleViewFile = (fileObj: { name: string; file: File | null }) => {
        if (fileObj.file) {
            const url = URL.createObjectURL(fileObj.file);
            setPreviewFile({ url, name: fileObj.name, type: fileObj.file.type });

            // Handle XLSX Parsing
            if (fileObj.name.toLowerCase().endsWith('.xlsx') || fileObj.name.toLowerCase().endsWith('.xls')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    setXlsxPreviewData(jsonData as any[][]);
                };
                reader.readAsArrayBuffer(fileObj.file);
            } else {
                setXlsxPreviewData(null);
                setDocxPreviewHtml(null);
            }
        }
    };

    const handleDownloadPreview = () => {
        if (previewFile) {
            saveAs(previewFile.url, previewFile.name);
        }
    };

    const handleSubmit = async () => {
        if (!userFlag || !subject || !message) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (mode === 'Group' && selectedGroupItems.length === 0) {
            toast.error('Please select at least one recipient');
            return;
        }

        setIsSubmitting(true);
        try {
            const uploadedFiles: IFILESLISTdata[] = [];
            for (const fileObj of files) {
                if (fileObj.file) {
                    const formData = new FormData();
                    formData.append('file', fileObj.file);
                    const uploadRes = await uploadDocument(formData);
                    if (uploadRes.success && uploadRes.data) {
                        uploadedFiles.push({
                            ISMID_Filename: fileObj.name,
                            ISMID_Filepath: uploadRes.data
                        });
                    }
                }
            }

            const payload: any = {
                ISMINT_GroupOrIndFlg: mode,
                userflag: userFlag,
                ISMINT_Subject: subject,
                ISMINT_Interaction: message,
                images_paths: uploadedFiles.map((f) => f.ISMID_Filepath),
                FILESLISTdata: uploadedFiles,
                ISMINT_MACAddress: '00-14-22-01-23-45', // Standard legacy test values
                ISMINT_ISPIPAddress: '192.168.1.1'
            };

            if (mode === 'Group') {
                if (userFlag === 'Student') {
                    payload.arrayStudent = students
                        .filter((s) => selectedGroupItems.includes(s.AMST_Id!))
                        .map((s) => ({ AMST_Id: s.AMST_Id! }));
                } else {
                    payload.arrayTeachers = recipients
                        .filter((r) => selectedGroupItems.includes(r.HRME_Id!))
                        .map((r) => ({ HRME_Id: r.HRME_Id! }));
                }
            } else {
                let toId = 0;
                if (userFlag === 'Student') {
                    toId = Number(selectedRecipientId);
                    payload.arrayStudent = [{ AMST_Id: toId }];
                } else if (
                    userFlag === 'Teachers' ||
                    userFlag === 'SubjectTeacher' ||
                    userFlag === 'ClassTeacher' ||
                    userFlag === 'Principal' ||
                    userFlag === 'HOD'
                ) {
                    toId = Number(selectedRecipientId);
                    payload.arrayTeachers = [{ HRME_Id: toId }];
                } else {
                    toId = recipients[0]?.HRME_Id || 0;
                    if (selectedRecipientId) toId = Number(selectedRecipientId);
                    payload.arrayTeachers = [{ HRME_Id: toId }];
                }
                payload.ISTINT_ToId = toId;
            }

            const res = await saveInteractionData(payload);
            if (res.success) {
                toast.success(res.message || 'Interaction sent successfully');
                onSuccess();
            } else {
                toast.error(res.message || 'Failed to send interaction');
            }
        } catch (error) {
            toast.error('An error occurred while sending');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredRecipientsList = recipients.filter(
        (r) =>
            (r.EmpName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.HRME_EmployeeCode || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredStudentsList = students.filter(
        (s) =>
            (s.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.AMST_AdmNo || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='fade-in mx-auto max-w-5xl animate-in space-y-4 pb-8 duration-500'>
            {/* Header Status - Simplified */}
            <div className='flex items-center justify-between border-[#1e40af]/10 border-b pb-2'>
                <div className='flex items-center gap-2'>
                    <h2 className='font-black text-[#1e40af] text-[11px] uppercase tracking-[0.15em]'>Compose New Interaction</h2>
                </div>
                <div className='flex items-center gap-4 font-black text-[9px] text-slate-400 uppercase tracking-tight'>
                    <div className='flex items-center gap-1.5 rounded-sm border bg-slate-100 px-2 py-0.5 text-slate-500'>
                        <Calendar className='h-2.5 w-2.5' />
                        {format(new Date(), 'dd/MM/yyyy')}
                    </div>
                    <div className='flex items-center gap-1.5 rounded-sm border bg-slate-100 px-2 py-0.5 text-slate-500'>
                        <Clock className='h-2.5 w-2.5' />
                        {format(currentTime, 'hh:mm a')}
                    </div>
                </div>
            </div>

            {/* Selection Form Card - Centered Labels like Legacy */}
            <Card className='overflow-hidden border bg-background/50 shadow-sm backdrop-blur-sm'>
                <CardContent className='mx-auto max-w-3xl space-y-6 p-8'>
                    {/* User Type Selection */}
                    <RadioGroup
                        value={userFlag}
                        onValueChange={setUserFlag}
                        className='flex flex-wrap items-center justify-center gap-8 py-2'>
                        {availableUserTypes.map((type, idx) => (
                            <div key={type.id || idx} className='flex items-center space-x-2'>
                                <RadioGroupItem value={type.id} id={type.id} className='border-primary' />
                                <Label htmlFor={type.id} className='cursor-pointer font-bold text-sm transition-colors hover:text-primary'>
                                    {type.label}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>

                    {/* Form Fields */}
                    <div className='space-y-4 border-t border-dashed pt-4'>
                        {/* Always show Year */}
                        <div className='flex items-center gap-4'>
                            <Label className='w-24 shrink-0 text-right font-bold text-sm'>Academic Year :</Label>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className='h-9 flex-1 rounded-md border bg-background font-medium text-sm'>
                                    <SelectValue placeholder='Select Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {data.allacademicyear
                                        ?.filter((year) => year.asmaY_Id)
                                        .map((year, idx) => (
                                            <SelectItem key={year.asmaY_Id || idx} value={year.asmaY_Id.toString()}>
                                                {year.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {userFlag === 'Student' && (
                            <>
                                <div className='flex items-center gap-4'>
                                    <Label className='w-24 shrink-0 text-right font-bold text-sm'>
                                        Class : <span className='text-red-500'>*</span>
                                    </Label>
                                    <Select value={selectedClass} onValueChange={handleClassChange}>
                                        <SelectTrigger className='h-9 flex-1 rounded-md border bg-background font-medium text-sm'>
                                            <SelectValue placeholder='Select Class' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classList
                                                .filter((cls) => cls.ASMCL_Id)
                                                .map((cls: any, idx) => (
                                                    <SelectItem key={cls.ASMCL_Id || idx} value={cls.ASMCL_Id.toString()}>
                                                        {cls.ASMCL_ClassName}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='flex items-center gap-4'>
                                    <Label className='w-24 shrink-0 text-right font-bold text-sm'>
                                        Section : <span className='text-red-500'>*</span>
                                    </Label>
                                    <Select value={selectedSection} onValueChange={handleSectionChange} disabled={!selectedClass}>
                                        <SelectTrigger className='h-9 flex-1 rounded-md border bg-background font-medium text-sm'>
                                            <SelectValue placeholder='Select Section' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sections
                                                .filter((sec) => sec.asmS_Id)
                                                .map((sec: any, idx) => (
                                                    <SelectItem key={sec.asmS_Id || idx} value={sec.asmS_Id.toString()}>
                                                        {sec.asmC_SectionName}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='flex items-center gap-4'>
                                    <Label className='w-24 shrink-0 text-right font-bold text-sm'>
                                        Student : <span className='text-red-500'>*</span>
                                    </Label>
                                    {mode === 'Individual' ? (
                                        <Select
                                            value={selectedRecipientId}
                                            onValueChange={setSelectedRecipientId}
                                            disabled={!selectedSection}>
                                            <SelectTrigger className='h-9 flex-1 rounded-md border bg-background font-medium text-sm'>
                                                <SelectValue placeholder='Select Student' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {students
                                                    .filter((s) => s.AMST_Id)
                                                    .map((s, idx) => {
                                                        const className = s.ASMCL_ClassName || (s as any).classname || (s as any).ClassName;
                                                        const sectionName =
                                                            s.ASMC_SectionName || (s as any).sectionname || (s as any).SectionName;
                                                        const context =
                                                            className || sectionName
                                                                ? ` (${className || ''}${className && sectionName ? ' - ' : ''}${sectionName || ''})`
                                                                : '';
                                                        return (
                                                            <SelectItem
                                                                key={s.AMST_Id || idx}
                                                                value={s.AMST_Id?.toString() || `student-${idx}`}>
                                                                {idx + 1}. {s.studentName}
                                                                {context}
                                                            </SelectItem>
                                                        );
                                                    })}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className='flex-1'>
                                            <Badge variant='secondary' className='rounded-lg px-3 py-1 font-bold text-[10px]'>
                                                {selectedGroupItems.length} selected
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {userFlag && userFlag !== 'Student' && mode === 'Individual' && (
                            <div className='flex items-center gap-4'>
                                <Label className='w-24 shrink-0 text-right font-bold text-sm'>
                                    {userFlag} : <span className='text-red-500'>*</span>
                                </Label>
                                <Select value={selectedRecipientId} onValueChange={setSelectedRecipientId}>
                                    <SelectTrigger className='h-9 flex-1 rounded-md border bg-background font-medium text-sm'>
                                        <SelectValue placeholder={`Select ${userFlag.toLowerCase()}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {recipients
                                            .filter((r) => r.HRME_Id || r.AMST_Id)
                                            .map((r, idx) => {
                                                const name = r.EmpName || r.studentName;
                                                const sub = r.HRME_EmployeeCode || r.AMST_AdmNo;
                                                const className = r.ASMCL_ClassName || (r as any).classname || (r as any).ClassName;
                                                const sectionName = r.ASMC_SectionName || (r as any).sectionname || (r as any).SectionName;
                                                const subjectName = r.ISMS_SubjectName || (r as any).subjectname || (r as any).SubjectName;

                                                const contextArr = [];
                                                if (className) contextArr.push(className);
                                                if (sectionName) contextArr.push(sectionName);
                                                if (subjectName) contextArr.push(subjectName);
                                                const context = contextArr.length > 0 ? ` - ${contextArr.join(' - ')}` : '';

                                                return (
                                                    <SelectItem
                                                        key={(r.HRME_Id || r.AMST_Id || idx).toString()}
                                                        value={(r.HRME_Id || r.AMST_Id || 0).toString()}>
                                                        {idx + 1}. {name}
                                                        {sub ? ` (${sub})` : ''}
                                                        {context}
                                                    </SelectItem>
                                                );
                                            })}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Recipient Grid for Group Mode */}
            {mode === 'Group' && userFlag && (
                <Card className='-mt-6 rounded-t-none border border-t-0 bg-muted/5 pt-6'>
                    <CardContent className='space-y-4 p-6'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <Users className='h-4 w-4 text-primary' />
                                <span className='font-bold text-xs uppercase tracking-wider'>Select Group Recipients</span>
                            </div>
                            <div className='flex items-center gap-4'>
                                <div className='relative w-48'>
                                    <Search className='-translate-y-1/2 absolute top-1/2 left-2.5 h-3.5 w-3.5 text-muted-foreground' />
                                    <Input
                                        className='h-8 border bg-background pl-8 font-medium text-xs shadow-none'
                                        placeholder='Filter list...'
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Checkbox
                                        id='sel-all'
                                        checked={
                                            (userFlag === 'Student' ? students : recipients).length > 0 &&
                                            selectedGroupItems.length === (userFlag === 'Student' ? students : recipients).length
                                        }
                                        onCheckedChange={(checked) => handleSelectAll(checked === true)}
                                    />
                                    <Label htmlFor='sel-all' className='font-bold text-xs uppercase'>
                                        All
                                    </Label>
                                </div>
                            </div>
                        </div>
                        <ScrollArea className='h-[250px] rounded-lg border bg-background'>
                            <div className='grid grid-cols-1 gap-2 p-3 md:grid-cols-2 lg:grid-cols-3'>
                                {(userFlag === 'Student' ? filteredStudentsList : filteredRecipientsList).map((item, idx) => {
                                    const id = userFlag === 'Student' ? item.AMST_Id! : item.HRME_Id!;
                                    const name = userFlag === 'Student' ? item.studentName : item.EmpName;
                                    const sub = userFlag === 'Student' ? item.AMST_AdmNo : item.HRME_EmployeeCode;
                                    return (
                                        <div
                                            key={`${id}-${idx}`}
                                            className={cn(
                                                'flex cursor-pointer items-center gap-3 rounded-md border p-2 font-medium text-xs transition-colors',
                                                selectedGroupItems.includes(id) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                                            )}
                                            onClick={() => toggleItemSelection(id)}>
                                            <Checkbox checked={selectedGroupItems.includes(id)} />
                                            <div className='flex min-w-0 flex-col'>
                                                <span className='block truncate'>
                                                    {idx + 1}. {name}
                                                    {sub && <span className='ml-1 font-bold text-muted-foreground'>({sub})</span>}
                                                </span>
                                                <div className='mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 font-black text-[9px] text-blue-600/60 uppercase tracking-tight'>
                                                    {item.ASMCL_ClassName && <span>{item.ASMCL_ClassName}</span>}
                                                    {item.ASMC_SectionName && (
                                                        <span>
                                                            <span className='mx-1 opacity-40'>|</span>
                                                            {item.ASMC_SectionName}
                                                        </span>
                                                    )}
                                                    {item.ISMS_SubjectName && (
                                                        <span>
                                                            <span className='mx-1 opacity-40'>|</span>
                                                            {item.ISMS_SubjectName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}

            {/* Message Area Card - Integrated buttons exactly like legacy */}
            <Card className='overflow-hidden border shadow-md ring-1 ring-primary/10'>
                <div className='flex items-center justify-between bg-primary/90 px-6 py-2.5 text-white'>
                    <h3 className='font-bold text-xs uppercase tracking-[0.1em]'>New Message</h3>
                    <div className='flex items-center gap-2 font-bold text-[10px] opacity-80'>
                        {format(currentTime, 'dd/MM/yyyy hh:mm a')}
                    </div>
                </div>
                <CardContent className='p-0'>
                    <div className='space-y-6 p-8'>
                        <div className='flex gap-6'>
                            <Label className='w-20 shrink-0 pt-2 text-right font-bold text-sm'>
                                Subject : <span className='text-red-500'>*</span>
                            </Label>
                            <div className='flex-1 space-y-4'>
                                <Input
                                    className='h-10 border font-medium text-sm focus-visible:ring-primary/20'
                                    placeholder='Interaction Subject'
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                                <Textarea
                                    className='min-h-[160px] resize-none border p-4 font-medium text-sm'
                                    placeholder='Message details...'
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Action Buttons inside the card logic */}
                        <div className='flex items-center justify-end gap-3 border-t pt-4'>
                            <Button
                                className='rounded-md bg-primary px-8 font-bold hover:bg-primary/90'
                                disabled={isSubmitting}
                                onClick={handleSubmit}>
                                {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Send className='mr-2 h-4 w-4' />}
                                SEND
                            </Button>
                            <Button
                                variant='outline'
                                className='rounded-md border-none bg-orange-500 px-8 font-bold text-white hover:bg-orange-600'
                                onClick={onCancel}>
                                <X className='mr-2 h-4 w-4' />
                                CANCEL
                            </Button>
                        </div>
                    </div>

                    {/* Attachment Table-Like UI */}
                    <div className='overflow-hidden border-t'>
                        <table className='w-full border-collapse text-left'>
                            <thead className='bg-[#1a5f7a] font-bold text-[10px] text-white uppercase'>
                                <tr>
                                    <th className='w-16 border-white/10 border-r px-4 py-2 text-center'>SL NO</th>
                                    <th className='w-32 border-white/10 border-r px-4 py-2'>Upload File</th>
                                    <th className='border-white/10 border-r px-4 py-2'>File Name</th>
                                    <th className='w-20 border-white/10 border-r px-4 py-2 text-center'>View</th>
                                    <th className='w-20 px-4 py-2 text-center'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.map((file, idx) => (
                                    <tr key={idx} className='border-b transition-colors last:border-b-0 hover:bg-muted/30'>
                                        <td className='border-r px-4 py-2 text-center font-bold text-xs'>{idx + 1}</td>
                                        <td className='relative border-r px-4 py-2'>
                                            <Button
                                                size='sm'
                                                variant='outline'
                                                className='relative h-7 w-full cursor-pointer overflow-hidden border-none bg-primary/90 font-bold text-[10px] text-white shadow-sm'>
                                                Browse
                                                <input
                                                    type='file'
                                                    className='absolute inset-0 cursor-pointer opacity-0'
                                                    onChange={(e) => handleFileChange(idx, e)}
                                                />
                                            </Button>
                                        </td>
                                        <td className='border-r px-4 py-2'>
                                            <div className='flex h-7 items-center rounded border bg-background px-2'>
                                                <span className='max-w-[300px] truncate font-medium text-[10px]'>{file.name || ''}</span>
                                            </div>
                                        </td>
                                        <td className='border-r px-4 py-2 text-center'>
                                            {file.name ? (
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-6 w-6 text-primary hover:bg-primary/10'
                                                    onClick={() => handleViewFile(file)}>
                                                    <Eye className='h-4 w-4' />
                                                </Button>
                                            ) : null}
                                        </td>
                                        <td className='px-4 py-2 text-center'>
                                            <div className='flex items-center justify-center gap-1'>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-6 w-6 rounded-sm border text-primary hover:bg-primary/10'
                                                    onClick={addNewFile}>
                                                    <Plus className='h-3.5 w-3.5' />
                                                </Button>
                                                {files.length > 1 && (
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        className='h-6 w-6 rounded-sm border text-red-500 hover:bg-red-50'
                                                        onClick={() => removeFile(idx)}>
                                                        <Trash2 className='h-3.5 w-3.5' />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Image Preview Modal */}
            <Dialog
                open={!!previewFile}
                onOpenChange={(open) => {
                    if (!open) {
                        setPreviewFile(null);
                        setXlsxPreviewData(null);
                        setDocxPreviewHtml(null);
                    }
                }}>
                <DialogContent className='flex max-h-[90vh] max-w-4xl flex-col overflow-hidden rounded-2xl border-none p-0 shadow-2xl'>
                    <DialogHeader className='flex-row items-center justify-between space-y-0 bg-primary p-6 text-white'>
                        <DialogTitle className='truncate pr-8 font-bold text-lg'>{previewFile?.name}</DialogTitle>
                        <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 rounded-full text-white hover:bg-white/20'
                            onClick={() => setPreviewFile(null)}>
                            <X className='h-5 w-5' />
                        </Button>
                    </DialogHeader>
                    <div className='flex min-h-[300px] flex-1 items-center justify-center overflow-auto bg-muted/20 p-8'>
                        {previewFile?.url &&
                            (previewFile.type?.startsWith('video/') ? (
                                <video src={previewFile.url} controls className='max-h-full max-w-full rounded-lg shadow-xl' autoPlay />
                            ) : previewFile.type?.startsWith('audio/') ? (
                                <div className='flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border bg-background p-10 shadow-xl'>
                                    <div className='flex h-20 w-20 items-center justify-center rounded-full bg-primary/10'>
                                        <FileText className='h-10 w-10 text-primary' />
                                    </div>
                                    <audio src={previewFile.url} controls className='w-full' autoPlay />
                                    <p className='font-bold text-muted-foreground text-sm'>{previewFile.name}</p>
                                </div>
                            ) : previewFile.type === 'application/pdf' ||
                              previewFile.name.toLowerCase().endsWith('.docx') ||
                              previewFile.name.toLowerCase().endsWith('.doc') ? (
                                <iframe
                                    src={previewFile.url}
                                    className='h-full min-h-[600px] w-full rounded-lg border-none'
                                    title={previewFile.name}
                                />
                            ) : xlsxPreviewData ? (
                                <div className='flex h-full min-h-[500px] w-full flex-col overflow-hidden rounded-lg border bg-background shadow-inner'>
                                    <div className='flex items-center justify-between border-b bg-muted/50 px-4 py-2'>
                                        <span className='font-bold text-[10px] text-muted-foreground uppercase tracking-wider'>
                                            Excel Preview (First 50 Rows)
                                        </span>
                                        <Badge variant='outline' className='border-green-200 bg-green-50 text-[9px] text-green-700'>
                                            XLSX DATA
                                        </Badge>
                                    </div>
                                    <ScrollArea className='w-full flex-1 overflow-auto'>
                                        <div className='p-4'>
                                            <table className='w-full border-collapse font-medium text-[11px]'>
                                                <tbody>
                                                    {xlsxPreviewData.slice(0, 50).map((row, rIdx) => (
                                                        <tr
                                                            key={rIdx}
                                                            className={cn(
                                                                'transition-colors hover:bg-muted/30',
                                                                rIdx === 0 && 'border-b-2 bg-muted/80 font-bold'
                                                            )}>
                                                            {row.map((cell: any, cIdx: number) => (
                                                                <td key={cIdx} className='min-w-[120px] whitespace-nowrap border p-2'>
                                                                    {cell?.toString() || ''}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {xlsxPreviewData.length > 50 && (
                                                <div className='mt-2 border-t border-dashed bg-muted/10 p-4 text-center font-bold text-muted-foreground text-xs'>
                                                    Showing first 50 rows. Download to see all {xlsxPreviewData.length} rows.
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            ) : previewFile.type?.startsWith('image/') ? (
                                <img
                                    src={previewFile.url}
                                    alt={previewFile.name}
                                    className='max-h-full max-w-full rounded-lg object-contain shadow-xl'
                                />
                            ) : (
                                <div className='flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border bg-background p-10 shadow-xl'>
                                    <div className='flex h-20 w-20 items-center justify-center rounded-full bg-slate-100'>
                                        <FileText className='h-10 w-10 text-slate-400' />
                                    </div>
                                    <div className='space-y-2 text-center'>
                                        <h4 className='font-bold'>Document Preview Unavailable</h4>
                                        <p className='text-muted-foreground text-xs'>
                                            This file type ({previewFile.name.split('.').pop()?.toUpperCase()}) cannot be viewed directly in
                                            the browser.
                                        </p>
                                    </div>
                                    <Button
                                        className='h-12 w-full gap-2 bg-primary font-bold hover:bg-primary/90'
                                        onClick={handleDownloadPreview}>
                                        <Download className='h-4 w-4' />
                                        Download to View
                                    </Button>
                                </div>
                            ))}
                    </div>
                    <DialogFooter className='gap-3 border-t bg-background p-6'>
                        <Button variant='outline' className='rounded-full px-6 font-bold' onClick={() => setPreviewFile(null)}>
                            Close
                        </Button>
                        <Button
                            className='gap-2 rounded-full bg-primary px-8 font-black shadow-lg shadow-primary/20 hover:bg-primary/90'
                            onClick={handleDownloadPreview}>
                            <Download className='h-4 w-4' />
                            {previewFile?.type?.startsWith('video/')
                                ? 'Download Video'
                                : previewFile?.type?.startsWith('audio/')
                                  ? 'Download Audio'
                                  : previewFile?.type?.startsWith('image/')
                                    ? 'Download Image'
                                    : previewFile?.type === 'application/pdf'
                                      ? 'Download PDF'
                                      : 'Download File'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
