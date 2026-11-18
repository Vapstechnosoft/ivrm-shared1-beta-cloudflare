// Force TS Server re-analysis
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { uploadDocument } from '@/server/document_upload';
import { deleteInteractionReply, fetchThread, saveInteractionReply } from '@/server/staff-portal/interactions';
import type { IMessage } from '@/types/staff-portal/interactions';
import { format } from 'date-fns';
import { ChevronDown, Download, FileImage, FileText, Loader2, MessageSquare, Music, Paperclip, Trash2, User, Video, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

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
    const [replyVisible, setReplyVisible] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [files, setFiles] = useState<{ name: string; file: File | null }[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const loggedInHrmeId = userhrmE_Id;

    const loadThread = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetchThread(message.ISMINT_Id);
            if (res.success && res.data) {
                // Handle different backend response structures (viewmessage vs replylist)
                const threadData = res.data.viewmessage?.length ? res.data.viewmessage : res.data.replylist || [];
                setThread(threadData);

                // Parity logic: if data was loaded successfully, reply should be visible
                setReplyVisible(true);
            }
        } catch (error) {
            console.error('Failed to load thread:', error);
            toast.error('Failed to load conversation history');
        } finally {
            setIsLoading(false);
        }
    }, [message.ISMINT_Id]);

    useEffect(() => {
        if (isOpen) {
            loadThread();
        }
    }, [isOpen, loadThread]);

    const handleSendReply = async () => {
        if (!replyText.trim()) {
            toast.error('Please enter a message');
            return;
        }

        setIsSubmitting(true);
        try {
            // Upload files (supporting single file for consistency with compose)
            let uploadedFilePath = '';
            if (files.length > 0 && files[0].file) {
                const formData = new FormData();
                formData.append('file', files[0].file);
                const uploadRes = await uploadDocument(formData);
                if (uploadRes.success && uploadRes.data) {
                    uploadedFilePath = uploadRes.data;
                }
            }

            const payload: any = {
                isminT_Id: message.ISMINT_Id,
                istinT_Interaction: replyText,
                images_paths: uploadedFilePath ? [uploadedFilePath] : [],
                isminT_MACAddress: '00-14-22-01-23-45', // As per user requirement
                isminT_ISPIPAddress: '192.168.1.1' // As per user requirement
            };

            const res = await saveInteractionReply(payload);
            if (res.success) {
                toast.success(res.message || 'Reply sent successfully');
                setReplyText('');
                setFiles([]); // Clear files
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

    const handleDeleteReply = async (id: number) => {
        if (!confirm('Are you sure you want to delete this reply?')) return;
        try {
            const res = await deleteInteractionReply(id);
            if (res.success) {
                toast.success('Reply deleted');
                loadThread();
            } else {
                toast.error(res.message || 'Failed to delete');
            }
        } catch (error) {
            toast.error('Error deleting reply');
        }
    };

    const handleFileView = (url: string) => {
        if (!url) return;
        const ext = url?.split('.').pop()?.toLowerCase();

        if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext || '')) {
            window.open(`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`, '_blank');
        } else {
            window.open(url, '_blank');
        }
    };

    const handleDownload = async (url: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = url.split('/').pop() || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            window.open(url, '_blank');
        }
    };

    const getFileIcon = (url: string) => {
        const ext = url?.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext || '')) return <FileImage className='h-4 w-4' />;
        if (['mp4', 'mkv', 'avi'].includes(ext || '')) return <Video className='h-4 w-4' />;
        if (['mp3', 'wav'].includes(ext || '')) return <Music className='h-4 w-4' />;
        return <FileText className='h-4 w-4' />;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        if (selectedFile) {
            setFiles([{ name: selectedFile.name, file: selectedFile }]);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='flex max-h-[90vh] max-w-4xl flex-col overflow-hidden border-none bg-background/90 p-0 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl'>
                <DialogHeader className='space-y-4 border-b bg-primary/[0.03] p-8'>
                    <div className='flex flex-col gap-2'>
                        <div className='flex items-center gap-3'>
                            <div className='rounded-xl bg-primary/10 p-2.5 text-primary'>
                                <MessageSquare className='h-6 w-6' />
                            </div>
                            <DialogTitle className='font-black text-2xl leading-none tracking-tight'>{message.ISMINT_Subject}</DialogTitle>
                        </div>
                        <div className='ml-12 flex flex-wrap items-center gap-2'>
                            <Badge
                                variant='outline'
                                className='border-primary/20 bg-background/50 font-black text-[10px] text-primary uppercase tracking-widest'>
                                ID: {message.ISMINT_InteractionId}
                            </Badge>
                            {message.Classname && (
                                <Badge
                                    variant='outline'
                                    className='border-blue-500/20 bg-blue-500/10 font-black text-[10px] text-blue-600 uppercase tracking-widest'>
                                    {message.Classname} {message.Sectionname && `- ${message.Sectionname}`}
                                </Badge>
                            )}
                            <span className='text-muted-foreground opacity-30'>•</span>
                            <div className='flex items-center gap-1.5 font-bold text-muted-foreground text-xs'>
                                <User className='h-3.5 w-3.5' />
                                <span>
                                    {message.Sender} to {message.Receiver}
                                </span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className='flex-1 bg-white p-8'>
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
                                            <th className='w-[60px] border-blue-400/30 border-r px-4 py-3 text-center font-black text-[11px] uppercase tracking-wider'>
                                                SL NO
                                            </th>
                                            <th className='border-blue-400/30 border-r px-4 py-3 text-center font-black text-[11px] uppercase tracking-wider'>
                                                Interaction
                                            </th>
                                            <th className='w-[120px] border-blue-400/30 border-r px-4 py-3 text-center font-black text-[11px] uppercase tracking-wider'>
                                                Attachment
                                            </th>
                                            <th className='w-[150px] border-blue-400/30 border-r px-4 py-3 text-center font-black text-[11px] uppercase tracking-wider'>
                                                Reply By
                                            </th>
                                            <th className='w-[180px] border-blue-400/30 border-r px-4 py-3 text-center font-black text-[11px] uppercase tracking-wider'>
                                                Date
                                            </th>
                                            <th className='w-[80px] px-4 py-3 text-center font-black text-[11px] uppercase tracking-wider'>
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className='font-bold text-[12px] text-slate-600'>
                                        {/* Dynamic Thread Records from Backend */}
                                        {thread.map((item: any, idx: number) => {
                                            const isMyReply = item.ISTINT_ComposedById === loggedInHrmeId;
                                            return (
                                                <tr key={idx} className='border-slate-100 border-b transition-colors hover:bg-slate-50/80'>
                                                    <td className='border-slate-100 border-r bg-slate-50/30 px-4 py-4 text-center font-black text-slate-400 italic tracking-widest'>
                                                        {idx + 1}
                                                    </td>
                                                    <td className='border-slate-100 border-r px-4 py-4 font-medium leading-relaxed'>
                                                        {item.ISTINT_Interaction || item.ISMINT_Interaction}
                                                    </td>
                                                    <td className='border-slate-100 border-r px-4 py-4 text-center'>
                                                        {(item.ISTINT_Attachment || item.ISMINT_Attachment) && (
                                                            <button
                                                                onClick={() => {
                                                                    const url = item.ISTINT_Attachment || item.ISMINT_Attachment;
                                                                    const ext = url?.split('.').pop()?.toLowerCase();
                                                                    if (['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(ext || '')) {
                                                                        window.open(
                                                                            `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`,
                                                                            '_blank'
                                                                        );
                                                                    } else {
                                                                        setPreviewUrl(url);
                                                                    }
                                                                }}
                                                                className='inline-flex rounded-lg bg-blue-50 p-2 text-blue-600 shadow-sm transition-all hover:bg-blue-100'>
                                                                {getFileIcon(item.ISTINT_Attachment || item.ISMINT_Attachment || '')}
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className='border-slate-100 border-r px-4 py-4 text-center font-black text-[10px] text-slate-500 uppercase tracking-tighter'>
                                                        {item.Sender || (isMyReply ? 'You' : 'Staff')}
                                                    </td>
                                                    <td className='border-slate-100 border-r px-4 py-4 text-center text-[11px] text-slate-400'>
                                                        {item.ISTINT_DateTime || item.ISMINT_DateTime
                                                            ? format(
                                                                  new Date(item.ISTINT_DateTime || item.ISMINT_DateTime),
                                                                  'dd/MM/yyyy hh:mm a'
                                                              )
                                                            : ''}
                                                    </td>
                                                    <td className='px-4 py-4 text-center'>
                                                        {isMyReply && (
                                                            <button
                                                                onClick={() => handleDeleteReply(item.ISTINT_Id)}
                                                                className='rounded-lg p-2 text-red-400 transition-all hover:bg-red-50 hover:text-red-600'
                                                                title='Delete Reply'>
                                                                <Trash2 className='h-4 w-4' />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </ScrollArea>

                {replyVisible && (
                    <div className='relative border-t bg-muted/20 p-8 shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.05)]'>
                        <div className='flex flex-col gap-4'>
                            <div className='space-y-2'>
                                <div className='ml-1 flex items-center justify-between'>
                                    <Label className='font-black text-[10px] text-primary uppercase leading-none tracking-[0.2em]'>
                                        Draft Reply
                                    </Label>
                                    <ChevronDown className='h-3 w-3 text-muted-foreground opacity-50' />
                                </div>
                                <Textarea
                                    placeholder='Type your message here...'
                                    className='min-h-[120px] resize-none rounded-2xl border-2 bg-background p-4 font-medium placeholder:opacity-50 focus-visible:ring-primary/20'
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                />
                            </div>

                            <div className='flex items-center justify-between gap-4'>
                                <div className='flex grow flex-col gap-2'>
                                    <div className='flex flex-wrap gap-2'>
                                        {files.map((f, i) => (
                                            <div
                                                key={i}
                                                className='flex items-center gap-2 rounded-sm border border-slate-200 bg-slate-100 px-3 py-1.5'>
                                                <span className='max-w-[150px] truncate font-bold text-[11px] text-slate-600'>
                                                    {f.name}
                                                </span>
                                                <div className='ml-1 flex items-center gap-1 border-slate-300 border-l pl-2'>
                                                    <button
                                                        onClick={() => {
                                                            if (f.file) {
                                                                const ext = f.name.split('.').pop()?.toLowerCase();
                                                                if (['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(ext || '')) {
                                                                    toast.info('Excel/Word files will be downloaded for viewing');
                                                                    const url = URL.createObjectURL(f.file);
                                                                    const a = document.createElement('a');
                                                                    a.href = url;
                                                                    a.download = f.name;
                                                                    a.click();
                                                                    URL.revokeObjectURL(url);
                                                                } else {
                                                                    const url = URL.createObjectURL(f.file);
                                                                    window.open(url, '_blank');
                                                                }
                                                            }
                                                        }}
                                                        className='font-black text-[#1e40af] text-[10px] uppercase hover:underline'>
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (f.file) {
                                                                const url = URL.createObjectURL(f.file);
                                                                const a = document.createElement('a');
                                                                a.href = url;
                                                                a.download = f.name;
                                                                document.body.appendChild(a);
                                                                a.click();
                                                                document.body.removeChild(a);
                                                                URL.revokeObjectURL(url);
                                                            }
                                                        }}
                                                        className='font-black text-[#1e40af] text-[10px] uppercase hover:underline'>
                                                        Download
                                                    </button>
                                                    <X
                                                        className='ml-1 h-3 w-3 cursor-pointer text-red-500 hover:text-red-700'
                                                        onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        className='relative h-10 w-fit gap-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-colors hover:bg-primary/5 hover:text-primary'>
                                        <Paperclip className='h-4 w-4' />
                                        Attach File
                                        <Input
                                            type='file'
                                            className='absolute inset-0 cursor-pointer opacity-0'
                                            onChange={handleFileChange}
                                        />
                                    </Button>
                                </div>
                                <Button
                                    className='h-10 min-w-[120px] rounded-md bg-[#1e40af] px-6 font-black text-white text-xs uppercase tracking-widest shadow-md transition-all hover:bg-[#1e3a8a]'
                                    onClick={handleSendReply}
                                    disabled={isSubmitting || !replyText.trim()}>
                                    {isSubmitting ? <Loader2 className='h-4 w-4 animate-spin' /> : 'REPLY'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
            {/* Image Preview Modal */}
            <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
                <DialogContent className='flex max-w-4xl flex-col items-center border-none bg-transparent p-0 shadow-none'>
                    <div className='group relative flex w-full flex-col items-center gap-6'>
                        <div className='relative flex w-full max-w-3xl flex-col items-center overflow-hidden rounded-2xl bg-white/10 p-1 shadow-2xl backdrop-blur-md'>
                            {previewUrl &&
                                (previewUrl.toLowerCase().endsWith('.pdf') ? (
                                    <iframe
                                        src={`${previewUrl}#toolbar=0`}
                                        className='h-[70vh] w-full rounded-xl border-none bg-white shadow-inner'
                                        title='PDF Preview'
                                    />
                                ) : (
                                    <img
                                        src={previewUrl}
                                        alt='Preview'
                                        className='max-h-[70vh] w-auto rounded-xl object-contain shadow-inner'
                                    />
                                ))}
                        </div>
                        <div className='flex items-center gap-4'>
                            <Button
                                onClick={() => previewUrl && handleDownload(previewUrl)}
                                className='h-12 gap-3 rounded-full border border-white/20 bg-white/10 px-8 font-black text-white uppercase tracking-widest shadow-xl backdrop-blur-md hover:bg-white/20'>
                                <Download className='h-5 w-5' />
                                Download File
                            </Button>
                            <Button
                                onClick={() => setPreviewUrl(null)}
                                className='h-12 rounded-full bg-red-500/80 px-8 font-black text-white uppercase tracking-widest shadow-xl hover:bg-red-500'>
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}
