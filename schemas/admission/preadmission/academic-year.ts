import { z } from 'zod';

// Helper: Reusable string schema
const createStringSchema = (fieldName: string, min: number, max: number) =>
    z
        .string()
        .min(min, { message: `${fieldName} must be at least ${min} character(s)` })
        .max(max, { message: `${fieldName} must not exceed ${max} characters` })
        .nonempty({ message: `${fieldName} is required` });

// Helper: Date schema with ISO string validation
const dateSchema = (fieldName: string, allowNull = false) => {
    const baseSchema = z.string().refine(
        (value) => {
            if (!value) return allowNull;
            // ISO date string validation
            return !Number.isNaN(Date.parse(value));
        },
        {
            message: `${fieldName} must be a valid date`
        }
    );
    return allowNull ? baseSchema.nullable() : baseSchema;
};

export const PreAdmissionAcademicYearSchema = {
    addOrUpdate: z
        .object({
            // Optional internal id for updates
            asmaY_Id: z.number().int().optional(),

            // Institution
            mI_Id: z
                .union([z.number(), z.string()])
                .transform((val) => (typeof val === 'string' ? Number.parseInt(val, 10) : val))
                .refine((val) => !Number.isNaN(val) && val > 0, { message: 'Institution is required' }),

            // Form inputs for year parts (the UI collects From/To and we compute asmaY_Year)
            academicFromYear: z
                .string()
                .nonempty({ message: 'Academic From Year is required' })
                .regex(/^\d{4}$/, { message: 'From Year must be YYYY' }),
            academicToYear: z
                .string()
                .nonempty({ message: 'Academic To Year is required' })
                .regex(/^\d{4}$/, { message: 'To Year must be YYYY' }),

            // Academic Year Fields (computed on submit)
            asmaY_Year: z.string().regex(/^\d{4}-\d{4}$/, {
                message: 'Academic Year must be in format YYYY-YYYY'
            }),

            // Order field - must be a number for the API
            asmaY_Order: z
                .union([z.string(), z.number()])
                .transform((val) => (typeof val === 'string' ? Number.parseInt(val, 10) : val))
                .refine((val) => !Number.isNaN(val), {
                    message: 'Order must be a valid number'
                }),

            // Academic Year Code - required with length validation
            asmaY_AcademicYearCode: createStringSchema('Academic Year Code', 1, 20).regex(/^[a-zA-Z0-9-]+$/, {
                message: 'Academic Year Code must only contain letters, numbers, and hyphens'
            }),

            // Date fields with ISO string validation
            asmaY_From_Date: dateSchema('From Date', true),
            asmaY_To_Date: dateSchema('To Date', true),
            asmaY_PreAdm_F_Date: dateSchema('Pre-Admission From Date', true),
            asmaY_PreAdm_T_Date: dateSchema('Pre-Admission To Date', true),
            asmaY_Cut_Of_Date: dateSchema('Cut-off Date', true),

            // Flag fields with defaults and transformations
            asmaY_ActiveFlag: z
                .union([z.number(), z.boolean()])
                .transform((val) => (typeof val === 'boolean' ? (val ? 1 : 0) : val))
                .default(0),

            asmaY_TransportSDate: dateSchema('Transport Start Date', true).optional(),
            asmaY_TransportEDate: dateSchema('Transport End Date', true).optional(),
            asmaY_ReferenceDate: dateSchema('Reference Date', true).optional(),
            asmaY_AdvanceFeeDate: dateSchema('Advance Fee Date', true).optional(),
            asmaY_RegularFeeFDate: dateSchema('Regular Fee From Date', true).optional(),
            asmaY_RegularFeeTDate: dateSchema('Regular Fee To Date', true).optional(),
            asmaY_ArrearFeeDate: dateSchema('Arrear Fee Date', true).optional(),

            // ----- BOOLEAN/FLAG FIELDS – OPTIONAL WITH DEFAULT -----
            asmaY_ReggularFlg: z
                .union([z.boolean(), z.number()])
                .transform((val) => Boolean(val))
                .default(false)
                .optional(),

            asmaY_NewFlg: z
                .union([z.boolean(), z.number()])
                .transform((val) => Boolean(val))
                .default(false)
                .optional(),

            asmaY_NewAdmissionFlg: z
                .union([z.boolean(), z.number()])
                .transform((val) => Boolean(val))
                .default(false)
                .optional(),

            asmaY_Pre_ActiveFlag: z
                .union([z.boolean(), z.number()])
                .transform((val) => Boolean(val))
                .default(false)
                .optional(),

            // Pre-Admission time fields (stored as "HH:mm" strings)
            asmaY_PreAdm_F_Time: z.string().optional().nullable(),
            asmaY_PreAdm_T_Time: z.string().optional().nullable()
        })
        .refine(
            (data) => {
                if (data.asmaY_From_Date && data.asmaY_To_Date) {
                    return new Date(data.asmaY_To_Date) > new Date(data.asmaY_From_Date);
                }
                return true;
            },
            {
                message: 'End Date must be after Start Date',
                path: ['asmaY_To_Date']
            }
        )
        .refine(
            (data) => {
                if (data.asmaY_PreAdm_F_Date && data.asmaY_PreAdm_T_Date) {
                    return new Date(data.asmaY_PreAdm_T_Date) > new Date(data.asmaY_PreAdm_F_Date);
                }
                return true;
            },
            {
                message: 'Pre-Admission End Date must be after Start Date',
                path: ['asmaY_PreAdm_T_Date']
            }
        )
        .refine(
            (data) => {
                if (data.asmaY_TransportSDate && data.asmaY_TransportEDate) {
                    return new Date(data.asmaY_TransportEDate) > new Date(data.asmaY_TransportSDate);
                }
                return true;
            },
            {
                message: 'Transport End Date must be after Start Date',
                path: ['asmaY_TransportEDate']
            }
        )
        .refine(
            (data) => {
                if (data.asmaY_RegularFeeFDate && data.asmaY_RegularFeeTDate) {
                    return new Date(data.asmaY_RegularFeeTDate) > new Date(data.asmaY_RegularFeeFDate);
                }
                return true;
            },
            {
                message: 'Financial Year End Date must be after Start Date',
                path: ['asmaY_RegularFeeTDate']
            }
        )
        .refine(
            (data) => {
                if (data.asmaY_PreAdm_F_Date && data.asmaY_From_Date) {
                    return new Date(data.asmaY_PreAdm_F_Date) <= new Date(data.asmaY_From_Date);
                }
                return true;
            },
            {
                message: 'Pre-Admission Start Date cannot be after Start Date',
                path: ['asmaY_PreAdm_F_Date']
            }
        ),

    delete: z.object({
        asmaY_Id: z.coerce
            .number({ invalid_type_error: 'asmaY_Id must be a number' })
            .int('asmaY_Id must be an integer')
            .positive('asmaY_Id must be a positive number')
    })
};
export const transactionnumberingSchema = z
    .object({
        auto_manual_flag: z.enum(['Manual', 'Auto']).default('Auto'),
        duplicates_flag: z.enum(['Yes', 'No']).optional(),

        prefix_type: z.enum(['academic', 'particulars']).optional(),
        suffix_type: z.enum(['academic', 'particulars']).optional(),
        prefix_particulars: z.string().optional(),
        suffix_particulars: z.string().optional(),
        prefix_numeric_width: z.coerce.number().optional(),
        suffix_starting_from: z.coerce.number().optional(),
        prefix_with_zero: z.enum(['yes', 'no']).optional(),
        restart_frequency: z.enum(['never', 'yearly', 'monthly']).optional(),

        // Receipt specific fields
        transaction_name: z.string().optional(),
        restart_acad_year: z.boolean().optional(),
        restart_fin_year: z.boolean().optional(),
        restart_cal_year: z.boolean().optional(),

        // Voucher specific fields
        voucher_name: z.string().optional(),
        voucher_type: z.string().optional(),

        // RollNumber specific fields
        rollNumberingconfig: z
            .array(
                z.object({
                    ivrmarnC_Field: z.string(),
                    ivrmarnC_AscDscOrder: z.string(),
                    ivrmarnC_Order: z.coerce.number(),
                    ivrmarnC_Id: z.coerce.number()
                })
            )
            .optional()
    })
    .superRefine((data, ctx) => {
        if (data.auto_manual_flag === 'Manual') {
            if (!data.duplicates_flag) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Prevent Duplicate is required when Manual is selected',
                    path: ['duplicates_flag']
                });
            }
        } else if (data.auto_manual_flag === 'Auto') {
            if (!data.prefix_type) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Prefix Type is required',
                    path: ['prefix_type']
                });
            }
            if (!data.suffix_type) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Suffix Type is required',
                    path: ['suffix_type']
                });
            }
            if (!data.prefix_numeric_width || data.prefix_numeric_width < 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Width of numeric part is required',
                    path: ['prefix_numeric_width']
                });
            }
            if (!data.suffix_starting_from || data.suffix_starting_from < 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'SLNO Starting From is required',
                    path: ['suffix_starting_from']
                });
            }
            if (!data.prefix_with_zero) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Prefix with zero is required',
                    path: ['prefix_with_zero']
                });
            }
            if (!data.restart_frequency) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Restart frequency is required',
                    path: ['restart_frequency']
                });
            }
        }
    });
