'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { IAlumniLetterStudent } from '@/types/alumni/alumni-letters';
import { format } from 'date-fns';

interface StudentListProps {
    students: IAlumniLetterStudent[];
    selectedIds: number[];
    onToggleAll: (checked: boolean) => void;
    onToggleStudent: (id: number, checked: boolean) => void;
}

export default function StudentList({ students, selectedIds, onToggleAll, onToggleStudent }: StudentListProps) {
    const allSelected = students.length > 0 && selectedIds.length === students.length;

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between px-2'>
                <p className='text-muted-foreground text-sm'>
                    Total Records: <span className='font-bold text-foreground'>{students.length}</span> | Selected:{' '}
                    <span className='font-bold text-primary'>{selectedIds.length}</span>
                </p>
            </div>

            <ScrollArea className='h-[400px] rounded-md border'>
                <Table>
                    <TableHeader className='sticky top-0 z-10 bg-muted/50'>
                        <TableRow>
                            <TableHead className='w-[50px] text-center'>
                                <Checkbox checked={allSelected} onCheckedChange={(checked) => onToggleAll(!!checked)} />
                            </TableHead>
                            <TableHead className='w-[60px] text-center font-bold text-black'>SLNO</TableHead>
                            <TableHead className='text-center font-bold text-black'>Reg No</TableHead>
                            <TableHead className='text-center font-bold text-black'>Adm No</TableHead>
                            <TableHead className='text-center font-bold text-black'>Student Name</TableHead>
                            <TableHead className='text-center font-bold text-black'>Admission Date</TableHead>
                            <TableHead className='text-center font-bold text-black'>DOB</TableHead>
                            <TableHead className='text-center font-bold text-black'>Class</TableHead>
                            <TableHead className='text-center font-bold text-black'>Mobile</TableHead>
                            <TableHead className='text-center font-bold text-black'>Email</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className='h-24 text-center'>
                                    No students found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student, index) => (
                                <TableRow
                                    key={`${student.amsT_Id}-${index}`}
                                    className={selectedIds.includes(student.amsT_Id) ? 'bg-primary/5' : ''}>
                                    <TableCell className='text-center font-bold text-black'>
                                        <Checkbox
                                            checked={selectedIds.includes(student.amsT_Id)}
                                            onCheckedChange={(checked) => onToggleStudent(student.amsT_Id, !!checked)}
                                        />
                                    </TableCell>
                                    <TableCell className='text-center font-medium'>{index + 1}</TableCell>
                                    <TableCell>{student.amsT_RegistrationNo}</TableCell>
                                    <TableCell>{student.amsT_AdmNo}</TableCell>
                                    <TableCell className='font-semibold'>{student.studentname}</TableCell>
                                    <TableCell>{student.amsT_Date ? format(new Date(student.amsT_Date), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                    <TableCell>{student.amsT_DOB ? format(new Date(student.amsT_DOB), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                    <TableCell>{student.asmcL_ClassName}</TableCell>
                                    <TableCell>{student.amsT_MobileNo}</TableCell>
                                    <TableCell className='max-w-[150px] truncate'>{student.amsT_emailId}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
    );
}
