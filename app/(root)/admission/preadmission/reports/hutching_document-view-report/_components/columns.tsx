'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useStudentPrintData } from '@/hooks/admission/preadmission/useTransactions';
import type { IPreadmissionDocumentView } from '@/types/admission/preadmission/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { Download, Eye, FileText } from 'lucide-react';
import React, { useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import ApplicationPrintView from './application-print-view';

export const documentViewReportColumns: ColumnDef<IPreadmissionDocumentView>[] = [
    {
        accessorKey: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' className='font-bold text-black' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return pageIndex * pageSize + row.index + 1;
        }
    },
    {
        accessorKey: 'student_photo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Photo' className='font-bold text-black' />,
        cell: ({ row }) => {
            const photoPath = row.original.student_photo || row.original.pasR_Student_Pic_Path;
            return (
                <div className='h-10 w-10 overflow-hidden rounded-full border'>
                    <img
                        src={photoPath || '/placeholder-user.png'}
                        alt='Student'
                        className='h-full w-full object-cover'
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-user.png';
                        }}
                    />
                </div>
            );
        }
    },
    {
        accessorKey: 'student_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Name' className='font-bold text-black' />,
        cell: ({ row }) => <span className='uppercase'>{row.original.student_name}</span>
    },
    {
        accessorKey: 'pasR_RegistrationNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Registration No' className='font-bold text-black' />
    },
    {
        accessorKey: 'applied_class_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' className='font-bold text-black' />
    },
    {
        id: 'application_form',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Application Form' className='font-bold text-black' />,
        cell: ({ row }) => {
            const [open, setOpen] = useState(false);
            const printRef = React.useRef<HTMLDivElement>(null);

            const { data: studentDetails, isLoading } = useStudentPrintData(
                row.original.pasr_id || (row.original as any).pasR_Id,
                (row.original as any).selected_asmcL_Id || row.original.asmcl_id || 0,
                (row.original as any).selected_asmaY_Id || row.original.asmaY_Id || 0,
                (row.original as any).asmst_Id || (row.original as any).ASMST_Id || 0, // Pass ASMST_Id if available
                open // Fetch data only when the dialog is opened
            );

            const handlePrint = useReactToPrint({
                contentRef: printRef,
                documentTitle: '',
                pageStyle: `
                    @page {
                        size: A4 portrait;
                        margin: 0 !important;
                    }
                    @media print {
                        html, body {
                            margin: 0 !important;
                            padding: 0 !important;
                            background: #fff !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }
                `
            });

            return (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant='link' className='h-auto p-0 text-blue-600 hover:underline'>
                            <Eye className='mr-1 h-4 w-4' /> View Application
                        </Button>
                    </DialogTrigger>
                    <DialogContent className='flex max-h-[90vh] max-w-4xl flex-col overflow-hidden'>
                        <DialogHeader>
                            <DialogTitle>Admission Form</DialogTitle>
                        </DialogHeader>
                        <div className='flex-1 overflow-auto'>
                            {isLoading ? (
                                <div className='flex flex-col items-center justify-center p-10 space-y-4'>
                                    <Spinner className='bg-primary' size='lg' />
                                    <p className='text-sm text-muted-foreground font-medium'>Loading student details...</p>
                                </div>
                            ) : (
                                <ApplicationPrintView
                                    printRef={printRef}
                                    data={{
                                        ...studentDetails,
                                        ...(studentDetails?.data || {}),
                                        student_photo: (row.original as any).student_photo || (row.original as any).pasR_Student_Pic_Path,
                                        academic_year: studentDetails?.data?.academic_year || studentDetails?.academic_year || row.original.academic_year || '',
                                        asmcL_ClassName: studentDetails?.data?.asmcL_ClassName || studentDetails?.asmcL_ClassName || row.original.applied_class_name || '',
                                        pasr_id: row.original.pasr_id || (row.original as any).pasR_Id,
                                        pasR_RegistrationNo: row.original.pasR_RegistrationNo
                                    }}
                                />
                            )}
                        </div>
                        <div className='flex justify-end border-t p-4'>
                            <Button onClick={() => handlePrint()} variant='outline'>
                                Print
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            );
        }
    },
    {
        id: 'view',
        header: ({ column }) => <DataTableColumnHeader column={column} title='View' className='font-bold text-black' />,
        cell: ({ row }) => {
            const docs = row.original.doclist || [];
            return (
                <div className='flex flex-col gap-1'>
                    {docs.map((doc: any, index: number) => (
                        <a
                            key={index}
                            href={doc.document_Path}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center gap-1 text-blue-600 text-xs hover:underline'>
                            <FileText className='h-3 w-3' /> {doc.amsmD_DocumentName}
                        </a>
                    ))}
                </div>
            );
        }
    },
    {
        id: 'download',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Download' className='font-bold text-black' />,
        cell: ({ row }) => {
            const docs = row.original.doclist || [];
            
            const handleDownload = async (url: string, fileName: string) => {
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error('Network response was not ok');
                    const blob = await response.blob();
                    const blobUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    const extension = url.split('.').pop() || '';
                    const hasExtension = fileName.includes('.');
                    link.download = hasExtension ? fileName : `${fileName}.${extension}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(blobUrl);
                } catch (error) {
                    console.error("Error downloading the file:", error);
                    window.open(url, '_blank');
                }
            };

            return (
                <div className='flex flex-col gap-1'>
                    {docs.map((doc: any, index: number) => (
                        <span
                            key={index}
                            onClick={() => handleDownload(doc.document_Path, doc.amsmD_DocumentName || 'download')}
                            className='flex items-center gap-1 text-blue-600 text-xs hover:underline cursor-pointer'>
                            <Download className='h-3 w-3' /> {doc.amsmD_DocumentName}
                        </span>
                    ))}
                </div>
            );
        }
    }
];
