import { deleteIdSchema } from '@/schemas/validationSchemas';
import { z } from 'zod';

export const homeWorkSchema = {
    addOrUpdate: z.object({
        ihW_Id: z.number().optional().nullable(),
        asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, 'Academic Year is required'),
        asmcL_Id: z.number({ required_error: 'Class is required' }).min(1, 'Class is required'),
        hm_section_list: z
            .array(
                z.object({
                    asmS_Id: z.number()
                })
            )
            .min(1, 'At least one section is required'),
        ismS_Id: z.number({ required_error: 'Subject is required' }).min(1, 'Subject is required'),
        ihW_Topic: z.string().min(1, 'Topic is required').max(250, 'Topic name cannot exceed 250 characters'),
        ihW_Date: z.date({ required_error: 'Date is required' }),
        ihW_Assignment: z.string().optional().nullable(),
        ihW_AssignmentNo: z.string().optional().nullable(),
        ihW_ActiveFlag: z.boolean().default(true),

        // Attachments (Files & URLs mixed in IHW_FilePath_Array)
        ihW_FilePath_Array: z
            .array(
                z.object({
                    ihW_FilePath: z.string(),
                    fileName: z.string()
                })
            )
            .optional()
            .default([]),

        // Display fields
        asmcL_ClassName: z.string().optional(),
        asmC_SectionName: z.string().optional(),
        ismS_SubjectName: z.string().optional(),
        createdDate: z.string().optional(),
        createdTime: z.string().optional(),
        filesCount: z.number().optional(),

        // Form specific fields for separate handling
        ihW_Attachment_Array: z.array(z.object({ ihW_FilePath: z.string(), fileName: z.string() })).optional()
    }),
    delete: z.object({
        ihW_Id: deleteIdSchema('ihW_Id')
    })
};

export type IHomeWork = z.infer<typeof homeWorkSchema.addOrUpdate>;

// Marks Entry Schema
export const homeWorkMarksSchema = z.object({
    amst_Id: z.number(),
    studentName: z.string(),
    rollNo: z.string().optional(),
    admNo: z.string().optional(),
    ihwupl_Id: z.number().optional().nullable(),
    ihwupl_Marks: z.string().optional().nullable(),
    ihwupl_StaffRemarks: z.string().optional().nullable(),
    ihwupl_StaffUpload: z.string().optional().nullable(),
    ihwupl_FileName: z.string().optional().nullable(),
    checked: z.boolean().default(false),
    studentUploads: z
        .array(
            z.object({
                ihwupl_Id: z.number(),
                ihwupl_FileName: z.string(),
                ihwupl_Attachment: z.string(),
                ihwupl_Date: z.string()
            })
        )
        .optional()
});

export const homeWorkMarksListSchema = z.object({
    ihW_Id: z.number(),
    students: z.array(homeWorkMarksSchema)
});

export type IHomeWorkMarks = z.infer<typeof homeWorkMarksSchema>;
export type IHomeWorkMarksList = z.infer<typeof homeWorkMarksListSchema>;

// Search Schema for Marks Update
export const homeWorkMarksSearchSchema = z.object({
    asmaY_Id: z.number().min(1, 'Academic Year is required'),
    asmcL_Id: z.number().min(1, 'Class is required'),
    asmS_Id: z.number().min(1, 'Section is required'),
    ismS_Id: z.number().optional(),
    from_date: z.date().optional(),
    to_date: z.date().optional()
});

export type IHomeWorkMarksSearch = z.infer<typeof homeWorkMarksSearchSchema>;
