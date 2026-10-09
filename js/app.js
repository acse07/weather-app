import {
  fetchCurrentWeatherByCoords,
  fetchForecastByCoords,
  fetchUvIndex,
  geocodeCity,
  mapApiError
} from "./api.js";
import { getDefaultState, loadState, saveState } from "./storage.js";
import {
  getSystemTheme,
  hideGlobalError,
  initUI,
  renderHistory,
  renderSkeletons,
  renderWeather,
  setLoading,
  setTheme,
  setUnitsLabel,
  showEmptyState,
  showGlobalError,
  showInputHint
} from "./ui.js";

const AppState = {
  ...getDefaultState(),
  ...loadState()
};

let currentUvData = null;

function persistState() {
  saveState(AppState);
}

function updateState(partial) {
  Object.assign(AppState, partial);
  persistState();
}

function normalizeHistory(city) {
  const clean = city.trim();
  const existing = AppState.searchHistory.filter((item) => item.toLowerCase() !== clean.toLowerCase());
  return [clean, ...existing].slice(0, 5);
}

async function renderFromState() {
  if (!AppState.currentData || !AppState.forecastData) {
    showEmptyState();
    return;
  }
  renderWeather(AppState, currentUvData);
}

async function fetchByCoords(lat, lon, cityLabel) {
  setLoading(true);
  renderSkeletons();

  try {
    const [currentData, forecastData, uvData] = await Promise.all([
      fetchCurrentWeatherByCoords(lat, lon, "metric"),
      fetchForecastByCoords(lat, lon, "metric"),
      fetchUvIndex(lat, lon).catch(() => null)
    ]);

    currentUvData = uvData;
    updateState({
      currentCity: cityLabel || currentData.name,
      currentData,
      forecastData,
      searchHistory: normalizeHistory(cityLabel || currentData.name)
    });

    hideGlobalError();
    renderHistory(AppState.searchHistory);
    renderWeather(AppState, currentUvData);
  } catch (error) {
    showGlobalError(mapApiError(error));
    if (!AppState.currentData) showEmptyState();
  } finally {
    setLoading(false);
  }
}

async function searchCity(city) {
  const trimmed = city.trim();
  if (!trimmed) {
    showInputHint("Please enter a city name.");
    return;
  }

  hideGlobalError();
  try {
    const location = await geocodeCity(trimmed);
    await fetchByCoords(location.lat, location.lon, location.name);
  } catch (error) {
    showGlobalError(mapApiError(error));
  }
}

function requestGeolocation() {
  if (!navigator.geolocation) {
    showGlobalError("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchByCoords(latitude, longitude);
    },
    () => {
      showGlobalError("Location access denied. Please enable geolocation and try again.");
    }
  );
}

function toggleUnits() {
  const nextUnits = AppState.units === "metric" ? "imperial" : "metric";
  updateState({ units: nextUnits });
  setUnitsLabel(nextUnits);
  if (AppState.currentData && AppState.forecastData) renderWeather(AppState, currentUvData);
}

function toggleTheme() {
  const nextTheme = AppState.theme === "dark" ? "light" : "dark";
  updateState({ theme: nextTheme });
  setTheme(nextTheme);
}

async function init() {
  const initialTheme = AppState.theme || getSystemTheme();
  updateState({
    theme: initialTheme,
    units: AppState.units || "metric"
  });

  setTheme(AppState.theme);
  setUnitsLabel(AppState.units);
  renderHistory(AppState.searchHistory);

  initUI({
    onSearch: searchCity,
    onGeolocation: requestGeolocation,
    onUnitsToggle: toggleUnits,
    onThemeToggle: toggleTheme,
    onHistorySearch: searchCity,
    onQuickCity: searchCity
  });

  await renderFromState();
}

init();
