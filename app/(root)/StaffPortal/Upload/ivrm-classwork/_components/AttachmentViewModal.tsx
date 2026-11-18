'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Attachment {
    icW_Attachment: string;
    icwatT_FileName: string;
    icwatT_Attachment: string;
}

interface AttachmentViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    attachments: Attachment[];
}

export default function AttachmentViewModal({ isOpen, onClose, attachments }: AttachmentViewModalProps) {
    const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);

    useEffect(() => {
        if (isOpen && attachments.length > 0 && !selectedAttachment) {
            setSelectedAttachment(attachments[0]);
        }
    }, [isOpen, attachments, selectedAttachment]);

    const getFileType = (url: string) => {
        if (!url) return 'unknown';
        if (url.startsWith('http') && !url.includes('.') && !url.includes('firebasestorage')) return 'url';
        const ext = url.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext || '')) return 'image';
        if (['mp4', 'wmv', 'mov', 'avi'].includes(ext || '')) return 'video';
        if (['mp3', 'wav', 'ogg'].includes(ext || '')) return 'audio';
        if (ext === 'pdf') return 'pdf';
        if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext || '')) return 'office';
        return 'unknown';
    };

    const renderPreview = (attachment: Attachment) => {
        const url = attachment.icwatT_Attachment || attachment.icW_Attachment;
        const type = getFileType(url);

        switch (type) {
            case 'image':
                return (
                    <div className='flex h-full items-center justify-center overflow-hidden rounded-lg bg-gray-100 p-4'>
                        <img src={url} alt={attachment.icwatT_FileName} className='max-h-full max-w-full object-contain shadow-sm' />
                    </div>
                );
            case 'video':
                return (
                    <div className='flex h-full items-center justify-center overflow-hidden rounded-lg bg-black'>
                        <video controls className='max-h-full max-w-full'>
                            <source src={url} />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                );
            case 'audio':
                return (
                    <div className='flex h-full flex-col items-center justify-center rounded-lg bg-blue-50 p-12'>
                        <div className='mb-6 rounded-full bg-blue-100 p-6'>
                            <FileText className='h-16 w-16 text-blue-600' />
                        </div>
                        <audio controls className='w-full max-w-md'>
                            <source src={url} />
                            Your browser does not support the audio element.
                        </audio>
                        <p className='mt-4 font-medium text-blue-800'>{attachment.icwatT_FileName}</p>
                    </div>
                );
            case 'pdf':
                return (
                    <iframe
                        src={`${url}#toolbar=0`}
                        className='h-full w-full rounded-lg border shadow-inner'
                        title={attachment.icwatT_FileName}
                    />
                );
            case 'url':
                return (
                    <div className='flex h-full flex-col items-center justify-center rounded-lg border-2 border-gray-200 border-dashed bg-gray-50 p-12'>
                        <div className='mb-6 rounded-full bg-blue-50 p-6'>
                            <ExternalLink className='h-16 w-16 text-blue-500' />
                        </div>
                        <h3 className='mb-4 font-semibold text-gray-800 text-xl'>External Resource</h3>
                        <p className='mb-8 max-w-md text-center text-gray-500'>
                            This attachment is an external link. Click the button below to open it in a new tab.
                        </p>
                        <Button size='lg' className='bg-blue-600 shadow-lg hover:bg-blue-700' onClick={() => window.open(url, '_blank')}>
                            Open Link <ExternalLink className='ml-2 h-5 w-5' />
                        </Button>
                    </div>
                );
            case 'office':
                return (
                    <div className='flex h-full flex-col items-center justify-center rounded-lg border-2 border-gray-200 border-dashed bg-gray-50 p-12'>
                        <div className='mb-6 rounded-full bg-green-50 p-6'>
                            <FileText className='h-16 w-16 text-green-500' />
                        </div>
                        <h3 className='mb-4 font-semibold text-gray-800 text-xl'>Office Document</h3>
                        <p className='mb-8 max-w-md text-center text-gray-500'>
                            Browser previews are not available for Office documents. Please download the file to view it.
                        </p>
                        <Button size='lg' className='bg-green-600 shadow-lg hover:bg-green-700' onClick={() => window.open(url, '_blank')}>
                            Download File <Download className='ml-2 h-5 w-5' />
                        </Button>
                    </div>
                );
            default:
                return (
                    <div className='flex h-full flex-col items-center justify-center rounded-lg border-2 border-gray-200 border-dashed bg-gray-50 p-12'>
                        <div className='mb-6 rounded-full bg-gray-100 p-6'>
                            <FileText className='h-16 w-16 text-gray-400' />
                        </div>
                        <h3 className='mb-4 font-semibold text-gray-800 text-xl'>Preview Not Available</h3>
                        <p className='mb-8 max-w-md text-center text-gray-500'>
                            We can't display a preview for this file type. Try downloading it instead.
                        </p>
                        <Button size='lg' variant='outline' onClick={() => window.open(url, '_blank')}>
                            Download File <Download className='ml-2 h-5 w-5' />
                        </Button>
                    </div>
                );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className='flex h-[90vh] max-w-6xl flex-col overflow-hidden border-0 bg-white p-0 shadow-2xl'>
                <DialogHeader className='shrink-0 flex-row items-center justify-between bg-blue-600 p-6 text-white'>
                    <div>
                        <DialogTitle className='font-bold text-2xl tracking-tight'>Attachment Preview</DialogTitle>
                        {selectedAttachment && <p className='mt-1 text-blue-100 text-sm'>{selectedAttachment.icwatT_FileName}</p>}
                    </div>
                </DialogHeader>

                <div className='flex flex-1 overflow-hidden'>
                    {/* Sidebar / List */}
                    <div className='flex w-80 shrink-0 flex-col border-r bg-gray-50'>
                        <div className='border-b bg-white p-4'>
                            <h4 className='font-bold text-gray-700 text-xs uppercase tracking-wider'>
                                All Attachments ({attachments.length})
                            </h4>
                        </div>
                        <div className='flex-1 space-y-3 overflow-y-auto p-4'>
                            {attachments.map((att, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedAttachment(att)}
                                    className={`flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                                        selectedAttachment === att
                                            ? 'border-blue-500 bg-blue-50 shadow-md ring-4 ring-blue-500/10'
                                            : 'border-transparent bg-white shadow-sm hover:border-gray-200 hover:shadow-sm'
                                    }`}>
                                    <div
                                        className={`mt-1 rounded-lg p-2 ${selectedAttachment === att ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                        <FileText className='h-5 w-5' />
                                    </div>
                                    <div className='flex-1 overflow-hidden'>
                                        <p
                                            className={`truncate font-bold text-sm ${selectedAttachment === att ? 'text-blue-700' : 'text-gray-700'}`}>
                                            {att.icwatT_FileName || 'Attachment ' + (idx + 1)}
                                        </p>
                                        <p className='mt-1 text-gray-400 text-xs capitalize'>
                                            {getFileType(att.icwatT_Attachment || att.icW_Attachment)} file
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className='relative flex flex-1 flex-col overflow-hidden bg-white p-8'>
                        <div className='absolute top-4 right-4 z-10 flex gap-2'>
                            {selectedAttachment && (
                                <Button
                                    variant='outline'
                                    size='sm'
                                    className='bg-white/90 shadow-sm backdrop-blur hover:bg-white'
                                    onClick={() =>
                                        window.open(selectedAttachment.icwatT_Attachment || selectedAttachment.icW_Attachment, '_blank')
                                    }>
                                    <Download className='mr-2 h-4 w-4' /> Download
                                </Button>
                            )}
                        </div>
                        <div className='relative flex-1 overflow-hidden'>
                            {selectedAttachment ? (
                                renderPreview(selectedAttachment)
                            ) : (
                                <div className='flex h-full flex-col items-center justify-center gap-4 text-gray-400'>
                                    <FileText className='h-16 w-16 opacity-20' />
                                    <p className='font-medium text-lg italic'>Select an attachment to preview</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
