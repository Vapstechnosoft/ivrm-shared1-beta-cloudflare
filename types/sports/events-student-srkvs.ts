import type { ReactNode } from 'react';
import { z } from 'zod';

// Interfaces for Grid Data
export interface IEventsStudentSRKVSData {
    endDate: ReactNode;
    startDate: ReactNode;
    spccesT_Id: number;
    spccmeV_EventVenue: string;
    spccmeV_Id: number;
    spccesT_ActiveFlag: boolean;
    compitionLevel: string;
    spccmcC_Id: number;
    categoryName: string;
    spccmscC_Id: number;
    sportsName: string;
    spccmcL_Id: number;
    spccesT_House_Class_Flag: string;
    spccmuoM_Id: number;
    uomName: string;
    spccmE_Id: number;
    spccmsccG_Id: number;
    spccmsccG_SportsCCGroupName: string;
    eventName: string;
    asmaY_Id: number;
    asmaY_Year: string;
    // startDate: string;
    // endDate: string;
}

export interface IEventsStudentSRKVSViewDetails {
    amsT_Id: number;
    spccesT_Id: number;
    amsT_AdmNo: string;
    asmaY_Id: number;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    spccestR_Rank: number;
    spccestR_Points: number;
    spccestR_RecordBrokenFlag: boolean;
    studentName: string;
    spccestR_Id: number;
    spccmscC_MultiAttemptFlg: boolean;
    spccmscC_NoOfAttempts: number;
    spccestR_Remarks?: string;
}

// Student Dropdown/Selection Item
export interface IStudentSRKVSValues {
    amsT_Id: number;
    studentName: string;
    amsT_AdmNo: string;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    // spccmH_HouseName?: string; // Removed
    spccestR_Points?: number | string;
    spccestR_Rank?: string;
    spccestR_Remarks?: string;
    spccestR_RecordBrokenFlag?: boolean;
    ivrmgC_SportsPointsDropdownFlg?: number; // 0 for text input, 1 for dropdown
    spccmuoM_Id?: number;
    spccestR_Value?: string;
    spccestR_EventRecordFlg?: boolean;
    spccestR_Id?: number;
    spccesT_Id?: number;
    spccmscC_MultiAttemptFlg?: boolean;
    selected?: boolean;
    detailsstudent?: any[]; // For multiple attempts
}

// Dropdowns
export interface IEventsStudentSRKVSDropdowns {
    academicYear: { asmaY_Id: number; asmaY_Year: string }[];
    eventsList: { spccmE_Id: number; spccmE_EventName: string }[];
    categoryList: { spccmcC_Id: number; spccmcC_CompitionCategory: string }[];
    // houseList: { spccmH_Id: number; spccmH_HouseName: string }[]; // Removed
    classList: { asmcL_Id: number; asmcL_ClassName: string }[];
    sectionList: { asmS_Id: number; asmC_SectionName: string }[];
    competitionLevelList: { spccmcL_Id: number; spccmcL_CompitionLevel: string }[];
    groupList: { spccmsccG_Id: number; spccmsccG_SportsCCGroupName: string; spccmsccG_SCCFlag?: string }[];
    sportsList: { spccmscC_Id: number; spccmscC_SportsCCName?: string; spccmE_EventName?: string }[];
    uomList: { spccmuoM_Id: number; spccmuoM_UOMName: string }[];
    venueList: { spccmeV_Id: number; spccmeV_EventVenue: string; spccE_StartDate?: string; spccE_EndDate?: string }[];
    subSubEventList: { spccmsccG_Id: number; spccmsccG_SportsCCGroupName: string }[];
    categoryListClassWise: { comcat_idcls: number; comptcatenamecls: string }[];
}

export const eventsStudentSRKVSSchema = z.object({
    asmaY_Id: z.coerce.number().min(1, 'Academic Year is required'),
    spccmsccG_SCCFlag: z.enum(['Sports', 'Co-Curricular']),
    // spccesT_House_Class_Flag: z.enum(["CC", "House", "Class", "CS"]).optional(), // Removed
    spccmcC_Id: z.coerce.number().optional(), // Category (for CC)
    comcat_idcls: z.coerce.number().optional(), // Category (for Class/House?)
    spccmcL_Id: z.coerce.number().min(1, 'Competition Level is required'),
    spccmE_Id: z.coerce.number().min(1, 'Event is required'),
    spccmsccG_Id: z.coerce.number().min(1, 'Main Event is required'),
    spccmsccG_Idsub: z.coerce.number().min(1, 'Sub Sub Event is required'),
    spccmscC_Id: z.coerce.number().min(1, 'Sub Event is required'),
    spccmuoM_Id: z.coerce.number().min(1, 'UOM is required'),
    spccmeV_Id: z.coerce.number().min(1, 'Venue is required'),
    spccE_StartDate: z.string().min(1, 'Start Date is required'),
    spccE_EndDate: z.string().min(1, 'End Date is required'),
    spccesT_Remarks: z.string().optional(),
    spccesT_OldRecord: z.string().optional(),

    // Filtering Arrays
    // selectedHouses: z.array(z.number()).optional(), // Removed
    selectedClasses: z.array(z.number()).optional(),
    selectedSections: z.array(z.number()).optional()
});

export type EventsStudentSRKVSFormSchema = z.infer<typeof eventsStudentSRKVSSchema>;
