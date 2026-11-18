'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { IEventsStudentSRKVSViewDetails } from '@/types/sports/events-student-srkvs';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ViewDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: IEventsStudentSRKVSViewDetails[] | null;
    onSave?: (updatedData: IEventsStudentSRKVSViewDetails[]) => void;
}

export function ViewDetailsModal({ isOpen, onClose, data, onSave }: ViewDetailsModalProps) {
    const [editableData, setEditableData] = useState<IEventsStudentSRKVSViewDetails[]>([]);

    useEffect(() => {
        if (data) {
            setEditableData([...data]);
        }
    }, [data]);

    const handleInputChange = (index: number, field: keyof IEventsStudentSRKVSViewDetails, value: any) => {
        const newData = [...editableData];
        newData[index] = { ...newData[index], [field]: value };
        setEditableData(newData);
    };

    const handleSave = () => {
        if (onSave) {
            onSave(editableData);
        } else {
            toast.success('Details updated temporarily. Hook up save API to persist.');
            onClose();
        }
    };

    if (!data || data.length === 0) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-[1000px]'>
                <DialogHeader>
                    <DialogTitle>Student Entry Details</DialogTitle>
                </DialogHeader>
                <div className='rounded-md border bg-card p-4'>
                    <ScrollArea className='h-[60vh]'>
                        <Table>
                            <TableHeader className='bg-muted/50'>
                                <TableRow>
                                    <TableHead className='w-[50px] text-center'>SL.No</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Adm No.</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Point</TableHead>
                                    <TableHead>Place</TableHead>
                                    <TableHead>Remark</TableHead>
                                    <TableHead className='text-center'>Record Broken</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {editableData.map((student, index) => (
                                    <TableRow key={student.amsT_Id}>
                                        <TableCell className='text-center font-medium'>{index + 1}</TableCell>
                                        <TableCell>{student.studentName}</TableCell>
                                        <TableCell>{student.amsT_AdmNo}</TableCell>
                                        <TableCell>{student.asmcL_ClassName}</TableCell>
                                        <TableCell>{student.asmC_SectionName}</TableCell>
                                        <TableCell>
                                            <Input
                                                className='h-8 w-20'
                                                value={student.spccestR_Points || ''}
                                                onChange={(e) => handleInputChange(index, 'spccestR_Points', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                className='h-8 w-20'
                                                value={student.spccestR_Rank || ''}
                                                onChange={(e) => handleInputChange(index, 'spccestR_Rank', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                className='h-8 w-32'
                                                value={student.spccestR_Remarks || ''}
                                                onChange={(e) => handleInputChange(index, 'spccestR_Remarks', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            <Checkbox
                                                checked={!!student.spccestR_RecordBrokenFlag}
                                                onCheckedChange={(checked) =>
                                                    handleInputChange(index, 'spccestR_RecordBrokenFlag', checked)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
                <DialogFooter className='mt-4'>
                    <Button variant='outline' onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
