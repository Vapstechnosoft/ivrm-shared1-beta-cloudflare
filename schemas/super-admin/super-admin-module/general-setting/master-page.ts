import { z } from 'zod';

export const masterPageSchema = z
    .object({
        ivrmP_Id: z
            .union([z.number(), z.string(), z.null()])
            .optional()
            .transform((val) => (val ? Number(val) : 0)),
        ivrmmP_PageName: z.string().min(1, 'Page Name is required').max(200, 'Page Name exceeds limit'),
        ivrmP_PageDisplayName: z.string().max(200, 'Display Name exceeds limit').optional().nullable(),
        ivrmP_PageDesc: z.string().min(1, 'Page URL is required').max(255, 'Page URL exceeds limit'),
        ivrmP_MandatoryFlag: z
            .union([z.boolean(), z.number(), z.string(), z.null()])
            .optional()
            .transform((val) => {
                if (val === null || val === undefined) return 0;
                if (typeof val === 'boolean') return val ? 1 : 0;
                if (typeof val === 'string') return val === '1' || val === 'true' ? 1 : 0;
                return val;
            }),
        ivrmP_BrowerUrl: z.string().optional().nullable(),
        ivrmP_BrowserUrl: z.string().optional().nullable(),
        IVRMP_BrowserUrl: z.string().optional().nullable()
    })
    .passthrough();

export type MasterPageSchema = z.infer<typeof masterPageSchema>;
