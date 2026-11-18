'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, FileDown, Eye } from 'lucide-react';
import { IClgPreadmissionStudent } from '@/types/college/transactions';
import { useClgApplicationStudentDocs } from '@/hooks/college/useCollegeTransactions';

interface DocumentsModalProps {
    student: IClgPreadmissionStudent;
    open: boolean;
    onClose: () => void;
}

export default function DocumentsModal({ student, open, onClose }: DocumentsModalProps) {
    const [docs, setDocs] = useState<any[]>([]);
    const { mutateAsync: fetchDocs, isPending } = useClgApplicationStudentDocs();

    useEffect(() => {
        if (open && student.pacA_Id) {
            fetchDocs({ pacA_Id: student.pacA_Id }).then((res) => {
                setDocs(res?.data || []);
            });
        }
    }, [open, student.pacA_Id]);

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Documents — {student.name}</DialogTitle>
                </DialogHeader>

                {isPending ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : docs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No documents submitted.</p>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                        {docs.map((doc: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between border rounded-md p-3 bg-muted/30">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{doc.documentName || doc.aD_DocumentName}</span>
                                    <span className="text-xs text-muted-foreground">{doc.fileName || doc.paD_FileName}</span>
                                </div>
                                <div className="flex gap-1">
                                    {doc.fileUrl && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            asChild
                                        >
                                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" title="View">
                                                <Eye className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    )}
                                    {doc.fileUrl && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            asChild
                                        >
                                            <a href={doc.fileUrl} download title="Download">
                                                <FileDown className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
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
