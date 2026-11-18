export const extractList = (data: any, preferredKey?: string) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const target = data?.data !== undefined ? data.data : data;
    if (Array.isArray(target)) return target;
    if (!target) return [];

    if (preferredKey) {
        const foundKey = Object.keys(target).find((k) => k.toLowerCase() === preferredKey.toLowerCase());
        if (foundKey && Array.isArray(target[foundKey])) return target[foundKey];
    }

    const keys = [
        'academiclist',
        'catelist',
        'classlist',
        'sectionlist',
        'stafflist',
        'subjectlist',
        'staffbyall',
        'subjectbystaff',
        'sectionbyclass',
        'classbycategory',
        'categorylist',
        'daylist',
        'periodlist'
    ];
    for (const key of keys) {
        const foundKey = Object.keys(target).find((k) => k.toLowerCase() === key.toLowerCase());
        if (foundKey && Array.isArray(target[foundKey])) return target[foundKey];
    }
    return [];
};

export const filterData = (list: any[], key: string) => {
    return (list || []).filter((item: any) => {
        if (!item) return false;
        const actualKey = Object.keys(item).find((k) => k.toLowerCase() === key.toLowerCase());
        const val = actualKey ? item[actualKey] : undefined;
        if (val === undefined || val === null) return true;
        if (typeof val !== 'string') return !!val;
        const name = val.trim();
        return name && name.toLowerCase() !== 'test';
    });
};
