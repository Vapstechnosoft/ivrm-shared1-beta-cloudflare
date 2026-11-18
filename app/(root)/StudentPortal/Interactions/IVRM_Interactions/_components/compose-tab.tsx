'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { ClipboardCheck, FileText, GraduationCap, Loader2, School, Search, Send, User, UserCheck, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

import { uploadDocument } from '@/server/document_upload';
import {
    getRecipientsByRole,
    getSectionsForInteraction,
    getStudentsForInteraction,
    saveInteraction
} from '@/server/staff-portal/interactions';
import type { IInteractionsInitialData, IRecipient } from '@/types/staff-portal/interactions';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

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

    const [file, setFile] = useState<{ name: string; file: File | null; path?: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    // Preview state
    const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: string } | null>(null);
    const [xlsxPreviewData, setXlsxPreviewData] = useState<any[][] | null>(null);
    const [docxPreviewHtml, setDocxPreviewHtml] = useState<string | null>(null);

    const roleFlg = data.roletype?.[0]?.ivrmrT_Role || 'Student';
    const isStudentRole = roleFlg === 'Student' || roleFlg === 'Staff';
    const config = data.configflag?.[0] || {};

    // Filter available user types based on role and config flags (legacy parity)
    const availableUserTypes = useMemo(() => {
        if (!isStudentRole) {
            const types = [];
            if (data.chatwithstudent !== false)
                types.push({ id: 'Student', label: 'Student', icon: <GraduationCap className='h-4 w-4' /> });
            if (data.chatwithstaff !== false) types.push({ id: 'Teachers', label: 'Teachers', icon: <User className='h-4 w-4' /> });

            if (mode === 'Individual' && data.chatwithstaff !== false) {
                if (config.ivrmgC_EnableHODIntFlg) types.push({ id: 'HOD', label: 'HOD', icon: <Users className='h-4 w-4' /> });
                types.push({ id: 'Principal', label: 'Principal', icon: <School className='h-4 w-4' /> });
                types.push({ id: 'AS', label: 'Academic Supervisor', icon: <UserCheck className='h-4 w-4' /> });
                types.push({ id: 'EC', label: 'Exam Coordinator', icon: <ClipboardCheck className='h-4 w-4' /> });
            }
            return types;
        } else {
            const types = [];
            types.push({ id: 'SubjectTeacher', label: 'Subject Teacher', icon: <User className='h-4 w-4' /> });
            types.push({ id: 'ClassTeacher', label: 'Class Teacher', icon: <UserCheck className='h-4 w-4' /> });
            if (config.ivrmgC_EnableSTHODIntFlg) types.push({ id: 'HOD', label: 'HOD', icon: <Users className='h-4 w-4' /> });
            types.push({ id: 'Principal', label: 'Principal', icon: <School className='h-4 w-4' /> });
            types.push({ id: 'AS', label: 'Academic Supervisor', icon: <UserCheck className='h-4 w-4' /> });
            types.push({ id: 'EC', label: 'Exam Coordinator', icon: <ClipboardCheck className='h-4 w-4' /> });
            return types;
        }
    }, [isStudentRole, data, config, mode]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Set default selection when types become available
    useEffect(() => {
        if (isMounted && availableUserTypes.length > 0 && !userFlag) {
            setUserFlag(availableUserTypes[0].id);
        }
    }, [isMounted, availableUserTypes, userFlag]);

    // Recipient selection logic - matches legacy getdetail
    useEffect(() => {
        if (!userFlag || !selectedYear) return;
        const fetchDetails = async () => {
            setIsLoadingDetails(true);
            try {
                const res = await getRecipientsByRole(roleFlg, userFlag, Number(selectedYear));
                if (res.success && res.data) {
                    // Handle JSON-serialized filter data if present (special case for Student flag)
                    let details = (res.data as any).getdetails || [];

                    // The backend sometimes returns a serialized JSON string in a 'data' array
                    const rawData = (res.data as any).data || res.data;
                    if (Array.isArray(rawData) && rawData.length > 0 && rawData[0].IVRM_Interaction_filter) {
                        try {
                            details = JSON.parse(rawData[0].IVRM_Interaction_filter);
                        } catch (e) {
                            console.error('Failed to parse IVRM_Interaction_filter:', e);
                        }
                    } else if (Array.isArray(rawData) && !details.length) {
                        details = rawData;
                    }

                    // Precision deduplication to ensure frontend matches backend record count exactly
                    const uniqueDetails: any[] = [];
                    const seenKeys = new Set();

                    (details || []).forEach((item: any) => {
                        const id = item.HRME_Id || item.AMST_Id || item.AMST_AdmNo || 'no-id';
                        const className = item.ASMCL_ClassName || item.classname || 'no-class';
                        const sectionName = item.ASMC_SectionName || item.sectionname || 'no-section';
                        const key = `${id}-${className}-${sectionName}`;

                        if (!seenKeys.has(key)) {
                            seenKeys.add(key);
                            uniqueDetails.push(item);
                        }
                    });

                    setRecipients(uniqueDetails);
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

        // Reset selections
        setSelectedClass('');
        setSections([]);
        setSelectedSection('');
        setStudents([]);
        setSelectedRecipientId('');
        setSelectedGroupItems([]);
    }, [userFlag, selectedYear, roleFlg]);

    // Extract unique classes for student interaction dropdown
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

    // Fetch sections when class changes (for Student selection)
    const handleClassChange = async (classId: string) => {
        setSelectedClass(classId);
        setSelectedSection('');
        setStudents([]);

        setIsLoadingDetails(true);
        try {
            const res = await getSectionsForInteraction(Number(classId), Number(selectedYear), roleFlg);
            if (res.success && res.data) {
                // Handle different backend structures (sectionList vs direct data array)
                const sectionList = (res.data as any).sectionList || (Array.isArray(res.data) ? res.data : []);
                const uniqueSections = sectionList.reduce((acc: any[], curr: any) => {
                    if (curr.asmS_Id && !acc.some((s: any) => s.asmS_Id === curr.asmS_Id)) {
                        acc.push(curr);
                    }
                    return acc;
                }, []);
                setSections(uniqueSections);
            }
        } catch (error) {
            toast.error('Failed to load sections');
        } finally {
            setIsLoadingDetails(false);
        }
    };

    // Fetch students when section changes
    const handleSectionChange = async (sectionId: string) => {
        setSelectedSection(sectionId);
        setIsLoadingDetails(true);
        try {
            const res = await getStudentsForInteraction(Number(selectedClass), Number(sectionId));
            if (res.success && res.data) {
                // Handle different backend structures (get_student vs direct data array)
                const studentList = (res.data as any).get_student || (Array.isArray(res.data) ? res.data : []);
                const uniqueStudents = studentList.reduce((acc: any[], curr: any) => {
                    if (curr.AMST_Id && !acc.some((s: any) => s.AMST_Id === curr.AMST_Id)) {
                        acc.push(curr);
                    }
                    return acc;
                }, []);
                setStudents(uniqueStudents);
            }
        } catch (error) {
            toast.error('Failed to load students');
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const list = userFlag === 'Student' ? students : recipients;
            const allIds = list.map((item) => (userFlag === 'Student' ? item.AMST_Id : item.HRME_Id)).filter((id): id is number => !!id);
            setSelectedGroupItems(allIds);
        } else {
            setSelectedGroupItems([]);
        }
    };

    const toggleItemSelection = (id: number) => {
        setSelectedGroupItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        if (selectedFile) {
            setFile({ name: selectedFile.name, file: selectedFile });
        }
    };

    const removeFile = () => setFile(null);

    const handleViewFile = (fileObj: { name: string; file: File | null }) => {
        if (fileObj.file) {
            const url = URL.createObjectURL(fileObj.file);
            const type = fileObj.file.type || '';
            setPreviewFile({ url, name: fileObj.name, type });

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

    const downloadFile = () => {
        if (file?.file) {
            const url = URL.createObjectURL(file.file);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
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

        if (mode === 'Individual' && !selectedRecipientId && !['HOD', 'Principal', 'AS', 'ClassTeacher'].includes(userFlag)) {
            if (recipients.length === 0) {
                toast.error('No recipients available');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            // Upload file if present
            let uploadedFilePath = '';
            if (file && file.file) {
                const formData = new FormData();
                formData.append('file', file.file);
                const uploadRes = await uploadDocument(formData);
                if (uploadRes.success && uploadRes.data) {
                    uploadedFilePath = uploadRes.data;
                }
            }

            let toId = 0;
            if (mode === 'Individual') {
                if (selectedRecipientId) {
                    toId = Number(selectedRecipientId);
                } else if (!['HOD', 'Principal', 'AS', 'ClassTeacher'].includes(userFlag)) {
                    toId = recipients[0]?.HRME_Id || 0;
                }
            }

            const payload: any = {
                userflag: userFlag,
                roleflg: roleFlg,
                isminT_GroupOrIndFlg: mode,
                isminT_Subject: subject,
                isminT_Interaction: message,
                images_paths: uploadedFilePath ? [uploadedFilePath] : [],
                isminT_MACAddress: '00:1A:2B:3C:4D:5E', // As per latest user requirement
                isminT_ISPIPAddress: '192.168.1.100', // As per latest user requirement
                transnumbconfigurationsettingsss: {
                    imN_AutoManualFlag: 'Auto'
                }
            };

            // Recipient mapping logic based on user examples
            if (mode === 'Individual') {
                payload.istinT_ToId = toId;
            } else {
                // Group Mode: Use arrays
                if (userFlag === 'Student') {
                    payload.arrayStudent = students
                        .filter((s) => selectedGroupItems.includes(s.AMST_Id!))
                        .map((s) => ({ AMST_Id: s.AMST_Id! }));
                } else {
                    payload.arrayTeachers = recipients
                        .filter((r) => selectedGroupItems.includes(r.HRME_Id!))
                        .map((r) => ({ HRME_Id: r.HRME_Id! }));
                }
            }

            const res = await saveInteraction(payload);

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
        <div className='flex flex-col gap-6 py-4'>
            {/* Recipient Selection Box */}
            <div
                className={cn(
                    'mx-auto w-full max-w-4xl rounded-none border border-slate-200 bg-white p-6 shadow-sm',
                    isSubmitting && 'pointer-events-none opacity-50'
                )}>
                <div className='flex flex-col items-center gap-6'>
                    {/* Radio Group for Role Selection - Boxed like legacy */}
                    <div className='w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm'>
                        <RadioGroup
                            value={userFlag}
                            onValueChange={setUserFlag}
                            className='flex w-full flex-wrap items-center justify-center gap-x-12 gap-y-4'>
                            {availableUserTypes.map((type) => (
                                <div key={type.id} className='flex items-center space-x-2'>
                                    <RadioGroupItem
                                        value={type.id}
                                        id={`role-${type.id}`}
                                        className='h-4 w-4 border-[#1e40af] text-[#1e40af]'
                                    />
                                    <Label
                                        htmlFor={`role-${type.id}`}
                                        className='cursor-pointer whitespace-nowrap font-semibold text-[12px] text-slate-600'>
                                        {type.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {/* Dependent Dropdowns - Dynamic Labels */}
                    <div className='mt-2 grid w-full max-w-2xl gap-4'>
                        {userFlag === 'Student' && (
                            <>
                                <div className='flex items-center gap-4'>
                                    <Label className='w-48 text-right font-bold text-[12px] text-slate-600'>Class :*</Label>
                                    <select
                                        className='h-9 flex-1 rounded-none border border-slate-300 px-3 text-[12px] outline-none transition-all focus:border-[#1e40af]'
                                        value={selectedClass}
                                        onChange={(e) => handleClassChange(e.target.value)}>
                                        <option value=''>Select Class</option>
                                        {classList.map((cls: any) => (
                                            <option key={cls.ASMCL_Id} value={cls.ASMCL_Id.toString()}>
                                                {cls.ASMCL_ClassName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className='flex items-center gap-4'>
                                    <Label className='w-48 text-right font-bold text-[12px] text-slate-600'>Section :*</Label>
                                    <select
                                        className='h-9 flex-1 rounded-none border border-slate-300 px-3 text-[12px] outline-none transition-all focus:border-[#1e40af] disabled:opacity-50'
                                        value={selectedSection}
                                        onChange={(e) => handleSectionChange(e.target.value)}
                                        disabled={!selectedClass}>
                                        <option value=''>Select Section</option>
                                        {sections.map((sec: any, idx: number) => (
                                            <option key={`${sec.asmS_Id || 'sec'}-${idx}`} value={sec.asmS_Id.toString()}>
                                                {sec.asmC_SectionName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        {mode === 'Individual' ? (
                            <div className='flex items-center gap-4'>
                                <Label className='w-48 text-right font-bold text-[12px] text-slate-600'>
                                    {availableUserTypes.find((t) => t.id === userFlag)?.label || 'Recipient'} :*
                                </Label>
                                <select
                                    className='h-9 flex-1 rounded-none border border-[#1e40af]/30 px-3 text-[12px] outline-none transition-all focus:border-[#1e40af] disabled:border-slate-200 disabled:bg-slate-50'
                                    value={selectedRecipientId}
                                    onChange={(e) => setSelectedRecipientId(e.target.value)}
                                    disabled={!userFlag || (userFlag === 'Student' && (!selectedSection || !selectedClass))}>
                                    <option value=''>Select {userFlag || 'Recipient'}</option>
                                    {(userFlag === 'Student' ? filteredStudentsList : filteredRecipientsList).map((item, idx) => {
                                        const id = userFlag === 'Student' ? item.AMST_Id! : item.HRME_Id!;
                                        const name = userFlag === 'Student' ? item.studentName : item.EmpName;
                                        const sub = userFlag === 'Student' ? item.AMST_AdmNo : item.HRME_EmployeeCode;
                                        const className =
                                            (item as any).ASMCL_ClassName || (item as any).classname || (item as any).ClassName;
                                        const sectionName =
                                            (item as any).ASMC_SectionName || (item as any).sectionname || (item as any).SectionName;
                                        const subjectName =
                                            (item as any).ISMS_SubjectName || (item as any).subjectname || (item as any).SubjectName;

                                        const contextArr = [];
                                        if (className) contextArr.push(className);
                                        if (sectionName) contextArr.push(sectionName);
                                        if (subjectName) contextArr.push(subjectName);
                                        const context = contextArr.length > 0 ? ` - ${contextArr.join(' - ')}` : '';
                                        return (
                                            <option key={`${id || 'item'}-${idx}`} value={id.toString()}>
                                                {idx + 1}. {name}
                                                {sub ? ` (${sub})` : ''}
                                                {context}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        ) : (
                            <div className='flex flex-col gap-4 border border-slate-200 p-4'>
                                <div className='mb-2 flex items-center justify-between border-slate-100 border-b pb-2'>
                                    <div className='flex items-center gap-2'>
                                        <Checkbox
                                            id='select-all'
                                            checked={
                                                (userFlag === 'Student' ? students : recipients).length > 0 &&
                                                selectedGroupItems.length === (userFlag === 'Student' ? students : recipients).length
                                            }
                                            onCheckedChange={handleSelectAll}
                                            className='h-4 w-4 border-[#1e40af] data-[state=checked]:bg-[#1e40af]'
                                        />
                                        <Label htmlFor='select-all' className='cursor-pointer font-bold text-[11px] text-slate-500'>
                                            SELECT ALL
                                        </Label>
                                    </div>
                                    <div className='relative w-48'>
                                        <Input
                                            placeholder='Search...'
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className='h-7 rounded-none border-slate-200 pl-7 text-[10px] focus-visible:ring-0'
                                        />
                                        <Search className='absolute top-1.5 left-2 h-3.5 w-3.5 text-slate-400' />
                                    </div>
                                </div>
                                <ScrollArea className='h-64 pr-4'>
                                    <div className='space-y-1'>
                                        {(userFlag === 'Student' ? filteredStudentsList : filteredRecipientsList).map((item, idx) => {
                                            const id = userFlag === 'Student' ? item.AMST_Id! : item.HRME_Id!;
                                            const name = userFlag === 'Student' ? item.studentName : item.EmpName;
                                            const sub = userFlag === 'Student' ? item.AMST_AdmNo : item.HRME_EmployeeCode;
                                            const className = (item as any).ASMCL_ClassName;
                                            const sectionName = (item as any).ASMC_SectionName;
                                            const subjectName = (item as any).ISMS_SubjectName;
                                            const contextArr = [];
                                            if (className) contextArr.push(className);
                                            if (sectionName) contextArr.push(sectionName);
                                            if (subjectName) contextArr.push(subjectName);
                                            const context = contextArr.length > 0 ? ` - ${contextArr.join(' - ')}` : '';
                                            return (
                                                <div
                                                    key={`${id || 'grp'}-${idx}`}
                                                    className='flex items-center gap-3 px-2 py-1 transition-colors hover:bg-slate-50'>
                                                    <Checkbox
                                                        id={`item-${id}-${idx}`}
                                                        checked={selectedGroupItems.includes(id)}
                                                        onCheckedChange={() => toggleItemSelection(id)}
                                                        className='h-3.5 w-3.5 border-slate-400 data-[state=checked]:border-[#1e40af] data-[state=checked]:bg-[#1e40af]'
                                                    />
                                                    <Label
                                                        htmlFor={`item-${id}-${idx}`}
                                                        className='flex-1 cursor-pointer text-[11px] text-slate-600'>
                                                        {idx + 1}. {name}
                                                        {sub ? <span className='ml-1 font-normal text-slate-400'>({sub})</span> : ''}
                                                        {context}
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                        {(userFlag === 'Student' ? students : recipients).length === 0 && (
                                            <div className='py-8 text-center text-[11px] text-slate-400'>No items found</div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Message Area */}
            <div className='mx-auto w-full max-w-4xl overflow-hidden rounded-none border border-[#1e40af]/30 bg-white shadow-md'>
                {/* Legacy Header */}
                <div className='flex items-center justify-between border-orange-200 border-t-2 border-t-orange-400 border-b bg-slate-50 px-4 py-2'>
                    <h3 className='font-black text-[#1e40af] text-[11px] uppercase tracking-wider'>NEW MESSAGE</h3>
                    <div className='flex items-center gap-2 font-black text-[10px] text-slate-400'>
                        {isMounted ? format(new Date(), 'dd/MM/yyyy hh:mm a') : '   /  /     :   '}
                    </div>
                </div>

                <div className='space-y-6 p-8'>
                    <div className='flex gap-4'>
                        <Label className='mt-2.5 w-48 text-right font-bold text-[12px] text-slate-600 uppercase'>Subject :*</Label>
                        <Input
                            placeholder='Interaction Subject'
                            className='h-10 flex-1 rounded-none border-slate-300 bg-white text-[12px] focus-visible:border-[#1e40af] focus-visible:ring-0'
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>

                    <div className='flex gap-4'>
                        <Label className='mt-2.5 w-48 text-right font-bold text-[12px] text-slate-600 uppercase'>Message :*</Label>
                        <Textarea
                            placeholder='Message'
                            className='min-h-[180px] flex-1 resize-none rounded-none border-slate-300 bg-white text-[12px] focus-visible:border-[#1e40af] focus-visible:ring-0'
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>

                    {/* Single File Upload in Legacy Style */}
                    <div className='ml-48 flex flex-col gap-3 pl-4'>
                        <div className='flex items-center gap-4'>
                            <div className='group relative'>
                                <Button className='flex h-8 items-center gap-2 rounded-none bg-[#245a8e] px-4 font-bold text-[11px] uppercase tracking-wider hover:bg-[#1e4a7a]'>
                                    Browse
                                    <Send className='h-3.5 w-3.5 rotate-[270deg]' />
                                </Button>
                                <input type='file' className='absolute inset-0 cursor-pointer opacity-0' onChange={handleFileChange} />
                            </div>

                            {file && (
                                <div className='flex items-center gap-3'>
                                    <span className='max-w-[200px] truncate font-bold text-[#1e40af] text-[11px]'>{file.name}</span>
                                    <div className='flex items-center gap-1'>
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() => {
                                                if (file) {
                                                    handleViewFile(file);
                                                }
                                            }}
                                            className='h-7 px-2 font-bold text-[#245a8e] text-[10px] uppercase hover:bg-blue-50 hover:text-blue-700'>
                                            View
                                        </Button>
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={downloadFile}
                                            className='h-7 px-2 font-bold text-[#245a8e] text-[10px] uppercase hover:bg-blue-50 hover:text-blue-700'>
                                            Download
                                        </Button>
                                        <button onClick={removeFile} className='ml-1 text-red-500 hover:text-red-700'>
                                            <X className='h-4 w-4' />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className='mt-1 font-bold text-[10px] text-red-600'>Accept File: jpg, jpeg, png, doc, ppt, excel, pdf</p>
                    </div>
                </div>

                {/* Legacy Footer Buttons */}
                <div className='flex justify-center gap-4 border-slate-100 border-t bg-slate-50 p-6'>
                    <Button
                        className='flex h-10 min-w-[120px] items-center gap-2 rounded-none bg-[#245a8e] font-black text-[12px] uppercase tracking-wider shadow-sm hover:bg-[#1e4a7a]'
                        onClick={handleSubmit}
                        disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className='h-4 w-4 animate-spin' /> : <Send className='h-4 w-4' />}
                        SEND
                    </Button>
                    <Button
                        className='flex h-10 min-w-[120px] items-center gap-2 rounded-none bg-orange-600 font-black text-[12px] uppercase tracking-wider shadow-sm hover:bg-orange-700'
                        onClick={onCancel}
                        disabled={isSubmitting}>
                        <X className='h-4 w-4' />
                        CANCEL
                    </Button>
                </div>
            </div>

            {/* In-Browser File Preview Modal */}
            <Dialog
                open={!!previewFile}
                onOpenChange={(open) => {
                    if (!open) {
                        setPreviewFile(null);
                        setXlsxPreviewData(null);
                        setDocxPreviewHtml(null);
                    }
                }}>
                <DialogContent className='flex max-h-[90vh] max-w-4xl flex-col overflow-hidden rounded-none border-2 border-[#245a8e] p-0 shadow-2xl'>
                    <DialogHeader className='flex-row items-center justify-between space-y-0 bg-[#245a8e] p-4 text-white'>
                        <DialogTitle className='truncate pr-8 font-bold text-sm uppercase tracking-wider'>{previewFile?.name}</DialogTitle>
                        <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 rounded-none text-white hover:bg-white/20'
                            onClick={() => setPreviewFile(null)}>
                            <X className='h-5 w-5' />
                        </Button>
                    </DialogHeader>
                    <div className='flex min-h-[400px] flex-1 items-center justify-center overflow-auto bg-slate-50 p-6'>
                        {previewFile &&
                            (previewFile.type?.startsWith('video/') ? (
                                <video src={previewFile.url} controls className='max-h-full max-w-full shadow-lg' autoPlay />
                            ) : previewFile.type?.startsWith('audio/') ? (
                                <div className='flex w-full max-w-md flex-col items-center gap-6 border border-slate-200 bg-white p-10 shadow-xl'>
                                    <div className='flex h-20 w-20 items-center justify-center bg-slate-100'>
                                        <FileText className='h-10 w-10 text-[#245a8e]' />
                                    </div>
                                    <audio src={previewFile.url} controls className='w-full' autoPlay />
                                    <p className='font-bold text-slate-500 text-xs uppercase tracking-tighter'>{previewFile.name}</p>
                                </div>
                            ) : previewFile.type === 'application/pdf' ||
                              previewFile.type?.startsWith('image/') ||
                              previewFile.name.toLowerCase().endsWith('.docx') ||
                              previewFile.name.toLowerCase().endsWith('.doc') ? (
                                <iframe
                                    src={previewFile.url}
                                    className='h-full min-h-[600px] w-full rounded-lg border-none'
                                    title={previewFile.name}
                                />
                            ) : xlsxPreviewData &&
                              (previewFile.name.toLowerCase().endsWith('.xlsx') || previewFile.name.toLowerCase().endsWith('.xls')) ? (
                                <div className='flex h-full min-h-[500px] w-full flex-col overflow-hidden border border-slate-200 bg-white shadow-inner'>
                                    <div className='flex items-center justify-between border-b bg-slate-100 px-4 py-2'>
                                        <span className='font-bold text-[10px] text-slate-500 uppercase tracking-wider'>
                                            Excel Preview (First 50 Rows)
                                        </span>
                                        <Badge
                                            variant='outline'
                                            className='rounded-none border-green-200 bg-green-50 text-[9px] text-green-700'>
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
                                                                'transition-colors hover:bg-slate-50',
                                                                rIdx === 0 && 'border-b-2 bg-slate-100 font-bold'
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
                                                <div className='mt-2 border-t border-dashed bg-slate-50 p-4 text-center font-bold text-slate-400 text-xs uppercase'>
                                                    Showing first 50 rows. Download to see all {xlsxPreviewData.length} rows.
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            ) : (
                                <div className='border border-slate-300 border-dashed bg-white p-12 text-center'>
                                    <FileText className='mx-auto mb-4 h-12 w-12 text-slate-300' />
                                    <p className='font-bold text-slate-400 text-sm uppercase tracking-widest'>
                                        Preview not available for this file type
                                    </p>
                                    <Button variant='link' onClick={downloadFile} className='mt-2 font-bold text-[#245a8e]'>
                                        Download anyway
                                    </Button>
                                </div>
                            ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
