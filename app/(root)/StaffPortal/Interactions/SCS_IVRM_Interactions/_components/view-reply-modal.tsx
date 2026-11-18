'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { fetchThread, saveInteractionReply } from '@/server/staff-portal/interactions';
import type { IMessage, ISaveReplyRequest } from '@/types/staff-portal/interactions';
import { format } from 'date-fns';
import { Download, FileImage, FileText, Loader2, Music, Paperclip, Video } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ViewReplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: IMessage;
    roleFlg: string;
    interactionsData: any;
}
export const dynamic = 'force-dynamic';
export function ViewReplyModal({ isOpen, onClose, message, roleFlg, interactionsData }: ViewReplyModalProps) {
    const [thread, setThread] = useState<any[]>([]);
    const [replyVisible, setReplyVisible] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const loadThread = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetchThread(message.ISMINT_Id);
            if (res.success && res.data) {
                setThread(res.data.viewmessage || []);

                // SCS specific reply logic (simplified parity)
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
            const payload: ISaveReplyRequest = {
                ismint_Id: message.ISMINT_Id,
                istint_Interaction: replyText,
                roleflg: roleFlg,
                istint_ComposedByFlg: roleFlg,
                istint_Id: 0
            };

            const res = await saveInteractionReply(payload);
            if (res.success && res.data?.returnval) {
                toast.success('Reply sent successfully');
                setReplyText('');
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

    const handleFileView = (url: string) => {
        if (!url) return;
        const ext = url.split('.').pop()?.toLowerCase();

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
        const ext = url.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext || '')) return <FileImage className='h-4 w-4' />;
        if (['mp4', 'mkv', 'avi'].includes(ext || '')) return <Video className='h-4 w-4' />;
        if (['mp3', 'wav'].includes(ext || '')) return <Music className='h-4 w-4' />;
        return <FileText className='h-4 w-4' />;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='flex max-h-[90vh] max-w-4xl flex-col overflow-hidden border-none bg-background/95 p-0 shadow-2xl backdrop-blur-md'>
                <DialogHeader className='border-b bg-muted/30 p-6'>
                    <div className='flex items-center justify-between'>
                        <div className='space-y-1'>
                            <DialogTitle className='flex items-center gap-2 font-bold text-xl'>
                                <MessageSquareIcon className='h-5 w-5 text-primary' />
                                {message.ISMINT_Subject}
                            </DialogTitle>
                            <p className='flex items-center gap-2 text-muted-foreground text-xs'>
                                <Badge variant='outline' className='font-bold text-[10px] uppercase tracking-tight'>
                                    Conversation ID: {message.ISMINT_InteractionId}
                                </Badge>
                                {message.Classname && (
                                    <Badge
                                        variant='outline'
                                        className='border-blue-100 bg-blue-50 font-bold text-[10px] text-blue-600 uppercase'>
                                        {message.Classname} {message.Sectionname && `- ${message.Sectionname}`}
                                    </Badge>
                                )}
                                <span>•</span>
                                <span>
                                    {message.Sender} to {message.Receiver}
                                </span>
                            </p>
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
                                            <th className='w-[180px] px-4 py-2 text-center font-black text-[11px] uppercase tracking-wider'>
                                                Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className='font-bold text-[12px] text-slate-600'>
                                        {/* Original Message First */}
                                        <tr className='border-slate-100 border-b transition-colors hover:bg-slate-50'>
                                            <td className='border-slate-100 border-r px-4 py-4 text-center text-slate-400 italic'>1</td>
                                            <td className='border-slate-100 border-r px-4 py-4 font-medium leading-relaxed'>
                                                {message.ISMINT_Interaction}
                                            </td>
                                            <td className='border-slate-100 border-r px-4 py-4 text-center'>
                                                {message.ISMINT_Attachment && (
                                                    <button
                                                        onClick={() => setPreviewUrl(message.ISMINT_Attachment!)}
                                                        className='inline-flex rounded-md bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100'>
                                                        <Paperclip className='h-4 w-4' />
                                                    </button>
                                                )}
                                            </td>
                                            <td className='border-slate-100 border-r px-4 py-4 text-center text-[11px] uppercase tracking-tighter'>
                                                {message.Sender}
                                            </td>
                                            <td className='px-4 py-4 text-center text-[11px] text-slate-500'>
                                                {format(new Date(message.ISMINT_DateTime), 'dd/MM/yyyy hh:mm a')}
                                            </td>
                                        </tr>

                                        {/* Replies */}
                                        {thread.map((item: any, idx: number) => (
                                            <tr key={idx} className='border-slate-100 border-b transition-colors hover:bg-slate-50'>
                                                <td className='border-slate-100 border-r px-4 py-4 text-center text-slate-400 italic'>
                                                    {idx + 2}
                                                </td>
                                                <td className='border-slate-100 border-r px-4 py-4 font-medium leading-relaxed'>
                                                    {item.ISTINT_Interaction}
                                                </td>
                                                <td className='border-slate-100 border-r px-4 py-4 text-center'>
                                                    {item.ISTINT_Attachment && (
                                                        <button
                                                            onClick={() => setPreviewUrl(item.ISTINT_Attachment)}
                                                            className='inline-flex rounded-md bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100'>
                                                            {getFileIcon(item.ISTINT_Attachment)}
                                                        </button>
                                                    )}
                                                </td>
                                                <td className='border-slate-100 border-r px-4 py-4 text-center text-[11px] uppercase tracking-tighter'>
                                                    {item.Sender || (item.ISTINT_ComposedByFlg === roleFlg ? 'You' : item.Receiver)}
                                                </td>
                                                <td className='px-4 py-4 text-center text-[11px] text-slate-500'>
                                                    {format(new Date(item.ISTINT_DateTime), 'dd/MM/yyyy hh:mm a')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </ScrollArea>

                {replyVisible && (
                    <div className='space-y-4 border-t bg-muted/10 p-6'>
                        <div className='flex flex-col gap-3'>
                            <Textarea
                                placeholder='Write a reply...'
                                className='min-h-[100px] resize-none focus-visible:ring-primary/20'
                                value={replyText}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
                            />

                            <div className='flex items-center justify-between gap-4'>
                                <div className='flex grow flex-wrap gap-2'>
                                    <Button variant='outline' size='sm' className='h-8 gap-2 text-[10px]'>
                                        <Paperclip className='h-3.5 w-3.5' />
                                        Attach File
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
                        <div className='relative overflow-hidden rounded-2xl bg-white/10 p-1 shadow-2xl backdrop-blur-md'>
                            {previewUrl && (
                                <img
                                    src={previewUrl}
                                    alt='Preview'
                                    className='max-h-[70vh] w-auto rounded-xl object-contain shadow-inner'
                                />
                            )}
                        </div>
                        <div className='flex items-center gap-4'>
                            <Button
                                onClick={() => previewUrl && handleDownload(previewUrl)}
                                className='h-12 gap-3 rounded-full border border-white/20 bg-white/10 px-8 font-black text-white uppercase tracking-widest shadow-xl backdrop-blur-md hover:bg-white/20'>
                                <Download className='h-5 w-5' />
                                Download Image
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

function MessageSquareIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
        </svg>
    );
}
