'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, ExternalLink, FileText, ImageIcon } from 'lucide-react';

interface AttachmentPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    fileName: string;
}

export default function AttachmentPreview({ isOpen, onClose, url, fileName }: AttachmentPreviewProps) {
    if (!url) return null;

    const extension = url.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
    const isPdf = extension === 'pdf';
    const isVideo = ['mp4', 'webm', 'ogg', 'wmv'].includes(extension || '');
    const isAudio = ['mp3', 'wav', 'ogg'].includes(extension || '');
    const isDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension || '');

    const renderPreview = () => {
        if (isImage) {
            return <img src={url} alt={fileName} className='max-h-[70vh] w-full object-contain' />;
        }
        if (isPdf) {
            return <iframe src={`${url}#toolbar=0`} className='h-[70vh] w-full border-0' title={fileName} />;
        }
        if (isVideo) {
            return (
                <video controls className='max-h-[70vh] w-full'>
                    <source src={url} type={`video/${extension}`} />
                    Your browser does not support the video tag.
                </video>
            );
        }
        if (isAudio) {
            return (
                <div className='flex h-32 items-center justify-center rounded-lg bg-muted/30 p-8'>
                    <audio controls className='w-full'>
                        <source src={url} type={`audio/${extension}`} />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            );
        }

        return (
            <div className='flex flex-col items-center justify-center gap-4 rounded-xl bg-muted/20 py-20'>
                <div className='rounded-full bg-blue-100 p-6'>
                    {isDoc ? <FileText className='h-12 w-12 text-blue-600' /> : <ImageIcon className='h-12 w-12 text-blue-600' />}
                </div>
                <p className='font-medium text-lg'>{fileName}</p>
                <p className='text-muted-foreground'>Preview not available for this file type.</p>
                <Button asChild variant='default'>
                    <a href={url} download={fileName} target='_blank' rel='noopener noreferrer'>
                        <Download className='mr-2 h-4 w-4' /> Download File
                    </a>
                </Button>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-w-4xl p-4'>
                <DialogHeader className='mb-2 border-b pb-2'>
                    <DialogTitle className='flex items-center justify-between pr-8'>
                        <span className='truncate'>{fileName}</span>
                        <div className='flex gap-2'>
                            <Button variant='ghost' size='sm' asChild>
                                <a href={url} target='_blank' rel='noopener noreferrer'>
                                    <ExternalLink className='h-4 w-4' /> Open in New Tab
                                </a>
                            </Button>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <div className='w-full'>{renderPreview()}</div>
            </DialogContent>
        </Dialog>
    );
}
