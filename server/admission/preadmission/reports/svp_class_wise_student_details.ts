'use server';

import { api } from '@/lib/apiService';

export async function getSVPClassWiseInitialData() {
    const url = '/Classwisestudentdetails/getdetails';
    return await api.get<any>('admission', url);
}

export async function getSVPClassByYear(ASMAY_Id: number) {
    const url = `/Classwisestudentdetails/fetchclassbyYearId?ASMAY_Id=${ASMAY_Id}`;
    return await api.get<any>('admission', url);
}

export async function getSVPSectionByClass(data: {
    asmaY_Id: number;
    classlsttwo: any[];
}) {
    const url = '/Classwisestudentdetails/getsection';
    return await api.post<any>('admission', url, data);
}

export async function getSVPClassWiseReportDetails(data: {
    ASMAY_Id: number;
    classlsttwo: any[];
    sectionlistarray: any[];
    TempararyArrayheadList: any[];
    flag: string;
    AMC_Id: number;
    Concession_Id?: string;
}) {
    const url = '/Classwisestudentdetails/Getreport';
    return await api.post<any>('admission', url, data);
}
