'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getRoomCategoryList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    return await api.get<any>('hostel', `/RoomCategory/get_room_category_list?${urlParams}`);
}

export async function saveRoomCategory(data: any) {
    const url = '/RoomCategory/add_or_update_room_category';
    return await api.post<any>('hostel', url, data);
}

export async function deactivateRoomCategory(id: number) {
    const url = `/RoomCategory/deactivate_room_category/${id}`;
    return await api.put<any>('hostel', url, id);
}

export async function getRoomCategoryDropdownList() {
    return await api.get<any>('hostel', `/RoomCategory/get_room_category_dropdown_list`);
}
