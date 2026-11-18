import { z } from 'zod';

export const questionOptionSchema = z.object({
    lmsmoeqoA_Id: z.number().optional(),
    lmsmoeqoA_Option: z.string().min(1, 'Option text is required'),
    lmsmoeqoA_OptionCode: z.string().optional(),
    lmsmoeqoA_AnswerFlag: z.boolean().default(false),
    lmsmoeqoA_OptionImage: z.string().optional(),
    lmsmoeqoA_Marks: z.coerce.number().min(0).default(1)
});

export const questionFileSchema = z.object({
    lmsmoeqF_Id: z.number().optional(),
    lmsmoeqF_FileName: z.string(),
    lmsmoeqF_FilePath: z.string(),
    filetype: z.string().optional()
});

// Master Question (School) Schema
export const masterQuestionSchema = z.object({
    lmsmoeQ_Id: z.number().optional(),
    ismS_Id: z.coerce.number({ required_error: 'Subject is required' }).min(1, 'Please select a subject'),
    topic_Id: z.coerce.number().optional(),
    
    // Question Types
    isTextType: z.boolean().default(true),
    isMathChemType: z.boolean().default(false),
    isStructuralType: z.boolean().default(false),
    
    lmsmoeQ_Question: z.string().min(3, 'Question must be at least 3 characters long').max(1000, 'Max 1000 characters'),
    lmsmoeQ_QuestionDesc: z.string().max(2000, 'Max 2000 characters').optional().or(z.literal('')),
    
    lmsmoecX_Id: z.coerce.number().optional(),
    lmsmoeQ_NoOfOptions: z.coerce.number().optional(),
    lmsmoeQ_Marks: z.coerce.number({ required_error: 'Marks is required' }).min(1, 'Marks must be at least 1'),
    
    subjectiveFlg: z.boolean().default(false),
    subjectiveAnswer: z.string().optional().or(z.literal('')),
    matchTheFollowingFlg: z.boolean().default(false),
    noOfRows: z.coerce.number().optional(),
    noOfColumns: z.coerce.number().optional(),

    classIds: z.array(z.number()).optional(),
    options: z.array(questionOptionSchema).optional(),
    files: z.array(questionFileSchema).optional()
});

// Class Question Mapping Schema
export const classQuestionMappingSchema = z.object({
    lmsmoeQ_Id: z.number({ required_error: 'Question is required' }),
    asmcL_Ids: z.array(z.number()).min(1, 'Select at least one class'),
    asmS_Ids: z.array(z.number()).optional()
});

// Master Question College Schema
export const masterQuestionCollegeSchema = z.object({
    lmsmcQ_Id: z.number().optional(),
    amcO_Id: z.coerce.number({ required_error: 'Course is required' }).min(1, 'Please select a course'),
    amB_Id: z.coerce.number({ required_error: 'Branch is required' }).min(1, 'Please select a branch'),
    amsE_Id: z.coerce.number({ required_error: 'Semester is required' }).min(1, 'Please select a semester'),
    ismS_Id: z.coerce.number({ required_error: 'Subject is required' }).min(1, 'Please select a subject'),
    lmsmcQ_Question: z.string().min(3, 'Question must be at least 3 characters long').max(1000, 'Max 1000 characters'),
    lmsmcQ_QuestionDesc: z.string().max(2000, 'Max 2000 characters').optional().or(z.literal('')),
    lmsmcQ_Marks: z.coerce.number({ required_error: 'Marks is required' }).min(1, 'Marks must be at least 1'),
    lmsmoecX_Id: z.coerce.number().optional(),
    options: z.array(questionOptionSchema).optional(),
    files: z.array(questionFileSchema).optional()
});

// Toggle / Deactivate Schema
export const toggleQuestionSchema = z.object({
    id: z.number(),
    activeFlag: z.boolean().optional()
});
