
const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const TEXT_DECODER_LATIN1 = new TextDecoder("latin1");
const TEXT_DECODER_UTF8 = new TextDecoder("utf-8");

// Keywords used in V2 Cards (SillyTavern / CCV2 / MetaCapture)
const V2_TEXT_KEYWORDS = [
    "chara",
    "chara_card",
    "chara_card_v2",
    "chara_card_v3",
    "json",
    "ai_character",
    "persona",
    "character",
    "v2card",
    "izk_v2_card",
    "story_plot", // Added for Story Plot
    "world_setting", // Added for World
];

export type V2CardMetadata = {
    id?: string;
    name?: string;
    description?: string;
    personality?: string;
    first_mes?: string;
    mes_example?: string;
    scenario?: string;
    system_prompt?: string;
    creator_notes?: string;
    tags?: string[];
    creator?: string;
    character_version?: string;
    alternate_greetings?: string[];
    extensions?: Record<string, any>;
    // Story Plot specific fields (example)
    plot_beats?: {
        setup?: string;
        conflict?: string;
        twist?: string;
        climax?: string;
        resolution?: string;
    };
    [key: string]: unknown;
};

function parseLooseJson<T = Record<string, unknown>>(input: string): T | null {
    if (!input) return null;
    try {
        return JSON.parse(input) as T;
    } catch {
        // Try to find JSON object within text
        const start = input.indexOf("{");
        const end = input.lastIndexOf("}");
        if (start !== -1 && end !== -1 && end > start) {
            const candidate = input.slice(start, end + 1);
            try {
                return JSON.parse(candidate) as T;
            } catch {
                return null;
            }
        }
    }
    return null;
}

async function inflateBytes(bytes: Uint8Array): Promise<Uint8Array | null> {
    const hasDecompressionStream =
        typeof window !== "undefined" && "DecompressionStream" in window;
    if (hasDecompressionStream) {
        try {
            const stream = new Blob([bytes])
                .stream()
                .pipeThrough(new (window as any).DecompressionStream("deflate"));
            const buffer = await new Response(stream).arrayBuffer();
            return new Uint8Array(buffer);
        } catch {
            // ignore and try fallback
        }
    }
    try {
        // Dynamic import to avoid bundling if not needed, or use if available
        const module = await import("pako");
        const inflate = module?.inflate;
        if (typeof inflate === "function") {
            const result = inflate(bytes);
            return result instanceof Uint8Array ? result : new Uint8Array(result);
        }
    } catch {
        // ignore
    }
    return null;
}

export async function extractV2CardMetadataFromPng(file: File): Promise<V2CardMetadata | null> {
    try {
        const buffer = new Uint8Array(await file.arrayBuffer());
        for (let i = 0; i < PNG_SIGNATURE.length; i += 1) {
            if (buffer[i] !== PNG_SIGNATURE[i]) {
                throw new Error("NOT_PNG");
            }
        }
        const texts: Array<{ keyword: string; text: string; bytes: Uint8Array }> = [];
        let offset = 8;
        while (offset + 8 <= buffer.length) {
            const length =
                (buffer[offset] << 24) |
                (buffer[offset + 1] << 16) |
                (buffer[offset + 2] << 8) |
                buffer[offset + 3];
            offset += 4;
            const type = String.fromCharCode(
                buffer[offset],
                buffer[offset + 1],
                buffer[offset + 2],
                buffer[offset + 3],
            );
            offset += 4;
            if (offset + length > buffer.length) break;
            const data = buffer.slice(offset, offset + length);
            offset += length;
            offset += 4; // skip CRC

            if (type === "tEXt") {
                let idx = 0;
                while (idx < data.length && data[idx] !== 0) idx += 1;
                const keyword = TEXT_DECODER_LATIN1.decode(data.slice(0, idx));
                const textBytes = data.slice(idx + 1);
                texts.push({
                    keyword,
                    text: TEXT_DECODER_LATIN1.decode(textBytes),
                    bytes: textBytes,
                });
            } else if (type === "iTXt") {
                let idx = 0;
                while (idx < data.length && data[idx] !== 0) idx += 1;
                const keyword = TEXT_DECODER_LATIN1.decode(data.slice(0, idx));
                const compressionFlag = data[idx + 1];
                const compressionMethod = data[idx + 2];
                idx += 3;
                while (idx < data.length && data[idx] !== 0) idx += 1;
                idx += 1;
                while (idx < data.length && data[idx] !== 0) idx += 1;
                idx += 1;
                let textBytes = data.slice(idx);
                if (compressionFlag === 1 && compressionMethod === 0) {
                    const inflated = await inflateBytes(textBytes);
                    if (inflated) {
                        texts.push({ keyword, text: TEXT_DECODER_UTF8.decode(inflated), bytes: inflated });
                    }
                } else {
                    texts.push({ keyword, text: TEXT_DECODER_UTF8.decode(textBytes), bytes: textBytes });
                }
            } else if (type === "zTXt") {
                let idx = 0;
                while (idx < data.length && data[idx] !== 0) idx += 1;
                const keyword = TEXT_DECODER_LATIN1.decode(data.slice(0, idx));
                idx += 1;
                const compressed = data.slice(idx);
                const inflated = await inflateBytes(compressed);
                if (inflated) {
                    texts.push({ keyword, text: TEXT_DECODER_UTF8.decode(inflated), bytes: inflated });
                }
            } else if (type === "IEND") {
                break;
            }
        }

        // Prioritize known keywords
        const prioritized = texts.filter((entry) =>
            V2_TEXT_KEYWORDS.includes((entry.keyword || "").toLowerCase()),
        );
        const candidates = prioritized.length > 0 ? prioritized : texts;

        for (const entry of candidates.reverse()) {
            const { text, bytes } = entry;
            // Try parsing as JSON directly
            let parsed = parseLooseJson<V2CardMetadata>(text);
            // If failed, try parsing from bytes (sometimes encoding issues)
            if (!parsed && bytes) {
                try {
                    parsed = parseLooseJson<V2CardMetadata>(TEXT_DECODER_UTF8.decode(bytes));
                } catch {
                    // ignore
                }
            }
            if (parsed && typeof parsed === "object") {
                // If it's a CCV2 spec, the data might be inside 'data' field
                if ('data' in parsed && typeof parsed.data === 'object') {
                    return parsed.data as V2CardMetadata;
                }
                return parsed;
            }
        }
        return null;
    } catch (e) {
        console.warn("Failed to extract metadata from PNG", e);
        return null;
    }
}
