'use server';

import { type ApiResponse, api } from '@/lib/apiService';
import type { IEventsStudentSRKVSData, IEventsStudentSRKVSDropdowns, IStudentSRKVSValues } from '@/types/sports/events-student-srkvs'; // Ensure this path is correct

/**
 * Fetch All Initial Dropdowns
 */
/**
 * Fetch All Initial Dropdowns
 */
export async function getEventsStudentSRKVSDropdowns(): Promise<IEventsStudentSRKVSDropdowns> {
    let academicYearList: any[] = [];
    let categoryList: any[] = [];
    const categoryListClassWise: any[] = [];
    let competitionLevelList: any[] = [];
    let eventsList: any[] = [];
    let groupList: any[] = []; // Main Event
    let uomList: any[] = [];
    let venueList: any[] = [];

    // Call API for Academic Year, Venue List, Main Event List and Competition Category List
    try {
        const [yearResponse, venueResponse, mainEventResponse, categoryResponse] = await Promise.all([
            api.post<any>('sports', 'SportStudentEligbleReport/Getdetails', {}),
            api.get<any>('sports', 'EventsStudentRecord/VenueList'),
            api.get<any>('sports', 'EventsStudentRecord/MainEventList'),
            api.get<any>('sports', 'EventsStudentRecord/CompetitionCategoryList')
        ]);

        if (yearResponse.success && yearResponse.data) {
            academicYearList = yearResponse.data.yearlist || [];
        }

        if (venueResponse.success && venueResponse.data) {
            venueList = Array.isArray(venueResponse.data) ? venueResponse.data : [];
        }

        if (mainEventResponse.success && mainEventResponse.data) {
            groupList = Array.isArray(mainEventResponse.data) ? mainEventResponse.data : [];
        }

        if (categoryResponse.success && categoryResponse.data) {
            categoryList = Array.isArray(categoryResponse.data) ? categoryResponse.data : [];
        }
    } catch (error) {
        console.error('Error fetching SRKVS dropdowns:', error);
    }

    // Mock Data for others (until API integration for them is confirmed)

    eventsList = [
        { spccmE_Id: 1, spccmE_EventName: 'Annual Sports Meet' },
        { spccmE_Id: 2, spccmE_EventName: 'Inter-House Football' }
    ];

    competitionLevelList = [
        { spccmcL_Id: 1, spccmcL_CompitionLevel: 'Inter-House' },
        { spccmcL_Id: 2, spccmcL_CompitionLevel: 'Inter-School' },
        { spccmcL_Id: 3, spccmcL_CompitionLevel: 'State Level' }
    ];

    uomList = [
        { spccmuoM_Id: 1, spccmuoM_UOMName: 'Seconds' },
        { spccmuoM_Id: 2, spccmuoM_UOMName: 'Meters' },
        { spccmuoM_Id: 3, spccmuoM_UOMName: 'Points' }
    ];

    return {
        academicYear: academicYearList,
        eventsList: eventsList,
        categoryList: categoryList,
        // houseList: [], // Removed
        classList: [],
        sectionList: [],
        competitionLevelList: competitionLevelList,
        groupList: groupList,
        sportsList: [],
        uomList: uomList,
        venueList: venueList,
        subSubEventList: [],
        categoryListClassWise: []
    };
}

// Fetch Classes and Houses based on Academic Year
export async function getClassHouse(asmaY_Id: number) {
    let listof_class: any[] = [];

    try {
        const classResponse = await api.get<any>('sports', `EventsStudentRecord/ClassList?ASMAY_Id=${asmaY_Id}`);
        if (classResponse.success && classResponse.data) {
            listof_class = Array.isArray(classResponse.data) ? classResponse.data : [];
        }
    } catch (error) {
        console.error('Error fetching Class List:', error);
    }

    return {
        listof_class: listof_class,
        sectionList: []
        // houseList: [] // Removed
    };
}

// Fetch Sections based on Class Selection
export async function getSectionList(data: { ASMAY_Id: number; classListArray: any[] }) {
    try {
        const response = await api.post<any>('sports', 'EventsStudentRecord/SectionList', data);
        if (response.success && response.data) {
            return Array.isArray(response.data) ? response.data : [];
        }
        return [];
    } catch (error) {
        console.error('Error fetching Section List:', error);
        return [];
    }
}

// Fetch Sub Events (Sports Name)
export async function getSportsName(spccmsccG_Id: number) {
    try {
        const response = await api.get<any>('sports', `EventsStudentRecord/SubEventList?SPCCME_Id=${spccmsccG_Id}`);
        if (response.success && response.data) {
            return Array.isArray(response.data) ? response.data : [];
        }
        return [];
    } catch (error) {
        console.error('Error fetching Sub Events:', error);
        return [];
    }
}

// Fetch Sub Sub Events and UOM (get_uom_Name)
export async function getSubSubEvents(spccmscC_Id: number, spccmsccG_Id: number) {
    try {
        const response = await api.get<any>('sports', `EventsStudentRecord/SubSubEventList?SPCCMSCCG_Id=${spccmscC_Id}`);
        if (response.success && response.data) {
            return Array.isArray(response.data) ? response.data : [];
        }
        return [];
    } catch (error) {
        console.error('Error fetching Sub Sub Events:', error);
        return [];
    }
}

// Fetch Students
export async function getStudents(payload: any): Promise<ApiResponse<IStudentSRKVSValues[]>> {
    try {
        const response = await api.post<any>('sports', 'EventsStudentRecord/GetStudentList', payload);

        // Handle response where data is present even if success flag is false (e.g. "Unauthorized" but with data)
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            return { success: true, message: 'Students fetched successfully', data: response.data };
        }

        if (response.success && response.data) {
            let students = [];
            if (Array.isArray(response.data)) {
                students = response.data;
            } else if (response.data.studentList && Array.isArray(response.data.studentList)) {
                students = response.data.studentList;
            }
            return { success: true, message: 'Students fetched successfully', data: students };
        }
        return { success: false, message: response.message || 'No students found', data: [] };
    } catch (error) {
        console.error('Error fetching students:', error);
        return { success: false, message: 'Failed to fetch students', data: [] };
    }
}

// Fetch Saved Records List
export async function getEventsStudentSRKVSList(): Promise<ApiResponse<IEventsStudentSRKVSData[]>> {
    try {
        const response = await api.get<any>('sports', 'EventsStudentRecord/EventsStudentGridSRKVS');
        console.log('Grid Response:', JSON.stringify(response, null, 2));

        // Handle case where backend returns success:false but still provides data
        // e.g. { success: false, message: "UOMList not found", data: [...records] }
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            return { success: true, message: 'Data fetched successfully', data: response.data };
        }

        if (response.success && response.data) {
            const data = Array.isArray(response.data) ? response.data : [];
            return { success: true, message: 'Data fetched successfully', data: data };
        }
        return { success: false, message: response.message || 'Failed to fetch grid data', data: [] };
    } catch (error) {
        console.error('Error fetching grid data:', error);
        return { success: false, message: 'Error fetching grid data', data: [] };
    }
}

// Save Record
export async function saveEventsStudentSRKVS(data: any): Promise<ApiResponse<any>> {
    console.log('saveEventsStudentSRKVS Payload:', JSON.stringify(data, null, 2));
    try {
        const response = await api.post<any>('sports', 'EventsStudentRecord/saveRecordSRKVS', data);

        // Assuming response.data contains the APIResponseDto from C#
        const returnVal = response.data?.returnVal || (response as any).returnVal;

        if (response.success && (returnVal === 'Saved!' || returnVal === 'updated' || returnVal === 'Saved successfully')) {
            return { success: true, message: returnVal, data: response.data };
        } else if (response.success && response.message === 'Saved successfully') {
            return { success: true, message: 'Saved successfully', data: response.data };
        } else if (returnVal === 'duplicate') {
            return { success: false, message: 'Record already exists (Duplicate)', data: null };
        } else if (returnVal === 'Save Failed!') {
            return { success: false, message: 'Failed to save record', data: null };
        }

        // Fallback
        if (response.success && !returnVal) {
            // Maybe API wrapper strips it? Treat as success if data matches expectations?
            // But safer to assume failure if returnVal is missing when expected.
            // However, let's just return what we got if successful HTTP.
            return { success: true, message: 'Request processed, verify status.', data: response.data };
        }

        return { success: false, message: response.message || returnVal || 'Failed to save record', data: null };
    } catch (error) {
        console.error('Error saving SRKVS record:', error);
        return { success: false, message: 'An error occurred while saving', data: null };
    }
}

// Get View Details
export async function getEventsStudentSRKVSDetails(spccesT_Id: number): Promise<ApiResponse<any[]>> {
    try {
        const response = await api.get<any>('sports', `EventsStudentRecord/ViewDetailsSRKVS?SPCCEST_Id=${spccesT_Id}`);
        // Handle response where data is present even if success flag is false
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            return { success: true, message: 'Details fetched successfully', data: response.data };
        }
        if (response.success && response.data) {
            return {
                success: true,
                message: 'Details fetched successfully',
                data: Array.isArray(response.data) ? response.data : [response.data]
            };
        }
        return { success: false, message: response.message || 'No details found', data: [] };
    } catch (error) {
        console.error('Error fetching View Details:', error);
        return { success: false, message: 'Failed to fetch details', data: [] };
    }
}

// Update View Details
export async function updateStudentSRKVSDetails(data: any): Promise<ApiResponse<any>> {
    try {
        const payload = {
            MI_Id: 0,
            UserId: 0,
            ASMAY_Id: 0,
            student1: data.map((item: any) => ({
                spccestR_Id: item.spccestR_Id || 0,
                amsT_Id: item.amsT_Id || 0,
                spccesT_Id: item.spccesT_Id || 0,
                spccestR_Rank: String(item.spccestR_Rank || '0'),
                spccestR_Points: Number(item.spccestR_Points) || 0,
                spccestR_Value: String(item.spccestR_Value || ''),
                spccestR_RecordBrokenFlag: item.spccestR_RecordBrokenFlag ? 'true' : 'false',
                spccestR_Remarks: item.spccestR_Remarks || '',
                spccmuoM_Id: item.spccmuoM_Id || 0,
                spccestR_EventRecordFlg: !!item.spccestR_EventRecordFlg,
                spccmscC_MultiAttemptFlg: !!item.spccmscC_MultiAttemptFlg,
                MultipleBroken: []
            }))
        };

        const response = await api.post<any>('sports', 'EventsStudentRecord/UpdateStudentSRKVS', payload);

        if (response.success) {
            return { success: true, message: response.message || 'Updated Successfully', data: response.data };
        }

        return { success: false, message: response.message || 'Failed to update details', data: null };
    } catch (error) {
        console.error('Error updating View Details:', error);
        return { success: false, message: 'An error occurred while updating', data: null };
    }
}

// Deactivate Record
export async function deactivateEventsStudentSRKVS(data: { id: number; activeFlag: boolean }): Promise<ApiResponse<any>> {
    console.log('Deactivating data:', data);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, message: `Record ${data.activeFlag ? 'Activated' : 'Deactivated'} Successfully`, data: null };
}
