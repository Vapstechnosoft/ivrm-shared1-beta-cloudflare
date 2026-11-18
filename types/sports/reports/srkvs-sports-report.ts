import { z } from 'zod';

// Schema for the form
export const SRKVSSportsReportSchema = z
    .object({
        ASMAY_Id: z
            .number({ required_error: 'Select Academic Year', invalid_type_error: 'Select Academic Year' })
            .min(1, 'Select Academic Year'),
        SPCCME_Id: z.number({ required_error: 'Select Event', invalid_type_error: 'Select Event' }).min(1, 'Select Event'),
        Type: z.string({ required_error: 'Select Result', invalid_type_error: 'Select Result' }).min(1, 'Select Result'),

        // Optional/Conditional Fields
        Meet_Year: z.string().optional(),
        FromDate: z.date({ required_error: 'Select Date' }),

        // Multi-select or Single Select based on Type
        selectedCompetitionLevels: z.array(z.object({ spccmcL_Id: z.number() })).default([]),
        spccmcL_Id: z.number().optional(),

        selectedCategories: z.array(z.object({ spccmcC_Id: z.number() })).default([]),
        spccmcC_Id: z.number().optional(),

        // Specific Event Fields
        spccmsccG_Id: z.number().optional(), // Main Event (Group)
        spccmscC_Id: z.number().optional(), // Sub Event
        spccmsccG_Idsub: z.number().optional(), // Sub Sub Event (Single)

        // Sub Sub Event Multi-select
        selectedSubSubEvents: z.array(z.object({ spccmsccG_Id: z.number() })).default([])
    })
    .superRefine((data, ctx) => {
        const isMultiLevel = data.Type === 'Record' || data.Type === 'Start';
        const isMultiCategory = ['Record', 'Start', 'Consolidated', 'Indoor'].includes(data.Type);
        const hasEventFields = ['Start', 'Finish', 'Indoor', 'Outdoor', 'Team', 'Externals'].includes(data.Type);

        if (isMultiLevel) {
            if (!data.selectedCompetitionLevels || data.selectedCompetitionLevels.length === 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select Competition Level', path: ['selectedCompetitionLevels'] });
            }
        } else {
            if (!data.spccmcL_Id || data.spccmcL_Id === 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select Competition Level', path: ['spccmcL_Id'] });
            }
        }

        if (isMultiCategory) {
            if (!data.selectedCategories || data.selectedCategories.length === 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select Competition Category', path: ['selectedCategories'] });
            }
        } else {
            if (!data.spccmcC_Id || data.spccmcC_Id === 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select Competition Category', path: ['spccmcC_Id'] });
            }
        }

        if (hasEventFields) {
            if (!data.spccmsccG_Id || data.spccmsccG_Id === 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select Main Event', path: ['spccmsccG_Id'] });
            }
            if (!data.spccmscC_Id || data.spccmscC_Id === 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select Sub Event', path: ['spccmscC_Id'] });
            }

            const isMultiSubSub = ['Indoor', 'Outdoor', 'Externals'].includes(data.Type);
            const isSingleSubSub = ['Start', 'Team', 'Finish'].includes(data.Type);

            if (isMultiSubSub) {
                if (!data.selectedSubSubEvents || data.selectedSubSubEvents.length === 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select Sub Sub Event', path: ['selectedSubSubEvents'] });
                }
            } else if (isSingleSubSub) {
                if (!data.spccmsccG_Idsub || data.spccmsccG_Idsub === 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select Sub Sub Event', path: ['spccmsccG_Idsub'] });
                }
            }
        }
    });

export type SRKVSSportsReportFormSchema = z.infer<typeof SRKVSSportsReportSchema>;

// API Response Interfaces
export interface ISRKVSYear {
    asmaY_Id: number;
    asmaY_Year: string;
}

export interface ISRKVSMasterEvent {
    spccmE_Id: number;
    spccmE_EventName: string;
}

export interface ISRKVSCompetitionLevel {
    spccmcL_Id: number;
    spccmcL_CompitionLevel: string;
}

export interface ISRKVSCategory {
    spccmcC_Id: number;
    spccmcC_CompitionCategory: string;
}

export interface ISRKVSMainEvent {
    // getMasterEvent
    spccmsccG_Id: number;
    spccmsccG_SportsCCGroupName: string;
}

export interface ISRKVSSubEvent {
    // sportsCCList
    spccmscC_Id: number;
    spccmscC_SportsCCName: string;
}

export interface ISRKVSSubSubEvent {
    // getsubsubevent
    spccmsccG_Id: number;
    spccmsccG_SportsCCGroupName: string;
}

export interface ISRKVSInitialData {
    yearlist: ISRKVSYear[];
    masterEvent: ISRKVSMasterEvent[];
    competetionLevel: ISRKVSCompetitionLevel[];
    categoryList: ISRKVSCategory[];
    getMasterEvent: ISRKVSMainEvent[]; // Main Event dropdown
    sportsCCList?: ISRKVSSubEvent[]; // Sub Event dropdown (from get_class or get_SportsName)
    getsubsubevent?: ISRKVSSubSubEvent[]; // Sub Sub Event dropdown
}

// Flat report item from API
export interface ISRKVSReportItem {
    AMST_Id: number;
    AMAY_RollNo: string;
    AMST_FirstName: string;
    AMST_AdmNo: string;
    ASMCL_ClassName: string;
    ASMC_SectionName: string;
    SPCCESTR_Rank: string;
    SPCCESTR_Value: string;
    SPCCMUOM_UOMName: string;
    SPCCME_EventName: string;
    SPCCMSCCG_SportsCCGroupName: string;
    ASMAY_Year?: string;
    SPCCMCC_CompitionCategory: string;
    SPCCMCL_Id: number;
    SPCCMSCCG_Id: number;
    SPCCEST_Remarks?: string;
    [key: string]: any;
}

// Grouped data for UI
export interface ISRKVSReportData {
    SPCCMCC_Id?: number;
    SPCCMCC_CompitionCategory: string;
    SPCCMCL_Id?: number;
    spccmcL_CompitionLevel?: string;
    SPCCMSCCG_Id?: number;
    SPCCMSCCG_SportsCCGroupName?: string;
    SPCCEST_Remarks?: string;
    SPCCMUOM_UOMName?: string;
    RecordDetails: ISRKVSReportItem[];
}
