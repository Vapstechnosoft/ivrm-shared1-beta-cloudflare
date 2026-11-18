'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { DataTableRef } from '@/components/ui/data-table/data-table';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    useForgotOTP,
    useSaveStatusData,
    useSearchStatusData,
    useStatusInitialData,
    useVerifyOTP
} from '@/hooks/admission/preadmission/useStatus';
import { useActivePreadmissionDetails } from '@/hooks/admission/preadmission/useTransactions';
import type { IStatusStudent } from '@/types/admission/preadmission/status';
import { Book, CheckSquare, FileDown, Printer, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { tableSearchVariables } from '@/lib/data-table.config';
import * as XLSX from 'xlsx';
import AddressBookView from './_components/address-book-view';
import { getStatusColumns } from './_components/columns';
import StatusPrintView from './_components/status-print-view';
import Swal from 'sweetalert2';

export default function PreadmissionStatusPage() {
    const { data: activePreadmission } = useActivePreadmissionDetails();
    const { data: initialData } = useStatusInitialData();
    console.log(initialData);
    const searchMutation = useSearchStatusData();
    const saveMutation = useSaveStatusData();
    const forgotOTPMutation = useForgotOTP();
    const verifyOTPMutation = useVerifyOTP();
    const [isPending, startTransition] = useTransition();

    // Form State
    const [statusType, setStatusType] = useState('Appsts');
    const [asmayId, setAsmayId] = useState<number>(0);
    const [asmclId, setAsmclId] = useState<number | ''>('');
    const [pamstId, setPamstId] = useState<number>(0);

    // Grid Data (Combined to avoid double renders)
    const [gridData, setGridData] = useState<{ list: IStatusStudent[]; rptStatus: boolean }>({ list: [], rptStatus: false });
    const [selectedStudents, setSelectedStudents] = useState<IStatusStudent[]>([]);
    const [printData, setPrintData] = useState<any[]>([]);
    const [bulkStudentStatus, setBulkStudentStatus] = useState<string>('786');



    // Communication State
    const [sendEmail, setSendEmail] = useState(false);
    const [sendSms, setSendSms] = useState(false);
    const [sendDefault, setSendDefault] = useState(false);

    const [emailSubject, setEmailSubject] = useState('');
    const [emailHeader, setEmailHeader] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [emailFooter, setEmailFooter] = useState('');
    const [smsContent, setSmsContent] = useState('');
    const [sendWhatsapp, setSendWhatsapp] = useState(false);

    // OTP State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [otpType, setOtpType] = useState('Appsts');
    const [otpValue, setOtpValue] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpRequired, setOtpRequired] = useState(false);
    const [maskedMobile, setMaskedMobile] = useState('');
    const [maskedEmail, setMaskedEmail] = useState('');

    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));
    const [currentPage] = useQueryState(tableSearchVariables.page, parseAsInteger.withDefault(1));
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withDefault(10));

    const filteredStudents = useMemo(() => {
        if (!searchQuery) return gridData.list;
        const lowerQuery = searchQuery.toLowerCase();
        return gridData.list.filter((s) => {
            return (
                (s.name && String(s.name).toLowerCase().includes(lowerQuery)) ||
                (s.pasR_RegistrationNo && String(s.pasR_RegistrationNo).toLowerCase().includes(lowerQuery)) ||
                (s.className && String(s.className).toLowerCase().includes(lowerQuery)) ||
                (s.statusName && String(s.statusName).toLowerCase().includes(lowerQuery))
            );
        });
    }, [gridData.list, searchQuery]);

    const paginatedStudents = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredStudents.slice(startIndex, startIndex + pageSize);
    }, [filteredStudents, currentPage, pageSize]);

    const tableRef = useRef<DataTableRef>(null);
    const printRef = useRef<HTMLDivElement>(null);
    const addressBookRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({ contentRef: printRef });
    const handleAddressBookPrint = useReactToPrint({ contentRef: addressBookRef });

    const handleExportExcel = useCallback(() => {
        if (selectedStudents.length === 0) {
            toast.error('Please select records to be exported');
            return;
        }
        const exportData = selectedStudents.map((user, index) => ({
            'SL.No': index + 1,
            Name: user.name,
            Class: user.className,
            RegNo: user.pasR_RegistrationNo,
            Status: user.statusName,
            'Father Name': user.pasR_FatherName,
            'Mobile No.': user.pasR_MobileNo,
            Email: user.pasR_emailId,
            Address:
                `${user.pasR_ConStreet || ''} ${user.pasR_ConArea || ''} ${user.pasR_ConCity || ''} ${user.pasR_ConPincode || ''}`.trim()
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Status Report');
        XLSX.writeFile(wb, 'Status_Report.xlsx');
    }, [selectedStudents]);

    const statusOptions = useMemo(() => {
        if (statusType === 'Appsts') {
            return [
                { pamsT_Id: 787926, pamsT_Status: 'APP WAITING' },
                { pamsT_Id: 787927, pamsT_Status: 'APP REJECTED' },
                { pamsT_Id: 787928, pamsT_Status: 'APP ACCEPTED' }
            ];
        }
        return initialData?.data?.statuslist || [];
    }, [statusType, initialData]);

    const handlePrintAction = useCallback(() => {
        if (selectedStudents.length === 0) return;
        setPrintData(
            selectedStudents.map((s) => ({
                ...s,
                statusName: statusOptions.find((opt) => opt.pamsT_Id === s.pamsT_Id)?.pamsT_Status || s.statusName,
                remark: s.remarks || s.remark
            }))
        );
        setTimeout(() => {
            handlePrint();
        }, 500);
    }, [selectedStudents, statusOptions, handlePrint]);

    const handleAddressBookPrintAction = useCallback(() => {
        if (selectedStudents.length === 0) return;
        setPrintData(selectedStudents);
        setTimeout(() => {
            handleAddressBookPrint();
        }, 500);
    }, [selectedStudents, handleAddressBookPrint]);

    useEffect(() => {
        if (activePreadmission?.data) {
            setAsmayId(activePreadmission.data.asmaY_Id);
        }
    }, [activePreadmission]);

    useEffect(() => {
        const config = localStorage.getItem('ivrmgeneralconfiglist');
        if (config) {
            const parsed = JSON.parse(config);
            if (parsed?.[0]) {
                const c = parsed[0];
                setOtpRequired(c.ivrmgC_emailValOTPFlag === 1 || c.ivrmgC_MobileValOTPFlag === 1);
                if (c.ivrmgC_OTPMobileNo) setMaskedMobile(String(c.ivrmgC_OTPMobileNo).substring(String(c.ivrmgC_OTPMobileNo).length - 4));
                if (c.ivrmgC_OTPMailId) setMaskedEmail(c.ivrmgC_OTPMailId.substring(0, 4));
            }
        }
    }, []);

    const handleSearch = async () => {
        if (!asmayId) return toast.error('Please select Academic Year');
        if (asmclId === undefined || asmclId === null || asmclId.toString() === '') return toast.error('Please select Class');
        if (!pamstId) return toast.error('Please select Status');
        setSelectedStudents([]);
        try {
            const response = await searchMutation.mutateAsync({
                ASMAY_Id: asmayId,
                ASMCL_Id: asmclId,
                PAMST_Id: pamstId,
                status_type: statusType
            });
            if (response?.data && Array.isArray(response.data)) {
                const list = response.data.map((s: any) => ({
                    ...s,
                    name: `${s.pasR_FirstName || ''} ${s.pasR_MiddleName && s.pasR_MiddleName !== 'False' ? s.pasR_MiddleName : ''} ${s.pasR_LastName && s.pasR_LastName !== 'False' ? s.pasR_LastName : ''}`
                        .replace(/\s+/g, ' ')
                        .trim(),
                    selected: false,
                    remarks: ''
                }));
                setGridData({ list, rptStatus: list.length > 0 && list[0].statusFlag === 'RPT' });
                if (list.length === 0) toast.info('No records found');
            }
        } catch (error) {
            toast.error('An error occurred during search');
        }
    };

    const handleIndividualStatusChange = useCallback((studentId: number, statusId: number) => {
        setGridData((prev) => ({ ...prev, list: prev.list.map((s) => (s.pasR_Id === studentId ? { ...s, pamsT_Id: statusId } : s)) }));
        setSelectedStudents((prev) => prev.map((s) => (s.pasR_Id === studentId ? { ...s, pamsT_Id: statusId } : s)));
    }, []);

    const handleIndividualRemarkChange = useCallback((studentId: number, remark: string) => {
        setGridData((prev) => ({ ...prev, list: prev.list.map((s) => (s.pasR_Id === studentId ? { ...s, remarks: remark } : s)) }));
    }, []);

    const handleBulkStatusChange = useCallback((val: string) => {
        setBulkStudentStatus(val);
        if (val === '786') return;
        const statusId = Number(val);

        setGridData((prev) => ({
            ...prev,
            list: prev.list.map((s) => ({ ...s, pamsT_Id: statusId }))
        }));
        setSelectedStudents((prev) => prev.map((s) => ({ ...s, pamsT_Id: statusId })));
    }, []);

    const handleUpdateStatus = () => {
        if (selectedStudents.length === 0) return toast.error('Kindly select at least one student');
        if (selectedStudents.some((s) => !s.pamsT_Id || s.pamsT_Id === 786))
            return toast.error('Please select an update status for all selected students');
        if (otpRequired && (sendEmail || sendSms || sendDefault)) setShowOtpModal(true);
        else setShowConfirmModal(true);
    };

    const handleFinalSave = async () => {
        try {
            const res = await saveMutation.mutateAsync({
                _type: statusType,
                data_array: selectedStudents.map((s) => ({
                    pasR_Id: s.pasR_Id,
                    PAMST_Id: s.pamsT_Id,
                    remarks: s.remarks || '',
                    PASR_MobileNo: s.pasR_MobileNo,
                    PASR_emailId: s.pasR_emailId,
                    MI_Id: (s as any).mI_Id || 0,
                    className: s.className
                })),
                defaultsmsemail: sendDefault,
                smscheck: sendSms,
                emailcheck: sendEmail,
                whatsapp: sendWhatsapp,
                smscontent: smsContent,
                header: emailHeader,
                Subject: emailSubject,
                Message: emailMessage,
                Footer: emailFooter,
                count: selectedStudents.length
            });

            if (res?.success) {
                setShowConfirmModal(false);
                Swal.fire({
                    title: 'Success!',
                    text: res.message || 'Status updated successfully',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                }).then(() => {
                    window.location.reload();
                });
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: res?.message || 'Failed to update status',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'An error occurred while saving',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        }
    };

    const handleSendOtp = async () => {
        try {
            await forgotOTPMutation.mutateAsync({ clickedlinkname: otpType === 'M' ? 'Mobile' : 'Email', Mobile: '', Email: '' });
            setShowOtpModal(false);
            setShowConfirmModal(true);
        } catch (error) {
            toast.error('Failed to send OTP');
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const res = await verifyOTPMutation.mutateAsync({ EMAILOTP: otpValue });
            if (res?.data === 'Success') {
                setOtpVerified(true);
                toast.success('OTP verified');
            } else toast.error('OTP mismatch');
        } catch (error) {
            toast.error('OTP verification failed');
        }
    };

    const columns = useMemo(() => {
        return getStatusColumns(statusOptions, handleIndividualStatusChange, handleIndividualRemarkChange, gridData.rptStatus, currentPage, pageSize).filter(
            (col) => {
                if (col.id === 'updateStatus' && gridData.rptStatus) return false;
                if ((col as any).accessorKey === 'repeat_Class_Id' && !gridData.rptStatus) return false;
                return true;
            }
        );
    }, [statusOptions, gridData.rptStatus, handleIndividualStatusChange, handleIndividualRemarkChange, currentPage, pageSize]);

    return (
        <div className='flex flex-col gap-6 p-4'>
            {/* {activePreadmission?.data && (
                <div className='flex flex-wrap items-center justify-between gap-6 rounded-lg border bg-muted/50 p-4 shadow-sm'>
                    <div className='flex items-center gap-3'>
                        <div className='rounded-full bg-primary/10 p-2'><Calendar className='h-5 w-5 text-primary' /></div>
                        <div>
                            <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Active Academic Year</p>
                            <p className='text-lg font-bold text-foreground'>{activePreadmission.data.asmaY_Year}</p>
                        </div>
                    </div>
                    <div className='flex gap-8'>
                        <div className='flex flex-col'><p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Start Date</p><p className='font-semibold'>{format(new Date(activePreadmission.data.asmaY_PreAdm_F_Date), 'dd-MM-yyyy')}</p></div>
                        <div className='flex flex-col border-l pl-8'><p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>End Date</p><p className='font-semibold'>{format(new Date(activePreadmission.data.asmaY_PreAdm_T_Date), 'dd-MM-yyyy')}</p></div>
                    </div>
                </div>
            )} */}

            <CollapsibleSection title='Preadmission Status Search' defaultOpen>
                <div className='flex flex-col gap-6'>
                    <div className='mb-2 flex justify-center'>
                        <div className='flex gap-8 rounded-full border bg-muted/30 px-8 py-3 shadow-inner'>
                            <RadioGroup
                                value={statusType}
                                onValueChange={(v) => {
                                    setStatusType(v);
                                    setGridData({ list: [], rptStatus: false });
                                    setSelectedStudents([]);
                                }}
                                className='flex gap-10'>
                                <div className='flex items-center space-x-3'>
                                    <RadioGroupItem value='Appsts' id='appsts' className='h-5 w-5 border-2 border-primary' />
                                    <Label htmlFor='appsts' className='cursor-pointer font-bold text-base'>
                                        Application Status
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-3'>
                                    <RadioGroupItem value='admsts' id='admsts' className='h-5 w-5 border-2 border-primary' />
                                    <Label htmlFor='admsts' className='cursor-pointer font-bold text-base'>
                                        Admission Status
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                    <div className='mx-auto w-full max-w-2xl space-y-4 rounded-xl border bg-background p-8 shadow-sm'>
                        <div className='grid grid-cols-3 items-center gap-4'>
                            <Label className='text-right font-semibold'>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                            <div className='col-span-2'>
                                <Select value={String(asmayId)} onValueChange={(v) => setAsmayId(Number(v))}>
                                    <SelectTrigger className='bg-muted/10'>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {initialData?.data?.academicList?.map((y: any) => (
                                            <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                {y.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className='grid grid-cols-3 items-center gap-4'>
                            <Label className='text-right font-semibold'>
                                Class <span className='text-red-500'>*</span>
                            </Label>
                            <div className='col-span-2'>
                                <Select value={String(asmclId)} onValueChange={(v) => setAsmclId(Number(v))}>
                                    <SelectTrigger className='bg-muted/10'>
                                        <SelectValue placeholder='Select Class' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='0'>ALL</SelectItem>
                                        {initialData?.data?.classlist?.map((c: any) => (
                                            <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                                {c.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className='grid grid-cols-3 items-center gap-4'>
                            <Label className='text-right font-semibold'>
                                Status
                                <span className='text-red-500'>*</span>
                            </Label>
                            <div className='col-span-2'>
                                <Select value={String(pamstId)} onValueChange={(v) => setPamstId(Number(v))}>
                                    <SelectTrigger className='bg-muted/10'>
                                        <SelectValue placeholder='Select Status' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='0'>Select</SelectItem>
                                        {statusOptions.map((s: any) => (
                                            <SelectItem key={s.pamsT_Id} value={String(s.pamsT_Id)}>
                                                {s.pamsT_Status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className='flex justify-center gap-4 pt-6'>
                            <Button
                                onClick={handleSearch}
                                disabled={searchMutation.isPending}
                                className='bg-indigo-700 px-8 font-bold text-white uppercase shadow-md transition-all hover:bg-indigo-800 active:scale-95'>
                                <Search className='mr-2 h-4 w-4' /> Search
                            </Button>
                            <Button
                                variant='destructive'
                                onClick={() => window.location.reload()}
                                className='bg-orange-600 px-8 font-bold text-white uppercase shadow-md transition-all hover:bg-orange-700 active:scale-95'>
                                <X className='mr-2 h-4 w-4' /> Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            {gridData.list.length > 0 && (
                <>
                    <div className='flex justify-center gap-4 rounded-lg border bg-muted/20 p-4 shadow-sm'>
                        <Button
                            variant='secondary'
                            onClick={handleExportExcel}
                            disabled={selectedStudents.length === 0}
                            className='border-indigo-200 font-bold hover:bg-indigo-50'>
                            <FileDown className='mr-2 h-4 w-4' /> Export to Excel
                        </Button>
                        <Button
                            variant='secondary'
                            onClick={handlePrintAction}
                            disabled={selectedStudents.length === 0}
                            className='border-indigo-200 font-bold hover:bg-indigo-50'>
                            <Printer className='mr-2 h-4 w-4' /> Print
                        </Button>
                        <Button
                            variant='secondary'
                            onClick={handleAddressBookPrintAction}
                            disabled={selectedStudents.length === 0}
                            className='border-indigo-200 font-bold hover:bg-indigo-50'>
                            <Book className='mr-2 h-4 w-4' /> Address Book
                        </Button>
                    </div>

                    <CollapsibleSection title='Status Details' defaultOpen>
                        <div className='mb-4 flex flex-wrap items-end justify-between gap-4'>
                            <div className='flex flex-col gap-1'>
                                <Label className='font-bold text-muted-foreground text-xs uppercase tracking-wider'>
                                    Total Grid Records
                                </Label>
                                <span className='inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-500/10 px-3 py-1 font-bold text-blue-600 text-sm shadow-sm'>
                                    {gridData.list.length}
                                </span>
                            </div>
                            <div className='flex flex-col gap-2'>
                                <Label>Update Status All</Label>
                                <div className='flex gap-2'>
                                    <Select
                                        value={bulkStudentStatus}
                                        onValueChange={(v) => {
                                            setBulkStudentStatus(v);
                                            handleBulkStatusChange(v);
                                        }}>
                                        <SelectTrigger className='w-[200px]'>
                                            <SelectValue placeholder='None' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='786'>None</SelectItem>
                                            {statusOptions.map((s: any) => (
                                                <SelectItem key={s.pamsT_Id} value={String(s.pamsT_Id)}>
                                                    {s.pamsT_Status}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <GenericDataTable<IStatusStudent>
                            columns={columns}
                            data={paginatedStudents}
                            totalItems={filteredStudents.length}
                            isLoading={searchMutation.isPending}
                            onRowSelectionChange={setSelectedStudents}
                            getRowId={(row) => row.pasR_Id.toString()}
                            ref={tableRef}
                            isSearchRequired={true}
                            isPaginationRequired={true}
                            manualPagination={true}
                        />

                        <div className='mt-8 rounded-lg border bg-card p-6 shadow-sm'>
                            <div className='mb-6 flex justify-center gap-8'>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='email'
                                        checked={sendEmail}
                                        onCheckedChange={(v) => {
                                            setSendEmail(!!v);
                                            if (v) setSendDefault(false);
                                        }}
                                    />
                                    <Label htmlFor='email' className='cursor-pointer font-bold'>
                                        EMAIL
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='sms'
                                        checked={sendSms}
                                        onCheckedChange={(v) => {
                                            setSendSms(!!v);
                                            if (v) setSendDefault(false);
                                        }}
                                    />
                                    <Label htmlFor='sms' className='cursor-pointer font-bold'>
                                        SMS
                                    </Label>
                                </div>
                                {statusType === 'admsts' && (
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox
                                            id='default'
                                            checked={sendDefault}
                                            onCheckedChange={(v) => {
                                                setSendDefault(!!v);
                                                if (v) {
                                                    setSendEmail(false);
                                                    setSendSms(false);
                                                    setSendWhatsapp(false);
                                                }
                                            }}
                                        />
                                        <Label htmlFor='default' className='cursor-pointer font-bold'>
                                            Default SMS & E-mail (Confirmed Status)
                                        </Label>
                                    </div>
                                )}
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='whatsapp'
                                        checked={sendWhatsapp}
                                        onCheckedChange={(v) => {
                                            setSendWhatsapp(!!v);
                                            if (v) setSendDefault(false);
                                        }}
                                    />
                                    <Label htmlFor='whatsapp' className='cursor-pointer font-bold'>
                                        WhatsApp
                                    </Label>
                                </div>
                            </div>
                            <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                                {sendEmail && (
                                    <div className='space-y-4 border-r pr-4'>
                                        <h4 className='border-b pb-2 font-bold'>Email Configuration</h4>
                                        <div className='flex flex-col gap-2'>
                                            <Label>Email Subject *</Label>
                                            <Input
                                                value={emailSubject}
                                                onChange={(e) => setEmailSubject(e.target.value)}
                                                placeholder='Subject'
                                                maxLength={50}
                                            />
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <Label>Email Header *</Label>
                                            <Input
                                                value={emailHeader}
                                                onChange={(e) => setEmailHeader(e.target.value)}
                                                placeholder='Header'
                                                maxLength={50}
                                            />
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <Label>Email Message *</Label>
                                            <Textarea
                                                value={emailMessage}
                                                onChange={(e) => setEmailMessage(e.target.value)}
                                                placeholder='Type your message...'
                                            />
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <Label>Email Footer *</Label>
                                            <Input
                                                value={emailFooter}
                                                onChange={(e) => setEmailFooter(e.target.value)}
                                                placeholder='Footer'
                                                maxLength={50}
                                            />
                                        </div>
                                    </div>
                                )}
                                {sendSms && (
                                    <div className='space-y-4'>
                                        <h4 className='border-b pb-2 font-bold'>SMS Configuration</h4>
                                        <div className='flex flex-col gap-2'>
                                            <Label>SMS Content *</Label>
                                            <Textarea
                                                value={smsContent}
                                                onChange={(e) => setSmsContent(e.target.value)}
                                                placeholder='Type SMS content...'
                                                rows={5}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className='mt-8 flex justify-center'>
                                <Button size='lg' className='h-12 px-8' onClick={handleUpdateStatus}>
                                    <CheckSquare className='mr-2 h-5 w-5' /> Update Status
                                </Button>
                            </div>
                        </div>
                    </CollapsibleSection>
                </>
            )}

            <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className='text-center text-destructive'>OTP Selection</DialogTitle>
                    </DialogHeader>
                    <div className='py-6 text-center'>
                        <RadioGroup value={otpType} onValueChange={setOtpType} className='mb-6 flex justify-center gap-8'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='M' id='otp-m' />
                                <Label htmlFor='otp-m'>Mobile OTP</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='E' id='otp-e' />
                                <Label htmlFor='otp-e'>Email OTP</Label>
                            </div>
                        </RadioGroup>
                        {otpType === 'M' ? (
                            <div className='space-y-2'>
                                <p className='font-bold text-destructive uppercase tracking-tight'>
                                    OTP will be sent to Authorized Mobile No!!
                                </p>
                                <p className='font-mono text-xl'>******{maskedMobile}</p>
                            </div>
                        ) : (
                            <div className='space-y-2'>
                                <p className='font-bold text-destructive uppercase tracking-tight'>
                                    OTP will be sent to Authorized Email Id!!
                                </p>
                                <p className='font-mono text-xl lowercase'>{maskedEmail}******</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter className='justify-center sm:justify-center'>
                        <Button onClick={handleSendOtp}>SEND OTP</Button>
                        <Button variant='outline' onClick={() => setShowOtpModal(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <DialogContent className='max-w-4xl' onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className='text-center text-destructive'>Selected Students for Status Update</DialogTitle>
                    </DialogHeader>
                    <div className='max-h-[400px] overflow-auto py-4'>
                        <table className='w-full border-collapse border text-sm'>
                            <thead className='bg-muted'>
                                <tr>
                                    <th className='border p-2'>SL.NO</th>
                                    <th className='border p-2 text-left'>Name</th>
                                    <th className='border p-2 text-left'>Class Name</th>
                                    <th className='border p-2 text-left'>Current Status</th>
                                    <th className='border p-2 text-left text-primary'>New Status</th>
                                    <th className='border p-2'>Application No</th>
                                    <th className='border p-2'>Gender</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedStudents.map((s, i) => (
                                    <tr key={s.pasR_Id}>
                                        <td className='border p-2 text-center'>{i + 1}</td>
                                        <td className='border p-2'>{s.name}</td>
                                        <td className='border p-2'>{s.className}</td>
                                        <td className='border p-2'>{s.statusName}</td>
                                        <td className='border p-2 font-bold text-primary'>
                                            {statusOptions.find((opt) => opt.pamsT_Id === s.pamsT_Id)?.pamsT_Status || 'Select Status'}
                                        </td>
                                        <td className='border p-2 text-center'>{s.pasR_RegistrationNo}</td>
                                        <td className='border p-2 text-center'>{s.pasR_Sex}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className='space-y-4 border-t py-4'>
                        {(sendEmail || sendSms) && (
                            <div className='space-y-2 rounded-lg bg-muted/30 p-4 text-sm'>
                                {sendSms && (
                                    <div className='grid grid-cols-4 gap-4'>
                                        <span className='text-right font-bold'>SMS Content:</span>
                                        <span className='col-span-3'>{smsContent}</span>
                                    </div>
                                )}
                                {sendEmail && (
                                    <div className='space-y-2'>
                                        <div className='grid grid-cols-4 gap-4'>
                                            <span className='text-right font-bold'>Email Subject:</span>
                                            <span className='col-span-3'>{emailSubject}</span>
                                        </div>
                                        <div className='grid grid-cols-4 gap-4'>
                                            <span className='text-right font-bold'>Email Header:</span>
                                            <span className='col-span-3'>{emailHeader}</span>
                                        </div>
                                        <div className='grid grid-cols-4 gap-4'>
                                            <span className='text-right font-bold'>Email Message:</span>
                                            <span className='col-span-3 whitespace-pre-wrap'>{emailMessage}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {otpRequired && (sendEmail || sendSms || sendDefault) && !otpVerified && (
                            <div className='flex items-center justify-center gap-4 border-y bg-primary/5 py-4'>
                                <Label className='font-bold'>Enter OTP:</Label>
                                <Input
                                    type='password'
                                    className='w-48 text-center tracking-widest'
                                    placeholder='ENTER OTP'
                                    value={otpValue}
                                    onChange={(e) => setOtpValue(e.target.value)}
                                />
                                <Button size='sm' onClick={handleVerifyOtp}>
                                    Submit
                                </Button>
                                <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        setShowOtpModal(true);
                                    }}>
                                    Resend OTP
                                </Button>
                            </div>
                        )}
                    </div>
                    <DialogFooter className='justify-center sm:justify-center'>
                        <Button disabled={otpRequired && (sendEmail || sendSms || sendDefault) && !otpVerified} onClick={handleFinalSave}>
                            Update Status
                        </Button>
                        <Button variant='outline' onClick={() => setShowConfirmModal(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: 0,
                    height: 0,
                    overflow: 'visible',
                    opacity: 0,
                    pointerEvents: 'none',
                    zIndex: -1
                }}>
                <StatusPrintView
                    ref={printRef}
                    data={printData}
                    userName={typeof window !== 'undefined' ? localStorage.getItem('username') || '' : ''}
                />
                <AddressBookView ref={addressBookRef} data={printData} />
            </div>
        </div>
    );
}
