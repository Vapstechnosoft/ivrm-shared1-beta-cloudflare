import { z } from 'zod';

export type DayPeriodSchema = z.infer<typeof dayPeriodSchema>;

export const dayPeriodSchema = z.object({
    ttrdP_Id: z.number().optional(),
    asmaY_Id: z
        .number({
            required_error: 'Academic Year is required',
            invalid_type_error: 'Academic Year is required'
        })
        .min(1, 'Academic Year is required'),
    ttmC_Id: z
        .number({
            required_error: 'Category is required',
            invalid_type_error: 'Category is required'
        })
        .min(1, 'Category is required'),
    asmcL_Id: z
        .number({
            required_error: 'Class is required',
            invalid_type_error: 'Class is required'
        })
        .min(1, 'Class is required'),
    asmS_Id: z
        .number({
            required_error: 'Section is required',
            invalid_type_error: 'Section is required'
        })
        .min(1, 'Section is required'),
    hrmE_Id: z
        .number({
            required_error: 'Staff Name is required',
            invalid_type_error: 'Staff Name is required'
        })
        .min(1, 'Staff Name is required'),
    ismS_Id: z
        .number({
            required_error: 'Subject is required',
            invalid_type_error: 'Subject is required'
        })
        .min(1, 'Subject is required'),
    ttmD_Id: z
        .number({
            required_error: 'Day is required',
            invalid_type_error: 'Day is required'
        })
        .min(1, 'Day is required'),
    ttmP_Id: z
        .number({
            required_error: 'Period is required',
            invalid_type_error: 'Period is required'
        })
        .min(1, 'Period is required'),
    ttrdP_SUbSelcFlag: z.boolean().optional(),
    combinationlist: z
        .array(
            z.object({
                ASMCL_Id: z.number(),
                ASMS_Id: z.number(),
                HRME_Id: z.number(),
                ISMS_Id: z.number(),
                TTRDPCC_Periods: z.number().min(1, 'Period count is required') // Mapped from NOP
            })
        )
        .optional()
});

export type DayStaffSchema = z.infer<typeof dayStaffSchema>;
export const dayStaffSchema = z.object({
    ttrdS_Id: z.number().optional(),
    ttrpS_Id: z.number().optional(),
    asmaY_Id: z.number().min(1, 'Academic Year is required'),
    // ttmD_Id: z.number().optional(),
    ttmD_Id: z.number().min(1, 'Day is required'),
    ttmP_Id: z.number().optional(),
    hrmE_Id: z.number().min(1, 'Staff is required'),
    ttrdS_SUbSelcFlag: z.boolean().optional(),
    ttrpS_SUbSelcFlag: z.boolean().optional(),
    ttrdscC_Id: z.number().optional(),
    tempararyArrayList: z
        .array(
            z.object({
                asmcL_Id: z.number(),
                asmS_Id: z.number(),
                ismS_Id: z.number(),
                nop: z.number().min(1, 'Period count is required'),
                clsDisplay: z.string().optional(),
                sectDisplay: z.string().optional(),
                subDisplay: z.string().optional()
            })
        )
        .optional()
});

export type DaySubjectSchema = z.infer<typeof daySubjectSchema>;
export const daySubjectSchema = z.object({
    ttrdsU_Id: z.number().optional(),
    asmaY_Id: z.number().min(1, 'Academic Year is required'),
    ttmD_Id: z.number().min(1, 'Day is required'),
    ismS_Id: z.number().min(1, 'Subject is required'),
    ttrdsU_SUbSelcFlag: z.boolean().optional(),
    ttrdsucC_Id: z.number().optional(),
    tempararyArrayList: z
        .array(
            z.object({
                asmcL_Id: z.number(),
                asmS_Id: z.number(),
                hrmE_Id: z.number(),
                nop: z.number(),
                clsDisplay: z.string().optional(),
                sectDisplay: z.string().optional(),
                staffDisplay: z.string().optional()
            })
        )
        .optional()
});

export type PeriodStaffSchema = z.infer<typeof periodStaffSchema>;
export const periodStaffSchema = z.object({
    ttrpS_Id: z.number().optional(),
    asmaY_Id: z.number().min(1, 'Academic Year is required'),
    ttmP_Id: z.number().min(1, 'Period is required'),
    hrmE_Id: z.number().min(1, 'Staff is required'),
    ttrpS_SUbSelcFlag: z.boolean().optional(),
    tempararyArrayList: z
        .array(
            z.object({
                asmcL_Id: z.number(),
                asmS_Id: z.number(),
                ismS_Id: z.number(),
                nop: z.number().min(1, 'Day count is required'),
                clsDisplay: z.string().optional(),
                sectDisplay: z.string().optional(),
                subDisplay: z.string().optional()
            })
        )
        .optional()
});

export type PeriodSubjectSchema = z.infer<typeof periodSubjectSchema>;
export const periodSubjectSchema = z.object({
    ttrpsU_Id: z.number().optional(),
    asmaY_Id: z.number().min(1, 'Academic Year is required'),
    ttmP_Id: z.number().min(1, 'Period is required'),
    ismS_Id: z.number().min(1, 'Subject is required'),
    ttrpsU_SUbSelcFlag: z.boolean().optional(),
    ttrpsucC_Id: z.number().optional(),
    tempararyArrayList: z
        .array(
            z.object({
                asmcL_Id: z.number(),
                asmS_Id: z.number(),
                hrmE_Id: z.number(),
                nod: z.number().min(1, 'Day count is required'), // Mapped from NOP/NOD
                clsDisplay: z.string().optional(),
                sectDisplay: z.string().optional(),
                staffDisplay: z.string().optional()
            })
        )
        .optional()
});

// Temp schemas for appending to grid
export const tempDayStaffSchema = z.object({
    ASMCL_Id: z.number().min(1, 'Class is required'),
    ASMS_Id: z.number().min(1, 'Section is required'),
    ISMS_Id: z.number().min(1, 'Subject is required'),
    NOP: z.string().min(1, 'Period count is required') // Input as string then converted
});
// ... other temp schemas as needed ...
