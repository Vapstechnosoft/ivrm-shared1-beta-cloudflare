'use server';

import { api } from '@/lib/apiService';
import type {
    IPointsRecordReportData,
    IPointsRecordReportLoadData,
    IPointsRecordReportRequest
} from '@/types/sports/reports/points-record-report';

// Using ITopperListClassData/SectionData types or defining locally if not exported?
// Since ITopperListReport uses specific types for its responses, and we are using its endpoints,
// we should ideally use compatible types.
// I defined generic interfaces in my types file (IClass, ISection etc).
// Let's use simple any or define compatible wrapper types if structure matches.
// The response structure from `get_class` is { classList: [], houseList: [], eventList: [] }
// My types are compatible.

export async function getPointsRecordReportLoadData(): Promise<IPointsRecordReportLoadData> {
    try {
        console.info("🟡 [SERVER ACTION] getPointsRecordReportLoadData: Fetching 'SportPointAndRecordReport/Getdetails'");
        const response = await api.post<any>('sports', 'SportPointAndRecordReport/Getdetails', {});
        console.info('🟢 [SERVER ACTION] getPointsRecordReportLoadData: Response success =', response?.success);

        const data = response?.data || {};
        if (!response?.success) {
            console.error('🔴 [SERVER ACTION] getPointsRecordReportLoadData failed:', response?.message);
        }

        return {
            academicYear: data.yearlist || [],
            yearlist: data.yearlist || [],
            venueList: data.venueList || [],
            eventList: data.eventList || [],
            sportslist: data.sportslist || [],
            categoryList: data.categoryList || [],
            houseList: data.houseList || [],
            events: data.events || [],
            divisionList: data.divisionList || []
        };
    } catch (error) {
        console.error('🔴 Error in getPointsRecordReportLoadData:', error);
        return {
            academicYear: [],
            yearlist: [],
            venueList: [],
            eventList: [],
            sportslist: [],
            categoryList: [],
            houseList: [],
            events: [],
            divisionList: []
        };
    }
}

export async function getClassesHousesEvents(asmaY_Id: number) {
    try {
        console.info(`🟡 [SERVER ACTION] getClassesHousesEvents: Fetching 'SportPointAndRecordReport/get_class' for Year ID ${asmaY_Id}`);
        const response = await api.post<any>('sports', 'SportPointAndRecordReport/get_class', { asmaY_Id });
        return response?.data || { classList: [], houseList: [], eventList: [] };
    } catch (error) {
        console.error('🔴 Error in getClassesHousesEvents:', error);
        return { classList: [], houseList: [], eventList: [] };
    }
}

export async function getSections(asmaY_Id: number, asmcL_Id: number) {
    try {
        console.info(`🟡 [SERVER ACTION] getSections: Fetching 'StudentAgeCalcReport/get_section' for Year ${asmaY_Id}, Class ${asmcL_Id}`);
        const response = await api.post<any>('sports', 'StudentAgeCalcReport/get_section', { asmaY_Id, asmcL_Id });
        return response?.data || { sectionList: [] };
    } catch (error) {
        console.error('🔴 Error in getSections:', error);
        return { sectionList: [] };
    }
}

export async function getPointsRecordReport(data: IPointsRecordReportRequest): Promise<IPointsRecordReportData[]> {
    try {
        console.info("🟡 [SERVER ACTION] getPointsRecordReport: Fetching 'SportPointAndRecordReport/showdetails'");
        // Ensure qualification_type is mapped to type for the API
        const payload = {
            ...data,
            type: (data as any).qualification_type
        };
        const response = await api.post<any>('sports', 'SportPointAndRecordReport/showdetails', payload);
        console.info('🟢 [SERVER ACTION] getPointsRecordReport: Response success =', response?.success);

        // Handling varied response structures
        if (Array.isArray(response?.data)) {
            return response.data;
        }

        return response?.data || [];
    } catch (error) {
        console.error('🔴 Error in getPointsRecordReport:', error);
        return [];
    }
}

// --- PLURAL CONTROLLER (For PointsRecordReport Page) ---

export async function getPointsRecordReportInitialData(): Promise<IPointsRecordReportLoadData> {
    try {
        console.info("🟡 [SERVER ACTION] getPointsRecordReportInitialData: Fetching 'SportTopperListReport/Getdetails'");
        const response = await api.post<any>('sports', 'SportTopperListReport/Getdetails', {});
        console.info('🟢 [SERVER ACTION] getPointsRecordReportInitialData: Response success =', response?.success);

        const data = response?.data || {};
        return {
            academicYear: data.yearlist || [],
            yearlist: data.yearlist || [],
            venueList: data.venueList || [],
            eventList: data.eventList || [],
            sportslist: data.sportslist || [],
            categoryList: data.categoryList || [],
            houseList: data.houseList || [],
            events: data.events || [],
            divisionList: data.divisionList || []
        };
    } catch (error) {
        console.error('🔴 Error in getPointsRecordReportInitialData:', error);
        return {
            academicYear: [],
            yearlist: [],
            venueList: [],
            eventList: [],
            sportslist: [],
            categoryList: [],
            houseList: [],
            events: [],
            divisionList: []
        };
    }
}

export async function getPointsReport(data: IPointsRecordReportRequest): Promise<IPointsRecordReportData[]> {
    try {
        console.info("🟡 [SERVER ACTION] getPointsReport: Fetching 'SportPointsAndRecordReport/showdetails'");
        const response = await api.post<any>('sports', 'SportPointsAndRecordReport/showdetails', data);
        console.info('🟢 [SERVER ACTION] getPointsReport: Response success =', response?.success);

        if (Array.isArray(response?.data)) return response.data;
        return response?.data || [];
    } catch (error) {
        console.error('🔴 Error in getPointsReport:', error);
        return [];
    }
}
export async function getPointsRecordReportClasses(asmaY_Id: number) {
    try {
        console.info(`🟡 [SERVER ACTION] getPointsRecordReportClasses: Fetching 'SportTopperListReport/get_class' for Year ID ${asmaY_Id}`);
        const response = await api.post<any>('sports', 'SportTopperListReport/get_class', { asmaY_Id });
        return response?.data || { classList: [], houseList: [], eventList: [] };
    } catch (error) {
        console.error('🔴 Error in getPointsRecordReportClasses:', error);
        return { classList: [], houseList: [], eventList: [] };
    }
}

export async function getPointsRecordReportSections(asmaY_Id: number, asmcL_Id: number) {
    try {
        console.info(
            `🟡 [SERVER ACTION] getPointsRecordReportSections: Fetching 'SportTopperListReport/get_section' for Year ${asmaY_Id}, Class ${asmcL_Id}`
        );
        const response = await api.post<any>('sports', 'SportTopperListReport/get_section', { asmaY_Id, asmcL_Id });
        return response?.data || { sectionList: [] };
    } catch (error) {
        console.error('🔴 Error in getPointsRecordReportSections:', error);
        return { sectionList: [] };
    }
}
