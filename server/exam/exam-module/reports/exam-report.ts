'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';

const CONTROLLER = 'ExamReport';

export async function getExamReportLoadData(Type: string, AMST_Id: number, EME_Id: number, ismS_Id: number) {
    try {
        const session = await auth();
        const mi_id = session?.user?.mi_id || 15536;
        const amst_id = session?.user?.amst_id || 15536;
        const asmay_id = 0;

        // Use StudentCompliantsView for loading years as requested
        const url = `StudentCompliantsView/get-load-data?AMST_Id=${amst_id}&ASMAY_Id=${asmay_id}`;

        console.log(`DEBUG: ExamReport Load Data URL: ${url}`);

        const response = await api.get<any>('portal', url);

        if (response.data) {
            console.log('DEBUG: Exam Load Data (Server):', JSON.stringify(response.data).substring(0, 500));
        }

        const data = response.data?.data || response.data; // Handle wrapped data if applicable

        // Robust mapping for Year List from StudentCompliantsView response structure
        let yearList = data?.stuyearlist || data?.academicYears || [];

        // Normalize Year Keys
        if (Array.isArray(yearList)) {
            const uniqueYears = new Map<string, any>();

            yearList.forEach((item: any, index: number) => {
                let yearName = '';
                let uniqueId = 0;
                let selected = false;

                if (typeof item === 'string') {
                    yearName = item;
                    // Try to generate a unique ID from the year string
                    const yearParts = item.split('-');
                    if (yearParts.length > 0 && !isNaN(Number.parseInt(yearParts[0]))) {
                        uniqueId = Number.parseInt(yearParts[0]);
                    } else {
                        uniqueId = -(index + 1);
                    }
                } else {
                    uniqueId = item.asmaY_Id || item.ASMAY_Id || item.yearId || 0;
                    yearName = item.asmaY_Year || item.ASMAY_Year || item.yearName || '';
                    selected = item.Selected || item.selected || false;
                }

                if (yearName && !uniqueYears.has(yearName)) {
                    // Ensure ID is not 0 if possible, fallback to negative index
                    if (uniqueId === 0) uniqueId = -(index + 1);

                    uniqueYears.set(yearName, {
                        asmaY_Id: uniqueId,
                        asmaY_Year: yearName,
                        Selected: selected
                    });
                }
            });

            // Convert map values to array
            yearList = Array.from(uniqueYears.values());

            // Final safety check for duplicate IDs
            const seenIds = new Set<number>();
            yearList = yearList.map((item: any, index: number) => {
                let id = item.asmaY_Id;

                // If ID is 0 or collides, generate a unique one
                if (id === 0 || seenIds.has(id)) {
                    // If 0, try to parse year again or fallback
                    if (id === 0) {
                        const yearParts = item.asmaY_Year.split('-');
                        if (yearParts.length > 0 && !isNaN(Number.parseInt(yearParts[0]))) {
                            id = Number.parseInt(yearParts[0]);
                        } else {
                            id = -(index + 1);
                        }
                    }

                    // If still collides, decrement until unique
                    while (seenIds.has(id)) {
                        id = id - 1;
                    }
                }

                seenIds.add(id);
                // Return new object copy to avoid reference mutation issues
                return {
                    ...item,
                    asmaY_Id: id
                };
            });

            console.log(
                'DEBUG: Final Unique Year List IDs:',
                yearList.map((y: any) => y.asmaY_Id)
            );
        } else {
            yearList = [];
        }

        // Exam list is usually not in this response, so client will fetch it on year selection
        const examList: any[] = [];

        return {
            studetiallist: yearList,
            examlist: examList,
            rcode: data?.rcode || ''
        };
    } catch (error) {
        console.error('API Call Failed:', error);
        return { studetiallist: [], examlist: [], rcode: '' };
    }
}

export async function getExamData(payload: { Type: string; ASMAY_Id: number; AMST_Id?: number }) {
    try {
        // Ensure AMST_Id is present
        if (!payload.AMST_Id) {
            const session = await auth();
            if (session?.user?.amst_id) {
                payload.AMST_Id = session.user.amst_id;
            }
        }
        console.log('DEBUG: Exam Data Payload (getExamData):', payload);

        const response = await api.get<any>('portal', `/${CONTROLLER}/get-exam-data`, {
            params: payload
        });

        // Debug response structure
        const resData = response.data;
        // console.log(`DEBUG: Exam Data Response (getExamData):`, JSON.stringify(resData).substring(0, 500));

        // Try to find examData or examlist in various locations
        // It could be response.data.examData directly or response.data.data.examData
        let examList = resData?.examData || resData?.data?.examData || resData?.examlist || resData?.data?.examlist || [];

        // Force check if it's wrapped in another 'data' key due to Axios + API wrapper
        if (!examList.length && resData?.data?.data?.examData) {
            examList = resData.data.data.examData;
        }

        if (Array.isArray(examList)) {
            const uniqueExams = new Map<number, any>();
            examList.forEach((item: any) => {
                // Try all possible keys and casing
                const id = item.emE_Id || item.EME_Id || item.examId || item.eme_id || 0;

                if (id !== 0 && !uniqueExams.has(id)) {
                    uniqueExams.set(id, {
                        // FORCE Keys to match what Client expects (emE_Id, emE_ExamName)
                        emE_Id: id,
                        emE_ExamName: item.emE_ExamName || item.EME_ExamName || item.examName || item.eme_examname || '',
                        Selected: item.Selected || item.selected || false
                    });
                }
            });
            examList = Array.from(uniqueExams.values());
            console.log('DEBUG: Processed Exam List:', JSON.stringify(examList));
        } else {
            console.warn('DEBUG: Exam List is empty or not an array. Found:', typeof examList);
        }

        // Return a clean object with just the list we found
        return { examlist: examList };
    } catch (error) {
        console.error('API Call Failed:', error);
        return { examlist: [], subjectlist: [] };
    }
}

export async function getSubjects(payload: { Type: string; ASMAY_Id: number; EME_Id: number }) {
    try {
        const response = await api.get<any>('portal', `/${CONTROLLER}/get-Subjects`, {
            params: payload
        });

        // Debug response structure
        const resData = response.data;
        // console.log(`DEBUG: Subject Data Response (getSubjects):`, JSON.stringify(resData).substring(0, 500));

        // Try to find subjectData or subjectlist in various locations
        let subjectList = resData?.data?.subjectData || resData?.subjectData || resData?.data?.subjectlist || resData?.subjectlist || [];

        // If 'data' itself is the array (based on user JSON: "data": [ ... ])
        if (!subjectList.length && Array.isArray(resData?.data)) {
            subjectList = resData.data;
        }

        if (Array.isArray(subjectList)) {
            const uniqueSubjects = new Map<number, any>();
            subjectList.forEach((item: any) => {
                // Try all possible keys and casing
                const id = item.ismS_Id || item.ISMS_Id || item.subjectId || item.isms_id || 0;

                if (id !== 0 && !uniqueSubjects.has(id)) {
                    uniqueSubjects.set(id, {
                        // FORCE Keys to match what Client expects (ismS_Id, ismS_SubjectName)
                        ismS_Id: id,
                        ismS_SubjectName: item.ismS_SubjectName || item.ISMS_SubjectName || item.subjectName || item.isms_subjectname || '',
                        Selected: item.Selected || item.selected || false
                    });
                }
            });
            subjectList = Array.from(uniqueSubjects.values());
            console.log('DEBUG: Processed Subject List:', JSON.stringify(subjectList));
        } else {
            console.warn('DEBUG: Subject List is empty or not an array. Found:', typeof subjectList);
        }

        // Return a clean object with just the list we found
        return { subjectlist: subjectList };
    } catch (error) {
        console.error('API Call Failed:', error);
        return { subjectlist: [] };
    }
}

export async function getStudentExamDetails(payload: any) {
    try {
        const response = await api.get<any>('portal', `/${CONTROLLER}/get-Student-ExamDetails`, {
            params: payload
        });
        return response.data;
    } catch (error) {
        console.error('API Call Failed:', error);
        return {
            examReportList: [],
            getexamconfig: [],
            get_eme_id_details: []
        };
    }
}
