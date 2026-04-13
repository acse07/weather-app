export function formatTemp(value, units) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return "--";
  }
  const normalized = units === "imperial" ? (Number(value) * 9) / 5 + 32 : Number(value);
  const rounded = Math.round(normalized);
  const symbol = units === "imperial" ? "°F" : "°C";
  return `${rounded}${symbol}`;
}

export function formatTime(unixTimestamp, offset = 0) {
  const date = new Date((unixTimestamp + offset) * 1000);
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC"
  }).format(date);
}

export function formatDate(unixTimestamp) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(new Date(unixTimestamp * 1000));
}

export function getWindDirection(degrees = 0) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(((degrees % 360) / 45)) % 8;
  return dirs[idx];
}

export function getWeatherBackground(weatherId, isDay) {
  if (weatherId >= 200 && weatherId < 300) return "thunderstorm";
  if (weatherId >= 300 && weatherId < 600) return "rain";
  if (weatherId >= 600 && weatherId < 700) return "snow";
  if (weatherId >= 700 && weatherId < 800) return "mist";
  if (weatherId === 800) return isDay ? "clear-day" : "clear-night";
  if (weatherId > 800) return "clouds";
  return "default";
}

export function getFlagEmoji(countryCode = "") {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
}

export function isDayTime(now, sunrise, sunset) {
  return now >= sunrise && now < sunset;
}

export function convertMsToMph(speed) {
  return speed * 2.23694;
}

export function getWindArrow(degrees = 0) {
  return `<span style="display:inline-block;transform:rotate(${degrees}deg)">↑</span>`;
}
