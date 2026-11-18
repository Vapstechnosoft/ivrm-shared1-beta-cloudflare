import { z } from 'zod';

const parseNumberWithMsg = (msg: string) =>
    z.preprocess(
        (val) => (val === '' || val === undefined || val === null || isNaN(Number(val)) ? 0 : Number(val)),
        z.number().refine((val) => val !== 0, { message: msg })
    );

// Answer Paper Correction Filter Schema
export const answerPaperFilterSchema = z.object({
    asmaY_Id: parseNumberWithMsg('Select Academic Year'),
    asmcL_Id: parseNumberWithMsg('Select Class'),
    asmS_Id: z.preprocess((val) => (val === '' || val === undefined || val === null || isNaN(Number(val)) ? 0 : Number(val)), z.number().optional()),
    ismS_Id: parseNumberWithMsg('Select Subject'),
    lpmoeeX_Id: parseNumberWithMsg('Select Exam Name')
});

// Single Question Evaluation Schema
export const questionEvaluationSchema = z.object({
    questionId: z.number(),
    awardedMarks: z.coerce.number().min(0, 'Marks cannot be negative'),
    teacherRemarks: z.string().optional()
});

// Save Answer Paper Evaluation Schema
export const saveEvaluationSchema = z.object({
    amsT_Id: z.number(),
    lpmoeeX_Id: z.number(),
    evaluations: z.array(questionEvaluationSchema)
});

// Publish To Student Portal Filter Schema
export const publishFilterSchema = z.object({
    asmaY_Id: parseNumberWithMsg('Select Academic Year'),
    asmcL_Id: parseNumberWithMsg('Select Class'),
    asmS_Id: z.preprocess((val) => (val === '' || val === undefined || val === null || isNaN(Number(val)) ? 0 : Number(val)), z.number().optional()),
    ismS_Id: parseNumberWithMsg('Select Subject'),
    lpmoeeX_Id: parseNumberWithMsg('Select Exam Name')
});

// Bulk Publish Action Schema
export const bulkPublishSchema = z.object({
    lpmoeeX_Id: z.number(),
    studentIds: z.array(z.number()).min(1, 'Please select at least one student'),
    publishStatus: z.boolean().default(true)
});
