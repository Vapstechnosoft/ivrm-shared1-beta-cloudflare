'use client';

import { Button } from '@/components/ui/button';
import { IDocumentViewClgStudent } from '@/types/college/reports';
import { type ColumnDef } from '@tanstack/react-table';
import { Download, Eye, Image as ImageIcon } from 'lucide-react';

interface ColumnCallbacks {
    onViewPhoto: (url: string) => void;
    onViewApplication: (student: IDocumentViewClgStudent) => void;
    onDownload: (url: string, filename: string) => void;
    onViewDoc: (url: string, name: string) => void;
}

export const getDocumentViewColumns = (callbacks: ColumnCallbacks): ColumnDef<IDocumentViewClgStudent>[] => [
    {
        id: 'slNo',
        header: () => <div className='text-center font-bold text-black'>SL.No</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 70
    },
    {
        accessorKey: 'pacA_StudentPhoto',
        header: () => <div className='text-center font-bold text-black'>Photo</div>,
        cell: ({ row }) => {
            const photoUrl = row.original.pacA_StudentPhoto;
            return (
                <div className='flex justify-center'>
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt='Student'
                            className='h-12 w-12 object-cover rounded-md border border-muted hover:scale-105 transition-transform duration-200 cursor-pointer'
                            onClick={() => callbacks.onViewPhoto(photoUrl)}
                        />
                    ) : (
                        <div className='h-12 w-12 bg-muted rounded-md flex items-center justify-center border border-dashed'>
                            <ImageIcon className='h-5 w-5 text-muted-foreground' />
                        </div>
                    )}
                </div>
            );
        },
        enableSorting: false,
        size: 90
    },
    {
        accessorKey: 'name',
        header: () => <div className='text-center font-bold text-black'>Name</div>,
        cell: ({ row }) => <div className='text-center font-medium uppercase'>{row.original.name}</div>,
        size: 180
    },
    {
        accessorKey: 'pacA_RegistrationNo',
        header: () => <div className='text-center font-bold text-black'>Registration No</div>,
        cell: ({ row }) => <div className='text-center font-mono font-semibold'>{row.original.pacA_RegistrationNo}</div>,
        size: 140
    },
    {
        accessorKey: 'classname',
        header: () => <div className='text-center font-bold text-black'>Course</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.classname}</div>,
        size: 150
    },
    {
        id: 'viewApplication',
        header: () => <div className='text-center font-bold text-black'>View Application</div>,
        cell: ({ row }) => (
            <div className='flex justify-center'>
                <Button
                    variant='link'
                    className='text-primary h-auto p-0 flex items-center gap-1 font-medium hover:underline'
                    onClick={() => callbacks.onViewApplication(row.original)}>
                    <Eye className='h-4 w-4' /> View
                </Button>
            </div>
        ),
        size: 140
    },
    {
        id: 'viewDocs',
        header: () => <div className='text-center font-bold text-black'>View</div>,
        cell: ({ row }) => {
            const student = row.original;
            return (
                <div className='flex flex-col gap-1 items-center text-xs'>
                    {student.pacA_StudentPhoto && (
                        <button
                            type='button'
                            className='text-blue-600 hover:underline font-medium text-left'
                            onClick={() => callbacks.onViewPhoto(student.pacA_StudentPhoto!)}>
                            Student Photo
                        </button>
                    )}
                    {student.doclist?.map((doc, idx) => (
                        <button
                            key={idx}
                            type='button'
                            className='text-blue-600 hover:underline text-left'
                            onClick={() => callbacks.onViewDoc(doc.document_Path, doc.amsmD_DocumentName)}>
                            {doc.amsmD_DocumentName}
                            {doc.filetype === 'pdf' && <span className='text-orange-500 ml-1 text-[10px]'>(pdf)</span>}
                        </button>
                    ))}
                </div>
            );
        },
        size: 180
    },
    {
        id: 'downloadDocs',
        header: () => <div className='text-center font-bold text-black'>Download</div>,
        cell: ({ row }) => {
            const student = row.original;
            return (
                <div className='flex flex-col gap-1 items-center text-xs'>
                    {student.pacA_StudentPhoto && (
                        <button
                            type='button'
                            className='text-blue-600 hover:underline flex items-center gap-1 text-left'
                            onClick={() => callbacks.onDownload(student.pacA_StudentPhoto!, `${student.name}_photo`)}>
                            <Download className='h-3 w-3' /> Download Photo
                        </button>
                    )}
                    {student.doclist?.map((doc, idx) => (
                        <button
                            key={idx}
                            type='button'
                            className='text-blue-600 hover:underline flex items-center gap-1 text-left'
                            onClick={() => callbacks.onDownload(doc.document_Path, doc.amsmD_DocumentName)}>
                            <Download className='h-3 w-3' /> Download Doc
                        </button>
                    ))}
                </div>
            );
        },
        size: 180
    }
];
