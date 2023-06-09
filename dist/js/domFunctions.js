export const setPlaceholderText = () => {
  const input = document.getElementById("searchBar__text");
  window.innerWidth < 400
    ? (input.placeholder = "City, State, Country")
    : (input.placeholder = "City, State, Country or Zip Code");
};

export const addSpinner = (icon) => {
  animateButton(icon);
  setTimeout(animateButton, 1000, icon);
};

const animateButton = (element) => {
  element.classList.toggle("none");
  element.nextElementSibling.classList.toggle("block");
  element.nextElementSibling.classList.toggle("none");
};

export const displayError = (headerMessage, screenReaderMessage) => {
  updateWeatherLocationHeader(headerMessage);
  updateScreenReaderConfirmation(screenReaderMessage);
};

export const displayApiError = (statusCode) => {
  const properMessage = toProperCase(statusCode.message);
  updateWeatherLocationHeader(properMessage);
  updateScreenReaderConfirmation(`${properMessage}. Please try again.`);
  // console.error()
};

const toProperCase = (text) => {
  const words = text.split(" ");
  const properWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  );
  return properWords.join(" ");
};

const updateWeatherLocationHeader = (message) => {
  const h1 = document.getElementById("currentForecast__location");
  if (message.indexOf("Lat:") !== -1 && message.indexOf("Long:") !== -1) {
    let messageArray = message.split(" ");
    messageArray = [messageArray[0], messageArray[1] + messageArray[2]];

    const mapArray = messageArray.map((msg) => msg.replace(":", ": "));
    const lat =
      mapArray[0].indexOf("-") === -1
        ? mapArray[0].slice(0, 10)
        : mapArray[0].slice(0, 11);
    const lon =
      mapArray[1].indexOf("-") === -1
        ? mapArray[1].slice(0, 11)
        : mapArray[1].slice(0, 12);
    h1.textContent = `${lat} • ${lon}`;
  } else {
    h1.textContent = message;
  }
};
export const updateScreenReaderConfirmation = (message) => {
  document.getElementById("confirmation").textContent = message;
};

export const updateDisplay = (weatherJson, locationObj) => {
  fadeDisplay();
  clearDisplay();
  const weatherClass = getWeatherClass(weatherJson.current.weather[0].icon);
  setBackgroundImage(weatherClass);
  const screenReaderWeather = buildScreenReaderWeather(
    weatherJson,
    locationObj
  );
  updateScreenReaderConfirmation(screenReaderWeather);
  updateWeatherLocationHeader(locationObj.getName());
  const currentConditionsArray = createCurrentConditionsDivs(
    weatherJson,
    locationObj.getUnit()
  );

  displayCurrentConditions(currentConditionsArray);
  displaySixDayForecast(weatherJson);

  setFocusOnSearch();

  fadeDisplay();
};

const fadeDisplay = () => {
  const currentConditions = document.getElementById("currentForecast");
  currentConditions.classList.toggle("zero-vis");
  currentConditions.classList.toggle("fade-in");

  const sixDayForecast = document.getElementById("dailyForecast");
  sixDayForecast.classList.toggle("zero-vis");
  sixDayForecast.classList.toggle("fade-in");
};

const clearDisplay = () => {
  const currentConditions = document.getElementById(
    "currentForecast__conditions"
  );
  deleteContents(currentConditions);

  const sixDayForecast = document.getElementById("dailyForecast__contents");
  deleteContents(sixDayForecast);
};

const deleteContents = (parentElement) => {
  let child = parentElement.lastElementChild;
  while (child) {
    parentElement.removeChild(child);
    child = parentElement.lastElementChild;
  }
};

const getWeatherClass = (icon) => {
  const firstTwoChars = icon.slice(0, 2);
  const lastChar = icon.slice(2);
  const weatherLookup = {
    "09": "snow",
    10: "rain",
    11: "rain",
    13: "snow",
    50: "fog",
  };

  let weatherClass;
  if (weatherLookup[firstTwoChars]) {
    weatherClass = weatherLookup[firstTwoChars];
  } else if (lastChar === "d") {
    weatherClass = "clouds";
  } else {
    weatherClass = "night";
  }

  return weatherClass;
};

const setBackgroundImage = (weatherClass) => {
  document.documentElement.classList.add(weatherClass);
  document.documentElement.classList.forEach((image) => {
    if (image !== weatherClass)
      document.documentElement.classList.remove(image);
  });
};

const buildScreenReaderWeather = (weatherJson, locationObj) => {
  const location = locationObj.getName();
  const unit = locationObj.getUnit();
  const tempUnit = unit === "imperial" ? "Fahrenheit" : "Celcius";
  return `${weatherJson.current.weather[0].description} and ${Math.round(
    Number(weatherJson.current.temp)
  )}°${tempUnit} in ${location}`;
};

const setFocusOnSearch = () =>
  document.getElementById("searchBar__text").focus();

const createCurrentConditionsDivs = (weatherObj, unit) => {
  const tempUnit = unit === "imperial" ? "F" : "C";
  const windUnit = unit === "imperial" ? "mph" : "m/s";
  const icon = createMainImageDiv(
    weatherObj.current.weather[0].icon,
    weatherObj.current.weather[0].description
  );
  const temp = createElement(
    "div",
    "temp",
    `${Math.round(Number(weatherObj.current.temp))}°`,
    tempUnit
  );
  const properDescription = toProperCase(
    weatherObj.current.weather[0].description
  );
  const desc = createElement("div", "desc", properDescription);
  const feels = createElement(
    "div",
    "feels",
    `Feels Like ${Math.round(Number(weatherObj.current.feels_like))}°`
  );
  const maxTemp = createElement(
    "div",
    "maxtemp",
    `High ${Math.round(Number(weatherObj.daily[0].temp.max))}°`
  );
  const minTemp = createElement(
    "div",
    "mintemp",
    `Low ${Math.round(Number(weatherObj.daily[0].temp.min))}°`
  );
  const humidity = createElement(
    "div",
    "humidity",
    `Humidity ${Math.round(Number(weatherObj.current.humidity))}%`
  );
  const wind = createElement(
    "div",
    "wind",
    `Wind ${Math.round(Number(weatherObj.current.wind_speed))} ${windUnit}`
  );

  return [icon, temp, desc, feels, maxTemp, minTemp, humidity, wind];
};

const createMainImageDiv = (icon, altText) => {
  const iconDiv = createElement("div", "icon");
  iconDiv.id = "icon";
  const faIcon = translateIconToFontAwesome(icon);
  faIcon.ariaHidden = true;
  faIcon.title = altText;
  iconDiv.appendChild(faIcon);
  return iconDiv;
};

const createElement = (elementType, divClassName, divText, unit) => {
  const div = document.createElement(elementType);
  div.className = divClassName;
  if (divText) {
    div.textContent = divText;
  }
  if (divClassName === "temp") {
    const unitDiv = document.createElement("div");
    unitDiv.classList.add("unit");
    unitDiv.textContent = unit;
    div.appendChild(unitDiv);
  }
  return div;
};

const translateIconToFontAwesome = (icon) => {
  const i = document.createElement("i");
  const firstTwoChars = icon.slice(0, 2);
  const lastChar = icon.slice(2);
  switch (firstTwoChars) {
    case "01":
      if (lastChar === "d") {
        i.classList.add("far", "fa-sun");
      } else {
        i.classList.add("far", "fa-moon");
      }
      break;
    case "02":
      if (lastChar === "d") {
        i.classList.add("fas", "fa-cloud-sun");
      } else {
        i.classList.add("fas", "fa-cloud-moon");
      }
      break;
    case "03":
      i.classList.add("fas", "fa-cloud");
      break;
    case "04":
      i.classList.add("fas", "fa-cloud-meatball");
      break;
    case "09":
      i.classList.add("fas", "fa-cloud-rain");
      break;
    case "10":
      if (lastChar === "d") {
        i.classList.add("fas", "fa-cloud-sun-rain");
      } else {
        i.classList.add("fas", "fa-cloud-moon-rain");
      }
      break;
    case "11":
      i.classList.add("fas", "fa-poo-storm");
      break;
    case "13":
      i.classList.add("far", "fa-snowflake");
      break;
    case "50":
      i.classList.add("fas", "fa-smog");
      break;
    default:
      i.classList.add("far", "fa-question-circle");
  }
  return i;
};

const displayCurrentConditions = (currentConditionsArray) => {
  const currentConditionsContainer = document.getElementById(
    "currentForecast__conditions"
  );
  currentConditionsArray.forEach((currentCondition) => {
    currentConditionsContainer.appendChild(currentCondition);
  });
};

const displaySixDayForecast = (weatherJson) => {
  for (let i = 1; i <= 6; i++) {
    const dailyForecastArray = createDailyForecastDivs(weatherJson.daily[i]);
    displayDailyForecast(dailyForecastArray);
  }
};

const createDailyForecastDivs = (dayWeather) => {
  const dayAbbreviationText = getDayAbbreviation(dayWeather.dt);
  const dayAbbreviation = createElement(
    "p",
    "dayAbbreviation",
    dayAbbreviationText
  );
  const dayIcon = createDailyForecastIcon(
    dayWeather.weather[0].icon,
    dayWeather.weather[0].description
  );

  const dayHigh = createElement(
    "p",
    "dayHigh",
    `${Math.round(Number(dayWeather.temp.max))}°`
  );
  const dayLow = createElement(
    "p",
    "dayLow",
    `${Math.round(Number(dayWeather.temp.min))}°`
  );

  return [dayAbbreviation, dayIcon, dayHigh, dayLow];
};

const getDayAbbreviation = (data) => {
  const dateObj = new Date(data * 1000);
  const utcString = dateObj.toUTCString();
  return utcString.slice(0, 3).toUpperCase();
};

const createDailyForecastIcon = (icon, altText) => {
  const img = createElement("img");
  if (window.innerWidth < 768 || window.innerHeight < 1025) {
    img.src = `https://openweathermap.org/img/wn/${icon}.png`;
  } else {
    img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }
  img.alt = altText;
  return img;
};

const displayDailyForecast = (dailyForecastArray) => {
  const dayDiv = createElement("div", "forecastDay");
  dailyForecastArray.forEach((element) => dayDiv.appendChild(element));
  const dailyForecastContainer = document.getElementById(
    "dailyForecast__contents"
  );
  dailyForecastContainer.appendChild(dayDiv);
};
