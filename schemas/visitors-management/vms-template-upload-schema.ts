import { z } from 'zod';

export const vmsTemplateUploadSchema = z.object({
    ismmT_Id: z.number().default(0),
    ismmT_TemplateName: z
        .string()
        .min(1, { message: 'Enter Template Name' })
        .max(200, { message: 'Template Name must be under 200 characters' }),
    ismmT_TemplateType: z.string().min(1, { message: 'Select Template Type' }),
    ismmT_FilePath: z.string().min(1, { message: 'Upload Template File' }),
    ismmT_Description: z.string().min(1, { message: 'Enter Template Description' })
});

export type VMSTemplateUploadSchema = z.infer<typeof vmsTemplateUploadSchema>;
