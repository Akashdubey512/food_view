export const AUTH_STORAGE_KEY = 'food_view_logged_in';

export const AUTH_CHANGE_EVENT = 'food_view_auth_change';

export function setLoggedIn() {
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
}

export function clearLoggedIn() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isLoggedIn() {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
}

export function emitAuthChange() {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}