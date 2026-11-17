'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getFeedbackDetails, saveFeedbackTransaction } from '../actions';
import type {
    FeedbackQuestionClient,
    FeedbackTransactionLoadData,
    FeedbackTransactionSaveRequest,
    FeedbackType,
    FeedbackTypeClient
} from '../types';

interface FeedbackCollegeParentTransactionClientProps {
    initialData: FeedbackTransactionLoadData;
}

export default function FeedbackCollegeParentTransactionClient({ initialData }: FeedbackCollegeParentTransactionClientProps) {
    const [feedbackTypes, setFeedbackTypes] = useState<FeedbackType[]>([]);
    const [selectedType, setSelectedType] = useState<string>('');

    // This state mimics the 'temparray' from legacy code
    const [feedbackForm, setFeedbackForm] = useState<FeedbackTypeClient[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Store answers separately to easily map back to the 'temparray' structure or update it directly
    // Using a map for easier state updates: questionId -> value
    const [answers, setAnswers] = useState<Record<number, string>>({});

    useEffect(() => {
        if (initialData && initialData.typelistload) {
            setFeedbackTypes(initialData.typelistload);
        }
    }, [initialData]);

    const handleTypeChange = async (typeId: string) => {
        setSelectedType(typeId);
        setFeedbackForm([]); // Clear previous form
        setAnswers({});

        if (!typeId) return;

        setIsLoading(true);
        try {
            const response = await getFeedbackDetails({ FMTY_Id: Number.parseInt(typeId) });

            if (response) {
                if (response.count > 0) {
                    toast.warning('Feedback already given for this type.');
                    setSelectedType(''); // Reset selection
                    return;
                }

                if (response.typelist && response.typelist.length > 0) {
                    const newFormStructure: FeedbackTypeClient[] = [];

                    // Logic to map response to client structure (replicating legacy nested loops)
                    response.typelist.forEach((type) => {
                        const questionsForType: FeedbackQuestionClient[] = [];

                        response.mappedquestiondeetails.forEach((q) => {
                            // Legacy check: if (dd.fmtY_Id === ddd.fmtY_Id)
                            if (type.fmtY_Id === q.fmtY_Id) {
                                const optionsForQuestion: { FMOP_Id: number; FMOP_FeedbackOptions: string }[] = [];

                                if (!q.fmqE_ManualEntryFlg) {
                                    // If manually entry is false, find options
                                    // Legacy logic has two branches based on 'fmtY_QuestionwiseOptionFlg'
                                    // But general logic filters options by current Type ID (and maybe Question ID)

                                    // Assuming common options for the type if not question-specific (simplifying based on legacy 'false' branch first)
                                    // In legacy 'false' branch: if (dd.fmtY_Id === dddd.fmtY_Id)

                                    // Filter options
                                    response.mappedoptiondeetails.forEach((opt) => {
                                        // Check if option belongs to this type
                                        if (opt.fmtY_Id === type.fmtY_Id) {
                                            // If question-wise mapping exists, check it; otherwise treat as general for type
                                            const isMappedToQuestion = opt.fmqE_Id ? opt.fmqE_Id === q.fmqE_Id : true;

                                            // Strict legacy Check:
                                            // if QuestionwiseOptionFlg is false, we take all options for the type
                                            // if true, we check both type and question id

                                            // Using the response structure effectively:
                                            if (type.fmtY_QuestionwiseOptionFlg) {
                                                if (opt.fmqE_Id === q.fmqE_Id) {
                                                    optionsForQuestion.push({
                                                        FMOP_Id: opt.fmoP_Id,
                                                        FMOP_FeedbackOptions: opt.fmoP_FeedbackOptions
                                                    });
                                                }
                                            } else {
                                                // Legacy code for 'false' branch:
                                                // if(dd.fmtY_Id === dddd.fmtY_Id) -> push
                                                // But wait, wouldn't that duplicate options for every question?
                                                // Yes, in legacy, 'tempoptionarray' is rebuilt for every question iteration.
                                                // We should filter options that belong to this TypeId.
                                                optionsForQuestion.push({
                                                    FMOP_Id: opt.fmoP_Id,
                                                    FMOP_FeedbackOptions: opt.fmoP_FeedbackOptions
                                                });
                                            }
                                        }
                                    });
                                }

                                questionsForType.push({
                                    FMQE_Id: q.fmqE_Id,
                                    FMQE_FeedbackQuestions: q.fmqE_FeedbackQuestions,
                                    manualflg: q.fmqE_ManualEntryFlg,
                                    opt: optionsForQuestion
                                });
                            }
                        });

                        newFormStructure.push({
                            FMTY_Id: type.fmtY_Id,
                            FMTY_FeedbackTypeName: type.fmtY_FeedbackTypeName,
                            ques: questionsForType
                        });
                    });

                    setFeedbackForm(newFormStructure);
                } else {
                    toast.info('No questions found for this feedback type.');
                }
            }
        } catch (error) {
            console.error('Error fetching feedback details:', error);
            toast.error('Failed to load feedback details.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerChange = (questionId: number, value: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));

        // Also update the main form structure if needed for submission binding
        // (Legacy uses ng-model="user1.name", which effectively mutates the array)
        setFeedbackForm((prev) =>
            prev.map((type) => ({
                ...type,
                ques: type.ques.map((q) => {
                    if (q.FMQE_Id === questionId) {
                        return { ...q, answerValue: value };
                    }
                    return q;
                })
            }))
        );
    };

    const handleCancel = () => {
        setSelectedType('');
        setFeedbackForm([]);
        setAnswers({});
    };

    const handleSubmit = async () => {
        // Validation
        let isValid = true;
        feedbackForm.forEach((type) => {
            type.ques.forEach((q) => {
                if (!answers[q.FMQE_Id] || answers[q.FMQE_Id].trim() === '') {
                    isValid = false;
                }
            });
        });

        if (!isValid) {
            toast.error('Please answer all questions before saving.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Prepare payload
            // Map answers back to the structure expected by 'savedata'
            // The legacy 'user1.name' holds the value.
            // My 'FeedbackTypeClient' structure has 'answerValue' updated in handleAnswerChange
            // BUT, legacy 'savedata' sends { temp: $scope.temparray, Flag: 'Parents' }
            // So I need to ensure 'answerValue' is mapped to 'name' property if backend expects strict legacy naming?
            // Checking legacy HTML: <input ... ng-model="user1.name">
            // So the backend likely looks for a property called 'name' on the question object.

            const payloadTemp = feedbackForm.map((type) => ({
                ...type,
                ques: type.ques.map((q) => ({
                    ...q,
                    name: answers[q.FMQE_Id] // Map answer to 'name' property for compatibility
                }))
            }));

            const payload: FeedbackTransactionSaveRequest = {
                temp: payloadTemp,
                Flag: 'Parents'
            };

            const response = await saveFeedbackTransaction(payload);
            if (response.returnval) {
                toast.success('Feedback saved successfully!');
                handleCancel(); // Reset form
            } else {
                toast.error('Failed to save record.', { description: response.message });
            }
        } catch (error) {
            console.error('Error saving feedback:', error);
            toast.error('An error occurred while saving.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='space-y-6'>
            {/* Selection Card */}
            <Card className='border-t-4 border-t-primary shadow-lg'>
                <CardHeader className='flex flex-row items-center justify-between border-b pb-2'>
                    <CardTitle className='font-bold text-primary text-xl uppercase'>Feedback Transaction</CardTitle>
                </CardHeader>
                <CardContent className='pt-6'>
                    <div className='flex justify-center'>
                        <div className='w-full max-w-md space-y-2'>
                            <Label htmlFor='feedback-type'>
                                Feedback Type <span className='text-red-500'>*</span>
                            </Label>
                            <Select value={selectedType} onValueChange={handleTypeChange}>
                                <SelectTrigger id='feedback-type'>
                                    <SelectValue placeholder='--Select Feedback Type--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {feedbackTypes.map((type) => (
                                        <SelectItem key={type.fmtY_Id} value={type.fmtY_Id.toString()}>
                                            {type.fmtY_FeedbackTypeName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Loading Indicator */}
            {isLoading && (
                <div className='flex justify-center p-8'>
                    <Loader2 className='h-8 w-8 animate-spin text-primary' />
                </div>
            )}

            {/* Questions Form */}
            {feedbackForm.map((type, typeIndex) => (
                <Card key={type.FMTY_Id} className='fade-in slide-in-from-bottom-4 animate-in shadow-md duration-500'>
                    <CardHeader className='border-b bg-primary/5 py-3 text-center'>
                        <CardTitle className='font-semibold text-lg text-slate-800'>{type.FMTY_FeedbackTypeName}</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6 p-6'>
                        {type.ques.map((q, index) => (
                            <div
                                key={q.FMQE_Id}
                                className='space-y-3 rounded-md border bg-slate-50/50 p-4 transition-colors hover:bg-slate-50'>
                                <h4 className='flex gap-2 font-semibold text-slate-800'>
                                    <span className='text-primary'>{index + 1}.</span>
                                    {q.FMQE_FeedbackQuestions}
                                </h4>

                                <div className='pl-6'>
                                    {q.manualflg ? (
                                        // Manual Entry (Textarea)
                                        <div className='space-y-1'>
                                            <Textarea
                                                placeholder='Enter your remarks / feedback here...'
                                                value={answers[q.FMQE_Id] || ''}
                                                onChange={(e) => handleAnswerChange(q.FMQE_Id, e.target.value)}
                                                className='max-w-xl bg-white'
                                                maxLength={500}
                                            />
                                            <p className='max-w-xl text-right text-muted-foreground text-xs'>
                                                {(answers[q.FMQE_Id] || '').length}/500
                                            </p>
                                        </div>
                                    ) : (
                                        // Options (Radio Buttons)
                                        <RadioGroup
                                            value={answers[q.FMQE_Id]}
                                            onValueChange={(val) => handleAnswerChange(q.FMQE_Id, val)}
                                            className='mt-2 space-y-2'>
                                            <div className='flex flex-wrap gap-4'>
                                                {q.opt?.map((opt) => (
                                                    <div
                                                        key={opt.FMOP_Id}
                                                        className='flex cursor-pointer items-center space-x-2 rounded-md border bg-white px-3 py-2 shadow-sm hover:border-primary/50'>
                                                        <RadioGroupItem
                                                            value={opt.FMOP_Id.toString()}
                                                            id={`q${q.FMQE_Id}-opt${opt.FMOP_Id}`}
                                                        />
                                                        <Label
                                                            htmlFor={`q${q.FMQE_Id}-opt${opt.FMOP_Id}`}
                                                            className='cursor-pointer font-normal'>
                                                            {opt.FMOP_FeedbackOptions}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </RadioGroup>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}

            {/* Footer Actions */}
            {feedbackForm.length > 0 && (
                <div className='fixed right-0 bottom-0 left-0 z-10 flex justify-center gap-4 border-t bg-white/80 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] backdrop-blur-md lg:pl-64'>
                    {/* lg:pl-64 accounts for sidebar width if sticky */}
                    <div className='flex gap-4'>
                        <Button variant='destructive' onClick={handleCancel} disabled={isSubmitting}>
                            <X className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting} className='min-w-[120px]'>
                            {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
                            Save
                        </Button>
                    </div>
                </div>
            )}

            {/* Spacer for fixed footer */}
            {feedbackForm.length > 0 && <div className='h-20' />}
        </div>
    );
}
