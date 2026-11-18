import { z } from 'zod';

export const pointsRecordReportSchema = z
    .object({
        Type: z.enum(['House', 'CS', 'CC']),
        ASMAY_Id: z.number().min(1, 'Academic Year is required'),

        // CS specific
        ASMCL_Id: z.number().optional(),
        selectedSectionlist: z.array(z.object({ asmS_Id: z.number() })).optional(),

        // CC specific
        SPCCMCC_Id: z.number().optional(),
        placListData: z.array(z.object({ spccestR_Rank: z.string() })).optional(),

        // Common
        selectedhouselist: z.array(z.object({ spccmH_Id: z.number() })).optional(),
        selectedEventlist: z.array(z.object({ spccmE_Id: z.number() })).optional(),
        selectedSportslist: z.array(z.object({ spccmscC_Id: z.number() })).optional()
    })
    .refine(
        (data) => {
            if (data.Type === 'CS') {
                return !!data.ASMCL_Id;
            }
            return true;
        },
        {
            message: 'Class is required',
            path: ['ASMCL_Id']
        }
    )
    .refine(
        (data) => {
            if (data.Type === 'CC') {
                return !!data.SPCCMCC_Id;
            }
            return true;
        },
        {
            message: 'Competition Category is required',
            path: ['SPCCMCC_Id']
        }
    )
    .refine(
        (data) => {
            // Basic validation: ensure at least one filter is selected if expected?
            // For now enforcing at least one House if Type is House could be good, but following pattern:
            if (data.Type === 'House') {
                return data.selectedhouselist && data.selectedhouselist.length > 0;
            }
            return true;
        },
        {
            message: 'Select at least one House',
            path: ['selectedhouselist']
        }
    )
    .refine(
        (data) => {
            if (data.Type === 'CS') {
                return data.selectedSectionlist && data.selectedSectionlist.length > 0;
            }
            return true;
        },
        {
            message: 'Select at least one Section',
            path: ['selectedSectionlist']
        }
    );

export type PointsRecordReportFormSchema = z.infer<typeof pointsRecordReportSchema>;
