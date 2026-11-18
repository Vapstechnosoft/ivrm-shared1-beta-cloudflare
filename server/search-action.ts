'use server';

import { exec } from 'child_process';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

export async function searchDatabase(query: string) {
    if (!query) return { results: [] };

    try {
        // Path to Python script
        const scriptPath = path.join(process.cwd(), 'server', 'global_search.py');

        // Execute Python script
        // Ensure python is in PATH or use absolute path to python.exe if needed
        const { stdout, stderr } = await execPromise(`python "${scriptPath}" "${query}"`);

        if (stderr) {
            console.error('Python Error:', stderr);
            // Non-fatal stderr (warnings) might exist, proceed if stdout has JSON
        }

        try {
            const data = JSON.parse(stdout);
            return { success: true, ...data };
        } catch (e) {
            console.error('JSON Parse Error:', e);
            return { success: false, error: 'Invalid response from search engine' };
        }
    } catch (error: any) {
        console.error('Search Execution Error:', error);
        return { success: false, error: error.message };
    }
}
