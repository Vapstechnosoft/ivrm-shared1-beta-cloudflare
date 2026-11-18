'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { IPurchaseDonateReportGridData, IPurchaseDonateReportRequest } from '@/types/library/reports/purchase-donate-report';

const FACADE = 'PurchaseDonateReport';

const extractList = (input: any): any[] => {
    if (!input) return [];
    if (Array.isArray(input)) return input;

    if (typeof input === 'object') {
        if ('$values' in input && Array.isArray(input.$values)) {
            return input.$values;
        }

        const priorityKeys = [
            'alldata',
            'reportlist',
            'reportList',
            'griddata',
            'gridList',
            'purchaselist',
            'donatelist',
            'purchasedlist',
            'donatedlist',
            'purchasedetails',
            'bookdetails',
            'get_report',
            'fillalldata',
            'list',
            'data'
        ];

        // 1. If input.data is present
        if (input.data) {
            if (Array.isArray(input.data)) return input.data;
            if (typeof input.data === 'object') {
                if ('$values' in input.data && Array.isArray(input.data.$values)) {
                    return input.data.$values;
                }
                for (const key of priorityKeys) {
                    const val = input.data[key];
                    if (Array.isArray(val) && val.length > 0) return val;
                    if (val && typeof val === 'object' && '$values' in val && Array.isArray(val.$values) && val.$values.length > 0) {
                        return val.$values;
                    }
                }
                for (const key of Object.keys(input.data)) {
                    const val = input.data[key];
                    if (Array.isArray(val)) return val;
                    if (val && typeof val === 'object' && '$values' in val && Array.isArray(val.$values)) {
                        return val.$values;
                    }
                }
            }
        }

        // 2. Check priority keys on input
        for (const key of priorityKeys) {
            const val = input[key];
            if (Array.isArray(val) && val.length > 0) return val;
            if (val && typeof val === 'object' && '$values' in val && Array.isArray(val.$values) && val.$values.length > 0) {
                return val.$values;
            }
        }

        for (const key of priorityKeys) {
            const val = input[key];
            if (Array.isArray(val)) return val;
            if (val && typeof val === 'object' && '$values' in val && Array.isArray(val.$values)) {
                return val.$values;
            }
        }

        // 3. Fallback: Check ANY property on input that is an array
        for (const key of Object.keys(input)) {
            const val = input[key];
            if (Array.isArray(val)) return val;
            if (val && typeof val === 'object' && '$values' in val && Array.isArray(val.$values)) {
                return val.$values;
            }
        }
    }

    return [];
};

const normalizeReportItem = (item: any): IPurchaseDonateReportGridData => {
    if (!item || typeof item !== 'object') return item;
    return {
        ...item,
        lmB_BookType: item.lmB_BookType || item.LMB_BookType || item.bookType || item.BookType || item.booktype || item.LMB_BOOKTYPE || '',
        lmbanO_AccessionNo:
            item.lmbanO_AccessionNo ||
            item.LMBANO_AccessionNo ||
            item.lmbano_AccessionNo ||
            item.accessionNo ||
            item.AccessionNo ||
            item.accession_no ||
            item.Accession_No ||
            item.LMBANO_ACCESSIONNO ||
            '',
        lmB_BookTitle:
            item.lmB_BookTitle ||
            item.LMB_BookTitle ||
            item.lmb_BookTitle ||
            item.bookTitle ||
            item.BookTitle ||
            item.title ||
            item.Title ||
            item.book_title ||
            item.LMB_BOOKTITLE ||
            '',
        name:
            item.name ||
            item.Name ||
            item.authorName ||
            item.AuthorName ||
            item.author_Name ||
            item.Author_Name ||
            item.lmba_AuthorName ||
            item.LMBA_AuthorName ||
            item.author ||
            item.Author ||
            '',
        lmV_VendorName:
            item.lmV_VendorName ||
            item.LMV_VendorName ||
            item.lmv_VendorName ||
            item.vendorName ||
            item.VendorName ||
            item.vendor_name ||
            item.vendor ||
            item.Vendor ||
            item.donor_Id ||
            item.Donor_Id ||
            item.donorName ||
            item.DonorName ||
            item.donor_name ||
            item.donor ||
            item.Donor ||
            item.LMB_DonorAddress ||
            '',
        lmB_PurchaseDate:
            item.lmB_PurchaseDate ||
            item.LMB_PurchaseDate ||
            item.lmb_PurchaseDate ||
            item.purchaseDate ||
            item.PurchaseDate ||
            item.purchase_date ||
            item.date ||
            item.Date ||
            item.LMB_PURCHASEDATE ||
            '',
        lmB_NoOfCopies: Number(
            item.lmB_NoOfCopies ??
                item.LMB_NoOfCopies ??
                item.lmb_NoOfCopies ??
                item.noOfCopies ??
                item.NoOfCopies ??
                item.copies ??
                item.Copies ??
                item.LMB_NOOFCOPIES ??
                0
        ),
        lmB_Price: Number(item.lmB_Price ?? item.LMB_Price ?? item.lmb_Price ?? item.price ?? item.Price ?? item.LMB_PRICE ?? 0),
        lmB_Discount: Number(
            item.lmB_Discount ?? item.LMB_Discount ?? item.lmb_Discount ?? item.discount ?? item.Discount ?? item.LMB_DISCOUNT ?? 0
        ),
        lmB_NetPrice: Number(
            item.lmB_NetPrice ??
                item.LMB_NetPrice ??
                item.lmb_NetPrice ??
                item.netPrice ??
                item.NetPrice ??
                item.netAmount ??
                item.NetAmount ??
                item.net_Price ??
                item.Net_Price ??
                item.net_amount ??
                item.LMB_NETPRICE ??
                0
        )
    };
};

export async function getPurchaseDonateReportData(data: IPurchaseDonateReportRequest) {
    try {
        let session: any = null;
        try {
            session = await auth();
        } catch (authErr) {
            console.warn('[PurchaseDonateReport] auth() call error (ignoring and using fallback mi_id):', authErr);
        }

        const rawCirc = data.circ_Flag || data.LMB_BookType || 'Book';
        let circFlag = String(rawCirc).trim();
        if (circFlag.toLowerCase() === 'book') {
            circFlag = 'Book';
        } else if (circFlag.toLowerCase() === 'non-book' || circFlag.toLowerCase() === 'nonbook') {
            circFlag = 'Non-Book';
        }

        const rawFlag = data.lbcpA_Flg || data.book_Flag || 'Purchased';
        let lbcpAFlg = String(rawFlag).trim();
        if (
            lbcpAFlg.toLowerCase() === 'purchased' ||
            lbcpAFlg.toLowerCase() === 'purchaged' ||
            lbcpAFlg.toLowerCase() === 'purchase' ||
            lbcpAFlg.toUpperCase() === 'P'
        ) {
            lbcpAFlg = 'Purchased';
        } else if (lbcpAFlg.toLowerCase() === 'donated' || lbcpAFlg.toLowerCase() === 'donate' || lbcpAFlg.toUpperCase() === 'D') {
            lbcpAFlg = 'Donated';
        }

        const miId = (session as any)?.mi_id || data.mI_Id || data.MI_Id || 30;
        const ivrmulId = session?.roleId || (session as any)?.user_id || 0;

        // Backend URL format: /api/PurchaseDonateReport/getdata/Book/Purchased
        const url = `${FACADE}/getdata/${circFlag}/${lbcpAFlg}`;

        const payload = {
            mI_Id: miId,
            MI_Id: miId,
            circ_Flag: circFlag,
            Circ_Flag: circFlag,
            LMB_BookType: circFlag,
            lbcpA_Flg: lbcpAFlg,
            LBCPA_Flg: lbcpAFlg,
            book_Flag: lbcpAFlg,
            IVRMUL_Id: ivrmulId
        };

        console.info(`[PurchaseDonateReport] Calling endpoint: ${url}`, payload);

        let response: any;
        try {
            // Primary method: POST with payload in body and query params
            response = await api.post<any>('library', url, payload, { params: payload });
        } catch (postErr: any) {
            console.warn(`[PurchaseDonateReport] Primary POST to ${url} failed, trying fallbacks:`, postErr);
            try {
                // Fallback 1: POST without query params
                response = await api.post<any>('library', url, payload);
            } catch {
                try {
                    // Fallback 2: POST directly to /getdata with payload
                    response = await api.post<any>('library', `${FACADE}/getdata`, payload);
                } catch {
                    try {
                        // Fallback 3: Uppercase format (BOOK/Purchased)
                        const upperUrl = `${FACADE}/getdata/${circFlag.toUpperCase()}/${lbcpAFlg}`;
                        response = await api.post<any>('library', upperUrl, payload, { params: payload });
                    } catch {
                        try {
                            // Fallback 4: GET method with query parameters
                            response = await api.get<any>('library', url, { params: payload });
                        } catch {
                            try {
                                // Fallback 5: Legacy typo 'Purchaged'
                                if (lbcpAFlg === 'Purchased') {
                                    const legacyUrl = `${FACADE}/getdata/${circFlag}/Purchaged`;
                                    response = await api.post<any>('library', legacyUrl, payload, { params: payload });
                                } else {
                                    throw postErr;
                                }
                            } catch {
                                throw postErr;
                            }
                        }
                    }
                }
            }
        }

        const responseData = response?.data ?? response;
        console.info('[PurchaseDonateReport] Response received:', typeof responseData);

        const rawList = extractList(responseData);
        console.info(`[PurchaseDonateReport] Extracted ${rawList.length} items`);

        const normalizedList = rawList.map(normalizeReportItem);

        return {
            success: true,
            data: normalizedList
        };
    } catch (error: any) {
        console.error('Error in getPurchaseDonateReportData:', error);
        const errMsg = typeof error === 'string' ? error : error?.message || 'Failed to fetch purchase/donate report data';
        return {
            success: false,
            message: errMsg,
            data: []
        };
    }
}
