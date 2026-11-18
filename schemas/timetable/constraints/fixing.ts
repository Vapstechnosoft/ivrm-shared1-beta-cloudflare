import { z } from 'zod';

// Common sub-schema for Class-Section logic

// 2. Day Staff Sub-list: Class, Section, Subject, NOP
const fixingDayStaffListSchema = z.object({
    asmcL_Id: z.coerce.number().min(1, 'Class is required'),
    asmS_Id: z.coerce.number().min(1, 'Section is required'),
    ismS_Id: z.coerce.number().min(1, 'Subject is required'),
    nop: z.coerce.number().min(1, 'No of Periods is required'),
    // UI Display
    clsDisplay: z.string().optional(),
    sectDisplay: z.string().optional(),
    subDisplay: z.string().optional()
});

// 3. Day Subject Sub-list: Class, Section, Staff, NOP
const fixingDaySubjectListSchema = z.object({
    asmcL_Id: z.coerce.number().min(1, 'Class is required'),
    asmS_Id: z.coerce.number().min(1, 'Section is required'),
    hrmE_Id: z.coerce.number().min(1, 'Staff is required'),
    nop: z.coerce.number().min(1, 'No of Periods is required'),
    // UI Display
    clsDisplay: z.string().optional(),
    sectDisplay: z.string().optional(),
    staffDisplay: z.string().optional()
});

// 4. Period Staff Sub-list: Class, Section, Subject, NOD
const fixingPeriodStaffListSchema = z.object({
    asmcL_Id: z.coerce.number().min(1, 'Class is required'),
    asmS_Id: z.coerce.number().min(1, 'Section is required'),
    ismS_Id: z.coerce.number().min(1, 'Subject is required'),
    nop: z.coerce.number().min(1, 'No of Days is required'),
    // UI Display
    clsDisplay: z.string().optional(),
    sectDisplay: z.string().optional(),
    subDisplay: z.string().optional()
});

// 5. Period Subject Sub-list: Class, Section, Staff, NOD
const fixingPeriodSubjectListSchema = z.object({
    asmcL_Id: z.coerce.number().min(1, 'Class is required'),
    asmS_Id: z.coerce.number().min(1, 'Section is required'),
    hrmE_Id: z.coerce.number().min(1, 'Staff is required'),
    nop: z.coerce.number().min(1, 'No of Days is required'),
    // UI Display
    clsDisplay: z.string().optional(),
    sectDisplay: z.string().optional(),
    staffDisplay: z.string().optional()
});

// 1. Day Period Schema
export const fixingDayPeriodSchema = z.object({
    ttfdP_Id: z.number().optional(),
    asmaY_Id: z.coerce.number().min(1, 'Academic Year is required'),
    ttmC_Id: z.coerce.number().min(1, 'Category is required'),
    asmcL_Id: z.coerce.number().min(1, 'Class is required'),
    asmS_Id: z.coerce.number().min(1, 'Section is required'),
    hrmE_Id: z.coerce.number().min(1, 'Staff is required'),
    ismS_Id: z.coerce.number().min(1, 'Subject is required'),
    ttmD_Id: z.coerce.number().min(1, 'Day is required'),
    ttmP_Id: z.coerce.number().min(1, 'Period is required')
});
export type FixingDayPeriodSchema = z.infer<typeof fixingDayPeriodSchema>;

// 2. Day Staff Schema
export const fixingDayStaffSchema = z.object({
    ttfdS_Id: z.number().optional(),
    asmaY_Id: z.coerce.number().min(1, 'Academic Year is required'),
    ttmD_Id: z.coerce.number().min(1, 'Day is required'),
    hrmE_Id: z.coerce.number().min(1, 'Staff is required'),
    ttfdS_SUbSelcFlag: z.boolean().default(false), // true if Class-Section Wise
    ttfdscC_Id: z.number().optional(),
    tempararyArrayList: z.array(fixingDayStaffListSchema).optional()
});
export type FixingDayStaffSchema = z.infer<typeof fixingDayStaffSchema>;

// 3. Day Subject Schema
export const fixingDaySubjectSchema = z.object({
    ttfdsU_Id: z.number().optional(),
    asmaY_Id: z.coerce.number().min(1, 'Academic Year is required'),
    ttmD_Id: z.coerce.number().min(1, 'Day is required'),
    ismS_Id: z.coerce.number().min(1, 'Subject is required'),
    ttfdsU_SUbSelcFlag: z.boolean().default(false),
    tempararyArrayList: z.array(fixingDaySubjectListSchema).optional()
});
export type FixingDaySubjectSchema = z.infer<typeof fixingDaySubjectSchema>;

// 4. Period Staff Schema
export type FixingPeriodStaffSchema = z.infer<typeof fixingPeriodStaffSchema>;
export const fixingPeriodStaffSchema = z.object({
    ttfpS_Id: z.number().optional(),
    asmaY_Id: z.coerce.number().min(1, 'Academic Year is required'),
    ttmP_Id: z.coerce.number().min(1, 'Period is required'),
    hrmE_Id: z.coerce.number().min(1, 'Staff is required'),
    ttfpS_SUbSelcFlag: z.boolean().default(false),
    ttfpscC_Id: z.number().optional(),
    tempararyArrayList: z.array(fixingPeriodStaffListSchema).optional()
});

// 5. Period Subject Schema
export const fixingPeriodSubjectSchema = z.object({
    ttrpsU_Id: z.number().optional(),
    ttfpsU_Id: z.number().optional(),
    asmaY_Id: z.coerce.number().min(1, 'Academic Year is required'),
    ttmP_Id: z.coerce.number().min(1, 'Period is required'),
    ismS_Id: z.coerce.number().min(1, 'Subject is required'),
    ttrpsU_SUbSelcFlag: z.boolean().default(false),
    ttfpsU_SUbSelcFlag: z.boolean().default(false),
    tempararyArrayList: z.array(fixingPeriodSubjectListSchema).optional()
});
export type FixingPeriodSubjectSchema = z.infer<typeof fixingPeriodSubjectSchema>;
