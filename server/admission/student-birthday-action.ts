'use server';

import { api } from '@/lib/apiService';

// Helper to format date strings to YYYY-MM-DD
function formatDate(dateInput: any): string {
    if (!dateInput) return '';
    try {
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return String(dateInput);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch {
        return String(dateInput);
    }
}

export async function getStudentBirthdayReportDetails(data: any) {
    const fromDate = data.Fromdate || data.fromdate || '';
    const toDate = data.Todate || data.todate || '';
    const months =
        data.months !== undefined && data.months !== ''
            ? Number(data.months) || data.months
            : data.Months !== undefined && data.Months !== ''
              ? Number(data.Months) || data.Months
              : 1;
    const all1 = data.all1 !== undefined ? data.all1 : data.All1 !== undefined ? data.All1 : 0;
    const flag = data.flag || data.Flag || 'S';

    const params = new URLSearchParams();
    params.append('Fromdate', formatDate(fromDate));
    params.append('Todate', formatDate(toDate));
    params.append('months', String(months));
    params.append('all1', String(all1));
    params.append('flag', flag);

    const url = `/Studentbirthdayreport/getStudentdetails?${params.toString()}`;
    const res = await api.get<any>('admission', url, data);

    const rawRes = res as any;
    let studentList: any[] = [];
    let count = 0;

    if (rawRes) {
        if (rawRes.data) {
            studentList = rawRes.data.studentList || rawRes.data.studentDetails || (Array.isArray(rawRes.data) ? rawRes.data : []);
            count = rawRes.data.count !== undefined ? rawRes.data.count : studentList.length;
        } else {
            studentList = rawRes.studentList || rawRes.studentDetails || (Array.isArray(rawRes) ? rawRes : []);
            count = rawRes.count !== undefined ? rawRes.count : studentList.length;
        }
    }

    const mappedStudentList = studentList.map((student: any) => {
        const studentname = student.studentname || student.studentName || student.StudentName || '';
        const classname = student.classname || student.className || student.ClassName || student.class || student.Class || '';
        const sectionname = student.sectionname || student.sectionName || student.SectionName || student.section || student.Section || '';
        const admno = student.admno || student.admNo || student.AdmNo || '';
        const stdaddress = student.stdaddress || student.stdAddress || student.StdAddress || student.address || student.Address || '';
        const amst_photo = student.amst_photo || student.amst_Photo || student.AMST_Photo || '';
        const amst_dob = student.amst_dob || student.amst_DOB || student.AMST_DOB || student.dob || student.DOB || '';
        const amst_id = student.amst_id || student.AMST_Id || student.AMST_ID || 0;

        return {
            ...student,
            amst_id,
            AMST_Id: amst_id,
            studentname,
            classname,
            sectionname,
            admno,
            stdaddress,
            amst_photo,
            amst_dob
        };
    });

    return {
        success: rawRes?.success !== undefined ? rawRes.success : true,
        message: rawRes?.message || 'Report fetched successfully',
        count: count || mappedStudentList.length,
        studentDetails: mappedStudentList
    };
}
