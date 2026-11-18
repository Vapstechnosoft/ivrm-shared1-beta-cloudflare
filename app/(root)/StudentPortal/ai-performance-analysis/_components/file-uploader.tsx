'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import type { ChangeEvent } from 'react';

interface FileUploaderProps {
    onFileSelect: (file: File) => void;
    isLoading?: boolean;
}

export function FileUploader({ onFileSelect, isLoading }: FileUploaderProps) {
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <Card className='border-2 border-dashed'>
            <CardContent className='flex flex-col items-center justify-center space-y-1 py-1.5'>
                <div className='rounded-full bg-primary/10 p-1.5'>
                    <Upload className='h-4 w-4 text-primary' />
                </div>
                <div className='text-center'>
                    <h3 className='font-semibold text-sm leading-none'>Upload Your Report Card</h3>
                    <p className='text-[10px] text-muted-foreground'>PDF, CSV, Excel (.xlsx, .xls)</p>
                </div>
                <div className='flex flex-col items-center'>
                    <input
                        type='file'
                        className='hidden'
                        accept='.csv, .xlsx, .xls, .pdf'
                        onChange={handleFileChange}
                        disabled={isLoading}
                        id='file-upload'
                    />
                    <Button
                        size='sm'
                        className='h-7 rounded-full px-4 text-[11px]'
                        disabled={isLoading}
                        onClick={() => document.getElementById('file-upload')?.click()}>
                        Select File
                    </Button>
                    {isLoading && <p className='animate-pulse text-[9px] text-muted-foreground'>Processing...</p>}
                </div>
            </CardContent>
        </Card>
    );
}
