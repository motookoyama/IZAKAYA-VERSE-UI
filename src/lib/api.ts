import { resolveBffBase } from "./bff";



export type Role = "user" | "ai";

export type Message = {
    role: Role;
    text: string;
    cardId?: string;
    cardName?: string;
};

export type WalletBalance = {
    uid: string;
    balance: number;
    transactions: any[];
};

function ensureChatProviderQuery(url: string): string {
    try {
        const target = new URL(url);
        if (!target.pathname.startsWith("/chat")) {
            return url;
        }
        target.searchParams.set("provider", "gemini");
        return target.toString();
    } catch {
        return url;
    }
}

function buildRequestUrl(path: string): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = `${resolveBffBase()}${normalizedPath}`;
    return ensureChatProviderQuery(url);
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const url = buildRequestUrl(path);
    const res = await fetch(url, {
        headers: { "content-type": "application/json" },
        ...init,
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${text}`);
    }
    return res.json();
}

export const api = {
    async sendMessage(
        text: string,
        cardId: string,
        history: Message[] = [],
        tension: number = 50 // Default tension
    ): Promise<{ reply: string; meta: any }> {
        // Map tension (0-100) to temperature (0.2 - 0.95)
        // 0 -> 0.2 (Rigid)
        // 50 -> 0.575 (Balanced)
        // 100 -> 0.95 (Chaotic)
        const temperature = 0.2 + (tension / 100) * 0.75;

        return apiFetch("/chat/v1", {
            method: "POST",
            body: JSON.stringify({
                prompt: text,
                cardId,
                history,
                temperature,
            }),
        });
    },

    async getWalletBalance(uid: string): Promise<WalletBalance> {
        return apiFetch("/wallet/balance", {
            headers: {
                "X-IZK-UID": uid,
            },
        });
    },

    async consumePoints(uid: string, amount: number, sku: string): Promise<any> {
        return apiFetch("/wallet/consume", {
            method: "POST",
            headers: {
                "X-IZK-UID": uid,
            },
            body: JSON.stringify({
                uid,
                amount_pt: amount,
                sku,
                idempotency_key: crypto.randomUUID(),
            }),
        });
    },

    async getMetaCaptureLink(
        uid: string,
        content: string,
        mode: string,
        auto: boolean = false
    ): Promise<{ ok: boolean; url: string; cost: number }> {
        return apiFetch("/api/v2/metacapture_link", {
            method: "POST",
            headers: {
                "X-IZK-UID": uid,
            },
            body: JSON.stringify({
                content,
                mode,
                auto,
            }),
        });
    },
};
