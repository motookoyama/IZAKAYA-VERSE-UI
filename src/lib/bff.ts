export const resolveBffBase = () => {
    // In development, use the local proxy or direct URL
    if (import.meta.env.DEV) {
        return 'http://localhost:4117';
    }
    // In production (Cloud Run), use the production BFF URL
    return 'https://izakaya-bff-95139013565.asia-northeast1.run.app';
};
