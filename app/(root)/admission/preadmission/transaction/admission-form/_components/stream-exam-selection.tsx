'use client';

import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Control, Controller } from 'react-hook-form';

interface StreamExamSelectionProps {
    control: Control<any>;
    streams: any[];
    exams: any[];
    isLoading?: boolean;
    error?: string;
}

export function StreamExamSelection({ control, streams, exams, isLoading, error }: StreamExamSelectionProps) {
    return (
        <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='flex flex-col gap-1.5'>
                    <Label htmlFor='asmsT_Id'>Stream</Label>
                    <Controller
                        name='asmsT_Id'
                        control={control}
                        render={({ field }) => (
                            <Select
                                key={field.value || 'empty'}
                                onValueChange={(value) => field.onChange(Number(value))}
                                value={field.value?.toString() || ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Stream' />
                                </SelectTrigger>
                                <SelectContent>
                                    {streams.map((item: any) => (
                                        <SelectItem key={item.asmsT_Id} value={item.asmsT_Id.toString()}>
                                            {item.asmsT_StreamName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </div>

            {exams && exams.length > 0 && (
                <div className='overflow-hidden rounded-xl border border-gray-200 bg-white'>
                    <div className='border-gray-200 border-b bg-gray-50 px-4 py-3'>
                        <h3 className='font-semibold text-gray-900 text-sm'>Competitive Exam Selection</h3>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow className='bg-gray-50/50'>
                                <TableHead className='w-[200px]'>Stream</TableHead>
                                <TableHead>Competitive Exam</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className='font-medium'>
                                    {streams.find((s) => s.asmsT_Id === control._formValues.asmsT_Id)?.asmsT_StreamName ||
                                        'Selected Stream'}
                                </TableCell>
                                <TableCell>
                                    <Controller
                                        name='ASMCE_Id'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                key={field.value || 'empty'}
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value?.toString() || ''}>
                                                <SelectTrigger className='w-full md:w-[300px]'>
                                                    <SelectValue placeholder='Select Competitive Exam' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {exams.map((item: any) => (
                                                        <SelectItem key={item.asmcE_Id} value={item.asmcE_Id.toString()}>
                                                            {item.asmcE_CompetitiveExams}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            )}

            {error && <p className='text-red-500 text-sm'>{error}</p>}
            {isLoading && <p className='text-gray-500 text-sm'>Loading exam details...</p>}
        </div>
    );
}
