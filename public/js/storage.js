function loadLastSearch() {
    try {
        const value = localStorage.getItem(window.AppConfig.STORAGE_KEY);
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
}

function saveLastSearch(search) {
    localStorage.setItem(window.AppConfig.STORAGE_KEY, JSON.stringify(search));
}

function clearLastSearch() {
    localStorage.removeItem(window.AppConfig.STORAGE_KEY);
}

window.SearchStorage = {
    loadLastSearch,
    saveLastSearch,
    clearLastSearch
};
