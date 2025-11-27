import { resolveBffBase } from './bff';

export const api = {
    async callProtocol(appName: string, payload: any) {
        const bffBase = resolveBffBase();
        // TODO: Get real UID from auth context
        const uid = 'user_12345';

        const res = await fetch(`${bffBase}/protocol/${appName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-IZK-UID': uid,
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Failed to call protocol: ${appName}`);
        }

        return res.json();
    },

    // Deprecated: Use callProtocol('metacapture', ...) instead
    async getMetaCaptureLink(_uid: string, content: string, mode: string, auto: boolean) {
        return this.callProtocol('metacapture', { content, mode, auto });
    },

    async getWalletBalance(uid: string) {
        const bffBase = resolveBffBase();
        try {
            const res = await fetch(`${bffBase}/wallet/balance?userId=${uid}`);
            if (!res.ok) return 0;
            const data = await res.json();
            return data.balance || 0;
        } catch {
            return 0;
        }
    }
};
