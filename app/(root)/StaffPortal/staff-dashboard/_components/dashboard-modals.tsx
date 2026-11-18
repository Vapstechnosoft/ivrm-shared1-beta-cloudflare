'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STAFF_PORTAL_QUERY_KEYS } from '@/constants/query-keys';
import {
    changeProfile,
    useStaffAssets,
    useStaffEvents,
    useStaffMedicalRecords,
    useStaffNoticeAttachments,
    useStaffNoticeBoard
} from '@/hooks/staff-portal/useStaffDashboard';
import type { IEmployeeBasicDetails, IEmployeeProfile, INoticeBoard } from '@/types/staff-portal/dashboard';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Ban, Download, Eye, FileText, Loader2, Upload, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { assetColumns, coeColumns, noticeColumns, purchaseColumns } from './columns';

interface BaseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function FilePreviewModal({ open, onOpenChange, fileUrl }: BaseModalProps & { fileUrl: string }) {
    const isPdf = fileUrl.toLowerCase().endsWith('.pdf');
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileUrl);
    const isVideo = /\.(mp4|wmv|avi)$/i.test(fileUrl);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='flex h-[80vh] max-w-5xl flex-col'>
                <DialogHeader>
                    <DialogTitle>File Preview</DialogTitle>
                </DialogHeader>
                <div className='flex flex-1 items-center justify-center overflow-hidden rounded-md bg-muted'>
                    {isPdf && <iframe src={`${fileUrl}#toolbar=0`} className='h-full w-full' title='PDF Preview' />}
                    {isImage && <img src={fileUrl} alt='Preview' className='max-h-full max-w-full object-contain' />}
                    {isVideo && <video src={fileUrl} controls className='max-h-full max-w-full' />}
                    {!isPdf && !isImage && !isVideo && (
                        <div className='p-8 text-center'>
                            <FileText className='mx-auto mb-4 h-16 w-16 text-muted-foreground' />
                            <p>Preview not available for this file type.</p>
                            <Button asChild className='mt-4'>
                                <a href={fileUrl} download>
                                    Download to View
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function ProfileModal({
    open,
    onOpenChange,
    empData,
    profileStatus
}: BaseModalProps & { empData?: IEmployeeBasicDetails; profileStatus?: IEmployeeProfile }) {
    if (!empData) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-3xl'>
                <DialogHeader>
                    <DialogTitle>Employee Profile</DialogTitle>
                </DialogHeader>
                <div className='grid grid-cols-1 gap-6 py-4 md:grid-cols-3'>
                    <div className='flex flex-col items-center space-y-4 md:col-span-1'>
                        <div className='flex h-56 w-48 items-center justify-center overflow-hidden rounded-lg border bg-muted'>
                            {empData.hrmE_PhotoNo ? (
                                <img src={empData.hrmE_PhotoNo} alt='Profile' className='h-full w-full object-cover' />
                            ) : (
                                <User className='h-24 w-24 text-muted-foreground' />
                            )}
                        </div>
                        <div className='text-center'>
                            <Badge
                                variant={
                                    profileStatus?.hrmereqreQ_ConformFlg === 1
                                        ? 'success'
                                        : profileStatus?.hrmereqreQ_ConformFlg === 0
                                          ? 'destructive'
                                          : 'secondary'
                                }>
                                Status: {profileStatus?.hrmereqreQ_ReqStatus || 'Pending'}
                            </Badge>
                        </div>
                    </div>
                    <div className='space-y-4 md:col-span-2'>
                        {[
                            { label: 'Name', value: empData.hrmE_EmployeeFirstName },
                            { label: 'DOB', value: empData.hrmE_DOB ? format(new Date(empData.hrmE_DOB), 'dd/MM/yyyy') : '' },
                            { label: 'Emp. Code', value: empData.hrmE_EmployeeCode },
                            { label: 'Designation', value: empData.hrmdeS_DesignationName },
                            { label: 'DOJ', value: empData.hrmE_DOJ ? format(new Date(empData.hrmE_DOJ), 'dd/MM/yyyy') : '' },
                            { label: 'Department', value: empData.hrmD_DepartmentName }
                        ].map((item) => (
                            <div key={item.label} className='grid grid-cols-12 gap-2 border-b pb-2'>
                                <span className='col-span-4 font-semibold text-muted-foreground'>{item.label}</span>
                                <span className='col-span-8'>: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant='outline' onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function NoticeBoardModal({ open, onOpenChange, years, initialYear }: BaseModalProps & { years: any[]; initialYear: number }) {
    const [selectedYear, setSelectedYear] = useState(initialYear);
    const { data, isLoading } = useStaffNoticeBoard({ flag: 'noticeboard', OnClickOrOnChange: 'OnChange', ASMAY_Id: selectedYear });
    const [viewingNotice, setViewingNotice] = useState<INoticeBoard | null>(null);

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className='flex max-h-[90vh] max-w-5xl flex-col'>
                    <DialogHeader>
                        <DialogTitle>Notice Board</DialogTitle>
                    </DialogHeader>
                    <div className='flex items-end gap-4 py-4'>
                        <div className='w-1/3'>
                            <FormLabel>Academic Year</FormLabel>
                            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number(v))}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((y) => (
                                        <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                            {y.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className='flex-1 overflow-auto'>
                        <GenericDataTable
                            columns={[
                                ...noticeColumns,
                                {
                                    id: 'actions',
                                    header: 'View Attachment',
                                    cell: ({ row }) => {
                                        const hasFiles = row.original.Filecount > 0;
                                        return hasFiles ? (
                                            <Button variant='ghost' size='sm' onClick={() => setViewingNotice(row.original)}>
                                                <Eye className='h-4 w-4 text-primary' />
                                            </Button>
                                        ) : (
                                            <Ban className='h-4 w-4 text-muted-foreground' />
                                        );
                                    }
                                }
                            ]}
                            data={data?.noticeboard || []}
                            isLoading={isLoading}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {viewingNotice && (
                <NoticeAttachmentModal
                    open={!!viewingNotice}
                    onOpenChange={(open) => !open && setViewingNotice(null)}
                    noticeId={viewingNotice.INTB_Id}
                />
            )}
        </>
    );
}

export function NoticeAttachmentModal({ open, onOpenChange, noticeId }: BaseModalProps & { noticeId: number }) {
    const { data, isLoading } = useStaffNoticeAttachments(noticeId);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className='max-w-4xl'>
                    <DialogHeader>
                        <DialogTitle>Notice Attachments</DialogTitle>
                    </DialogHeader>
                    <GenericDataTable
                        columns={[
                            { accessorKey: 'index', header: 'SL NO', cell: ({ row }) => row.index + 1 },
                            { accessorKey: 'INTBFL_FileName', header: 'File Name/URL' },
                            {
                                id: 'view',
                                header: 'View/Click',
                                cell: ({ row }) => {
                                    const isHyperlink = row.original.INTB_Attachment === 'HyperLink';
                                    return isHyperlink ? (
                                        <a
                                            href={row.original.INTBFL_FilePath}
                                            target='_blank'
                                            rel='noreferrer'
                                            className='text-primary hover:underline'>
                                            Click Here
                                        </a>
                                    ) : (
                                        <Button variant='ghost' size='sm' onClick={() => setPreviewUrl(row.original.INTBFL_FilePath)}>
                                            <Eye className='h-4 w-4 text-primary' />
                                        </Button>
                                    );
                                }
                            },
                            {
                                id: 'download',
                                header: 'Download',
                                cell: ({ row }) => {
                                    const isHyperlink = row.original.INTB_Attachment === 'HyperLink';
                                    return isHyperlink ? (
                                        <Ban className='h-4 w-4 text-muted-foreground' />
                                    ) : (
                                        <a href={row.original.INTBFL_FilePath} download>
                                            <Download className='h-4 w-4 text-primary' />
                                        </a>
                                    );
                                }
                            }
                        ]}
                        data={data?.attachementlist || []}
                        isLoading={isLoading}
                    />
                    <div className='mt-2 text-destructive text-xs italic'>Note: Excel, ppt and Document Can&apos;t View. only Download</div>
                </DialogContent>
            </Dialog>

            {previewUrl && (
                <FilePreviewModal open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)} fileUrl={previewUrl} />
            )}
        </>
    );
}

export function EventsModal({ open, onOpenChange }: BaseModalProps) {
    const { data, isLoading } = useStaffEvents({ flag: 'events', OnClickOrOnChange: 'OnClick' });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-4xl'>
                <DialogHeader>
                    <DialogTitle>Calendar of Events</DialogTitle>
                </DialogHeader>
                <GenericDataTable columns={coeColumns} data={data?.coedata || []} isLoading={isLoading} />
            </DialogContent>
        </Dialog>
    );
}

export function AssetListModal({ open, onOpenChange }: BaseModalProps) {
    const { data, isLoading } = useStaffAssets({ flag: 'Asset' });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-4xl'>
                <DialogHeader>
                    <DialogTitle>Asset List</DialogTitle>
                </DialogHeader>
                <GenericDataTable columns={assetColumns} data={data?.assetlist || []} isLoading={isLoading} />
            </DialogContent>
        </Dialog>
    );
}

export function PurchaseListModal({ open, onOpenChange }: BaseModalProps) {
    const { data, isLoading } = useStaffAssets({ flag: 'Purchase' });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-5xl'>
                <DialogHeader>
                    <DialogTitle>Purchase List</DialogTitle>
                </DialogHeader>
                <GenericDataTable columns={purchaseColumns} data={data?.purchaselist || []} isLoading={isLoading} />
            </DialogContent>
        </Dialog>
    );
}

export function BookListModal({ open, onOpenChange, books }: BaseModalProps & { books: any[] }) {
    const [selectedBook, setSelectedBook] = useState<number | null>(null);
    const { data: files, isLoading } = useStaffAssets({ flag: 'BOOKLIST', INTB_Id: selectedBook ?? undefined });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className='max-w-4xl'>
                    <DialogHeader>
                        <DialogTitle>Book List</DialogTitle>
                    </DialogHeader>
                    <div className='space-y-4 py-4'>
                        <div className='w-1/2'>
                            <FormLabel>Book Title</FormLabel>
                            <Select onValueChange={(v) => setSelectedBook(Number(v))}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Book Title' />
                                </SelectTrigger>
                                <SelectContent>
                                    {books.map((b) => (
                                        <SelectItem key={b.lmB_Id} value={b.lmB_Id.toString()}>
                                            {b.lmB_BookTitle}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <GenericDataTable
                            columns={[
                                { accessorKey: 'index', header: 'SL NO', cell: ({ row }) => row.index + 1 },
                                { accessorKey: 'LMB_BookTitle', header: 'Book Title' },
                                { accessorKey: 'LMBFILE_FileName', header: 'File Name' },
                                {
                                    id: 'view',
                                    header: 'View',
                                    cell: ({ row }) => (
                                        <Button variant='ghost' size='sm' onClick={() => setPreviewUrl(row.original.LMBFILE_FilePath)}>
                                            <Eye className='h-4 w-4 text-primary' />
                                        </Button>
                                    )
                                }
                            ]}
                            data={files?.bookFillist || []}
                            isLoading={isLoading}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {previewUrl && (
                <FilePreviewModal open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)} fileUrl={previewUrl} />
            )}
        </>
    );
}

export function MedicalRecordModal({ open, onOpenChange, empId }: BaseModalProps & { empId: number }) {
    const { data, isLoading } = useStaffMedicalRecords({ HRME_Id: empId });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className='max-w-4xl'>
                    <DialogHeader>
                        <DialogTitle>Employee Medical Records</DialogTitle>
                    </DialogHeader>
                    <div className='grid grid-cols-1 gap-4 py-4 sm:grid-cols-2 lg:grid-cols-3'>
                        {data?.attachementlist?.map((file: any, idx: number) => (
                            <Card key={idx} className='overflow-hidden'>
                                <CardContent className='flex flex-col items-center space-y-3 p-4'>
                                    <div className='rounded-full bg-primary/10 p-3'>
                                        <FileText className='h-8 w-8 text-primary' />
                                    </div>
                                    <span className='line-clamp-2 h-8 text-center font-medium text-xs'>{file.INTBFL_FileName}</span>
                                    <div className='flex w-full gap-2'>
                                        <Button
                                            size='xs'
                                            variant='outline'
                                            className='flex-1 gap-1'
                                            onClick={() => setPreviewUrl(file.INTBFL_FilePath)}>
                                            <Eye className='h-3 w-3' /> View
                                        </Button>
                                        <Button size='xs' variant='outline' className='flex-1 gap-1' asChild>
                                            <a href={file.INTBFL_FilePath} download>
                                                <Download className='h-3 w-3' /> Save
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {!isLoading && (!data?.attachementlist || data.attachementlist.length === 0) && (
                            <div className='col-span-full py-12 text-center text-muted-foreground'>No medical records found.</div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {previewUrl && (
                <FilePreviewModal open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)} fileUrl={previewUrl} />
            )}
        </>
    );
}

export function TimeTableModal({ open, onOpenChange, timetable, days }: BaseModalProps & { timetable: any[]; days: any[] }) {
    // Group periods by day
    const groupedTT =
        days?.reduce(
            (acc, day) => {
                acc[day.ttmD_DayName] = timetable?.filter((item) => item.dayName === day.ttmD_DayName) || [];
                return acc;
            },
            {} as Record<string, any[]>
        ) || {};

    if (!days) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-h-[90vh] max-w-6xl overflow-auto'>
                <DialogHeader>
                    <DialogTitle>Weekly Time Table</DialogTitle>
                </DialogHeader>
                <div className='py-4'>
                    <div className='overflow-x-auto rounded-lg border shadow-sm'>
                        <table className='w-full border-collapse text-sm'>
                            <thead className='bg-muted'>
                                <tr>
                                    <th className='sticky left-0 z-10 w-32 border bg-muted/50 p-3 text-left'>Day / Period</th>
                                    {Array.from({ length: 9 }).map((_, i) => (
                                        <th key={i} className='min-w-[120px] border p-3 text-center'>
                                            Period {i + 1}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {days.map((day) => (
                                    <tr key={day.ttmD_DayCode} className='transition-colors hover:bg-muted/30'>
                                        <td className='sticky left-0 z-10 border bg-muted/20 p-3 font-semibold'>{day.ttmD_DayName}</td>
                                        {Array.from({ length: 9 }).map((_, i) => {
                                            const period = groupedTT[day.ttmD_DayName]?.find((p: any) => p.periodCount === i + 1);
                                            return (
                                                <td key={i} className='border p-3 text-center'>
                                                    {period ? (
                                                        <div className='flex flex-col gap-1 rounded border border-primary/10 bg-primary/5 p-2'>
                                                            <span className='font-bold text-primary'>{period.asmcL_ClassName}</span>
                                                            <span className='text-[10px] text-muted-foreground'>
                                                                {period.asmC_SectionName}
                                                            </span>
                                                            <span className='font-medium text-[10px] text-amber-600 italic'>
                                                                ({period.ismS_SubjectName})
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className='text-muted-foreground/30'>-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function PhotoUploadModal({ open, onOpenChange, empId }: BaseModalProps & { empId: number }) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            // In a real app, you'd upload the file to a storage service first or send it as multipart
            // For this implementation, we'll assume the API handles the file or a base64 string
            // Let's assume we send the file to a dedicated upload endpoint first if needed,
            // but here we'll use the changeProfile action.

            // To simplify for this task, let's convert to base64 for the changeProfile action
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(file!);
            });
            const base64 = await base64Promise;

            const response = await changeProfile({ HRME_PhotoNo: base64 });
            return response;
        },
        onSuccess: (resp) => {
            if (resp.success) {
                toast.success('Profile picture updated successfully');
                queryClient.invalidateQueries({ queryKey: [STAFF_PORTAL_QUERY_KEYS.STAFF_DASHBOARD] });
                onOpenChange(false);
            } else {
                toast.error(resp.message || 'Failed to update profile picture');
            }
        },
        onError: () => {
            toast.error('An error occurred during upload');
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            if (selected.size > 2 * 1024 * 1024) {
                toast.error('File size should be less than 2MB');
                return;
            }
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const handleUpload = () => {
        if (!file) return;
        mutation.mutate(new FormData());
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-md'>
                <DialogHeader>
                    <DialogTitle>Update Profile Picture</DialogTitle>
                </DialogHeader>
                <div className='flex flex-col items-center space-y-6 py-6'>
                    <div className='flex h-48 w-40 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-muted'>
                        {preview ? (
                            <img src={preview} alt='Preview' className='h-full w-full object-cover' />
                        ) : (
                            <Upload className='h-10 w-10 text-muted-foreground' />
                        )}
                    </div>
                    <div className='w-full'>
                        <Input type='file' accept='image/*' onChange={handleFileChange} />
                        <p className='mt-2 text-center text-[10px] text-muted-foreground'>Supported formats: JPG, PNG. Max size: 2MB.</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant='outline' onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpload} disabled={!file || mutation.isPending} className='gap-2'>
                        {mutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <Upload className='h-4 w-4' />}
                        Upload photo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
