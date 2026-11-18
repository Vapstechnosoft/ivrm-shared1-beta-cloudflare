'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form';

interface SubjectGroupTableProps<T extends FieldValues> {
    control: Control<T>;
    electiveList: any[];
    isLoading?: boolean;
}

export function SubjectGroupTable<T extends FieldValues>({ control, electiveList, isLoading }: SubjectGroupTableProps<T>) {
    return (
        <div className='space-y-4'>
            <Label htmlFor='electivelist_Groups'>Integrated Programs / Elective Groups</Label>

            <div className='overflow-hidden rounded-xl border border-gray-200 bg-white'>
                <Table>
                    <TableHeader>
                        <TableRow className='bg-gray-50/50'>
                            <TableHead className='w-[80px] text-center'>SL.No.</TableHead>
                            <TableHead>Group Name</TableHead>
                            <TableHead className='w-[100px] text-center'>Selection</TableHead>
                            <TableHead>Subjects</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className='py-8 text-center text-gray-500'>
                                    Loading elective groups...
                                </TableCell>
                            </TableRow>
                        ) : electiveList && electiveList.length > 0 ? (
                            electiveList.map((group: any, groupIdx: number) => {
                                const subjects = group.subjects || [];
                                const rowCount = subjects.length || 1;

                                return (
                                    <Controller<T>
                                        key={group.asmgC_Id}
                                        name={'electivelist_Groups' as Path<T>}
                                        control={control}
                                        render={({ field }) => {
                                            const isSelected = ((field.value as any[]) || []).includes(group.asmgC_Id);

                                            const handleToggle = (checked: boolean) => {
                                                const currentVals = (field.value as any[]) || [];
                                                if (checked) {
                                                    field.onChange([...currentVals, group.asmgC_Id]);
                                                } else {
                                                    field.onChange(currentVals.filter((v: any) => v !== group.asmgC_Id));
                                                }
                                            };

                                            return (
                                                <>
                                                    {subjects.length > 0 ? (
                                                        subjects.map((subject: any, subIdx: number) => (
                                                            <TableRow key={`${group.asmgC_Id}-${subject.ismS_Id || subIdx}`}>
                                                                {subIdx === 0 && (
                                                                    <>
                                                                        <TableCell className='text-center' rowSpan={rowCount}>
                                                                            {groupIdx + 1}
                                                                        </TableCell>
                                                                        <TableCell className='font-medium' rowSpan={rowCount}>
                                                                            {group.asmgC_GroupName}
                                                                        </TableCell>
                                                                        <TableCell className='text-center' rowSpan={rowCount}>
                                                                            <Checkbox checked={isSelected} onCheckedChange={handleToggle} />
                                                                        </TableCell>
                                                                    </>
                                                                )}
                                                                <TableCell className='text-gray-600'>{subject.ismS_SubjectName}</TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell className='text-center'>{groupIdx + 1}</TableCell>
                                                            <TableCell className='font-medium'>{group.asmgC_GroupName}</TableCell>
                                                            <TableCell className='text-center'>
                                                                <Checkbox checked={isSelected} onCheckedChange={handleToggle} />
                                                            </TableCell>
                                                            <TableCell className='text-gray-400 italic'>No subjects listed</TableCell>
                                                        </TableRow>
                                                    )}
                                                </>
                                            );
                                        }}
                                    />
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className='py-8 text-center text-gray-400'>
                                    No elective groups available for the selected class/stream
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
