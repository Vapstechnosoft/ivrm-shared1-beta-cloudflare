import { z } from 'zod';

/**
 * Zod schema for Leave Configuration form validation
 * Matches validation rules from IVRM LeaveConfiguration.html
 */
export const leaveConfigurationSchema = z.object({
    id: z.number().optional().default(0),
    policy_name: z.string().min(1, 'Please Enter Policy Name'),
    proc_name: z.string().optional(),
    servic_name: z.string().min(1, 'Please Select Service Name'),
    late_flag: z.boolean().default(true),
    Late_Time: z.string().min(1, 'Enter Late Time'),
    numlate_flag: z.boolean().default(true),
    Late_num: z.string().min(1, 'Enter num of lates'),
    Early: z.boolean().default(true),
    Early_Time: z.string().min(1, 'Enter Early Time'),
    Time_flag: z.boolean().default(true),
    cum_time: z.string().min(1, 'Enter Cumulative Time'),
    Aftr_cum_time: z.string().min(1, 'Enter Cumulative Time'),
    carry_flag: z.boolean().default(true),
    sufix_flag: z.boolean().default(true),
    holiday_inc_flag: z.boolean().default(true),
    HRLPC_LateLeaveFlag: z.enum(['leave', 'lop']).default('leave'),
    sporgen_flag: z.enum(['SP', 'GEN']).default('GEN'),
    HRLPC_AbsentLeaveFlag: z.enum(['leave', 'lop']).default('leave')
});

export type LeaveConfigurationFormValues = z.infer<typeof leaveConfigurationSchema>;
