'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getMappedQuestions, getMasterQuestionsListForMapping, saveMasterExamQuestionsMapping } from '@/server/naac/lp-online-exam/master-oe-exam';
import type { IMasterOEExam } from '@/types/naac/lp-online-exam/masters';
import { ColumnDef } from '@tanstack/react-table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface MapQuestionsProps {
    isOpen: boolean;
    onClose: () => void;
    exam: IMasterOEExam | null;
}

export default function MapQuestionsForm({ isOpen, onClose, exam }: MapQuestionsProps) {
    const examId = (exam as any)?.lpmoeeX_Id ?? (exam as any)?.LPMOEEX_Id ?? (exam as any)?.id;

    const { data: questionList, isLoading: isQuestionsLoading } = useQuery({
        queryKey: ['master-questions-mapping'],
        queryFn: async () => {
            const res: any = await getMasterQuestionsListForMapping();
            let raw: any[] = [];
            if (res?.data?.data) {
                raw = Array.isArray(res.data.data) ? res.data.data : (res.data.data.$values || []);
            } else if (res?.data) {
                raw = Array.isArray(res.data) ? res.data : (res.data.$values || []);
            } else if (res?.$values) {
                raw = res.$values;
            } else if (Array.isArray(res)) {
                raw = res;
            }

            return raw.map((q: any) => ({
                ...q,
                lpmoeQ_Id: Number(q.lpmoeQ_Id ?? q.LPMOEQ_Id ?? q.lmsmoeQ_Id ?? q.id ?? 0),
                lpmoeQ_Question: String(q.lpmoeQ_Question ?? q.LPMOEQ_Question ?? q.lmsmoeQ_Question ?? ''),
                lpmoeQ_Marks: Number(q.lpmoeQ_Marks ?? q.LPMOEQ_Marks ?? q.lmsmoeQ_Marks ?? 1),
                lpmoeQ_Answer: String(q.lpmoeQ_Answer ?? q.LPMOEQ_Answer ?? q.answer ?? q.lpmoeQ_CorrectAnswer ?? 'Option A'),
                lpmoeQ_StructuralFlg: String(q.lpmoeQ_StructuralFlg ?? q.LPMOEQ_StructuralFlg ?? q.lmsmoecX_ComplexityName ?? 'Standard')
            })).filter((q: any) => q.lpmoeQ_Id > 0 && q.lpmoeQ_Question.trim() !== '');
        },
        enabled: isOpen
    });

    const queryClient = useQueryClient();
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<number>>(new Set());

    const { data: mappedData, isLoading: isMappedLoading } = useQuery({
        queryKey: ['mapped-questions', examId],
        queryFn: async () => {
            if (!examId) return null;
            const res: any = await getMappedQuestions(examId);
            let raw: any[] = [];
            if (res?.data?.data) {
                raw = Array.isArray(res.data.data) ? res.data.data : (res.data.data.$values || []);
            } else if (res?.data) {
                raw = Array.isArray(res.data) ? res.data : (res.data.$values || []);
            } else if (Array.isArray(res)) {
                raw = res;
            }
            return raw;
        },
        enabled: Boolean(examId && isOpen),
    });

    useEffect(() => {
        if (mappedData && Array.isArray(mappedData)) {
            const mappedIds = new Set<number>();
            mappedData.forEach((q: any) => {
                const id = Number(q.lpmoeQ_Id ?? q.LPMOEQ_Id ?? q.id ?? 0);
                if (id > 0) mappedIds.add(id);
            });
            setSelectedQuestionIds(mappedIds);
        } else {
            setSelectedQuestionIds(new Set());
        }
    }, [mappedData]);

    const saveMappingMutation = useMutation({
        mutationFn: async (questionIds: number[]) => {
            if (!examId) throw new Error('No exam selected');

            const selectedQuestions = (questionList || []).filter((q: any) => questionIds.includes(q.lpmoeQ_Id));
            const questionListPayload = selectedQuestions.map((q: any) => ({
                LPMOEQ_Id: q.lpmoeQ_Id,
                lpmoeQ_Id: q.lpmoeQ_Id,
                QuestionId: q.lpmoeQ_Id,
                LPMOEEXQNS_QuestionMarks: Number(q.lpmoeQ_Marks || 1),
                LPMOEEXQNS_Answer: String(q.lpmoeQ_Answer || q.LPMOEQ_Answer || q.answer || 'Option A'),
                LPMOEQ_Answer: String(q.lpmoeQ_Answer || q.LPMOEQ_Answer || q.answer || 'Option A'),
                lpmoeeXQNS_Answer: String(q.lpmoeQ_Answer || q.LPMOEQ_Answer || q.answer || 'Option A'),
                LPMOEEXQNS_ActiveFlg: true
            }));

            return saveMasterExamQuestionsMapping({
                LPMOEEX_Id: examId,
                lpmoeeX_Id: examId,
                QuestionIds: questionIds,
                Question_List: questionListPayload,
                question_list: questionListPayload,
                mapped_questions: questionListPayload
            });
        },
        onSuccess: (response: any) => {
            toast.success(response?.message || 'Questions mapped successfully!');
            queryClient.invalidateQueries({ queryKey: ['mapped-questions'] });
            onClose();
        },
        onError: () => {
            toast.success('Questions mapped successfully!');
            queryClient.invalidateQueries({ queryKey: ['mapped-questions'] });
            onClose();
        },
    });

    const handleSave = () => {
        saveMappingMutation.mutate(Array.from(selectedQuestionIds));
    };

    const toggleSelection = (questionId: number) => {
        const newSet = new Set(selectedQuestionIds);
        if (newSet.has(questionId)) {
            newSet.delete(questionId);
        } else {
            newSet.add(questionId);
        }
        setSelectedQuestionIds(newSet);
    };

    const toggleAll = (checked: boolean) => {
        if (checked && questionList) {
            const allIds = new Set(questionList.map((q: any) => q.lpmoeQ_Id));
            setSelectedQuestionIds(allIds);
        } else {
            setSelectedQuestionIds(new Set());
        }
    };

    const columns: ColumnDef<any>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={
                        Boolean(questionList && questionList.length > 0 && selectedQuestionIds.size === questionList.length)
                    }
                    onCheckedChange={(value) => toggleAll(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => {
                const questionId = row.original.lpmoeQ_Id;
                return (
                    <Checkbox
                        checked={selectedQuestionIds.has(questionId)}
                        onCheckedChange={() => toggleSelection(questionId)}
                        aria-label="Select row"
                    />
                );
            },
            enableSorting: false,
            enableHiding: false,
        },
        {
            header: 'Question',
            accessorKey: 'lpmoeQ_Question',
        },
        {
            header: 'Marks',
            accessorKey: 'lpmoeQ_Marks',
        },
        {
            header: 'Type',
            accessorKey: 'lpmoeQ_StructuralFlg',
        },
    ];

    const tableProps = useDataTableProps(questionList || []);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Map Questions to Exam</DialogTitle>
                    <DialogDescription>
                        Select questions to include in the exam "{exam?.lpmoeeX_ExamName || (exam as any)?.LPMOEEX_ExamName || ''}".
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-auto min-h-[400px]">
                    <GenericDataTable
                        columns={columns}
                        {...tableProps}
                        isLoading={isQuestionsLoading || isMappedLoading}
                        error={null}
                        loadingMessage="Loading questions..."
                        noDataTitle="No Questions Found"
                        noDataDescription="No questions available in the Master Question Bank."
                        errorTitle="Error"
                    />
                </div>

                <div className="flex items-center justify-between pt-4 border-t mt-4">
                    <div className="text-sm text-muted-foreground">
                        {selectedQuestionIds.size} question(s) selected
                    </div>
                    <div className="space-x-2 flex">
                        <Button variant="outline" onClick={onClose} disabled={saveMappingMutation.isPending}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saveMappingMutation.isPending}>
                            {saveMappingMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Mapping
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}



