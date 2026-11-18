'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Layers } from 'lucide-react';
import type { IViewGroupSubject } from '../types';

interface ViewSubjectsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groupName: string;
    subjects: IViewGroupSubject[];
}

export function ViewSubjectsModal({ open, onOpenChange, groupName, subjects }: ViewSubjectsModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2 font-bold text-lg'>
                        <Layers className='h-5 w-5 text-primary' />
                        &ldquo;{groupName || 'Subject Group'}&rdquo; Group Subjects
                    </DialogTitle>
                    <DialogDescription className='text-muted-foreground text-xs'>
                        List of subjects mapped to this subject group ({subjects.length} subjects)
                    </DialogDescription>
                </DialogHeader>

                <div className='my-2 overflow-x-auto rounded-md border'>
                    <Table>
                        <TableHeader>
                            <TableRow className='bg-muted/50 hover:bg-muted/50'>
                                <TableHead className='w-14 text-center font-bold text-foreground'>SLNO</TableHead>
                                <TableHead className='text-left font-bold text-foreground'>Subject Name</TableHead>
                                <TableHead className='w-36 text-left font-bold text-foreground'>Subject Code</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subjects.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className='h-24 text-center text-muted-foreground text-xs'>
                                        No mapped subjects found for this group.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                subjects.map((sub, index) => (
                                    <TableRow key={sub.ismS_Id || index} className='hover:bg-muted/30'>
                                        <TableCell className='text-center font-medium text-xs'>{index + 1}</TableCell>
                                        <TableCell className='text-left font-semibold text-foreground text-xs'>
                                            {sub.ismS_SubjectName}
                                        </TableCell>
                                        <TableCell className='text-left text-muted-foreground text-xs'>
                                            {sub.ismS_SubjectCode || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <DialogFooter>
                    <Button type='button' variant='outline' onClick={() => onOpenChange(false)} className='h-9 px-4 font-medium text-xs'>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
