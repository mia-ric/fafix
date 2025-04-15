import FAFIXStorage from "../utils/storage";

export function useStorage() {
    return {
        local: new FAFIXStorage('FAFIX', localStorage),
        session: new FAFIXStorage('FAFIX', sessionStorage),
    }
};

export function useLocalStorage() {
    return useStorage().local;
};

export function useSessionStorage() {
    return useStorage().session;
};
