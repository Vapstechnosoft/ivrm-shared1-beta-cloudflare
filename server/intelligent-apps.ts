'use server';

import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';

export interface ChatgptDTO {
    message?: string;
    ChatCompletion?: string;
    MobileNumber?: string;
    Typedropdown?: string;
    Board?: string;
    BirthdayName?: string;
    InstituteNameB?: string;
    Attendance1?: string;
    Attendance2?: string;
    Attendance3?: string;
    Attendance4?: string;
    Attendance5?: string;
    FeeDue?: string;
    FeeTransaction1?: string;
    FeeTransaction2?: string;
    FeeTransaction3?: string;
    FeeTransaction4?: string;
    FeeTransaction5?: string;
    LoginCredentials1?: string;
    LoginCredentials2?: string;
    LoginCredentials3?: string;
    LoginCredentials4?: string;
    LoginCredentials5?: string;
}

export interface TranslatorDTO {
    fromlanguage: string;
    tolanguage: string;
    source?: string;
    fromsource: string;
    result?: string;
    translateddata?: string[];
    MI_Id?: number;
}

export async function chatGPT(data: ChatgptDTO): Promise<ChatgptDTO> {
    const apiKey = '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';
    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    const maxTokens = 500;
    const temperature = 0.5;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: data.message }],
                max_tokens: maxTokens,
                model: 'openai/gpt-oss-120b',
                temperature: temperature
            })
        });

        if (response.ok) {
            const result = await response.json();
            const messageContent = result.choices[0].message.content;
            return { ...data, ChatCompletion: messageContent };
        } else {
            console.error(`Error: ${response.status} ${response.statusText}`);
            const errorBody = await response.text();
            console.error(`Response body: ${errorBody}`);
            return { ...data, ChatCompletion: `Error: ${response.status} - ${errorBody}` };
        }
    } catch (error) {
        console.error('Error in chatGPT:', error);
        return { ...data, ChatCompletion: 'Internal server error' };
    }
}

export async function whatsAppCall(data: ChatgptDTO): Promise<string> {
    const accessToken =
        'EAALIaEGktRgBOxmK05MMqsi9jKwo4ZBSzps3ZAWckqVLvDMe0LZCSPZCDHEUkrsGjuKkR43wKzvBVZC4XnPNrESHgZC9ZADLVZAHLAAZCDZCY7mhy6hdqwt2FRTTAdjUUqrqNUrwasJwdOBEeXzFGDonc5ri5KZCts64szUfrhQ1kc0RLIdeQWjYZAx4Gi2SupDgg3aP2e8xsSfMt4QVVj7u';
    const endpoint = 'https://graph.facebook.com/v17.0/177948302058854/messages';

    let templateName = '';
    // biome-ignore lint/style/useConst: <explanation>
    let languageCode = 'en';
    let bodyParameters: { type: string; text: string | undefined }[] = [];

    if (data.Typedropdown === 'Board') {
        templateName = 'welcomevaps';
        // C# code commented out parameters for Board, so we assume no parameters or handle similarly
    } else if (data.Typedropdown === 'Birthday') {
        templateName = 'birthdaynew';
        bodyParameters = [
            { type: 'text', text: data.BirthdayName },
            { type: 'text', text: data.InstituteNameB }
        ];
    } else if (data.Typedropdown === 'Attendance') {
        templateName = 'attendance';
        bodyParameters = [
            { type: 'text', text: data.Attendance1 },
            { type: 'text', text: data.Attendance2 },
            { type: 'text', text: data.Attendance3 },
            { type: 'text', text: data.Attendance4 },
            { type: 'text', text: data.Attendance5 }
        ];
    } else if (data.Typedropdown === 'FeeDue') {
        templateName = 'feedefault';
        bodyParameters = [{ type: 'text', text: data.FeeDue }];
    } else if (data.Typedropdown === 'FeeTransaction') {
        templateName = 'feetransaction';
        bodyParameters = [
            { type: 'text', text: data.FeeTransaction1 },
            { type: 'text', text: data.FeeTransaction2 },
            { type: 'text', text: data.FeeTransaction3 },
            { type: 'text', text: data.FeeTransaction4 },
            { type: 'text', text: data.FeeTransaction5 }
        ];
    } else {
        // LoginCredentials or default
        templateName = 'administrator';
        bodyParameters = [
            { type: 'text', text: data.LoginCredentials1 },
            { type: 'text', text: data.LoginCredentials2 },
            { type: 'text', text: data.LoginCredentials3 },
            { type: 'text', text: data.LoginCredentials4 },
            { type: 'text', text: data.LoginCredentials5 }
        ];
    }

    const payload = {
        messaging_product: 'whatsapp',
        to: data.MobileNumber,
        type: 'template',
        template: {
            name: templateName,
            language: { code: languageCode },
            components: [
                {
                    type: 'body',
                    parameters: bodyParameters
                }
            ]
        }
    };

    try {
        const response = await fetch(`${endpoint}?access_token=${accessToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const body = await response.json();
            console.log(body);
            return 'success';
        } else {
            console.error(`Error: ${response.status} ${response.statusText}`);
            const errorBody = await response.text();
            console.error(errorBody);
            return 'failed';
        }
    } catch (error) {
        console.error('Error in whatsAppCall:', error);
        return 'error';
    }
}

export async function whatsAppBulkCall(formData: FormData): Promise<string> {
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) return 'no_file';

    try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet) as any[];

        let successCount = 0;
        let failCount = 0;

        for (const row of data) {
            if (row.MobileNumber) {
                const chatData: ChatgptDTO = {
                    MobileNumber: String(row.MobileNumber),
                    Typedropdown: type,
                    BirthdayName: String(row.BirthdayName || row.Name || ''),
                    InstituteNameB: String(row.InstituteNameB || row.Institute || ''),
                    Attendance1: String(row.Attendance1 || row.Att1 || ''),
                    Attendance2: String(row.Attendance2 || row.Att2 || ''),
                    Attendance3: String(row.Attendance3 || row.Att3 || ''),
                    Attendance4: String(row.Attendance4 || row.Att4 || ''),
                    Attendance5: String(row.Attendance5 || row.Att5 || ''),
                    FeeDue: String(row.FeeDue || row.DueAmount || ''),
                    FeeTransaction1: String(row.FeeTransaction1 || row.Trans1 || ''),
                    FeeTransaction2: String(row.FeeTransaction2 || row.Trans2 || ''),
                    FeeTransaction3: String(row.FeeTransaction3 || row.Trans3 || ''),
                    FeeTransaction4: String(row.FeeTransaction4 || row.Trans4 || ''),
                    FeeTransaction5: String(row.FeeTransaction5 || row.Trans5 || ''),
                    LoginCredentials1: String(row.LoginCredentials1 || row.Cred1 || ''),
                    LoginCredentials2: String(row.LoginCredentials2 || row.Cred2 || ''),
                    LoginCredentials3: String(row.LoginCredentials3 || row.Cred3 || ''),
                    LoginCredentials4: String(row.LoginCredentials4 || row.Cred4 || ''),
                    LoginCredentials5: String(row.LoginCredentials5 || row.Cred5 || '')
                };

                const res = await whatsAppCall(chatData);
                if (res === 'success') successCount++;
                else failCount++;
            }
        }

        return `Bulk process completed. Success: ${successCount}, Failed: ${failCount}`;
    } catch (error) {
        console.error('Error in whatsAppBulkCall:', error);
        return 'error';
    }
}

export async function languageTranslator(data: TranslatorDTO): Promise<TranslatorDTO> {
    const key = 'ae1549ade3594811b31d5b7eedf42758';
    const endpoint = 'https://api.cognitive.microsofttranslator.com';
    const location = 'centralindia';
    const route = `/translate?api-version=3.0&from=${data.fromlanguage}&to=${data.tolanguage}`;
    const url = `${endpoint}${route}`;

    const body = [{ Text: data.fromsource }];

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': key,
                'Ocp-Apim-Subscription-Region': location
            },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            const resultText = await response.text();
            // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
            let jsonResponse;
            try {
                jsonResponse = JSON.parse(resultText);
            } catch (e) {
                // fall back or handle error? Azure usually returns JSON.
                jsonResponse = [];
            }

            const translations: string[] = [];

            if (Array.isArray(jsonResponse)) {
                for (const item of jsonResponse) {
                    if (item.translations && Array.isArray(item.translations)) {
                        for (const translation of item.translations) {
                            translations.push(translation.text);
                        }
                    }
                }
            }

            return {
                ...data,
                result: resultText,
                translateddata: translations
            };
        } else {
            console.error(`Translator Error: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error(errorText);
            return { ...data, result: errorText, translateddata: [] };
        }
    } catch (error) {
        console.error('Error in languageTranslator:', error);
        return { ...data, result: 'Internal server error', translateddata: [] };
    }
}

export async function compressPdf(formData: FormData) {
    console.log('Starting PDF compression...');
    const file = formData.get('file') as File;

    if (!file) {
        console.error('No file provided');
        return { success: false, error: 'No file provided' };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalSize = buffer.length;
    console.log(`Received PDF: ${file.name}, size: ${originalSize}`);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'compressed');

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueId = randomUUID();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const outputPath = path.join(uploadDir, `${uniqueId}_optimized_${safeName}`);

    try {
        const srcDoc = await PDFDocument.load(buffer);
        const newDoc = await PDFDocument.create();

        // Copy all pages to new document to strip history/unused objects
        const copiedPages = await newDoc.copyPages(srcDoc, srcDoc.getPageIndices());
        copiedPages.forEach((page: any) => newDoc.addPage(page));

        // Strip metadata
        newDoc.setTitle('');
        newDoc.setAuthor('');
        newDoc.setSubject('');
        newDoc.setKeywords([]);
        newDoc.setProducer('');
        newDoc.setCreator('');

        const compressedBytes = await newDoc.save();

        fs.writeFileSync(outputPath, compressedBytes);
        console.log(`PDF saved to ${outputPath}`);

        const compressedSize = compressedBytes.length;
        const savings = ((originalSize - compressedSize) / originalSize) * 100;

        console.log(`PDF Optimization complete. Savings: ${savings.toFixed(2)}%`);

        return {
            success: true,
            downloadUrl: `/uploads/compressed/${path.basename(outputPath)}`,
            originalSize,
            compressedSize,
            savings,
            filename: path.basename(outputPath)
        };
    } catch (error) {
        console.error('PDF compression error:', error);
        return { success: false, error: 'Compression failed: ' + String(error) };
    }
}
