'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMasterQuestion, useSaveMasterQuestion } from '@/hooks/exam/online-exam/useMasters';
import type { IClassDropdown, IMasterQuestionList } from '@/types/exam/online-exam/masters';
import { Check, CheckSquare, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ClassMappingModalProps {
    question: IMasterQuestionList | null;
    classes: IClassDropdown[];
    open: boolean;
    onClose: () => void;
}

export default function ClassMappingModal({ question, classes = [], open, onClose }: ClassMappingModalProps) {
    const { refetch } = useMasterQuestion(undefined, { enabled: false });
    const saveMutation = useSaveMasterQuestion();
    const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!question) return;
        const qId = question.lmsmoeQ_Id || (question as any).lpmoeQ_Id;
        try {
            const saved = typeof window !== 'undefined' ? localStorage.getItem(`mapped_classes_q_${qId}`) : null;
            if (saved) {
                const ids = JSON.parse(saved);
                if (Array.isArray(ids) && ids.length > 0) {
                    setSelectedClassIds(ids);
                    return;
                }
            }
        } catch (_) {}

        if (question?.classList && question.classList.length > 0) {
            setSelectedClassIds(question.classList.map((c) => c.asmcL_Id));
        } else if (question?.asmcL_Id && question.asmcL_Id > 0) {
            setSelectedClassIds([question.asmcL_Id]);
        } else {
            setSelectedClassIds([]);
        }
    }, [question]);

    const handleToggleClass = (classId: number) => {
        setSelectedClassIds((prev) => (prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]));
    };

    const handleSelectAll = () => {
        if (selectedClassIds.length === classes.length) {
            setSelectedClassIds([]);
        } else {
            setSelectedClassIds(classes.map((c) => c.asmcL_Id));
        }
    };

    const handleSave = async () => {
        if (!question) return;

        if (selectedClassIds.length === 0) {
            toast.error('Please select at least one class to map');
            return;
        }

        setIsSaving(true);
        try {
            const qId = question.lmsmoeQ_Id || (question as any).lpmoeQ_Id;
            try {
                localStorage.setItem(`mapped_classes_q_${qId}`, JSON.stringify(selectedClassIds));
            } catch (_) {}

            const mappedClasses = classes.filter((c) => selectedClassIds.includes(c.asmcL_Id));
            const payload = {
                MI_Id: 30,
                LPMOEQ_Id: qId,
                ISMS_Id: question.ismS_Id,
                ASMCL_Id: selectedClassIds[0] || question.asmcL_Id,
                LPMOEQ_Question: question.lmsmoeQ_Question,
                LPMOEQ_Marks: question.lmsmoeQ_Marks,
                LPMCOMP_Id: question.lmsmoecX_Id || 1,
                classlist: selectedClassIds.map((id) => ({
                    ASMCL_Id: id
                }))
            };

            const response = await saveMutation.mutateAsync(payload);
            if (response?.success !== false && !response?.error) {
                // Update local question reference so modal and table immediately reflect all chosen classes
                question.classList = mappedClasses;
                question.asmcL_ClassName = mappedClasses.map((c) => c.asmcL_ClassName).join(', ');
                toast.success('Class question mapping saved successfully!');
                refetch();
                onClose();
            } else {
                toast.error(response?.message || response?.error || 'Failed to save mapping');
            }
        } catch (error: any) {
            toast.error(error?.message || 'An error occurred while saving class mapping');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className='flex max-h-[85vh] max-w-md flex-col'>
                <DialogHeader>
                    <DialogTitle className='font-bold text-lg'>Map Question to Classes</DialogTitle>
                    <DialogDescription className='text-muted-foreground text-xs'>
                        Select all applicable classes for this question
                    </DialogDescription>
                </DialogHeader>

                <div className='rounded-md bg-muted/40 p-3 text-xs'>
                    <span className='font-semibold text-foreground'>Question: </span>
                    <span className='text-foreground'>{question?.lmsmoeQ_Question}</span>
                </div>

                <div className='flex items-center justify-between border-b py-2'>
                    <span className='font-semibold text-xs'>Available Classes</span>
                    <Button type='button' variant='ghost' size='sm' onClick={handleSelectAll} className='h-7 gap-1.5 text-xs'>
                        {selectedClassIds.length === classes.length ? (
                            <>
                                <Square className='h-3.5 w-3.5' /> Unselect All
                            </>
                        ) : (
                            <>
                                <CheckSquare className='h-3.5 w-3.5' /> Select All
                            </>
                        )}
                    </Button>
                </div>

                <div className='max-h-60 flex-1 space-y-2 overflow-y-auto py-2'>
                    {classes.length === 0 ? (
                        <p className='py-4 text-center text-muted-foreground text-xs'>No classes available</p>
                    ) : (
                        classes.map((cls) => {
                            const isChecked = selectedClassIds.includes(cls.asmcL_Id);
                            return (
                                <div
                                    key={cls.asmcL_Id}
                                    onClick={() => handleToggleClass(cls.asmcL_Id)}
                                    className={`flex cursor-pointer items-center justify-between rounded-md border p-2.5 text-xs transition-all ${
                                        isChecked
                                            ? 'border-primary/60 bg-primary/10 font-semibold text-foreground'
                                            : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                                    }`}>
                                    <span>{cls.asmcL_ClassName}</span>
                                    <div
                                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                                            isChecked ? 'border-primary bg-primary text-primary-foreground' : 'border-input'
                                        }`}>
                                        {isChecked && <Check className='h-3 w-3 stroke-[3]' />}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <DialogFooter className='border-t pt-3'>
                    <Button type='button' variant='outline' onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button type='button' onClick={handleSave} disabled={isSaving} className='min-w-28'>
                        {isSaving ? 'Saving...' : 'Save Mapping'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
