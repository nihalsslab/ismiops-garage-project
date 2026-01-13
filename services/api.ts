
interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
    url?: string;
}

const getScriptUrl = () => {
    try {
        // @ts-ignore
        return import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbza-bLiSEMRYnCQBmTi7Ncqr43ed-pfLEj7MjkW3BPJVKbacLCByvl4WfAZaf8sdR_a/exec';
    } catch (e) {
        console.warn('Failed to access import.meta.env', e);
        return 'https://script.google.com/macros/s/AKfycbza-bLiSEMRYnCQBmTi7Ncqr43ed-pfLEj7MjkW3BPJVKbacLCByvl4WfAZaf8sdR_a/exec';
    }
};

const API_URL = getScriptUrl();

if (!API_URL) {
    console.warn('VITE_GOOGLE_APPS_SCRIPT_URL is not set in .env.local');
}

export const api = {
    async getInventory() {
        if (!API_URL) return { status: 'error', message: 'API URL missing' };
        try {
            const res = await fetch(`${API_URL}?action=getInventory`);
            return await res.json();
        } catch (e) {
            return { status: 'error', message: e.toString() };
        }
    },

    async addPart(part: any) {
        return this.post('addPart', part);
    },

    async getJobs() {
        if (!API_URL) return { status: 'error', message: 'API URL missing' };
        try {
            const res = await fetch(`${API_URL}?action=getJobs`);
            return await res.json();
        } catch (e) {
            return { status: 'error', message: e.toString() };
        }
    },

    async addJob(job: any) {
        return this.post('addJob', job);
    },

    async deletePart(id: string) {
        return this.post('deletePart', { id });
    },

    async updatePart(id: string, updates: any) {
        return this.post('updatePart', { id, updates });
    },

    async deleteJob(id: string) {
        return this.post('deleteJob', { id });
    },

    async updateJob(id: string, updates: any) {
        return this.post('updateJob', { id, updates });
    },

    async getInvoiceItems(jobId: string) {
        if (!API_URL) return { status: 'error', message: 'API URL missing' };
        try {
            const res = await fetch(`${API_URL}?action=getInvoiceItems&jobId=${jobId}`);
            return await res.json();
        } catch (e) {
            return { status: 'error', message: e.toString() };
        }
    },

    async saveInvoiceItems(jobId: string, items: any[]) {
        return this.post('saveInvoiceItems', { jobId, items });
    },

    async uploadImage(file: File) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Data = (reader.result as string).split(',')[1];
                const payload = {
                    data: base64Data,
                    filename: file.name,
                    mimeType: file.type
                };
                const res = await this.post('uploadImage', payload);
                resolve(res);
            };
            reader.onerror = (error) => reject(error);
        });
    },

    async post(action: string, payload: any) {
        if (!API_URL) return { status: 'error', message: 'API URL missing' };
        try {
            // mode: 'no-cors' is often needed for GAS but it makes response opaque.
            // However, for correct error handling we usually want standard cors if GAS is set up right.
            // GAS Web App "Execute as: Me, Access: Anyone" usually supports CORS redirects.
            // We'll try standard post first.
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8', // GAS requires text/plain often to avoid OPTIONS preflight issues
                },
                body: JSON.stringify({ action, payload })
            });
            return await res.json();
        } catch (e) {
            return { status: 'error', message: e.toString() };
        }
    }
};
