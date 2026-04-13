const API_KEY = "1792ffe7d9cedbe7f924a270d5a2dc14"; // Get a free API key at https://openweathermap.org/
const WEATHER_BASE = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_BASE = "https://api.openweathermap.org/data/2.5/forecast";
const GEO_BASE = "https://api.openweathermap.org/geo/1.0/direct";
const UV_BASE = "https://api.openweathermap.org/data/2.5/uvi";

async function request(url) {
  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    const networkError = new Error("Network error. Please check your internet connection.");
    networkError.status = 0;
    throw networkError;
  }

  if (!response.ok) {
    const error = new Error("Request failed.");
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export async function geocodeCity(cityName) {
  const url = `${GEO_BASE}?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`;
  const data = await request(url);
  if (!data.length) {
    const error = new Error("City not found.");
    error.status = 404;
    throw error;
  }
  return data[0];
}

export async function fetchCurrentWeatherByCoords(lat, lon, units) {
  const url = `${WEATHER_BASE}?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
  return request(url);
}

export async function fetchCurrentWeatherByCity(cityName, units) {
  const geo = await geocodeCity(cityName);
  return fetchCurrentWeatherByCoords(geo.lat, geo.lon, units);
}

export async function fetchForecastByCoords(lat, lon, units) {
  const url = `${FORECAST_BASE}?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
  return request(url);
}

export async function fetchUvIndex(lat, lon) {
  const url = `${UV_BASE}?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  return request(url);
}

export function mapApiError(error) {
  const { status } = error;
  if (status === 404) return "City not found. Please try another search.";
  if (status === 401) return "Invalid API key. Update YOUR_API_KEY in js/api.js.";
  if (status === 429) return "Rate limit reached. Please try again shortly.";
  if (status === 0) return error.message;
  return "Something went wrong while fetching weather data.";
}
