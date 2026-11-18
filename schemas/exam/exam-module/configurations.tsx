import { z } from 'zod';

/**
 * Full schema for Exam Standard config (ExmConfig_*)
 * - Use object-level .superRefine for cross-field validation
 */
export const examStandardSchema = {
    Update: z
        .object({
            ExmConfig_Id: z.number().nullable().optional(),
            mI_Id: z.number().optional(),

            // ENUM FIELDS
            ExmConfig_RankingMethod: z.enum(['Dense', 'Standard'], {
                required_error: 'Select Ranking Method'
            }),

            ExmConfig_Remarks: z.enum(['General', 'Studentwise'], {
                required_error: 'Select Remarks Type'
            }),

            ExmConfig_PassFailRankFlag: z.union([z.enum(['0', '1']), z.boolean(), z.string()]),

            ExmConfig_AdmNoRegNoRollNo_DefaultFlag: z.string().min(1, 'Select Default Column Display'),

            ExmConfig_Recordsearchtype: z.string().min(1, 'Select Search Type'),

            // NUMERIC + FLAG RULES
            ExmConfig_EnableFractionFlg: z.boolean(),
            ExmConfig_NoOfDecimal: z.union([z.literal(''), z.string(), z.number()]).optional(),

            ExmConfig_RoundoffFlag: z.boolean(),
            ExmConfig_NoOfDecimalValues: z.union([z.literal(''), z.string(), z.number()]).optional(),

            // ================================
            // ⭐ NEW FIELD (Missing earlier)
            // ================================
            ExmConfig_FailColorFlg: z.string().nullable().optional(),

            // BOOLEAN FLAGS
            ExmConfig_PromSubjRoundoffFlag: z.boolean().optional(),
            ExmConfig_PromotionFlag: z.boolean().optional(),
            ExmConfig_GraceAplFlg: z.boolean().optional(),
            ExmConfig_BonusAplFlag: z.boolean().optional(),
            ExmConfig_MinAttAplFlag: z.boolean().optional(),
            ExmConfig_MarksMultiply: z.boolean().optional(),
            ExmConfig_PerRoundoffFlag: z.boolean().optional(),
            ExmConfig_FailBoldFlg: z.boolean().optional(),
            ExmConfig_FailItalicFlg: z.boolean().optional(),
            ExmConfig_FailUnderscoreFlg: z.boolean().optional(),
            ExmConfig_ClassRankFlg: z.boolean().optional(),
            ExmConfig_ClassPositionFlg: z.boolean().optional(),
            ExmConfig_FailRankFlg: z.boolean().optional(),
            ExmConfig_FeeDefaulterDisplayFlg: z.boolean().optional(),
            ExmConfig_GroupMarksToResultFlg: z.boolean().optional(),
            ExmConfig_EntryDateRestFlg: z.boolean().optional(),

            ExmConfig_AdmnoColumnDisplay: z.boolean().optional(),
            ExmConfig_RegnoColumnDisplay: z.boolean().optional(),
            ExmConfig_RollnoColumnDisplay: z.boolean().optional(),

            ExmConfig_HallTicketFlg: z.boolean().optional(),
            ExmConfig_AllSubjectAbsentFlg: z.boolean().optional(),

            ExmConfig_SecRankFlg: z.boolean().optional(),
            ExmConfig_SectionPositionFlg: z.boolean().optional(),

            ExmConfig_GroupwiseMarksFlg: z.boolean().optional(),
            ExmConfig_SubjectwiseSecRankFlg: z.boolean().optional(),
            ExmConfig_SubjectwiseClassRankFlg: z.boolean().optional()
        })

        // ============================
        // ⭐ CUSTOM VALIDATIONS
        // ============================
        .superRefine((data, ctx) => {
            // SEARCH TYPE VALIDATION
            const allowedSearch = ['Name', 'AdmNo', 'RollNo', 'RegNo', 'Admno', 'Rollno', 'Regno'];
            if (data.ExmConfig_Recordsearchtype && !allowedSearch.some((s) => s.toLowerCase() === data.ExmConfig_Recordsearchtype.toLowerCase())) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Invalid Search Type',
                    path: ['ExmConfig_Recordsearchtype']
                });
            }
        })
};

// Export the TypeScript type for use with useForm
