'use server';

import { type ApiResponse, api } from '@/lib/apiService';
import type {
    IEventsStudentMappingData,
    IEventsStudentMappingDropdowns,
    IStudentFilterParams,
    IStudentValues
} from '@/types/sports/events-student-mapping';

/**
 * Fetch All Dropdowns
 */
export async function getEventsStudentMappingDropdowns(): Promise<IEventsStudentMappingDropdowns> {
    let academicYearList: any[] = [];
    let categoryList: any[] = [];
    let houseList: any[] = [];

    try {
        const yearResponsePromise = api.post<{ yearlist: any[] }>('sports', 'SportVenuewiseParticipationReport/Getdetails', {});
        const categoryResponsePromise = api.get<{ spccmcC_Id: number; spccmcC_CompitionCategory: string }[]>(
            'sports',
            'EventsStudentRecord/CompetitionCategoryList'
        );
        const houseResponsePromise = api.get<{ spccmH_Id: number; spccmH_HouseName: string }[]>('sports', 'EventsStudentRecord/HouseList');

        const [yearResponse, categoryResponse, houseResponse] = await Promise.all([
            yearResponsePromise,
            categoryResponsePromise,
            houseResponsePromise
        ]);

        if (yearResponse.success && yearResponse.data && yearResponse.data.yearlist) {
            academicYearList = yearResponse.data.yearlist.map((year: any) => ({
                asmaY_Id: year.asmaY_Id,
                asmaY_Year: year.asmaY_Year
            }));
        }

        if (categoryResponse.success && categoryResponse.data) {
            categoryList = categoryResponse.data.map((item) => ({
                spccmcC_Id: item.spccmcC_Id,
                spccmcC_CompitionCategory: item.spccmcC_CompitionCategory
            }));
        }

        if (houseResponse.success && houseResponse.data) {
            houseList = houseResponse.data.map((item) => ({
                spccmH_Id: item.spccmH_Id,
                spccmH_HouseName: item.spccmH_HouseName
            }));
        }
    } catch (error) {
        console.error('Failed to fetch dropdowns:', error);
    }

    // Mock Data for other dropdowns
    return {
        academicYear: academicYearList,
        eventsList: [
            { spccmE_Id: 1, spccmE_EventName: '100m Sprint' },
            { spccmE_Id: 2, spccmE_EventName: 'High Jump' },
            { spccmE_Id: 3, spccmE_EventName: 'Long Jump' },
            { spccmE_Id: 4, spccmE_EventName: 'Shot Put' }
        ],
        categoryList: categoryList,
        houseList: houseList,
        classList: [
            { asmcL_Id: 1, asmcL_ClassName: 'I' },
            { asmcL_Id: 2, asmcL_ClassName: 'II' },
            { asmcL_Id: 10, asmcL_ClassName: 'X' },
            { asmcL_Id: 12, asmcL_ClassName: 'XII' }
        ],
        sectionList: [
            { asmS_Id: 1, asmC_SectionName: 'A' },
            { asmS_Id: 2, asmC_SectionName: 'B' },
            { asmS_Id: 3, asmC_SectionName: 'C' }
        ],
        competitionLevelList: [
            { spccmcL_Id: 1, spccmcL_CompitionLevel: 'Inter-House' },
            { spccmcL_Id: 2, spccmcL_CompitionLevel: 'Inter-School' },
            { spccmcL_Id: 3, spccmcL_CompitionLevel: 'State Level' }
        ],
        groupList: [
            { spccmsccG_Id: 1, spccmsccG_SportsCCGroupName: 'Athletics', spccmsccG_SCCFlag: 'Sports' },
            { spccmsccG_Id: 2, spccmsccG_SportsCCGroupName: 'Team Sports', spccmsccG_SCCFlag: 'Sports' },
            { spccmsccG_Id: 3, spccmsccG_SportsCCGroupName: 'Literary', spccmsccG_SCCFlag: 'Co-Curricular' }
        ],
        sportsList: [
            { spccmscC_Id: 1, spccmscC_SportsCCName: 'Running' },
            { spccmscC_Id: 2, spccmscC_SportsCCName: 'Jumping' },
            { spccmscC_Id: 3, spccmscC_SportsCCName: 'Quiz' }
        ],
        uomList: [
            { spccmuoM_Id: 1, spccmuoM_UOMName: 'Seconds' },
            { spccmuoM_Id: 2, spccmuoM_UOMName: 'Meters' },
            { spccmuoM_Id: 3, spccmuoM_UOMName: 'Points' }
        ]
    };
}

/**
 * Helper for random data
 */
const INDIAN_NAMES = [
    'Aarav Sharma',
    'Vihaan Patel',
    'Aditya Kumar',
    'Sai Srinivas',
    'Arjun Singh',
    'Reyansh Gupta',
    'Ishaan Reddy',
    'Shaurya Verma',
    'Ayaan Khan',
    'Krishna Das',
    'Ananya Iyer',
    'Diya Menon',
    'Saanvi Rao',
    'Aadhya Nair',
    'Pari Joshi',
    'Kiara Malhotra',
    'Myra Kapoor',
    'Fatima Shaikh',
    'Zara Siddiqui',
    'Riya Deshmukh'
];

const EVENTS_LIST = ['100m Sprint', 'High Jump', 'Long Jump', 'Shot Put'];
const HOUSES = ['Red House', 'Blue House', 'Green House', 'Yellow House'];
const CLASSES = ['I', 'II', 'X', 'XII'];
const SECTIONS = ['A', 'B', 'C'];

/**
 * Fetch Students based on filters
 */
export async function getStudentList(filterParams: IStudentFilterParams): Promise<ApiResponse<IStudentValues[]>> {
    console.log('Fetching students with filter:', filterParams);
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay

    // Generate some mock students using Indian names
    let dummyStudents: IStudentValues[] = INDIAN_NAMES.map((name, i) => ({
        amsT_Id: 100 + i,
        studentName: name,
        amsT_AdmNo: `ADM00${100 + i}`,
        asmcL_ClassName: CLASSES[i % CLASSES.length],
        asmC_SectionName: SECTIONS[i % SECTIONS.length],
        spccmH_HouseName: HOUSES[i % HOUSES.length],
        ivrmgC_SportsPointsDropdownFlg: i % 2 // Alternating input type
    }));

    if (filterParams.ASMCL_Id && filterParams.ASMCL_Id.length > 0) {
        const classNames: string[] = [];
        if (filterParams.ASMCL_Id.includes(1)) classNames.push('I');
        if (filterParams.ASMCL_Id.includes(2)) classNames.push('II');
        if (filterParams.ASMCL_Id.includes(10)) classNames.push('X');
        if (filterParams.ASMCL_Id.includes(12)) classNames.push('XII');

        if (classNames.length > 0) {
            dummyStudents = dummyStudents.filter((s) => classNames.includes(s.asmcL_ClassName));
        }
    }

    if (filterParams.ASMS_Id && filterParams.ASMS_Id.length > 0) {
        const sectionNames: string[] = [];
        if (filterParams.ASMS_Id.includes(1)) sectionNames.push('A');
        if (filterParams.ASMS_Id.includes(2)) sectionNames.push('B');
        if (filterParams.ASMS_Id.includes(3)) sectionNames.push('C');

        if (sectionNames.length > 0) {
            dummyStudents = dummyStudents.filter((s) => sectionNames.includes(s.asmC_SectionName));
        }
    }

    if (filterParams.SPCCMH_Id && filterParams.SPCCMH_Id.length > 0) {
        const houseNames: string[] = [];
        if (filterParams.SPCCMH_Id.includes(1)) houseNames.push('Red House');
        if (filterParams.SPCCMH_Id.includes(2)) houseNames.push('Blue House');
        if (filterParams.SPCCMH_Id.includes(3)) houseNames.push('Green House');
        if (filterParams.SPCCMH_Id.includes(4)) houseNames.push('Yellow House');

        if (houseNames.length > 0) {
            dummyStudents = dummyStudents.filter((s) => houseNames.includes(s.spccmH_HouseName));
        }
    }

    return {
        success: true,
        message: 'Students fetched successfully',
        data: dummyStudents
    };
}

/**
 * Fetch Main Grid Data
 */
export async function getEventsStudentMappingList(): Promise<ApiResponse<IEventsStudentMappingData[]>> {
    const dummyData: IEventsStudentMappingData[] = INDIAN_NAMES.map((name, i) => ({
        spccestR_Id: 500 + i,
        spccesT_Id: 200 + i,
        asmaY_Year: '2023-2024',
        studentName: name,
        amsT_AdmNo: `ADM-${500 + i}`,
        asmcL_ClassName: CLASSES[i % CLASSES.length],
        asmC_SectionName: SECTIONS[i % SECTIONS.length],
        spccmH_HouseName: HOUSES[i % HOUSES.length],
        categoryName: i % 2 === 0 ? 'Senior Boys' : 'Senior Girls',
        compitionLevel: i % 3 === 0 ? 'Inter-House' : 'Inter-School',
        eventName: EVENTS_LIST[i % EVENTS_LIST.length],
        spccmsccG_SportsCCGroupName: i % 4 === 0 ? 'Team Sports' : 'Athletics',
        sportsName: i % 4 === 0 ? 'Cricket' : 'Running',
        spccmeV_EventVenue: 'Main Stadium',
        uomName: i % 2 === 0 ? 'Seconds' : 'Points',
        spccestR_Rank: `${(i % 3) + 1}`,
        spccestR_Points: ((i % 3) + 1) * 10,
        spccestR_Remarks: i % 2 === 0 ? 'Good performance' : 'Excellent effort',
        spccestR_ActiveFlag: i % 10 !== 0 // Mostly active
    }));

    return {
        success: true,
        message: 'Data fetched successfully',
        data: dummyData
    };
}

/**
 * Fetch Classes based on Academic Year
 */
export async function getClassList(asmaY_Id: number): Promise<ApiResponse<any[]>> {
    try {
        const response = await api.get<any[]>('sports', `EventsStudentRecord/ClassList?ASMAY_Id=${asmaY_Id}`);
        return response;
    } catch (error) {
        console.error('Failed to fetch class list:', error);
        return { success: false, message: 'Failed to fetch class list', data: [] };
    }
}

/**
 * Save Record
 */
export async function saveEventsStudentMapping(data: any): Promise<ApiResponse<any>> {
    console.log('Saving Events Student Mapping:', data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true, message: 'Records Saved Successfully', data: null };
}

/**
 * Deactivate Record
 */
export async function deactivateEventsStudentMapping(id: number, activeFlag: boolean): Promise<ApiResponse<any>> {
    console.log('Deactivating:', id, activeFlag);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
        success: true,
        message: activeFlag ? 'Activated successfully' : 'Deactivated successfully',
        data: null
    };
}
