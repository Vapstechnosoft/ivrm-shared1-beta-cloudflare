'use server';

import { api } from '@/lib/apiService';

export async function getSchoolTpinGenerationInitialDetails() {
    const url = '/SchoolTpinGenreation/loaddata';
    return await api.get<any>('admission', url);
}

export async function searchSchoolTpinGeneration(data: {
    ASMAY_Id: number;
}) {
    const url = `/SchoolTpinGenreation/search?ASMAY_Id=${data.ASMAY_Id}`;
    return await api.post<any>('admission', url);
}

export async function generateSchoolTpin(data: {
    ASMAY_Id: number;
}) {
    const url = `/SchoolTpinGenreation/generatetpin`;
    return await api.post<any>('admission', url, data);
}
