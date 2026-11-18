'use server';

import fs from 'fs';
import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';

const MODULE_URL = 'ImportLibrarydata';

export async function getImportLibraryDataInitial() {
    try {
        const session = await auth();
        const miId = session?.mi_id;

        // 1. Primary: ImportLibrarydata/import-Librarygetdetails via GET
        try {
            const url = `${MODULE_URL}/import-Librarygetdetails${miId ? `?MI_Id=${miId}` : ''}`;
            const response = await api.get<any>('library', url);
            const data = response?.data ?? response;
            if (data && (data.masterlibarary || data.msterliblist1 || data.lib_list || data.list)) {
                return data;
            }
            if (data) return data;
        } catch (getErr: any) {
            console.warn('[ImportLibrarydata/import-Librarygetdetails] GET error, trying POST fallback:', getErr?.message || getErr);
        }

        // 2. Primary: ImportLibrarydata/import-Librarygetdetails via POST
        try {
            const postResponse = await api.post<any>('library', `${MODULE_URL}/import-Librarygetdetails`, {
                MI_Id: miId || 0
            });
            const postData = postResponse?.data ?? postResponse;
            if (postData) return postData;
        } catch (postErr: any) {
            console.warn('[ImportLibrarydata/import-Librarygetdetails] POST error:', postErr?.message || postErr);
        }

        // 3. Fallback: ImportLibrarydata/import-Librarygetdetails/{id}
        if (miId) {
            try {
                const idResponse = await api.get<any>('library', `${MODULE_URL}/import-Librarygetdetails/${miId}`);
                const idData = idResponse?.data ?? idResponse;
                if (idData) return idData;
            } catch (_) {}
        }

        // 4. Fallback: MasterLibrary list if specific import endpoint is unavailable
        if (miId) {
            try {
                const masterLibRes = await api.get<any>(
                    'library',
                    `MasterLibrary/get-master-library-list?page=1&page_size=100&sort_column=lmaL_LibraryName&sort_direction=asc&mI_Id=${miId}`
                );
                const mData = masterLibRes?.data ?? masterLibRes;
                const libItems = mData?.list || mData?.liballdata || (Array.isArray(mData) ? mData : []);
                if (libItems.length > 0) {
                    return {
                        masterlibarary: libItems
                    };
                }
            } catch (_) {}
        }

        // 5. Fallback: legacy route
        const fallbackResponse = await api.get<any>('library', `${MODULE_URL}/getdetails/2`);
        return fallbackResponse?.data ?? fallbackResponse;
    } catch (error: any) {
        console.error('Failed to fetch import library initial data:', error);
        throw error;
    }
}

export async function checkLibraryDataValidation(data: any) {
    const response = await api.post<any>('library', `${MODULE_URL}/checkvalidation`, data);
    return response.data;
}

export async function saveImportLibraryData(data: any) {
    try {
        const session = await auth();
        const miId = session?.mi_id ? Number(session.mi_id) : Number(data?.MI_Id || (session as any)?.user?.mi_id || 30);

        const listKeys = [
            'masterbook',
            'booktransIMP',
            'masteracces',
            'mastervender',
            'masterauthor',
            'mastersub',
            'masterdep',
            'masterlang',
            'masterpubl',
            'masterrack'
        ];

        // Extract books array from whichever property it was passed under
        let booksArray: any[] = [];
        if (Array.isArray(data.masterbook) && data.masterbook.length > 0) {
            booksArray = data.masterbook;
        } else {
            // Find any array property that has rows
            for (const key of listKeys) {
                if (Array.isArray(data[key]) && data[key].length > 0) {
                    booksArray = data[key];
                    break;
                }
            }
        }

        const mappedBooks = booksArray.map((row: any) => {
            const rowItem = { ...row };
            rowItem.MI_Id = miId;
            rowItem.LMB_Id = Number(rowItem.LMB_Id || 0);

            // Ensure title is present if only subtitle was given
            const title = rowItem.LMB_BookTitle || rowItem.LMB_BOOKTITLE;
            const subtitle = rowItem.LMB_BookSubTitle || rowItem.LMB_BOOKSUBTITLE;
            if (!title && subtitle) {
                rowItem.LMB_BookTitle = subtitle;
                rowItem.LMB_BOOKTITLE = subtitle;
            }

            return rowItem;
        });

        const payload: Record<string, any> = {
            LMAL_Id: Number(data.LMAL_Id || 0),
            LMV_Id: Number(data.LMV_Id || 0),
            LMAU_Id: Number(data.LMAU_Id || 0),
            MI_Id: miId,
            returnval: false,
            suscnt: 0,
            failcnt: 0,
            dupcnt: 0,
            booktransIMP: null,
            masteracces: null,
            mastervender: null,
            masterauthor: null,
            mastersub: null,
            masterdep: null,
            masterlang: null,
            masterpubl: null,
            masterrack: null,
            masterbook: mappedBooks
        };

        try {
            fs.writeFileSync(
                'C:\\Users\\sumas\\.gemini\\antigravity-ide\\brain\\d0d37327-b7cf-45e6-9e19-11b831965928\\scratch\\last_request_debug.json',
                JSON.stringify(
                    {
                        timestamp: new Date().toISOString(),
                        miId,
                        lmalId: payload.LMAL_Id,
                        booksCount: mappedBooks.length,
                        sampleRow: mappedBooks[0]
                    },
                    null,
                    2
                )
            );
        } catch (_) {}

        const response: any = await api.post<any>('library', `${MODULE_URL}/add-import-Savedata`, payload);

        try {
            fs.writeFileSync(
                'C:\\Users\\sumas\\.gemini\\antigravity-ide\\brain\\d0d37327-b7cf-45e6-9e19-11b831965928\\scratch\\last_response_debug.json',
                JSON.stringify(
                    {
                        timestamp: new Date().toISOString(),
                        response
                    },
                    null,
                    2
                )
            );
        } catch (_) {}

        return response;
    } catch (error: any) {
        console.error('Failed to save imported library data:', error);
        try {
            fs.writeFileSync(
                'C:\\Users\\sumas\\.gemini\\antigravity-ide\\brain\\d0d37327-b7cf-45e6-9e19-11b831965928\\scratch\\last_error_debug.json',
                JSON.stringify(
                    {
                        timestamp: new Date().toISOString(),
                        error: error?.message || error
                    },
                    null,
                    2
                )
            );
        } catch (_) {}
        throw error;
    }
}
