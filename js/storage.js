const STORAGE_KEY = "weather_app_state_v1";

export function getDefaultState() {
  return {
    currentCity: "",
    currentData: null,
    forecastData: null,
    units: "metric",
    theme: "light",
    searchHistory: []
  };
}

export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return getDefaultState();

  try {
    const parsed = JSON.parse(raw);
    return {
      ...getDefaultState(),
      ...parsed
    };
  } catch {
    return getDefaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
