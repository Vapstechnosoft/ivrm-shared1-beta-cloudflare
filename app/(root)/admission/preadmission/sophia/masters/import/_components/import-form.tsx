'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileUp, Info, X } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';

interface ImportFormProps {
    onDataLoaded: (data: any[], columns: string[]) => void;
    onClear: () => void;
}

export default function ImportForm({ onDataLoaded, onClear }: ImportFormProps) {
    const [importType, setImportType] = useState<'all' | 'individual'>('all');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.name.endsWith('.xlsx')) {
                setSelectedFile(file);
                parseExcel(file);
            } else {
                alert('Please upload a .xlsx file');
            }
        }
    };

    const parseExcel = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
            const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];

            if (jsonData.length === 0) {
                alert('Excel Sheet is Empty');
                return;
            }

            // Helper to convert Excel serial date to DD-MM-YYYY
            const formatExcelDate = (val: any) => {
                if (typeof val === 'number') {
                    // Excel epoch is 1900-01-01
                    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    return `${day}/${month}/${year}`;
                }
                return val;
            };

            const formattedData = jsonData.map((row) => {
                const newRow = { ...row };
                for (const key of Object.keys(newRow)) {
                    const lowerKey = key.toLowerCase();
                    // Identify fields that are dates
                    if (lowerKey.includes('date') || lowerKey === 'dob') {
                        newRow[key] = formatExcelDate(newRow[key]);
                    } else if (typeof newRow[key] === 'number') {
                        newRow[key] = String(newRow[key]);
                    }
                }
                return newRow;
            });

            onDataLoaded(formattedData, headers);
        };
        reader.readAsBinaryString(file);
    };

    const handleClear = () => {
        setSelectedFile(null);
        setImportType('all');
        onClear();
    };

    return (
        <Card className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <CardHeader className='border-b bg-muted/50'>
                <CardTitle className='flex items-center gap-2 font-bold text-xl'>
                    <FileUp className='h-5 w-5 text-primary' />
                    Student Data Import
                </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6 pt-6'>
                <div className='flex flex-col items-center justify-center space-y-4'>
                    <div className='flex items-center gap-8 rounded-lg border bg-muted/30 p-4'>
                        <RadioGroup
                            value={importType}
                            onValueChange={(v) => setImportType(v as 'all' | 'individual')}
                            className='flex items-center gap-6'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='all' id='all' />
                                <Label htmlFor='all' className='cursor-pointer text-base'>
                                    All
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='individual' id='individual' />
                                <Label htmlFor='individual' className='cursor-pointer text-base'>
                                    Individual
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className='flex items-center gap-2 rounded-full border border-green-100 bg-green-50 p-2 px-4 text-green-600'>
                        <Info className='h-4 w-4 font-bold' />
                        <span className='font-semibold text-sm'>Kindly Select Only One Excel Sheet To Import</span>
                    </div>

                    <div className='w-full max-w-md'>
                        {!selectedFile ? (
                            <div className='group relative'>
                                <Input type='file' accept='.xlsx' onChange={handleFileChange} className='hidden' id='file-upload' />
                                <Label
                                    htmlFor='file-upload'
                                    className='flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/20 transition-all duration-300 group-hover:border-primary/50 group-hover:bg-muted/40'>
                                    <FileUp className='mb-2 h-8 w-8 text-muted-foreground group-hover:text-primary' />
                                    <span className='font-medium text-muted-foreground text-sm group-hover:text-primary'>
                                        Click to upload or drag and drop
                                    </span>
                                    <span className='mt-1 text-muted-foreground text-xs'>(Only .xlsx files are supported)</span>
                                </Label>
                            </div>
                        ) : (
                            <div className='flex items-center justify-between rounded-lg border border-secondary/30 bg-secondary/20 p-3'>
                                <div className='flex items-center gap-3'>
                                    <div className='rounded bg-green-100 p-2'>
                                        <FileUp className='h-5 w-5 text-green-600' />
                                    </div>
                                    <div className='flex flex-col'>
                                        <span className='max-w-[200px] truncate font-medium text-sm'>{selectedFile.name}</span>
                                        <span className='text-muted-foreground text-xs'>{(selectedFile.size / 1024).toFixed(2)} KB</span>
                                    </div>
                                </div>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={handleClear}
                                    className='text-destructive hover:bg-destructive/10'>
                                    <X className='h-4 w-4' />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
