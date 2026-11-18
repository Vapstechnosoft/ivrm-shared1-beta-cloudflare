import {
    createRequiredAlphaNumericWithSpaceSchema,
    createStringOnlySchema,
    deleteIdSchema
} from '@/schemas/validationSchemas';
import { z } from 'zod';

export const masterInstDocumentSchema = {
    addOrUpdate: z.object({
        aiD_Id: z.number().int({ message: 'AID_ID is required' }).optional(),
        documentType: createStringOnlySchema('Document Type', 1, 200),
        description: createRequiredAlphaNumericWithSpaceSchema('Description', 1, 1000),
        fileName: z.string().min(1, 'File Name is required'),
        filePath: z.string().min(1, 'File Path is required'),
        fileType: z.string().min(1, 'File Type is required'),
        fileSize: z.number().int().optional().nullable()
    }),
    delete: z.object({
        aiD_Id: deleteIdSchema('aiD_Id')
    })
};
