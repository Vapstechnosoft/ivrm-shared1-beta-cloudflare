'use server';

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------
const CMS_URL = process.env.CMS_URL || process.env.SIGNAGE_API_BASE_URL || '';
const CLIENT_ID = process.env.SIGNAGE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.SIGNAGE_SECRET_KEY || '';

// ---------------------------------------------------------------------------
// TOKEN CACHE  (module-level, survives across requests in the same process)
// ---------------------------------------------------------------------------
let _cachedToken: string | null = null;
let _tokenExpiry = 0; // epoch ms

async function getAccessToken(): Promise<string> {
    const now = Date.now();

    // Return cached token if still valid (with 60 s safety margin)
    if (_cachedToken && now < _tokenExpiry - 60_000) {
        return _cachedToken;
    }

    const res = await fetch(`${CMS_URL}/api/authorize/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        }),
        signal: AbortSignal.timeout(30000) // 30-second timeout
    });

    if (!res.ok) {
        throw new Error(`Xibo auth failed: ${res.status} ${res.statusText}`);
    }

    const payload = await res.json();
    const { access_token, expires_in } = payload;

    if (!access_token) {
        console.error('Xibo Auth Failed. Response:', payload);
        throw new Error('CMS did not return a valid access token');
    }

    console.log('Xibo Auth Successful. Token acquired.');
    _cachedToken = access_token as string;
    _tokenExpiry = now + (Number(expires_in) || 3600) * 1000;
    return _cachedToken;
}

// ---------------------------------------------------------------------------
// BASE REQUEST HELPER  (mirrors xibo_request in Python)
// ---------------------------------------------------------------------------
type RequestOptions = {
    params?: Record<string, string | number | boolean>;
    data?: Record<string, string | number>;
    files?: { fieldName: string; filename: string; blob: Blob }[];
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
};

async function xiboRequest<T = any>(opts: RequestOptions): Promise<T> {
    const token = await getAccessToken();

    // Build URL - Ensure CMS_URL doesn't have a trailing slash if path starts with one
    const baseUrl = CMS_URL.endsWith('/') ? CMS_URL.slice(0, -1) : CMS_URL;
    const path = opts.path.startsWith('/') ? opts.path : `/${opts.path}`;
    const url = new URL(`${baseUrl}${path}`);

    if (opts.params) {
        Object.entries(opts.params).forEach(([k, v]) => {
            if (v !== undefined && v !== null) {
                url.searchParams.set(k, String(v));
            }
        });
    }

    let body: BodyInit | undefined;
    const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
    };

    if (opts.files && opts.files.length > 0) {
        const form = new FormData();
        if (opts.data) {
            Object.entries(opts.data).forEach(([k, v]) => form.append(k, String(v)));
        }
        opts.files.forEach((f) => form.append(f.fieldName, f.blob, f.filename));
        body = form;
    } else if (opts.data) {
        body = new URLSearchParams(Object.fromEntries(Object.entries(opts.data).map(([k, v]) => [k, String(v)])));
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    const res = await fetch(url.toString(), {
        method: opts.method,
        headers,
        body,
        cache: 'no-store',
        signal: AbortSignal.timeout(30000) // 30-second timeout
    });

    if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown Error');
        console.error(`Xibo API Error [${res.status}]:`, errorText);
        throw new Error(`Xibo API error ${res.status}: ${errorText}`);
    }

    const text = await res.text();
    if (!text) return { success: true } as unknown as T;

    try {
        const json = JSON.parse(text);
        return json as T;
    } catch {
        return text as unknown as T;
    }
}

// ---------------------------------------------------------------------------
// HELPER: wrap xiboRequest and normalise to { success, data?, message? }
// ---------------------------------------------------------------------------
async function safe<T>(fn: () => Promise<T>): Promise<{ success: boolean; data?: T; message?: string }> {
    try {
        const data = await fn();
        return { success: true, data };
    } catch (error: any) {
        console.error('[digital-signage]', error?.message);
        return { success: false, message: error?.message || 'Request failed' };
    }
}

// ===========================================================================
// 1.  LIBRARY (MEDIA)
// ===========================================================================

/**
 * Upload a single media file to the Xibo library.
 * Matches Python:  xibo_request("POST", "/api/library",
 *                               data={"name": filename},
 *                               files={"files[]": (filename, file_obj)})
 */
export async function uploadMedia(file: File) {
    return safe(async () => {
        let filename = file.name;
        // Automatically rename .jfif to .jpg to bypass Xibo's extension restrictions
        if (filename.toLowerCase().endsWith('.jfif')) {
            filename = filename.slice(0, -5) + '.jpg';
        }

        const blob = file; // Use the File object directly as it is already a subclass of Blob
        const res = await xiboRequest({
            method: 'POST',
            path: '/api/library',
            data: { name: filename },
            files: [{ fieldName: 'files[]', filename, blob }]
        });

        // Check if Xibo returned an upload-level error inside a 200 OK response
        const fileError = res?.files?.[0]?.error || res?.[0]?.error;
        if (fileError) {
            throw new Error(fileError);
        }

        return res;
    });
}

/**
 * List media in the library (paginated).
 * Matches Python:  xibo_request("GET", "/api/library",
 *                               params={"start": …, "length": …})
 */
export async function getLibrary(page = 1, pageSize = 10, displayId?: number) {
    return safe(async () => {
        const params: Record<string, number> = {
            start: (page - 1) * pageSize,
            length: pageSize
        };
        if (displayId) params['displayId'] = displayId;

        return xiboRequest({
            method: 'GET',
            path: '/api/library',
            params
        });
    });
}

/**
 * Delete a media item from the library.
 * Matches Python:  xibo_request("DELETE", f"/api/library/{media_id}",
 *                               params={"forceDelete": int(force_delete)})
 */
export async function deleteMedia(mediaId: number, forceDelete = false) {
    return safe(() =>
        xiboRequest({
            method: 'DELETE',
            path: `/api/library/${mediaId}`,
            params: { forceDelete: forceDelete ? 1 : 0 }
        })
    );
}

// ===========================================================================
// 2.  SCHEDULE
// ===========================================================================

/**
 * Create a schedule event that links a media item to a display.
 * Matches Python:  xibo_request("POST", "/api/schedule",
 *                               data={"eventTypeId": 7,
 *                                     "mediaId": media_id,
 *                                     "displayGroupIds[]": display_id,
 *                                     "fromDt": start_date,
 *                                     "toDt": end_date})
 */
export async function createSchedule(
    mediaId: number,
    displayId: number,
    startDate: string, // ISO / Xibo date string, e.g. "2025-06-01 09:00:00"
    endDate: string
) {
    return safe(() =>
        xiboRequest({
            method: 'POST',
            path: '/api/schedule',
            data: {
                eventTypeId: 7,
                mediaId,
                'displayGroupIds[]': displayId,
                fromDt: startDate,
                toDt: endDate
            }
        })
    );
}

/**
 * List schedule events (paginated).
 * Matches Python:  xibo_request("GET", "/api/schedule",
 *                               params={"start": …, "length": …})
 */
export async function getSchedule(page = 1, pageSize = 10, displayId?: number) {
    return safe(async () => {
        const params: Record<string, number> = {
            start: (page - 1) * pageSize,
            length: pageSize
        };
        if (displayId) params['displayId'] = displayId;

        return xiboRequest({
            method: 'GET',
            path: '/api/schedule',
            params
        });
    });
}

/**
 * Delete a schedule event.
 * Matches Python:  xibo_request("DELETE", f"/api/schedule/{event_id}")
 */
export async function deleteSchedule(eventId: number) {
    return safe(() =>
        xiboRequest({
            method: 'DELETE',
            path: `/api/schedule/${eventId}`
        })
    );
}

// ===========================================================================
// 3.  UPLOAD  +  SCHEDULE  (combined convenience function used by the UI form)
//     Step 1: POST /api/library  → get back mediaId
//     Step 2: POST /api/schedule with that mediaId
// ===========================================================================

/**
 * Upload a file then immediately create a schedule event for it.
 * Accepts a FormData containing:
 *   - file       : File
 *   - display_id : string (number)
 *   - start_date : string
 *   - end_date   : string
 */
export async function uploadAndSchedule(formData: FormData) {
    try {
        const file = formData.get('file') as File | null;
        const displayId = formData.get('display_id') as string | null;
        const startDateRaw = formData.get('start_date') as string | null;
        const endDateRaw = formData.get('end_date') as string | null;

        if (!file || !displayId || !startDateRaw || !endDateRaw) {
            return { success: false, message: 'Missing required fields: file, display_id, start_date, end_date' };
        }

        // --- Step 0: Format Dates for Xibo ---
        // Xibo CMS typically expects "YYYY-MM-DD HH:mm:ss".
        // HTML datetime-local usually gives "YYYY-MM-DDTHH:mm".
        const formatXiboDate = (d: string) => {
            const withSpace = d.replace('T', ' ');
            return withSpace.length === 16 ? `${withSpace}:00` : withSpace;
        };

        const startDate = formatXiboDate(startDateRaw);
        const endDate = formatXiboDate(endDateRaw);

        // --- Step 1: upload media ---
        const uploadResult = await uploadMedia(file);
        if (!uploadResult.success) {
            return { success: false, message: `Upload failed: ${uploadResult.message}` };
        }

        // --- Step 2: Extract Media ID ---
        // Xibo returns the new media object(s) in various formats depending on version/endpoint:
        // 1. { files: [ { mediaId: 123, ... } ] }
        // 2. [ { mediaId: 123, ... } ]
        // 3. { mediaId: 123, ... }
        const mediaData = uploadResult.data as any;
        const mediaId = mediaData?.files?.[0]?.mediaId || mediaData?.[0]?.mediaId || mediaData?.mediaId || mediaData?.id;

        if (!mediaId) {
            console.error('[uploadAndSchedule] No mediaId found in response:', mediaData);
            return { success: false, message: 'Upload succeeded but no mediaId was returned' };
        }

        // --- Step 3: create schedule ---
        const scheduleResult = await createSchedule(Number(mediaId), Number(displayId), startDate, endDate);

        if (!scheduleResult.success) {
            return { success: false, message: `Schedule creation failed: ${scheduleResult.message}` };
        }

        return { success: true, data: { mediaId, schedule: scheduleResult.data } };
    } catch (error: any) {
        console.error('[uploadAndSchedule] Error:', error);
        return { success: false, message: error?.message || 'Upload and schedule failed' };
    }
}

// ===========================================================================
// 4.  DISPLAYS
// ===========================================================================

/**
 * List registered displays (paginated).
 * Matches Python:  xibo_request("GET", "/api/display",
 *                               params={"start": …, "length": …})
 */
export async function getDisplays(page = 1, pageSize = 10) {
    return safe(() =>
        xiboRequest({
            method: 'GET',
            path: '/api/display',
            params: {
                start: (page - 1) * pageSize,
                length: pageSize
            }
        })
    );
}

/**
 * Request a screenshot from a display.
 * Matches Python:  xibo_request("PUT", f"/display/requestscreenshot/{display_id}")
 */
export async function requestScreenshot(displayId: number) {
    return safe(() =>
        xiboRequest({
            method: 'PUT',
            path: `/display/requestscreenshot/${displayId}`
        })
    );
}
