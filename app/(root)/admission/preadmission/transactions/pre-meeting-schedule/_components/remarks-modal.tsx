'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSaveMeetingRemarks } from '@/hooks/admission/preadmission/transactions/use-pre-meeting-schedule';
import type { IPreMeetingSchedule } from '@/types/admission/preadmission/transactions/pre-meeting-schedule';
import { useEffect, useState } from 'react';

interface RemarksModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: IPreMeetingSchedule | null;
}

export default function RemarksModal({ isOpen, onClose, record }: RemarksModalProps) {
    const [grade, setGrade] = useState('');
    const [remarks, setRemarks] = useState('');

    const { mutate: saveRemarks, isPending } = useSaveMeetingRemarks();

    useEffect(() => {
        if (record) {
            setGrade(record.studentgrade || '');
            setRemarks(record.studentremarks || '');
        }
    }, [record]);

    const handleSubmit = () => {
        if (!record) return;

        saveRemarks(
            {
                LMSLMEET_Id: record.lmslmeeT_Id,
                grade: grade,
                remarks: remarks
            },
            {
                onSuccess: () => {
                    onClose();
                }
            }
        );
    };

    if (!record) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                    <DialogTitle className='font-bold text-blue-800 text-xl'>Add Remarks for {record.studentname}</DialogTitle>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                    <div className='grid grid-cols-4 items-center gap-4'>
                        <Label htmlFor='grade' className='text-right'>
                            Grade
                        </Label>
                        <Input
                            id='grade'
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className='col-span-3'
                            placeholder='Enter Grade'
                        />
                    </div>
                    <div className='grid grid-cols-4 items-center gap-4'>
                        <Label htmlFor='remarks' className='text-right'>
                            Remarks
                        </Label>
                        <Textarea
                            id='remarks'
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className='col-span-3'
                            placeholder='Enter Remarks'
                            rows={4}
                        />
                    </div>
                </div>
                <div className='mt-4 flex justify-end gap-2'>
                    <Button variant='outline' onClick={onClose} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? 'Saving...' : 'Save Remarks'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
