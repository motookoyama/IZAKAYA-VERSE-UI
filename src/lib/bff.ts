export const resolveBffBase = () => {
    // In development, use the local proxy or direct URL
    if (import.meta.env.DEV) {
        return 'http://localhost:4117';
    }
    // In production (Cloud Run), use the relative path or env var
    return 'https://izakaya-bff-c-preview-gq6f2n6yxa-an.a.run.app';
};
