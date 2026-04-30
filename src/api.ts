import { getToken } from './auth';

export async function apiFetch(path: string, options: RequestInit = {}) {
    const token = getToken();

    return fetch(`http://localhost:3000${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
}