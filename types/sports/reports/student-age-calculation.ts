import { z } from 'zod';

export interface IStudentAgeReport {
    amsT_Id: number;
    amsT_FirstName?: string;
    amsT_MiddleName?: string;
    amsT_LastName?: string;
    amsT_Name: string;
    amsT_Admno: string;
    asmcL_Classname: string;
    asmC_Sectionname: string;
    spccmH_Housename?: string;
    amsT_DOb: string | Date;
    years: number;
    months: number;
    monthsd: number;
    days?: number;
    spccmcL_compitionLevel?: string;
}

export interface IReportRequest {
    type: 'House' | 'CS'; // 'CS' for Class/Section
    asmaY_Id: number;
    asmcL_Id?: number;
    spccmcC_Id?: number;
    selectedhouselist?: { spccmH_Id: number }[];
    selectedSectionlist?: { asmS_Id: number }[];
    search_column?: string;
    search_query?: string;
}

export interface IStudentAgeCalculationDropdowns {
    yearlist: {
        asmaY_Id: number;
        asmaY_Year: string;
    }[];
    categoryList?: {
        spccmcC_Id: number;
        spccmcC_CompitionCategory: string;
    }[];
    classList?: {
        asmcL_Id: number;
        asmcL_ClassName: string;
    }[];
    houseList?: {
        spccmH_Id: number;
        spccmH_HouseName: string;
    }[];
    sectionList?: {
        asmS_Id: number;
        asmC_SectionName: string;
    }[];
}

export const StudentAgeReportSchema = z
    .object({
        type: z.enum(['House', 'CS']),
        asmaY_Id: z
            .number({ required_error: 'Select Academic Year', invalid_type_error: 'Select Academic Year' })
            .min(1, 'Select Academic Year'),
        spccmcC_Id: z.number().optional(),
        asmcL_Id: z.number().optional(),
        selectedhouselist: z.array(z.object({ spccmH_Id: z.number() })),
        selectedSectionlist: z.array(z.object({ asmS_Id: z.number() }))
    })
    .superRefine((data, ctx) => {
        // Academic Year is already handled by .min(1) above,
        // but we can be extra sure if needed.

        if (data.type === 'CS') {
            if (!data.asmcL_Id || data.asmcL_Id === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Select Class',
                    path: ['asmcL_Id']
                });
            }
            if (!data.selectedSectionlist || data.selectedSectionlist.length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Select at least one section',
                    path: ['selectedSectionlist']
                });
            }
        }

        // House selection is mandatory for both types in this report?
        // Usually yes, if it's displayed and has an asterisk.
        if (!data.selectedhouselist || data.selectedhouselist.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Select at least one house',
                path: ['selectedhouselist']
            });
        }
    });

export type StudentAgeReportFormSchema = z.infer<typeof StudentAgeReportSchema>;
