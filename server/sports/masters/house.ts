'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterHouse } from '@/types/sports/masters/house';

export async function getMasterHouses(searchParams?: ApiSearchparams) {
    // Map frontend column names to backend PascalCase DMO field names for sorting and searching
    const params = {
        ...searchParams,
        sort_column:
            searchParams?.sort_column === 'spccmH_Id'
                ? 'SPCCMH_Id'
                : searchParams?.sort_column === 'spccmH_HouseName'
                  ? 'SPCCMH_HouseName'
                  : searchParams?.sort_column === 'spccmH_HouseDescription'
                    ? 'SPCCMH_HouseDescription'
                    : searchParams?.sort_column === 'spccmH_Flag'
                      ? 'SPCCMH_Flag'
                      : searchParams?.sort_column || '',
        search_columns: searchParams?.search_query ? 'SPCCMH_HouseName,SPCCMH_HouseDescription,SPCCMH_Flag' : ''
    };

    const urlParams = getSearchParamsUrl(params);
    const url = `/SportsMasterHouse/getdetails?${urlParams}`;
    return await api.post<IMasterHouse[]>('sports', url, {});
}

export async function getMasterHouseDetails(id: number) {
    const url = `/SportsMasterHouse/editdata?SPCCMH_Id=${id}`;
    return await api.post<any>('sports', url, {});
}

export async function saveMasterHouse(data: any) {
    const SPCCMH_Id = data.spccmH_Id || 0;
    const SPCCMH_HouseName = encodeURIComponent(data.spccmH_HouseName || '');
    const SPCCMH_HouseDescription = encodeURIComponent(data.spccmH_HouseDescription || '');
    const SPCCMH_Flag = encodeURIComponent(data.spccmH_Flag || '');

    const url = `/SportsMasterHouse/savedata?SPCCMH_Id=${SPCCMH_Id}&SPCCMH_HouseName=${SPCCMH_HouseName}&SPCCMH_HouseDescription=${SPCCMH_HouseDescription}&SPCCMH_Flag=${SPCCMH_Flag}`;
    return await api.post<any>('sports', url, {});
}

export async function deactivateMasterHouse(data: any) {
    const SPCCMH_Id = data.spccmH_Id;
    const SPCCMH_ActiveFlag = data.spccmH_ActiveFlag;

    const url = `/SportsMasterHouse/deactivate?SPCCMH_Id=${SPCCMH_Id}&SPCCMH_ActiveFlag=${SPCCMH_ActiveFlag}`;
    return await api.post<any>('sports', url, {});
}
