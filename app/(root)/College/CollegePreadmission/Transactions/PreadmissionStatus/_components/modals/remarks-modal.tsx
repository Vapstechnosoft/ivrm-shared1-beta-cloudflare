'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { IClgPreadmissionStudent } from '@/types/college/transactions';
import { useClgApplicationStudentRemarks } from '@/hooks/college/useCollegeTransactions';
import { useEffect } from 'react';

interface RemarksModalProps {
    student: IClgPreadmissionStudent;
    open: boolean;
    onClose: () => void;
}

export default function RemarksModal({ student, open, onClose }: RemarksModalProps) {
    const [remarks, setRemarks] = useState<any[]>([]);
    const { mutateAsync: fetchRemarks, isPending } = useClgApplicationStudentRemarks();

    useEffect(() => {
        if (open && student.pacA_Id) {
            fetchRemarks({ pacA_Id: student.pacA_Id }).then((res) => {
                setRemarks(res?.data || []);
            });
        }
    }, [open, student.pacA_Id]);

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Remarks — {student.name}</DialogTitle>
                </DialogHeader>

                {isPending ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : remarks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No remarks found.</p>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {remarks.map((r: any, idx: number) => (
                            <div key={idx} className="border rounded-md p-3 space-y-1 bg-muted/30">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span className="font-medium">{r.statusName || r.pamsT_Name}</span>
                                    <span>{r.createdDate || r.pacA_CreatedDate}</span>
                                </div>
                                <p className="text-sm">{r.pacA_Statusremark || r.remark}</p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-end">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
