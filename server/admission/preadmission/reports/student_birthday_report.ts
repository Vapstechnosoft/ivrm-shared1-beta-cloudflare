'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getStudentBirthdayReportDetails(data: any, searchParams?: ApiSearchparams) {
    const { months, flag, all1, Fromdate, Todate } = data;
    let url = `/DOBcertificate/getdetails?Fromdate=${Fromdate}&Todate=${Todate}&months=${months || 0}&flag=${flag}&all1=${all1}`;
    if (searchParams) {
        const query = getSearchParamsUrl(searchParams);
        url += `&${query}`;
    }
    return await api.post<any>('admission', url, data);
}
