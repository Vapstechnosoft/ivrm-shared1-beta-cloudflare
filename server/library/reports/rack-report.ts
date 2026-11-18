'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { IRackReportGridData, IRackReportInitialData, IRackReportRequest } from '@/types/library/reports/rack-report';

const FACADE = 'RackReport';

const extractList = (list: any): any[] => {
    if (!list) return [];
    if (Array.isArray(list)) return list;

    if (list && typeof list === 'object' && '$values' in list && Array.isArray(list.$values)) {
        return list.$values;
    }

    const actual =
        list.data ||
        list.reportlist ||
        list.reportList ||
        list.griddata ||
        list.gridList ||
        list.alldata ||
        list.rackreport ||
        list.rackreportlist ||
        list.racklist ||
        list.msterRacklist ||
        list.lib_list ||
        list.libraryList ||
        list.libList ||
        list.msterliblist1 ||
        list.library_list ||
        list.get_report ||
        list.$values;

    if (Array.isArray(actual)) return actual;
    if (actual && typeof actual === 'object' && '$values' in actual && Array.isArray(actual.$values)) {
        return actual.$values;
    }

    return [];
};

const normalizeLibraryList = (list: any[]) => {
    return list.map((lib: any) => {
        if (!lib || typeof lib !== 'object') return lib;
        const lmaL_Id = lib.lmaL_Id ?? lib.lmal_Id ?? lib.LMAL_Id ?? lib.lmal_id ?? lib.lmalId ?? lib.id;
        const lmaL_LibraryName =
            lib.lmaL_LibraryName ??
            lib.lmal_LibraryName ??
            lib.LMAL_LibraryName ??
            lib.lmal_libraryname ??
            lib.libraryname ??
            lib.libraryName ??
            lib.name;
        return {
            ...lib,
            lmaL_Id: Number(lmaL_Id),
            lmaL_LibraryName: String(lmaL_LibraryName || '')
        };
    });
};

const normalizeRackList = (list: any[]) => {
    return list.map((rack: any) => {
        if (!rack || typeof rack !== 'object') return rack;
        const lmrA_Id = rack.lmrA_Id ?? rack.lmra_Id ?? rack.LMRA_Id ?? rack.lmra_id ?? rack.lmraId ?? rack.id;
        const lmrA_RackName =
            rack.lmrA_RackName ??
            rack.lmra_RackName ??
            rack.LMRA_RackName ??
            rack.lmra_rackname ??
            rack.rackname ??
            rack.rackName ??
            rack.name;
        const lmrA_FloorName = rack.lmrA_FloorName ?? rack.lmra_FloorName ?? rack.LMRA_FloorName ?? rack.floorName ?? rack.floor_Name ?? '';
        return {
            ...rack,
            lmrA_Id: lmrA_Id !== undefined && lmrA_Id !== null ? (Number.isNaN(Number(lmrA_Id)) ? String(lmrA_Id) : Number(lmrA_Id)) : '',
            lmrA_RackName: String(lmrA_RackName || ''),
            lmrA_FloorName: String(lmrA_FloorName || '')
        };
    });
};

const normalizeGridItem = (item: any): IRackReportGridData => {
    if (!item || typeof item !== 'object') return item;
    return {
        lmbanO_AccessionNo:
            item.lmbanO_AccessionNo ??
            item.LMBANO_AccessionNo ??
            item.lmbano_AccessionNo ??
            item.accessionNo ??
            item.AccessionNo ??
            item.accessionno ??
            '',
        lmB_BookTitle:
            item.lmB_BookTitle ??
            item.LMB_BookTitle ??
            item.lmb_BookTitle ??
            item.bookTitle ??
            item.BookTitle ??
            item.title ??
            item.book_Title ??
            '',
        rack_Name:
            item.rack_Name ??
            item.Rack_Name ??
            item.rackName ??
            item.RackName ??
            item.lmrA_RackName ??
            item.LMRA_RackName ??
            item.lmra_RackName ??
            item.lmra_rackname ??
            item.rack_name ??
            '',
        lmra_FloorName:
            item.lmra_FloorName ?? item.lmrA_FloorName ?? item.LMRA_FloorName ?? item.floorName ?? item.FloorName ?? item.floor_Name ?? '',
        lmb_BookType: item.lmb_BookType ?? item.lmB_BookType ?? item.LMB_BookType ?? item.bookType ?? item.BookType ?? item.book_Type ?? '',
        rack_Location:
            item.rack_Location ??
            item.Rack_Location ??
            item.lmrA_Location ??
            item.LMRA_Location ??
            item.lmra_Location ??
            item.location ??
            item.Location ??
            item.rack_location ??
            '',
        lmbano_AvialableStatus:
            item.lmbano_AvialableStatus ??
            item.lmbanO_AvialableStatus ??
            item.LMBANO_AvialableStatus ??
            item.lmbano_AvailableStatus ??
            item.bookStatus ??
            item.BookStatus ??
            item.status ??
            item.Status ??
            item.availableStatus ??
            item.avialableStatus ??
            '',
        authorName: item.authorName ?? item.AuthorName ?? item.lma_AuthorName ?? item.LMA_AuthorName ?? item.name ?? item.Name ?? '',
        lmD_DepartmentName: item.lmD_DepartmentName ?? item.LMD_DepartmentName ?? item.departmentName ?? item.department_Name ?? '',
        lmP_PublisherName: item.lmP_PublisherName ?? item.LMP_PublisherName ?? item.publisherName ?? item.publisher_Name ?? '',
        lmS_SubjectName: item.lmS_SubjectName ?? item.LMS_SubjectName ?? item.subjectName ?? item.subject_Name ?? '',
        ...item
    };
};

export async function getRackReportLibraries() {
    try {
        const url = 'AvailableBooksReport/getdetails';
        const response = await api.get<any>('library', url);

        let data: any = {};
        if (response) {
            data = response.data && typeof response.data === 'object' ? response.data : response;
        }

        const libList = data.libraryList || data.lib_list || data.libList || data.msterliblist1 || data.library_list || data || [];
        const list = extractList(libList);
        return normalizeLibraryList(list);
    } catch (error) {
        console.error('Error fetching rack report libraries:', error);
        return [];
    }
}

export async function getRackReportInitialData(): Promise<IRackReportInitialData> {
    try {
        const session = await auth();
        const miId = session?.mi_id;

        let data: any = {};
        try {
            const url = `/${FACADE}/library_RackReport_getdetails`;
            const response = await api.get<any>('library', url, { params: { MI_Id: miId } });
            data = response?.data && typeof response.data === 'object' ? response.data : response || {};
        } catch {
            try {
                const url = `/${FACADE}/getdetails`;
                const response = await api.get<any>('library', url, { params: { MI_Id: miId } });
                data = response?.data && typeof response.data === 'object' ? response.data : response || {};
            } catch {
                console.warn('RackReport getdetails fallback');
            }
        }

        let libList = extractList(data.lib_list || data.libraryList || data.libList || data.msterliblist1 || data.library_list || []);
        let racklist = extractList(data.racklist || data.msterRacklist || data.rackList || data.masterRackList || []);

        if (libList.length === 0) {
            try {
                const libRes = await api.get<any>('library', 'AvailableBooksReport/getdetails');
                const libData = libRes?.data && typeof libRes.data === 'object' ? libRes.data : libRes || {};
                libList = extractList(libData.libraryList || libData.lib_list || libData.libList || libData.msterliblist1 || []);
            } catch (e) {
                console.warn('Failed to fetch fallback libraries:', e);
            }
        }

        if (racklist.length === 0) {
            try {
                const rackRes = await api.get<any>('library', `/RackDetails/get-master-rack-list?page=1&page_size=200&mI_Id=${miId || 0}`);
                const rData = rackRes?.data && typeof rackRes.data === 'object' ? rackRes.data : rackRes || {};
                racklist = extractList(rData.list || rData.racklist || rData.data || (Array.isArray(rData) ? rData : []));
            } catch (e) {
                console.warn('Failed to fetch fallback racks:', e);
            }
        }

        return {
            lib_list: normalizeLibraryList(libList),
            racklist: normalizeRackList(racklist),
            booklist: extractList(data.booklist || data.msterbooklist || data.book_list || []),
            subjectlist: extractList(data.subjectlist || data.mstersubjectlist || data.subject_list || []),
            floorlist: extractList(data.floorlist || [])
        };
    } catch (error: any) {
        console.error('Error in getRackReportInitialData:', error);
        return {
            lib_list: [],
            racklist: [],
            booklist: [],
            subjectlist: [],
            floorlist: []
        };
    }
}

export async function getRackReportData(data: IRackReportRequest) {
    try {
        const rackVal =
            data.LMRA_Id !== undefined && data.LMRA_Id !== null && String(data.LMRA_Id).trim() !== '' ? String(data.LMRA_Id).trim() : 'ALL';
        const lmalId = Number(data.LMAL_Id || 0);

        // API URL format: RackReport/rack-get_report/ALL/3 or RackReport/rack-get_report/{LMRA_Id}/{LMAL_Id}
        const url = `${FACADE}/rack-get_report/${rackVal}/${lmalId}`;

        let response: any;
        try {
            response = await api.get<any>('library', url);
        } catch (getErr: any) {
            try {
                response = await api.post<any>('library', url, {});
            } catch {
                throw getErr;
            }
        }

        const responseData = response?.data ?? response;

        const rawList = extractList(
            responseData?.reportlist ||
                responseData?.reportList ||
                responseData?.griddata ||
                responseData?.gridList ||
                responseData?.alldata ||
                responseData?.rackreport ||
                responseData?.rackreportlist ||
                responseData?.data ||
                responseData
        );

        const normalizedList = rawList.map(normalizeGridItem);

        return {
            success: true,
            data: normalizedList,
            reportlist: normalizedList
        };
    } catch (error: any) {
        console.error('Error in getRackReportData:', error);
        return {
            success: false,
            message: error?.message || 'Failed to fetch rack report data',
            data: [],
            reportlist: []
        };
    }
}

