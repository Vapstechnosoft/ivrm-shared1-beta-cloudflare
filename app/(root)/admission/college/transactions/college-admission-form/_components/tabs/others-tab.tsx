'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, GraduationCap, Plus, Share2, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';

export function OthersTab({ initialData, onBack }: { initialData: any; onBack: () => void }) {
    const { control, watch, setValue } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'prevSchoolDetails'
    });

    return (
        <Card className='border-none bg-transparent shadow-none'>
            <CardContent className='grid gap-12 p-0'>
                {/* Reference & Source */}
                <div className='grid grid-cols-1 gap-12 md:grid-cols-2'>
                    <div className='space-y-4'>
                        <div className='flex items-center gap-2 border-b pb-2 font-semibold text-primary'>
                            <Share2 className='h-5 w-5' />
                            Reference Details
                        </div>
                        <div className='grid grid-cols-2 gap-2'>
                            {initialData.allRefrence?.map((ref: any) => (
                                <div key={ref.pamR_Id} className='flex items-center space-x-2'>
                                    <Checkbox id={`ref-${ref.pamR_Id}`} />
                                    <label htmlFor={`ref-${ref.pamR_Id}`} className='cursor-pointer font-medium text-sm leading-none'>
                                        {ref.pamR_ReferenceName}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='space-y-4'>
                        <div className='flex items-center gap-2 border-b pb-2 font-semibold text-primary'>
                            <Share2 className='h-5 w-5' />
                            Source Details
                        </div>
                        <div className='grid grid-cols-2 gap-2'>
                            {initialData.allSources?.map((src: any) => (
                                <div key={src.pamS_Id} className='flex items-center space-x-2'>
                                    <Checkbox id={`src-${src.pamS_Id}`} />
                                    <label htmlFor={`src-${src.pamS_Id}`} className='cursor-pointer font-medium text-sm leading-none'>
                                        {src.pamS_SourceName}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Previous Educational Details */}
                <div className='space-y-4'>
                    <div className='flex items-center justify-between border-b pb-2'>
                        <div className='flex items-center gap-2 font-semibold text-primary'>
                            <GraduationCap className='h-5 w-5' />
                            Previous Educational Details
                        </div>
                        <Button type='button' variant='outline' size='sm' onClick={() => append({})}>
                            <Plus className='mr-1 h-4 w-4' />
                            Add More
                        </Button>
                    </div>

                    <div className='rounded-md border'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>College Name</TableHead>
                                    <TableHead>Board</TableHead>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Max Marks</TableHead>
                                    <TableHead>Obtained</TableHead>
                                    <TableHead>Percentage</TableHead>
                                    <TableHead className='w-[50px]'></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell>
                                            <Input
                                                size={1}
                                                {...control.register(`prevSchoolDetails.${index}.acstpS_PrvSchoolName` as const)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                size={1}
                                                {...control.register(`prevSchoolDetails.${index}.acstpS_PreviousBoard` as const)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                size={1}
                                                {...control.register(`prevSchoolDetails.${index}.acstpS_PassingYear` as const)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                size={1}
                                                {...control.register(`prevSchoolDetails.${index}.acstpS_PreviousMaxMarks` as const)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                size={1}
                                                {...control.register(`prevSchoolDetails.${index}.acstpS_PreviousMarks` as const)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                size={1}
                                                {...control.register(`prevSchoolDetails.${index}.acstpS_PreviousPer` as const)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='icon'
                                                onClick={() => remove(index)}
                                                disabled={fields.length === 1}>
                                                <Trash2 className='h-4 w-4 text-destructive' />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className='flex justify-between pt-6'>
                    <Button type='button' variant='outline' onClick={onBack}>
                        <ChevronLeft className='mr-2 h-4 w-4' />
                        Previous
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
