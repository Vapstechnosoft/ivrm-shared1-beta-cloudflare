import { z } from 'zod';

export const consolidatedReportSchema = {
    search: z
        .object({
            asmaY_Id: z.number().min(1, 'Academic Year is required'),
            type: z.enum(['ST', 'STD', 'CSUB', 'STSUB', 'SPW', 'STFP', 'PSTF', 'SPC', 'CSPC', 'RMR', 'ATG']),
            ttmC_Id: z.number().optional(),
            classId: z.array(z.number()).optional(),
            sectionId: z.array(z.number()).optional(),
            staffId: z.array(z.number()).optional(), // For multi-select
            dayId: z.array(z.number()).optional(), // For multi-select
            periodId: z.array(z.number()).optional(), // For multi-select
            singleDayId: z.number().optional(), // For STFP, PSTF
            singlePeriodId: z.number().optional(), // For PSTF
            rpttyp: z.string().optional(), // For RMR (SAWC, SNWC)
            rpttypai: z.boolean().optional() // Teacher Master checkbox
        })
        .superRefine((data, ctx) => {
            if (data.type === 'ST') {
                if (!data.ttmC_Id) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Category is required', path: ['ttmC_Id'] });
                }
                if (!data.classId || data.classId.length === 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select atleast one Class', path: ['classId'] });
                }
                if (!data.sectionId || data.sectionId.length === 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select atleast one Section', path: ['sectionId'] });
                }
            }
            if (['CSUB', 'STSUB', 'SPW'].includes(data.type)) {
                if (!data.dayId || data.dayId.length === 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select atleast one Day', path: ['dayId'] });
                }
                if (!data.periodId || data.periodId.length === 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select atleast one Period', path: ['periodId'] });
                }
                if (data.type === 'CSUB' || data.type === 'SPW') {
                    if (!data.staffId || data.staffId.length === 0) {
                        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select atleast one Staff', path: ['staffId'] });
                    }
                }
            }
            if (['STFP', 'PSTF'].includes(data.type)) {
                if (!data.singleDayId) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Day is required', path: ['singleDayId'] });
                }
            }
            if (data.type === 'PSTF') {
                if (!data.singlePeriodId) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Period is required', path: ['singlePeriodId'] });
                }
            }
        })
};

export const classWiseReportSchema = {
    search: z.object({
        asmaY_Id: z.number().min(1, 'Academic Year is required'),
        ttmC_Id: z.number().min(1, 'Category is required'),
        classId: z.array(z.number()).min(1, 'Select at least one Class'),
        sectionId: z.array(z.number()).min(1, 'Select at least one Section')
    })
};

export const subjectWiseReportSchema = {
    search: z.object({
        asmaY_Id: z.number().min(1, 'Academic Year is required'),
        classId: z.array(z.number()).min(1, 'Select at least one Class'),
        subjectId: z.array(z.number()).min(1, 'Select at least one Subject')
    })
};

export const staffWiseReportSchema = {
    search: z.object({
        asmaY_Id: z.number().min(1, 'Academic Year is required'),
        staffId: z.array(z.number()).min(1, 'Select at least one Staff'),
        rpttyp: z.enum(['SAWC', 'SNWC'])
    })
};

export const deputationReportSchema = {
    search: z
        .object({
            asmaY_Id: z.number().min(1, 'Academic Year is required'),
            fromdate: z.date({
                required_error: 'From Date is required'
            }),
            todate: z.date({
                required_error: 'To Date is required'
            }),
            flag: z.enum(['D', 'C'], {
                required_error: 'Report Type is required'
            })
        })
        .refine((data) => data.todate >= data.fromdate, {
            message: 'To Date must be greater than or equal to From Date',
            path: ['todate']
        })
};

export const staffWiseWorkingHoursReportSchema = {
    search: z.object({
        asmaY_Id: z.number().min(1, 'Academic Year is required'),
        hrmE_Id: z.array(z.number()).min(1, 'Select at least one Staff')
    })
};

export const ttMonthEndReportSchema = {
    search: z.object({
        asmaY_Id: z.coerce
            .number({
                required_error: 'Please enter academic year',
                invalid_type_error: 'Please enter academic year'
            })
            .min(1, 'Please enter academic year'),
        month: z.coerce
            .number({
                required_error: 'Please enter month',
                invalid_type_error: 'Please enter month'
            })
            .min(1, 'Please enter month'),
        name: z.string().optional()
    })
};
