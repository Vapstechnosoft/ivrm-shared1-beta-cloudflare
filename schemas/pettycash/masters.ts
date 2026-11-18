import { z } from 'zod';

export const masterParticularsSchema = {
    addOrUpdate: z.object({
        pcmparT_ParticularName: z.string().min(1, 'Particular Name is required'),
        pcmparT_ParticularDesc: z.string().optional().or(z.literal(''))
    })
};

export type MasterParticularsFormValues = z.infer<typeof masterParticularsSchema.addOrUpdate>;
