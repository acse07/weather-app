import {
  convertMsToMph,
  formatDate,
  formatTemp,
  formatTime,
  getFlagEmoji,
  getWeatherBackground,
  getWindArrow,
  getWindDirection,
  isDayTime
} from "./utils.js";

const els = {
  app: document.getElementById("app"),
  form: document.getElementById("search-form"),
  input: document.getElementById("city-input"),
  clearInput: document.getElementById("clear-input"),
  hint: document.getElementById("input-hint"),
  searchBtn: document.getElementById("search-btn"),
  geoBtn: document.getElementById("geo-btn"),
  unitsToggle: document.getElementById("units-toggle"),
  unitsLabel: document.getElementById("units-label"),
  themeToggle: document.getElementById("theme-toggle"),
  themeIcon: document.getElementById("theme-icon"),
  historyList: document.getElementById("history-list"),
  quickCities: document.getElementById("quick-cities"),
  emptyState: document.getElementById("empty-state"),
  globalError: document.getElementById("global-error"),
  weatherLayout: document.getElementById("weather-layout"),
  currentCard: document.getElementById("current-card"),
  hourlyCard: document.getElementById("hourly-card"),
  dailyCard: document.getElementById("daily-card")
};

export function initUI(handlers) {
  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    handlers.onSearch(els.input.value);
  });

  els.geoBtn.addEventListener("click", handlers.onGeolocation);
  els.unitsToggle.addEventListener("click", handlers.onUnitsToggle);
  els.themeToggle.addEventListener("click", handlers.onThemeToggle);

  els.input.addEventListener("input", () => {
    els.clearInput.classList.toggle("hidden", !els.input.value.trim());
    hideInputHint();
  });

  els.clearInput.addEventListener("click", () => {
    els.input.value = "";
    els.clearInput.classList.add("hidden");
    els.input.focus();
  });

  els.historyList.addEventListener("click", (event) => {
    const target = event.target.closest("[data-history-city]");
    if (!target) return;
    handlers.onHistorySearch(target.dataset.historyCity);
  });

  els.quickCities.addEventListener("click", (event) => {
    const target = event.target.closest("[data-city]");
    if (!target) return;
    handlers.onQuickCity(target.dataset.city);
  });
}

export function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function setTheme(theme) {
  els.app.dataset.theme = theme;
  els.themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
}

export function setUnitsLabel(units) {
  els.unitsLabel.textContent = units === "imperial" ? "°F" : "°C";
}

export function showInputHint(message) {
  els.hint.textContent = message;
  els.hint.classList.remove("hidden");
}

export function hideInputHint() {
  els.hint.classList.add("hidden");
  els.hint.textContent = "";
}

export function setLoading(isLoading) {
  els.searchBtn.disabled = isLoading;
  els.geoBtn.disabled = isLoading;
  els.input.disabled = isLoading;
}

export function renderHistory(cities) {
  if (!cities.length) {
    els.historyList.innerHTML = `<p class="meta-label">No recent searches yet.</p>`;
    return;
  }
  els.historyList.innerHTML = cities
    .map((city) => `<button type="button" class="history-chip" data-history-city="${city}">${city}</button>`)
    .join("");
}

export function showGlobalError(message) {
  els.globalError.textContent = message;
  els.globalError.classList.remove("hidden");
}

export function hideGlobalError() {
  els.globalError.classList.add("hidden");
  els.globalError.textContent = "";
}

export function renderSkeletons() {
  hideGlobalError();
  els.emptyState.classList.add("hidden");
  els.weatherLayout.classList.remove("hidden");

  els.currentCard.innerHTML = `
    <div class="skeleton" style="height:24px;width:60%"></div>
    <div class="skeleton" style="height:18px;width:38%;margin-top:10px"></div>
    <div class="skeleton" style="height:58px;width:42%;margin-top:16px"></div>
    <div class="meta-grid" style="margin-top:20px">
      ${new Array(6).fill('<div class="skeleton" style="height:54px"></div>').join("")}
    </div>
  `;

  els.hourlyCard.innerHTML = `
    <div class="skeleton" style="height:22px;width:34%"></div>
    <div class="hourly-strip">
      ${new Array(8).fill('<div class="skeleton" style="height:120px"></div>').join("")}
    </div>
  `;

  els.dailyCard.innerHTML = `
    <div class="skeleton" style="height:22px;width:42%"></div>
    <div class="daily-list">
      ${new Array(5).fill('<div class="skeleton" style="height:54px"></div>').join("")}
    </div>
  `;
}

function renderCurrent(currentData, units, uvData) {
  const weather = currentData.weather[0];
  const isDay = isDayTime(currentData.dt, currentData.sys.sunrise, currentData.sys.sunset);
  const speed = units === "imperial" ? convertMsToMph(currentData.wind.speed) : currentData.wind.speed;
  const speedUnit = units === "imperial" ? "mph" : "m/s";
  const visibilityKm = (currentData.visibility / 1000).toFixed(1);
  const flag = getFlagEmoji(currentData.sys.country);

  els.currentCard.innerHTML = `
    <div class="city-line">
      <h2>${currentData.name}, ${currentData.sys.country}</h2>
      <span>${flag}</span>
    </div>
    <p class="time">Local time: ${formatTime(currentData.dt, currentData.timezone)}</p>
    <div class="weather-main">
      <img src="https://openweathermap.org/img/wn/${weather.icon}@2x.png" alt="${weather.description}">
      <div>
        <p class="desc">${weather.description}</p>
        <p class="temp-main">${formatTemp(currentData.main.temp, units)}</p>
      </div>
    </div>
    <div class="meta-grid">
      <div class="meta-item"><p class="meta-label">Feels like</p><strong>${formatTemp(currentData.main.feels_like, units)}</strong></div>
      <div class="meta-item"><p class="meta-label">Min / Max</p><strong>${formatTemp(currentData.main.temp_min, units)} / ${formatTemp(currentData.main.temp_max, units)}</strong></div>
      <div class="meta-item"><p class="meta-label">Humidity</p><strong>${currentData.main.humidity}%</strong></div>
      <div class="meta-item"><p class="meta-label">Pressure</p><strong>${currentData.main.pressure} hPa</strong></div>
      <div class="meta-item"><p class="meta-label">Wind</p><strong>${speed.toFixed(1)} ${speedUnit} ${getWindArrow(currentData.wind.deg)} ${getWindDirection(currentData.wind.deg)}</strong></div>
      <div class="meta-item"><p class="meta-label">Visibility</p><strong>${visibilityKm} km</strong></div>
      <div class="meta-item"><p class="meta-label">UV index</p><strong>${uvData?.value ?? "N/A"}</strong></div>
      <div class="meta-item"><p class="meta-label">Sunrise</p><strong>${formatTime(currentData.sys.sunrise, currentData.timezone)}</strong></div>
      <div class="meta-item"><p class="meta-label">Sunset</p><strong>${formatTime(currentData.sys.sunset, currentData.timezone)}</strong></div>
    </div>
  `;

  const background = getWeatherBackground(weather.id, isDay);
  els.app.dataset.weatherBg = background;
}

function buildHourlyItems(forecastData) {
  return forecastData.list.slice(0, 8).map((item) => `
    <div class="hourly-item">
      <p>${formatTime(item.dt, forecastData.city.timezone)}</p>
      <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}">
      <p><strong>${formatTemp(item.main.temp, forecastData.units)}</strong></p>
      <p class="meta-label">Rain ${(item.pop * 100).toFixed(0)}%</p>
    </div>
  `).join("");
}

function buildDailyItems(forecastData, units) {
  const days = {};

  forecastData.list.forEach((item) => {
    const key = new Date((item.dt + forecastData.city.timezone) * 1000).toISOString().slice(0, 10);
    if (!days[key]) {
      days[key] = {
        dt: item.dt,
        tempMin: item.main.temp_min,
        tempMax: item.main.temp_max,
        pop: item.pop,
        icon: item.weather[0].icon
      };
    } else {
      days[key].tempMin = Math.min(days[key].tempMin, item.main.temp_min);
      days[key].tempMax = Math.max(days[key].tempMax, item.main.temp_max);
      if (item.pop > days[key].pop) days[key].pop = item.pop;
      const hour = Number(item.dt_txt.split(" ")[1].slice(0, 2));
      if (hour >= 12 && hour <= 15) days[key].icon = item.weather[0].icon;
    }
  });

  return Object.values(days).slice(0, 5).map((day) => `
    <div class="daily-item">
      <p>${formatDate(day.dt)}</p>
      <img src="https://openweathermap.org/img/wn/${day.icon}.png" alt="Daily weather icon">
      <p><strong>${formatTemp(day.tempMax, units)} / ${formatTemp(day.tempMin, units)}</strong></p>
      <p class="meta-label">${(day.pop * 100).toFixed(0)}%</p>
    </div>
  `).join("");
}

function renderHourly(forecastData) {
  els.hourlyCard.innerHTML = `
    <h3>Next 24 hours</h3>
    <div class="hourly-strip">${buildHourlyItems(forecastData)}</div>
  `;
}

function renderDaily(forecastData, units) {
  els.dailyCard.innerHTML = `
    <h3>5-day forecast</h3>
    <div class="daily-list">${buildDailyItems(forecastData, units)}</div>
  `;
}

export function renderWeather(state, uvData) {
  hideGlobalError();
  els.emptyState.classList.add("hidden");
  els.weatherLayout.classList.remove("hidden");
  renderCurrent(state.currentData, state.units, uvData);
  renderHourly({ ...state.forecastData, units: state.units });
  renderDaily(state.forecastData, state.units);
}

export function showEmptyState() {
  els.emptyState.classList.remove("hidden");
  els.weatherLayout.classList.add("hidden");
}
