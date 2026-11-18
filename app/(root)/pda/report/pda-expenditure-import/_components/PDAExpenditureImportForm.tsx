'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IPDAExpenditureImportRow } from '@/types/pda/report/pda-expenditure-import';
import { AlertCircle, FileCheck, Upload } from 'lucide-react';
import type React from 'react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface PDAExpenditureImportFormProps {
    academicYears: { asmaY_Id: number; asmaY_Year: string }[];
    selectedAsmayId: number | null;
    setSelectedAsmayId: (id: number | null) => void;
    trnType: 'Debit' | 'Credit';
    setTrnType: (type: 'Debit' | 'Credit') => void;
    onImport: (data: IPDAExpenditureImportRow[]) => void;
}

export default function PDAExpenditureImportForm({
    academicYears,
    selectedAsmayId,
    setSelectedAsmayId,
    trnType,
    setTrnType,
    onImport
}: PDAExpenditureImportFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx');

        if (!isExcel) {
            toast.error('Please select a valid Excel file (.xlsx)');
            if (fileInputRef.current) fileInputRef.current.value = '';
            setFileName(null);
            return;
        }

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = evt.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json<IPDAExpenditureImportRow>(worksheet);

                if (jsonData.length === 0) {
                    toast.error('Excel sheet is empty');
                    setFileName(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    return;
                }

                // Basic structure check
                const requiredFields = ['RollNumber', 'Date', 'Amount', 'StudentName', 'Particulars', 'VoucherNo'];
                const firstRow = jsonData[0];
                const missingFields = requiredFields.filter((field) => !(field in firstRow));

                if (missingFields.length > 0) {
                    toast.error(`Missing required columns: ${missingFields.join(', ')}`);
                    setFileName(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    return;
                }

                onImport(jsonData);
            } catch (error) {
                console.error('Error parsing Excel:', error);
                toast.error('Failed to parse Excel file');
                setFileName(null);
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className='space-y-8'>
            <div className='flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4'>
                <AlertCircle className='mt-0.5 h-5 w-5 text-amber-500' />
                <p className='font-medium text-amber-800 text-sm'>
                    Kindly select only one Excel sheet to import. Ensure the columns follow the required format:
                    <span className='ml-1 font-bold italic'>
                        RollNumber, Date (DD/MM/YYYY), Amount, StudentName, Particulars, VoucherNo
                    </span>
                </p>
            </div>

            <div className='grid grid-cols-1 items-end gap-8 md:grid-cols-2'>
                <div className='space-y-3'>
                    <Label className='font-semibold text-gray-700 text-sm'>Transaction Type</Label>
                    <RadioGroup
                        value={trnType}
                        onValueChange={(val) => setTrnType(val as 'Debit' | 'Credit')}
                        className='flex gap-6 rounded-xl border border-gray-100 bg-gray-50 p-4'>
                        <div className='group flex cursor-pointer items-center space-x-2'>
                            <RadioGroupItem value='Debit' id='debit' className='border-primary text-primary' />
                            <Label htmlFor='debit' className='cursor-pointer font-medium transition-colors group-hover:text-primary'>
                                Deduct from PDA (Debit)
                            </Label>
                        </div>
                        <div className='group flex cursor-pointer items-center space-x-2'>
                            <RadioGroupItem value='Credit' id='credit' className='border-primary text-primary' />
                            <Label htmlFor='credit' className='cursor-pointer font-medium transition-colors group-hover:text-primary'>
                                Credit
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className='space-y-3'>
                    <Label htmlFor='academic-year' className='font-semibold text-gray-700 text-sm'>
                        Academic Year
                    </Label>
                    <Select value={selectedAsmayId?.toString()} onValueChange={(val) => setSelectedAsmayId(Number(val))}>
                        <SelectTrigger className='h-12 rounded-xl border-gray-200 shadow-sm transition-all hover:border-primary'>
                            <SelectValue placeholder='Select Academic Year' />
                        </SelectTrigger>
                        <SelectContent className='rounded-xl border-gray-100 shadow-2xl'>
                            {academicYears.map((year) => (
                                <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()} className='cursor-pointer'>
                                    {year.asmaY_Year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className='space-y-3'>
                <Label className='font-semibold text-gray-700 text-sm'>Choose Excel File</Label>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 ${fileName ? 'border-green-400 bg-green-50/30' : 'border-gray-200 hover:border-primary hover:bg-primary/5'}
                    `}>
                    <input type='file' ref={fileInputRef} onChange={handleFileChange} accept='.xlsx' className='hidden' />
                    {fileName ? (
                        <>
                            <div className='mb-2 rounded-full bg-green-100 p-2'>
                                <FileCheck className='h-6 w-6 text-green-600' />
                            </div>
                            <span className='font-semibold text-green-700 text-sm'>{fileName}</span>
                            <span className='mt-1 text-green-600 text-xs'>Click to change file</span>
                        </>
                    ) : (
                        <>
                            <div className='mb-2 rounded-full bg-primary/10 p-2'>
                                <Upload className='h-6 w-6 text-primary' />
                            </div>
                            <span className='font-semibold text-gray-600 text-sm'>Click to upload Excel file</span>
                            <span className='mt-1 text-gray-400 text-xs'>Only .xlsx files are supported</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
