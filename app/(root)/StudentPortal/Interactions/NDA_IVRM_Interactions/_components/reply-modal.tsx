'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { uploadDocument } from '@/server/document_upload';
import { deleteInteractionReply, fetchThread, saveInteractionReplyData } from '@/server/staff-portal/interactions';
import type { IFILESLISTdata, IMessage, ISaveReplyDataRequest } from '@/types/staff-portal/interactions';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import { Calendar, Download, Eye, FileText, Loader2, MessageSquare, Paperclip, Plus, Trash2, User, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ViewReplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: IMessage;
    roleFlg: string;
    userhrmE_Id: number;
}
export const dynamic = 'force-dynamic';
export function ViewReplyModal({ isOpen, onClose, message, roleFlg, userhrmE_Id }: ViewReplyModalProps) {
    const [thread, setThread] = useState<any[]>([]);
    const [replyText, setReplyText] = useState('');
    const [files, setFiles] = useState<{ name: string; file: File | null }[]>([{ name: '', file: null }]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: string } | null>(null);
    const [xlsxPreviewData, setXlsxPreviewData] = useState<any[][] | null>(null);
    const [docxPreviewHtml, setDocxPreviewHtml] = useState<string | null>(null);

    const loadThread = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetchThread(message.ISMINT_Id);
            if (res.success && res.data) {
                const rawThread = res.data.replylist || res.data.viewmessage || [];

                // Group records by Interaction + DateTime + ID to consolidate multiple attachments
                const grouped = rawThread.reduce((acc: any[], current: any) => {
                    const interaction = current.ISTINT_Interaction || current.ISMINT_Interaction;
                    const dateTime = current.ISTINT_DateTime || current.ISMINT_DateTime;
                    const istintId = current.ISTINT_Id;

                    // Find if this record belongs to an already added transaction
                    // We check ID first (precise), then fallback to content+time if ID is missing (robust)
                    const existing = acc.find(
                        (item) =>
                            (istintId && item.ISTINT_Id === istintId) ||
                            (!istintId && item.ISTINT_Interaction === interaction && item.ISTINT_DateTime === dateTime)
                    );

                    // Extract attachment from current record
                    const currentUrl = current.ISTINT_Attachment || current.ISMID_FilePath || current.ISMID_Filepath;
                    const currentName = current.ISMID_Filename || (currentUrl ? currentUrl.split('/').pop() : 'Attachment');

                    if (existing) {
                        // If it's the same transaction, merge the attachment
                        if (currentUrl && !existing.attachments.some((a: any) => a.url === currentUrl)) {
                            existing.attachments.push({ url: currentUrl, name: currentName });
                        }
                        return acc;
                    } else {
                        // New transaction - initialize attachments
                        const attachments: any[] = [];

                        // Check for nested attachment arrays (common in some formats)
                        const nestedFiles = current.FILESLISTdata || current.attachmentlist || current.images_paths || [];
                        if (Array.isArray(nestedFiles)) {
                            for (const f of nestedFiles) {
                                const url = typeof f === 'string' ? f : f.ISMID_Filepath || f.ISMID_FilePath || f.url;
                                const name =
                                    typeof f === 'string' ? url.split('/').pop() : f.ISMID_Filename || f.name || url.split('/').pop();
                                if (url) attachments.push({ url, name });
                            }
                        }

                        // Add top-level attachment if not redundant
                        if (currentUrl && !attachments.some((a) => a.url === currentUrl)) {
                            attachments.push({ url: currentUrl, name: currentName });
                        }

                        return [...acc, { ...current, attachments }];
                    }
                }, []);

                setThread(grouped);
            }
        } catch (error) {
            toast.error('Failed to load message thread');
        } finally {
            setIsLoading(false);
        }
    }, [message.ISMINT_Id]);

    useEffect(() => {
        if (isOpen) {
            loadThread();
        }
    }, [isOpen, loadThread]);

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

    const handleReply = async () => {
        if (!replyText.trim()) {
            toast.error('Please enter a reply message');
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

            const payload: ISaveReplyDataRequest = {
                ISMINT_Id: message.ISMINT_Id,
                ISTINT_Interaction: replyText,
                ISTINT_MACAddress: '00-00-00-00-00-00',
                ISMINT_ISPIPAddress: '127.0.0.1',
                FILESLISTdata: uploadedFiles,
                images_paths: uploadedFiles.map((f) => f.ISMID_Filepath)
            };

            const res = await saveInteractionReplyData(payload);
            if (res.success) {
                toast.success(res.message || 'Reply sent successfully');
                setReplyText('');
                setFiles([{ name: '', file: null }]);
                loadThread();
            } else {
                toast.error(res.message || 'Failed to send reply');
            }
        } catch (error) {
            toast.error('An error occurred while replying');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteReply = async (ISTINT_Id: number) => {
        if (!confirm('Are you sure you want to delete this reply?')) return;
        try {
            const res = await deleteInteractionReply(ISTINT_Id);
            if (res.success) {
                toast.success(res.message || 'Reply deleted');
                loadThread();
            } else {
                toast.error(res.message || 'Failed to delete reply');
            }
        } catch (error) {
            toast.error('Failed to delete reply');
        }
    };
    const handleDownload = () => {
        if (previewFile) {
            saveAs(previewFile.url, previewFile.name);
        }
    };

    const handleViewFile = async (url: string, fileName: string) => {
        if (!url) return;

        setIsLoading(true);
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const fileUrl = URL.createObjectURL(blob);
            const fileType = blob.type;

            setPreviewFile({ url: fileUrl, name: fileName, type: fileType });

            const isExcel =
                fileName.toLowerCase().endsWith('.xlsx') ||
                fileName.toLowerCase().endsWith('.xls') ||
                fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                fileType === 'application/vnd.ms-excel';

            const isWord =
                fileName.toLowerCase().endsWith('.docx') ||
                fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                fileType === 'application/msword';

            if (isExcel) {
                const arrayBuffer = await blob.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                setXlsxPreviewData(jsonData as any[][]);
            } else {
                setXlsxPreviewData(null);
                setDocxPreviewHtml(null);
            }
        } catch (error) {
            toast.error('Failed to load file preview');
            window.open(url, '_blank');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className='flex h-[90vh] max-w-5xl flex-col overflow-hidden rounded-3xl border-none p-0 shadow-2xl'>
                <DialogHeader className='shrink-0 bg-[#1e40af] p-6 text-white'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                            <div className='rounded-2xl bg-white/20 p-3 backdrop-blur-md'>
                                <MessageSquare className='h-6 w-6 text-white' />
                            </div>
                            <div>
                                <DialogTitle className='font-black text-xl tracking-tight'>{message.ISMINT_Subject}</DialogTitle>
                                <div className='mt-1 flex items-center gap-3 font-bold text-xs uppercase tracking-widest opacity-80'>
                                    <span className='flex items-center gap-1'>
                                        <User className='h-3 w-3' /> {message.Sender}
                                    </span>
                                    <span className='flex items-center gap-1'>
                                        <Calendar className='h-3 w-3' /> {format(new Date(message.ISMINT_DateTime), 'dd MMM yyyy')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button variant='ghost' size='icon' onClick={onClose} className='rounded-full text-white hover:bg-white/10'>
                            <X className='h-5 w-5' />
                        </Button>
                    </div>
                </DialogHeader>

                <div className='flex min-h-0 flex-1 flex-col bg-white'>
                    <ScrollArea className='flex-1 p-8'>
                        {isLoading ? (
                            <div className='flex flex-col items-center justify-center gap-4 py-20'>
                                <Loader2 className='h-10 w-10 animate-spin text-primary' />
                                <p className='animate-pulse font-black text-[10px] text-primary uppercase tracking-widest'>
                                    Loading interaction history...
                                </p>
                            </div>
                        ) : (
                            <div className='mx-auto max-w-[95%] pb-10'>
                                {/* Table View */}
                                <div className='overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm'>
                                    <table className='w-full border-collapse text-left'>
                                        <thead className='bg-[#1e40af] text-white'>
                                            <tr>
                                                <th className='w-[60px] border-[#3b82f6]/30 border-r px-4 py-2 text-center font-black text-[11px] uppercase tracking-wider'>
                                                    SL NO
                                                </th>
                                                <th className='border-[#3b82f6]/30 border-r px-4 py-2 text-center font-black text-[11px] uppercase tracking-wider'>
                                                    Interaction
                                                </th>
                                                <th className='w-[120px] border-[#3b82f6]/30 border-r px-4 py-2 text-center font-black text-[11px] uppercase tracking-wider'>
                                                    Image
                                                </th>
                                                <th className='w-[150px] border-[#3b82f6]/30 border-r px-4 py-2 text-center font-black text-[11px] uppercase tracking-wider'>
                                                    Reply By
                                                </th>
                                                <th className='w-[180px] border-[#3b82f6]/30 border-r px-4 py-2 text-center font-black text-[11px] uppercase tracking-wider'>
                                                    Date
                                                </th>
                                                <th className='w-[80px] px-4 py-2 text-center font-black text-[11px] uppercase tracking-wider'>
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className='font-bold text-[12px] text-slate-600'>
                                            {/* Replies */}
                                            {thread.map((msg, idx) => (
                                                <tr key={idx} className='border-slate-100 border-b transition-colors hover:bg-slate-50'>
                                                    <td className='border-slate-100 border-r px-4 py-4 text-center text-slate-400 italic'>
                                                        {idx + 1}
                                                    </td>
                                                    <td className='border-slate-100 border-r px-4 py-4 font-medium leading-relaxed'>
                                                        {msg.ISTINT_Interaction || msg.ISMINT_Interaction}
                                                    </td>
                                                    <td className='border-slate-100 border-r px-4 py-4 text-center'>
                                                        <div className='flex flex-wrap justify-center gap-2'>
                                                            {msg.attachments?.map((at: any, i: number) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => handleViewFile(at.url, at.name)}
                                                                    className='inline-flex rounded-md border border-blue-100 bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100'
                                                                    title={at.name}>
                                                                    <Paperclip className='h-4 w-4' />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className='border-slate-100 border-r px-4 py-4 text-center text-[11px] uppercase tracking-tighter'>
                                                        {msg.Sender}
                                                    </td>
                                                    <td className='border-slate-100 border-r px-4 py-4 text-center text-[11px] text-slate-500'>
                                                        {format(new Date(msg.ISTINT_DateTime || msg.ISMINT_DateTime), 'dd/MM/yyyy hh:mm a')}
                                                    </td>
                                                    <td className='px-4 py-4 text-center'>
                                                        {(msg.ISTINT_ComposedById === userhrmE_Id ||
                                                            msg.ISMINT_ComposedById === userhrmE_Id) && (
                                                            <button
                                                                onClick={() => handleDeleteReply(msg.ISTINT_Id)}
                                                                className='rounded-md border border-blue-100 p-1.5 text-blue-500 shadow-sm transition-all hover:bg-blue-50'
                                                                title='Delete Reply'>
                                                                <Trash2 className='h-4 w-4' />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </ScrollArea>

                    {/* Reply Section */}
                    <div className='shrink-0 border-t-2 bg-white p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]'>
                        <div className='mx-auto max-w-4xl space-y-6'>
                            <div className='flex gap-4'>
                                <div className='flex flex-1 flex-col gap-4'>
                                    <div className='group relative'>
                                        <Textarea
                                            placeholder='Type your reply...'
                                            className='min-h-[100px] resize-none rounded-2xl border-2 border-transparent bg-accent/5 p-4 font-medium text-sm transition-all focus-visible:border-primary/20 focus-visible:ring-0'
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                        />
                                        <div className='absolute right-4 bottom-4 flex items-center gap-2 opacity-0 transition-opacity group-focus-within:opacity-100'>
                                            <span className='font-black text-[10px] text-muted-foreground/40 uppercase'>
                                                Press Shift+Enter for new line
                                            </span>
                                        </div>
                                    </div>

                                    {/* File Attachments in Reply - Legacy Table Style */}
                                    <div className='mt-2 overflow-hidden rounded-none border'>
                                        <table className='w-full border-collapse text-left'>
                                            <thead className='bg-[#1a5f7a] font-bold text-[10px] text-white uppercase'>
                                                <tr>
                                                    <th className='w-12 border-white/10 border-r px-4 py-1.5 text-center'>SL NO</th>
                                                    <th className='w-28 border-white/10 border-r px-4 py-1.5'>Upload File</th>
                                                    <th className='border-white/10 border-r px-4 py-1.5'>File Name</th>
                                                    <th className='w-16 border-white/10 border-r px-4 py-1.5 text-center'>View</th>
                                                    <th className='w-16 px-4 py-1.5 text-center'>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {files.map((file, idx) => (
                                                    <tr key={idx} className='border-b transition-colors last:border-b-0 hover:bg-muted/30'>
                                                        <td className='border-r px-4 py-1.5 text-center font-bold text-xs'>{idx + 1}</td>
                                                        <td className='relative border-r px-4 py-1.5'>
                                                            <Button
                                                                size='sm'
                                                                variant='outline'
                                                                className='relative h-6 w-full cursor-pointer overflow-hidden border-none bg-[#1e40af] font-bold text-[9px] text-white shadow-sm'>
                                                                Browse
                                                                <input
                                                                    type='file'
                                                                    className='absolute inset-0 cursor-pointer opacity-0'
                                                                    onChange={(e) => handleFileChange(idx, e)}
                                                                />
                                                            </Button>
                                                        </td>
                                                        <td className='border-r px-4 py-1.5'>
                                                            <div className='flex h-6 items-center rounded-none border bg-background px-2'>
                                                                <span className='max-w-[200px] truncate font-medium text-[10px]'>
                                                                    {file.name || ''}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className='border-r px-4 py-1.5 text-center'>
                                                            {file.name && file.file ? (
                                                                <Button
                                                                    variant='ghost'
                                                                    size='icon'
                                                                    className='h-5 w-5 text-primary hover:bg-primary/10'
                                                                    onClick={() => {
                                                                        const url = URL.createObjectURL(file.file!);
                                                                        handleViewFile(url, file.name);
                                                                    }}>
                                                                    <Eye className='h-3.5 w-3.5' />
                                                                </Button>
                                                            ) : null}
                                                        </td>
                                                        <td className='px-4 py-1.5 text-center'>
                                                            <div className='flex items-center justify-center gap-1'>
                                                                <Button
                                                                    variant='ghost'
                                                                    size='icon'
                                                                    className='h-5 w-5 rounded-none border text-primary hover:bg-primary/10'
                                                                    onClick={addNewFile}>
                                                                    <Plus className='h-3 w-3' />
                                                                </Button>
                                                                {files.length > 1 && (
                                                                    <Button
                                                                        variant='ghost'
                                                                        size='icon'
                                                                        className='h-5 w-5 rounded-none border text-red-500 hover:bg-red-50'
                                                                        onClick={() => removeFile(idx)}>
                                                                        <Trash2 className='h-3 w-3' />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <Button
                                    className='h-10 self-end rounded-md bg-[#1e40af] px-6 font-black text-white text-xs uppercase tracking-widest shadow-md transition-all hover:bg-[#1e3a8a]'
                                    onClick={handleReply}
                                    disabled={isSubmitting || !replyText.trim()}>
                                    {isSubmitting ? <Loader2 className='h-4 w-4 animate-spin' /> : 'REPLY'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
            {/* Unified Preview Modal */}
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
                                    <Button className='h-12 w-full gap-2 bg-primary font-bold hover:bg-primary/90' onClick={handleDownload}>
                                        <Download className='h-4 w-4' />
                                        Download to View
                                    </Button>
                                </div>
                            ))}
                    </div>
                    <DialogFooter className='flex items-center justify-between border-t bg-muted/30 p-6 px-8 sm:justify-between'>
                        <div className='hidden font-bold text-muted-foreground text-xs uppercase tracking-widest sm:block'>
                            {previewFile?.name}
                        </div>
                        <div className='flex items-center gap-3'>
                            <Button
                                variant='outline'
                                onClick={() => setPreviewFile(null)}
                                className='rounded-full border-2 px-8 font-bold text-xs uppercase tracking-widest hover:bg-slate-50'>
                                Close
                            </Button>
                            <Button
                                onClick={handleDownload}
                                className='gap-3 rounded-full border-none bg-primary px-8 font-bold text-white text-xs uppercase tracking-widest shadow-lg transition-all hover:bg-primary/90 hover:shadow-primary/20'>
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
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}

// Exporting the component as a named export is preferred for this pattern
