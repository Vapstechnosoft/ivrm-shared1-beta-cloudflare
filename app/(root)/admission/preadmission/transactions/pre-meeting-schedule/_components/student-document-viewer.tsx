'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetStudentDocsOnly } from '@/hooks/admission/preadmission/transactions/use-pre-meeting-schedule';
import type { IPreMeetingSchedule } from '@/types/admission/preadmission/transactions/pre-meeting-schedule';
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StudentDocumentViewerProps {
    isOpen: boolean;
    onClose: () => void;
    record: IPreMeetingSchedule | null;
}

export default function StudentDocumentViewer({ isOpen, onClose, record }: StudentDocumentViewerProps) {
    const { mutate: getDocs, isPending } = useGetStudentDocsOnly();
    const [documents, setDocuments] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [zoom, setZoom] = useState(100);

    useEffect(() => {
        if (isOpen && record) {
            getDocs(
                { pasR_Id: record.pasr_id },
                {
                    onSuccess: (res: any) => {
                        if (res?.ddoc && res.ddoc.length > 0) {
                            const formattedDocs = res.ddoc.map((doc: any) => {
                                const ext = doc.document_Path.split('.').pop()?.toLowerCase();
                                return {
                                    ...doc,
                                    filetype: ext,
                                    isOfficeDoc: ['xlsx', 'xls', 'xlsm', 'docx', 'doc'].includes(ext || ''),
                                    isPdf: ext === 'pdf',
                                    isImage: ['jpg', 'jpeg', 'png', 'gif'].includes(ext || ''),
                                    viewPath: ['xlsx', 'xls', 'xlsm', 'docx', 'doc'].includes(ext || '')
                                        ? `https://view.officeapps.live.com/op/view.aspx?src=${doc.document_Path}`
                                        : doc.document_Path
                                };
                            });
                            setDocuments(formattedDocs);
                            setCurrentIndex(0);
                            setZoom(100);
                        } else {
                            setDocuments([]);
                        }
                    }
                }
            );
        } else {
            setDocuments([]);
        }
    }, [isOpen, record, getDocs]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % documents.length);
        setZoom(100);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + documents.length) % documents.length);
        setZoom(100);
    };

    const currentDoc = documents[currentIndex];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='flex h-[90vh] max-w-4xl flex-col'>
                <DialogHeader>
                    <DialogTitle className='flex items-center justify-between pr-8 font-bold text-blue-800 text-xl'>
                        <span>Documents for {record?.studentname}</span>
                        {documents.length > 0 && (
                            <span className='rounded-full bg-slate-100 px-3 py-1 font-normal text-muted-foreground text-sm'>
                                {currentIndex + 1} of {documents.length}
                            </span>
                        )}
                    </DialogTitle>
                    <DialogDescription>{currentDoc ? currentDoc.amsmD_DocumentName : 'No documents available'}</DialogDescription>
                </DialogHeader>

                <div className='relative flex flex-1 flex-col overflow-hidden rounded-lg border bg-slate-100/50'>
                    {isPending ? (
                        <div className='flex flex-1 items-center justify-center'>
                            <span className='animate-pulse font-medium text-slate-500'>Loading documents...</span>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className='flex flex-1 items-center justify-center'>
                            <span className='text-slate-500'>No documents found for this student.</span>
                        </div>
                    ) : (
                        <>
                            {/* Toolbar */}
                            <div className='flex h-12 items-center justify-between border-b bg-white px-4'>
                                <div className='flex items-center gap-2'>
                                    {currentDoc.isImage && (
                                        <>
                                            <Button variant='ghost' size='icon' onClick={() => setZoom((z) => Math.max(50, z - 25))}>
                                                <ZoomOut className='h-4 w-4' />
                                            </Button>
                                            <span className='w-12 text-center font-medium text-xs'>{zoom}%</span>
                                            <Button variant='ghost' size='icon' onClick={() => setZoom((z) => Math.min(200, z + 25))}>
                                                <ZoomIn className='h-4 w-4' />
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Button variant='ghost' size='sm' asChild>
                                        <a href={currentDoc.document_Path} target='_blank' rel='noopener noreferrer'>
                                            <Download className='mr-2 h-4 w-4' /> Download
                                        </a>
                                    </Button>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className='relative flex flex-1 items-center justify-center overflow-auto bg-slate-50 p-4'>
                                {currentDoc.isImage && (
                                    <div
                                        className='relative transition-transform duration-200 ease-in-out'
                                        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={currentDoc.viewPath}
                                            alt={currentDoc.amsmD_DocumentName}
                                            className='max-h-[70vh] max-w-full rounded border bg-white object-contain shadow-sm'
                                        />
                                    </div>
                                )}

                                {currentDoc.isPdf && (
                                    <iframe
                                        src={currentDoc.viewPath}
                                        className='h-full w-full rounded border bg-white shadow-sm'
                                        title={currentDoc.amsmD_DocumentName}
                                    />
                                )}

                                {currentDoc.isOfficeDoc && (
                                    <iframe
                                        src={currentDoc.viewPath}
                                        className='h-full w-full rounded border bg-white shadow-sm'
                                        title={currentDoc.amsmD_DocumentName}
                                    />
                                )}

                                {!currentDoc.isImage && !currentDoc.isPdf && !currentDoc.isOfficeDoc && (
                                    <div className='rounded border bg-white p-8 text-center shadow-sm'>
                                        <p className='mb-4 text-slate-500'>
                                            Preview not available for this file type ({currentDoc.filetype})
                                        </p>
                                        <Button asChild>
                                            <a href={currentDoc.document_Path} target='_blank' rel='noopener noreferrer'>
                                                Download File
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Navigation Overlays */}
                            {documents.length > 1 && (
                                <>
                                    <Button
                                        variant='secondary'
                                        size='icon'
                                        className='-translate-y-1/2 absolute top-1/2 left-4 h-10 w-10 rounded-full opacity-70 shadow-lg hover:opacity-100'
                                        onClick={handlePrev}>
                                        <ChevronLeft className='h-6 w-6' />
                                    </Button>
                                    <Button
                                        variant='secondary'
                                        size='icon'
                                        className='-translate-y-1/2 absolute top-1/2 right-4 h-10 w-10 rounded-full opacity-70 shadow-lg hover:opacity-100'
                                        onClick={handleNext}>
                                        <ChevronRight className='h-6 w-6' />
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
