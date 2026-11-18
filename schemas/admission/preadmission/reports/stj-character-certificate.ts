import { z } from 'zod';

export const StjCharacterCertificateSchema = z
    .object({
        allorindi: z.enum(['A', 'I']),
        optradio: z.enum(['S', 'L', 'D']),
        ASMAY_Id: z.number({ required_error: 'Please select Academic Year' }).min(1, 'Please select Academic Year'),
        ASMCL_Id: z.number().optional().nullable(),
        ASMS_Id: z.number().optional().nullable(),
        AMST_Id: z.number().optional().nullable(),
        ASA_FromDate: z.date({ required_error: 'Please select Date' }),

        // Checkbox groups
        House: z.record(z.string(), z.any()).optional(),
        activities: z.record(z.string(), z.any()).optional(),
        staticActivities: z.record(z.string(), z.any()).optional(), // Clubs
        School: z.record(z.string(), z.any()).optional(),

        // Text fields
        Posts: z.string().optional(),
        Principal: z.string().optional(),
        Year: z.string().optional(),
        Final: z.string().optional(),
        Year1: z.string().optional(),
        Final1: z.string().optional()
    })
    .superRefine((data, ctx) => {
        // Basic validations
        if (!data.ASMAY_Id || data.ASMAY_Id <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select Academic Year', path: ['ASMAY_Id'] });
        }
        if (!data.AMST_Id || data.AMST_Id <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select Student', path: ['AMST_Id'] });
        }
        if (!data.ASA_FromDate) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select Date', path: ['ASA_FromDate'] });
        }

        // Individual report type validations
        if (data.allorindi === 'I') {
            if (!data.ASMCL_Id || data.ASMCL_Id <= 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select Class', path: ['ASMCL_Id'] });
            }
            if (!data.ASMS_Id || data.ASMS_Id <= 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select Section', path: ['ASMS_Id'] });
            }
        }

        // Checkbox group validations (at least one selected)
        const hasSelection = (obj: any) => obj && Object.values(obj).some((val) => !!val);

        if (!hasSelection(data.House)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select at least one House activity', path: ['House'] });
        }
        if (!hasSelection(data.activities)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select at least one Class activity', path: ['activities'] });
        }
        if (!hasSelection(data.staticActivities)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select at least one Club', path: ['staticActivities'] });
        }
        if (!hasSelection(data.School)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select at least one School activity', path: ['School'] });
        }
    });

export type StjCharacterCertificateFields = z.infer<typeof StjCharacterCertificateSchema>;
