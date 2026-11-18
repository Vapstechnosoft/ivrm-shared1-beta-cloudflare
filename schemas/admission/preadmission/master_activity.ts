import { z } from 'zod';

export const MasterActivitySchema = z.object({
    amA_Id: z.number().optional(),
    amA_Activity: z.string().min(1, 'Activity Name is required').max(20, 'Activity Name cannot exceed 20 characters'),
    amA_Activity_Desc: z.string().min(1, 'Activity Description is required').max(50, 'Activity Description cannot exceed 50 characters')
});

export const masterActivitySchema = {
    addOrUpdate: MasterActivitySchema
};

export type IMasterActivity = z.infer<typeof MasterActivitySchema>;

export interface IMasterActivityList extends IMasterActivity {
    amA_Id: number;
    amA_Activity: string;
    amA_Activity_Desc: string;
}
