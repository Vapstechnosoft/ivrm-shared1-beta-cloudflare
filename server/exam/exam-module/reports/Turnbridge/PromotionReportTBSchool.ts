'use server';

import { type ApiResponse, api } from '@/lib/apiService';

function cleanJson<T>(obj: T): T {
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch {
        return obj;
    }
}

function hasDataItems(res: any): boolean {
    if (!res) return false;
    const checkArray = (arr: any) => {
        if (!arr) return false;
        if (Array.isArray(arr) && arr.length > 0) return true;
        if (arr.$values && Array.isArray(arr.$values) && arr.$values.length > 0) return true;
        return false;
    };
    if (checkArray(res)) return true;
    if (res.data && (checkArray(res.data) || checkArray(res.data.data))) return true;
    if (checkArray(res.academicyearlist)) return true;
    if (checkArray(res.yearlist)) return true;
    if (checkArray(res.classlist)) return true;
    if (checkArray(res.sectionlist)) return true;
    if (checkArray(res.examlist)) return true;
    if (checkArray(res.studentlist)) return true;
    if (checkArray(res.getstudentdetails)) return true;
    if (checkArray(res.studentdetails)) return true;
    if (checkArray(res.gradelist)) return true;
    if (typeof res === 'object' && Object.keys(res).length > 0) return true;
    return false;
}

export async function getPromotionReportTBSchool(data: any): Promise<ApiResponse<any>> {
    let payload: any = null;
    try {
        const url = '/JSHSExamReports/promotion_report_TBSchool';

        // Formatting student list
        let temp_Amstids: { amsT_Id: number }[] = [];
        if (Array.isArray(data.temp_Amstids)) {
            temp_Amstids = data.temp_Amstids;
        } else if (Array.isArray(data.Temp_AmstIds)) {
            temp_Amstids = data.Temp_AmstIds.map((item: any) => ({
                amsT_Id: Number(item.amsT_Id ?? item.AMST_Id ?? item)
            }));
        } else if (Array.isArray(data.studentList)) {
            temp_Amstids = data.studentList.map((item: any) => ({
                amsT_Id: Number(item.amsT_Id ?? item.AMST_Id ?? item)
            }));
        }

        // Formatting exam list
        let examlist: { emE_Id: number }[] = [];
        if (Array.isArray(data.examlist)) {
            examlist = data.examlist;
        } else if (Array.isArray(data.examList)) {
            examlist = data.examList.map((item: any) => ({
                emE_Id: Number(item.emE_Id ?? item.EME_Id ?? item)
            }));
        }

        payload = {
            asmaY_Id: Number(data.asmaY_Id ?? data.ASMAY_Id ?? 0),
            asmcL_Id: Number(data.asmcL_Id ?? data.ASMCL_Id ?? 0),
            asmS_Id: Number(data.asmS_Id ?? data.ASMS_Id ?? 0),
            empsG_PercentValue: Number(data.empsG_PercentValue ?? 0),
            flag: String(data.flag ?? ''),
            emE_Id: Number(data.emE_Id ?? 0),
            reporttype: String(data.reporttype ?? 'REPORT'),
            temp_Amstids,
            empG_GroupName: String(data.empG_GroupName ?? ''),
            emgR_Id: Number(data.emgR_Id ?? 0),
            examlist,
            ecteX_NotApplToTotalFlg: Boolean(data.ecteX_NotApplToTotalFlg ?? true)
        };

        console.log('==============================================');
        console.log('Sending payload to /JSHSExamReports/promotion_report_TBSchool:', payload);

        const response = await api.post<any>('exam', url, payload);

        console.log('RECEIVED BACKEND API RESPONSE:', response);
        console.log('==============================================');

        if (hasDataItems(response)) return cleanJson(response);
        return cleanJson(
            response || {
                success: false,
                message: 'No records found',
                data: null
            }
        );
    } catch (error) {
        console.error('getPromotionReportTBSchool error:', error);
        return cleanJson({
            success: false,
            message: 'Error fetching report from API',
            data: null
        });
    }
}

function getMockReportData(payload: any, originalData?: any) {
    const className =
        payload?.asmcL_ClassName || originalData?.asmcL_ClassName || originalData?.className || `Class ${payload?.asmcL_Id || 5}`;
    const sectionName = payload?.asmC_SectionName || originalData?.asmC_SectionName || originalData?.sectionName || 'A';
    const academicYear = originalData?.asmaY_Year || '2025-2026';

    const rawStudents = originalData?.studentList || originalData?.temp_Amstids || payload?.temp_Amstids || [];

    let studentDetails: any[] = [];

    if (Array.isArray(rawStudents) && rawStudents.length > 0) {
        studentDetails = rawStudents.map((s: any, idx: number) => {
            const id = Number(s.amsT_Id ?? s.AMST_Id ?? s);
            const name = s.studentName || s.studentname || s.student_Name || `Student ${idx + 1}`;
            const admNo = s.amsT_AdmNo || s.admno || s.admNo || `ADM${101 + idx}`;
            return {
                AMST_Id: id,
                studentname: name,
                classname: className,
                sectionname: sectionName,
                admno: admNo,
                asmaY_Year: academicYear
            };
        });
    }

    if (studentDetails.length === 0) {
        studentDetails = [
            {
                AMST_Id: 1,
                studentname: 'Rohan Sharma',
                classname: className,
                sectionname: sectionName,
                admno: 'ADM101',
                asmaY_Year: academicYear
            },
            {
                AMST_Id: 2,
                studentname: 'Ananya Verma',
                classname: className,
                sectionname: sectionName,
                admno: 'ADM102',
                asmaY_Year: academicYear
            },
            {
                AMST_Id: 3,
                studentname: 'Arjun Patel',
                classname: className,
                sectionname: sectionName,
                admno: 'ADM103',
                asmaY_Year: academicYear
            },
            {
                AMST_Id: 4,
                studentname: 'Sneha Reddy',
                classname: className,
                sectionname: sectionName,
                admno: 'ADM104',
                asmaY_Year: academicYear
            }
        ];
    }

    const studentWiseSubjects: any[] = [];
    const studentWiseMarks: any[] = [];
    const studentWiseAttendance: any[] = [];

    const baseSubjects = [
        { id: 101, name: 'English', subExam: 'Reading & Writing' },
        { id: 102, name: 'Mathematics', subExam: 'Concepts & Problem Solving' },
        { id: 103, name: 'Science', subExam: 'Scientific Inquiry' },
        { id: 104, name: 'Social Studies', subExam: 'Social Awareness' }
    ];

    studentDetails.forEach((stu, sIdx) => {
        baseSubjects.forEach((sub) => {
            studentWiseSubjects.push({
                AMST_Id: stu.AMST_Id,
                ISMS_Id: sub.id,
                ISMS_SubjectName: sub.name,
                EME_Id: 1,
                EME_ExamName: 'Unit Test 1',
                EMSE_SubExamName: sub.subExam
            });

            const markVal = 80 + ((sIdx + sub.id) % 15);
            studentWiseMarks.push({
                AMST_Id: stu.AMST_Id,
                ISMS_Id: sub.id,
                EME_Id: 1,
                ObtainedMarks: markVal,
                grade: markVal >= 90 ? 'A+' : markVal >= 80 ? 'A' : 'B',
                EYCES_MarksDisplayFlg: true,
                PassFailFlag: 'P'
            });
        });

        studentWiseAttendance.push({
            AMST_Id: stu.AMST_Id,
            EME_Id: 1,
            TOTALAttendancePercentage: 90 + (sIdx % 8),
            TOTALPRESENTDAYS: 45 + (sIdx % 5),
            TOTALWORKINGDAYS: 50
        });
    });

    return {
        getstudentdetails: studentDetails,
        getstudentwisesubjectlist: studentWiseSubjects,
        getstudentmarksdetails: studentWiseMarks,
        getgroupexamdetails: [
            { emE_Id: 1, emE_ExamName: 'Unit Test 1', empG_DistplayName: 'UT1', empsgE_ForMaxMarkrs: '100', emE_ExamCode: 'UT1' },
            { emE_Id: 2, emE_ExamName: 'Half Yearly', empG_DistplayName: 'HY', empsgE_ForMaxMarkrs: '100', emE_ExamCode: 'HY' }
        ],
        getstudentwiseattendancedetails: studentWiseAttendance,
        clstchname: ['Mrs. Radhika S']
    };
}
