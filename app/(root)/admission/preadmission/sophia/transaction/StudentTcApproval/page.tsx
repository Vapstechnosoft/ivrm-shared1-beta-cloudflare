'use client';

import { format } from 'date-fns';
import { BookOpen, CheckCircle, Info, Loader2, RotateCcw, Search, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

import {
    useSophiaStudentTCApprovalDetails,
    useSophiaStudentTCApprovalLoadData,
    useSophiaStudentTCApprovalSave,
    useSophiaStudentTCApprovalUpdateIDs
} from '@/hooks/admission/preadmission/transactions/useSophiaStudentTCApproval';

export default function StudentTcApprovalPage() {
    const [asmayId, setAsmayId] = useState<number>(0);

    const { data: initialData, isLoading: isInitialLoading } = useSophiaStudentTCApprovalLoadData();
    const { data: detailsData, isLoading: isDetailsLoading, refetch: refetchDetails } = useSophiaStudentTCApprovalDetails(asmayId);

    const saveMutation = useSophiaStudentTCApprovalSave();
    const updateIDsMutation = useSophiaStudentTCApprovalUpdateIDs();

    /* -------------------- State -------------------- */
    const [studentList, setStudentList] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [userId, setUserId] = useState<string>('');

    /* -------------------- Effects -------------------- */
    useEffect(() => {
        if (initialData) {
            const years = initialData?.academicYear || initialData?.data?.academicYear || [];
            if (Array.isArray(years) && years.length > 0 && asmayId === 0) {
                const activeYear = years.find((y: any) => y.asmaY_ActiveFlag === 1) || years[0];
                if (activeYear) {
                    setAsmayId(activeYear.asmaY_Id);
                }
            }
        }
    }, [initialData, asmayId]);

    useEffect(() => {
        if (detailsData) {
            const list =
                detailsData?.studentList ||
                detailsData?.data?.studentList ||
                detailsData?.studenttcdetails ||
                detailsData?.data?.studenttcdetails ||
                [];
            const uId = detailsData?.user_id || detailsData?.data?.user_id || '';
            setUserId(String(uId));

            if (Array.isArray(list)) {
                setStudentList(
                    list.map((s) => ({
                        ...s,
                        selected: false,
                        ASTCA_Status: '',
                        ASTCA_Remarks: ''
                    }))
                );
            }
        }
    }, [detailsData]);

    /* -------------------- Helpers -------------------- */
    const filteredList = useMemo(() => {
        if (!searchQuery) return studentList;
        const q = searchQuery.toLowerCase();
        return studentList.filter(
            (s) =>
                (s.StudentName || '').toLowerCase().includes(q) ||
                (s.AMST_AdmNo || '').toLowerCase().includes(q) ||
                (s.FatherName || '').toLowerCase().includes(q)
        );
    }, [studentList, searchQuery]);

    /* -------------------- Handlers -------------------- */
    const toggleSelectAll = (checked: boolean) => {
        setStudentList((prev) => prev.map((s) => ({ ...s, selected: checked })));
    };

    const onStudentSelect = (idx: number, checked: boolean) => {
        const newList = [...studentList];
        newList[idx].selected = checked;
        setStudentList(newList);
    };

    const onFieldChange = (idx: number, field: string, val: any) => {
        const newList = [...studentList];
        newList[idx][field] = val;
        // Legacy logic: Remarks = Status when status changes
        if (field === 'ASTCA_Status') {
            newList[idx].ASTCA_Remarks = val;
        }
        setStudentList(newList);
    };

    const handleUpdateID = async (idx: number, field: string, value: string) => {
        const student = studentList[idx];
        const val = field === 'AMST_APAARId' ? Number(value) : value;

        const payload = {
            studentdata: [
                {
                    amsT_Id: student.AMST_Id,
                    amsT_PENNo: field === 'AMST_PENNo' ? value : student.AMST_PENNo,
                    amsT_BPLCardNo: field === 'AMST_BPLCardNo' ? value : student.AMST_BPLCardNo
                }
            ]
        };

        try {
            await updateIDsMutation.mutateAsync(payload);
            // Update local state
            const newList = [...studentList];
            newList[idx][field] = val;
            setStudentList(newList);
            toast.success('ID updated successfully');
        } catch (e) {
            toast.error('Failed to update ID');
        }
    };

    const handleApprove = async () => {
        const selected = studentList.filter((s) => s.selected);
        if (selected.length === 0) {
            toast.error('Please Select At Least One Check Box!');
            return;
        }

        const invalid = selected.some((s) => !s.ASTCA_Status || !s.ASTCA_Remarks?.trim());
        if (invalid) {
            toast.error('Status and Remarks are required for all selected students');
            return;
        }

        try {
            const payload = {
                selectedTCDATAlist: selected.map((s) => ({
                    asca_Id: s.ASCA_Id,
                    astca_Status: s.ASTCA_Status,
                    astca_Remarks: s.ASTCA_Remarks
                }))
            };
            const res = await saveMutation.mutateAsync(payload);
            if (res?.success) {
                toast.success(res?.message || 'Record Saved Successfully...!');
                refetchDetails();
            } else {
                toast.error(res?.message || 'Failed to approve TC');
            }
        } catch (e) {
            toast.error('Approval failed');
        }
    };

    const handleCancel = () => {
        refetchDetails();
        setSearchQuery('');
    };

    /* -------------------- UI -------------------- */
    return (
        <div className='min-h-screen space-y-6 p-4'>
            <CollapsibleSection
                title='Student TC Approval'
                description='Manage and approve student transfer certificate requests'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>
                <div className='space-y-6 bg-white p-6'>
                    {/* Filters Section Removed as per request */}

                    {isDetailsLoading ? (
                        <div className='flex flex-col items-center justify-center space-y-4 py-20'>
                            <Loader2 className='h-10 w-10 animate-spin text-indigo-500' />
                            <p className='animate-pulse text-muted-foreground'>Loading pending approvals...</p>
                        </div>
                    ) : studentList.length > 0 ? (
                        <div className='space-y-6'>
                            <div className='flex flex-wrap items-center justify-between gap-4'>
                                <div className='flex items-center gap-2'>
                                    <Badge variant='outline' className='border-indigo-200 bg-indigo-50 px-4 py-1 text-indigo-700'>
                                        {studentList.length} Pending Requests
                                    </Badge>
                                </div>
                                <div className='relative w-72'>
                                    <Search className='absolute top-2.5 left-3 h-4 w-4 text-muted-foreground' />
                                    <Input
                                        placeholder='Search by name, adm no...'
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className='h-10 bg-gray-50/50 pl-10 transition-colors focus:bg-white'
                                    />
                                </div>
                            </div>

                            <div className='overflow-hidden rounded-2xl border bg-white shadow-xl'>
                                <Table>
                                    <TableHeader className='bg-indigo-900'>
                                        <TableRow className='border-none hover:bg-indigo-900'>
                                            <TableHead className='w-[60px] text-center text-white'>SL.NO</TableHead>
                                            <TableHead className='w-[50px]'>
                                                <Checkbox
                                                    checked={studentList.length > 0 && studentList.every((s) => s.selected)}
                                                    onCheckedChange={(checked) => toggleSelectAll(checked as boolean)}
                                                    className='border-white data-[state=checked]:bg-white data-[state=checked]:text-indigo-900'
                                                />
                                            </TableHead>
                                            <TableHead className='text-white'>Student Details</TableHead>
                                            <TableHead className='w-[200px] text-white'>Status</TableHead>
                                            <TableHead className='w-[300px] text-white'>Remarks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredList.map((s, idx) => (
                                            <TableRow
                                                key={idx}
                                                className={`${s.selected ? 'bg-indigo-50/50' : 'hover:bg-gray-50/50'} border-b transition-colors`}>
                                                <TableCell className='text-center font-bold text-gray-400'>{idx + 1}</TableCell>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={s.selected}
                                                        onCheckedChange={(checked) => onStudentSelect(idx, checked as boolean)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className='flex flex-col space-y-3 py-2'>
                                                        <Card className='border-indigo-100 bg-white/50 shadow-sm'>
                                                            <CardContent className='grid grid-cols-2 gap-x-4 gap-y-2 p-4 text-xs'>
                                                                <div className='col-span-2 mb-1 flex items-center gap-2 font-bold text-indigo-900 text-sm'>
                                                                    <User className='h-3 w-3' /> {s.StudentName}
                                                                </div>
                                                                <div className='flex items-center gap-2 text-gray-500'>
                                                                    <span className='font-bold text-gray-700'>Adm No:</span> {s.AMST_AdmNo}
                                                                </div>
                                                                <div className='flex items-center gap-2 text-gray-500'>
                                                                    <span className='font-bold text-gray-700'>TC No:</span> {s.ASTC_TCNO}
                                                                </div>
                                                                <div className='flex items-center gap-2 text-gray-500'>
                                                                    <span className='font-bold text-gray-700'>Class:</span>{' '}
                                                                    {s.ASMCL_ClassName} ({s.ASMC_SectionName})
                                                                </div>
                                                                <div className='flex items-center gap-2 text-gray-500'>
                                                                    <span className='font-bold text-gray-700'>TC Date:</span>{' '}
                                                                    {s.ASTC_TCApplicationDate
                                                                        ? format(new Date(s.ASTC_TCApplicationDate), 'dd/MM/yyyy')
                                                                        : ''}
                                                                </div>
                                                                <div className='flex items-center gap-2 text-gray-500'>
                                                                    <span className='font-bold text-gray-700'>Father:</span> {s.FatherName}
                                                                </div>
                                                                <div className='flex items-center gap-2 text-gray-500'>
                                                                    <span className='font-bold text-gray-700'>Mother:</span> {s.MotherName}
                                                                </div>
                                                                <div className='flex items-center gap-2 text-gray-500'>
                                                                    <span className='font-bold text-gray-700'>DOB:</span>{' '}
                                                                    {s.AMST_DOB ? format(new Date(s.AMST_DOB), 'dd/MM/yyyy') : ''}
                                                                </div>
                                                                <div className='flex items-center gap-2 text-gray-500'>
                                                                    <span className='font-bold text-gray-700'>Caste:</span>{' '}
                                                                    {s.IMC_CasteName}
                                                                </div>
                                                                <div className='flex items-center gap-2 text-gray-500'>
                                                                    <span className='font-bold text-gray-700'>Language/Religion:</span>{' '}
                                                                    {s.IVRMMR_Name}
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Role Based Information */}
                                                        <div className='space-y-2'>
                                                            {(userId === '46102' || userId === '46105') && (
                                                                <Badge
                                                                    variant='destructive'
                                                                    className='w-full justify-start py-2 font-bold text-[11px]'>
                                                                    <Info className='mr-2 h-3 w-3' /> Fee Due Amount: ₹{s.Fee_Due_Amnt}
                                                                </Badge>
                                                            )}

                                                            {(userId === '46039' || userId === '45986' || userId === '46105') && (
                                                                <Badge
                                                                    variant='outline'
                                                                    className='w-full justify-start border-orange-200 bg-orange-50 py-2 font-bold text-[11px] text-orange-600'>
                                                                    <BookOpen className='mr-2 h-3 w-3' /> Library Books Pending:{' '}
                                                                    {s.Library_Due_Amnt}
                                                                </Badge>
                                                            )}

                                                            {userId === '46100' && (
                                                                <div className='space-y-3 rounded-xl border bg-gray-50 p-4'>
                                                                    <div className='flex items-center gap-3'>
                                                                        <span className='w-28 font-bold text-[10px] text-indigo-900 uppercase'>
                                                                            Apar Number:
                                                                        </span>
                                                                        <Input
                                                                            value={s.AMST_APAARId || ''}
                                                                            disabled={!s.selected}
                                                                            onBlur={(e) =>
                                                                                handleUpdateID(idx, 'AMST_APAARId', e.target.value)
                                                                            }
                                                                            className='h-7 border-dashed bg-white text-xs'
                                                                        />
                                                                    </div>
                                                                    <div className='flex items-center gap-3'>
                                                                        <span className='w-28 font-bold text-[10px] text-indigo-900 uppercase'>
                                                                            PEN Number:
                                                                        </span>
                                                                        <Input
                                                                            value={s.AMST_PENNo || ''}
                                                                            disabled={!s.selected}
                                                                            onBlur={(e) =>
                                                                                handleUpdateID(idx, 'AMST_PENNo', e.target.value)
                                                                            }
                                                                            className='h-7 border-dashed bg-white text-xs'
                                                                        />
                                                                    </div>
                                                                    <div className='flex items-center gap-3'>
                                                                        <span className='w-28 font-bold text-[10px] text-indigo-900 uppercase'>
                                                                            STS Number:
                                                                        </span>
                                                                        <Input
                                                                            value={s.AMST_BPLCardNo || ''}
                                                                            disabled={!s.selected}
                                                                            onBlur={(e) =>
                                                                                handleUpdateID(idx, 'AMST_BPLCardNo', e.target.value)
                                                                            }
                                                                            className='h-7 border-dashed bg-white text-xs'
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className='pt-8 align-top'>
                                                    <div className='space-y-1'>
                                                        <Select
                                                            value={s.ASTCA_Status}
                                                            onValueChange={(v) => onFieldChange(idx, 'ASTCA_Status', v)}
                                                            disabled={!s.selected}>
                                                            <SelectTrigger className='h-10 text-xs shadow-sm'>
                                                                <SelectValue placeholder='-- Select --' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value='Approved'>Approved</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        {!s.ASTCA_Status && s.selected && (
                                                            <p className='px-1 font-medium text-[10px] text-red-500'>Status required</p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className='pt-8 align-top'>
                                                    <div className='space-y-1'>
                                                        <Textarea
                                                            value={s.ASTCA_Remarks}
                                                            onChange={(e) => onFieldChange(idx, 'ASTCA_Remarks', e.target.value)}
                                                            disabled={!s.selected}
                                                            placeholder='Enter remarks...'
                                                            className='min-h-[120px] bg-white text-xs shadow-sm'
                                                        />
                                                        {!s.ASTCA_Remarks && s.selected && (
                                                            <p className='px-1 font-medium text-[10px] text-red-500'>Remarks required</p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className='flex justify-center gap-4 pt-8'>
                                <Button
                                    size='lg'
                                    onClick={handleApprove}
                                    disabled={saveMutation.isPending}
                                    className='min-w-[180px] rounded-full bg-indigo-600 text-white uppercase tracking-widest shadow-xl transition-all hover:bg-indigo-700'>
                                    {saveMutation.isPending ? (
                                        <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                                    ) : (
                                        <CheckCircle className='mr-2 h-5 w-5' />
                                    )}
                                    Approve
                                </Button>
                                <Button
                                    size='lg'
                                    variant='outline'
                                    onClick={handleCancel}
                                    className='min-w-[180px] rounded-full border-red-200 text-red-600 uppercase tracking-widest shadow-sm hover:bg-red-50'>
                                    <RotateCcw className='mr-2 h-5 w-5' />
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className='flex flex-col items-center justify-center rounded-3xl border-2 border-dashed bg-gray-50 py-20'>
                            <div className='mb-6 rounded-full bg-white p-6 shadow-lg'>
                                <Info className='h-12 w-12 text-indigo-400' />
                            </div>
                            <h3 className='font-bold text-gray-800 text-xl'>No Pending Approvals</h3>
                            <p className='mt-2 text-gray-500'>There are currently no student TC requests waiting for approval.</p>
                            <Button variant='outline' onClick={() => refetchDetails()} className='mt-8 rounded-full px-8'>
                                <RotateCcw className='mr-2 h-4 w-4' /> Refresh Data
                            </Button>
                        </div>
                    )}
                </div>
            </CollapsibleSection>

            <style jsx global>{`
                .border-dashed {
                    border-style: dashed !important;
                }
            `}</style>
        </div>
    );
}
