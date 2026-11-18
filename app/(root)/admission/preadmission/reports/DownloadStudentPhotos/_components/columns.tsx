'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import type { IPreadmissionDocumentView } from '@/types/admission/preadmission/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import { useState } from 'react';

export const DocumentViewColoumn: ColumnDef<IPreadmissionDocumentView>[] = [
    {
        accessorKey: 'pasr_id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' className='w-full pl-6 font-bold text-black' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='w-full pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },

    {
        id: 'view',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Photo' className='text-center font-bold text-black' />,
        cell: ({ row }) => {
            const data = row.original;
            const studentPhoto =
                data.student_photo || data.pasR_Student_Pic_Path || (data as any).studentPhoto || (data as any).pasr_student_pic_path;
            let fatherPhoto =
                data.pasR_FatherPhoto ||
                (data as any).father_photo ||
                (data as any).fatherPhoto ||
                (data as any).pasr_father_photo ||
                (data as any).pasR_Father_Photo;
            let motherPhoto =
                data.pasR_MotherPhoto ||
                (data as any).mother_photo ||
                (data as any).motherPhoto ||
                (data as any).pasr_mother_photo ||
                (data as any).pasR_Mother_Photo;
            const doclist = data.doclist || [];

            // If not found in primary properties, try to find in doclist by name
            if (!fatherPhoto && doclist.length > 0) {
                fatherPhoto = doclist.find((d: any) => {
                    const name = d.amsmD_DocumentName?.toLowerCase() || '';
                    return name.includes('father photo') || name.includes('father_photo');
                })?.document_Path;
            }
            if (!motherPhoto && doclist.length > 0) {
                motherPhoto = doclist.find((d: any) => {
                    const name = d.amsmD_DocumentName?.toLowerCase() || '';
                    return name.includes('mother photo') || name.includes('mother_photo');
                })?.document_Path;
            }

            // Filter out primary photos from doclist to avoid double-showing them
            const otherDocs = doclist.filter((doc: any) => {
                const path = doc.document_Path;
                if (!path) return false;
                if (path === studentPhoto || path === fatherPhoto || path === motherPhoto) return false;
                const name = doc.amsmD_DocumentName?.toLowerCase() || '';
                if (name.includes('student photo') || name.includes('father photo') || name.includes('mother photo')) return false;
                return true;
            });

            const [selectedDoc, setSelectedDoc] = useState<{ path: string; name: string; type: string } | null>(null);

            const handleViewDoc = (path: string, name: string) => {
                if (!path) return;
                const extension = path.split('.').pop()?.toLowerCase() || '';
                let type = 'other';
                if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) type = 'image';
                else if (extension === 'pdf') type = 'pdf';

                if (type === 'image' || type === 'pdf') {
                    setSelectedDoc({ path, name, type });
                } else {
                    window.open(path, '_blank');
                }
            };

            return (
                <div className='flex flex-col items-start gap-1 py-1'>
                    {studentPhoto && (
                        <Button
                            variant='link'
                            className='h-auto p-0 text-blue-600 hover:text-blue-800 hover:underline'
                            onClick={() => handleViewDoc(studentPhoto, 'Student Photo')}>
                            Student Photo
                        </Button>
                    )}
                    {fatherPhoto && (
                        <Button
                            variant='link'
                            className='h-auto p-0 text-blue-600 hover:text-blue-800 hover:underline'
                            onClick={() => handleViewDoc(fatherPhoto, 'Father Photo')}>
                            Father Photo
                        </Button>
                    )}
                    {motherPhoto && (
                        <Button
                            variant='link'
                            className='h-auto p-0 text-blue-600 hover:text-blue-800 hover:underline'
                            onClick={() => handleViewDoc(motherPhoto, 'Mother Photo')}>
                            Mother Photo
                        </Button>
                    )}
                    {otherDocs.map((doc: any, index: number) => {
                        const path = doc.document_Path;
                        if (!path) return null;
                        const isPdf = path.toLowerCase().endsWith('.pdf');
                        return (
                            <Button
                                key={`view-doc-${index}`}
                                variant='link'
                                className='h-auto p-0 text-blue-600 hover:text-blue-800 hover:underline'
                                onClick={() => handleViewDoc(path, doc.amsmD_DocumentName || 'Document')}>
                                {doc.amsmD_DocumentName || 'Document'}
                                {isPdf && <span className='ml-1 font-bold text-orange-600'>(pdf)</span>}
                            </Button>
                        );
                    })}

                    {selectedDoc && (
                        <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
                            <DialogContent className='flex h-[90vh] max-w-5xl flex-col p-4'>
                                <DialogHeader>
                                    <DialogTitle className='text-center font-bold text-lg'>{selectedDoc.name}</DialogTitle>
                                </DialogHeader>
                                <div className='relative mt-4 flex-1 overflow-hidden rounded-md border bg-gray-50'>
                                    {selectedDoc.type === 'image' ? (
                                        <div className='flex h-full items-center justify-center p-4'>
                                            <img
                                                src={selectedDoc.path}
                                                alt={selectedDoc.name}
                                                className='max-h-full max-w-full object-contain shadow-sm'
                                            />
                                        </div>
                                    ) : (
                                        <iframe src={selectedDoc.path} title={selectedDoc.name} className='h-full w-full border-none' />
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            );
        },
        enableSorting: false
    },
    {
        accessorKey: 'student_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Name' className='font-bold text-black' />,
        cell: ({ row }) => <div className='text-uppercase'>{row.getValue('student_name')}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'pasR_RegistrationNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Registration No' className='font-bold text-black' />,
        cell: ({ row }) => {
            const regNo = row.original.pasR_RegistrationNo ?? 'N.A';
            const date = row.original.pasR_Date;
            const formattedDate = date ? new Date(date).toLocaleDateString('en-GB') : ''; // dd/MM/yyyy
            return (
                <div className='flex flex-col gap-1'>
                    <span>{regNo}</span>
                    {formattedDate && <span className='text-gray-500 text-sm'>{formattedDate}</span>}
                </div>
            );
        },
        enableSorting: true
    },
    {
        accessorKey: 'applied_class_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.original.applied_class_name || row.original.classname || 'N.A'}</div>,
        enableSorting: true
    },
    // {
    //     accessorKey: 'section_name',
    //     header: ({ column }) => <DataTableColumnHeader column={column} title='Section' className='font-bold text-black' />,
    //     cell: ({ row }) => <div>{row.original.section_name || row.original.section_name || 'N.A'}</div>,
    //     enableSorting: true
    // },

    {
        id: 'download',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Download' className='font-bold text-black' />,
        cell: ({ row }) => {
            const data = row.original;
            const studentPhoto =
                data.student_photo || data.pasR_Student_Pic_Path || (data as any).studentPhoto || (data as any).pasr_student_pic_path;
            let fatherPhoto =
                data.pasR_FatherPhoto ||
                (data as any).father_photo ||
                (data as any).fatherPhoto ||
                (data as any).pasr_father_photo ||
                (data as any).pasR_Father_Photo;
            let motherPhoto =
                data.pasR_MotherPhoto ||
                (data as any).mother_photo ||
                (data as any).motherPhoto ||
                (data as any).pasr_mother_photo ||
                (data as any).pasR_Mother_Photo;
            const doclist = data.doclist || [];

            // If not found in primary properties, try to find in doclist by name
            if (!fatherPhoto && doclist.length > 0) {
                fatherPhoto = doclist.find((d: any) => {
                    const name = d.amsmD_DocumentName?.toLowerCase() || '';
                    return name.includes('father photo') || name.includes('father_photo');
                })?.document_Path;
            }
            if (!motherPhoto && doclist.length > 0) {
                motherPhoto = doclist.find((d: any) => {
                    const name = d.amsmD_DocumentName?.toLowerCase() || '';
                    return name.includes('mother photo') || name.includes('mother_photo');
                })?.document_Path;
            }

            // Filter out primary photos from doclist to avoid double-showing them
            const otherDocs = doclist.filter((doc: any) => {
                const path = doc.document_Path;
                if (!path) return false;
                if (path === studentPhoto || path === fatherPhoto || path === motherPhoto) return false;
                const name = doc.amsmD_DocumentName?.toLowerCase() || '';
                if (name.includes('student photo') || name.includes('father photo') || name.includes('mother photo')) return false;
                return true;
            });

            const [downloading, setDownloading] = useState<string | null>(null);

            const handleDownload = async (url: string, filename: string, id: string) => {
                if (!url) return;
                setDownloading(id);
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error('Network response was not ok');
                    const blob = await response.blob();
                    const objectUrl = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = objectUrl;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(objectUrl);
                } catch (error) {
                    console.error('Download failed:', error);
                    window.open(url, '_blank');
                } finally {
                    setDownloading(null);
                }
            };

            return (
                <div className='flex flex-col items-start gap-1 py-1'>
                    {studentPhoto && (
                        <button
                            type='button'
                            className='flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800'
                            onClick={() => handleDownload(studentPhoto, `Student_Photo_${row.original.pasr_id}.jpg`, 'student')}>
                            {downloading === 'student' ? <Spinner size='sm' /> : <Download className='h-4 w-4' />}
                            <span className='text-sm'>Download</span>
                        </button>
                    )}
                    {fatherPhoto && (
                        <button
                            type='button'
                            className='flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800'
                            onClick={() => handleDownload(fatherPhoto, `Father_Photo_${row.original.pasr_id}.jpg`, 'father')}>
                            {downloading === 'father' ? <Spinner size='sm' /> : <Download className='h-4 w-4' />}
                            <span className='text-sm'>Download</span>
                        </button>
                    )}
                    {motherPhoto && (
                        <button
                            type='button'
                            className='flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800'
                            onClick={() => handleDownload(motherPhoto, `Mother_Photo_${row.original.pasr_id}.jpg`, 'mother')}>
                            {downloading === 'mother' ? <Spinner size='sm' /> : <Download className='h-4 w-4' />}
                            <span className='text-sm'>Download</span>
                        </button>
                    )}
                    {otherDocs.map((doc: any, index: number) => {
                        const path = doc.document_Path;
                        if (!path) return null;
                        const ext = path.split('.').pop() || 'file';
                        return (
                            <button
                                key={`download-doc-${index}`}
                                type='button'
                                className='flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800'
                                onClick={() =>
                                    handleDownload(
                                        path,
                                        `${doc.amsmD_DocumentName || 'Document'}_${data.pasr_id || (data as any).pasR_Id}.${ext}`,
                                        `doc-${index}`
                                    )
                                }>
                                {downloading === `doc-${index}` ? <Spinner size='sm' /> : <Download className='h-4 w-4' />}
                                <span className='text-sm'>Download {doc.amsmD_DocumentName}</span>
                            </button>
                        );
                    })}
                </div>
            );
        },
        enableSorting: false
    }
];
