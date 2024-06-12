const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer=document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");

const loadingScreen = document.querySelector(".loading-container");

const userInfoContainer= document.querySelector(".user-info-container");


//initial variables needed 
let currentTab=userTab;
const API_KEY = "f22d8abadeacf9f94f59342c799b60e1";
currentTab.classList.add("current-tab");
getFromSessionStorage();

function switchTab(clickedTab){
    if(clickedTab != currentTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");   

        if(!searchForm.classList.contains("active")){

            //checked if search form is invisible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //we have to have the co-ordinates for our weather
            getFromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () =>{
    switchTab(userTab)
});


searchTab.addEventListener("click", () => {
  switchTab(searchTab);
});

//checks if coordinates are already present in session storage
function getFromSessionStorage(){
   const localCoordinates=sessionStorage.getItem("user-coordinates");
   if(!localCoordinates){
    //we have to have the co-ordinates for our weather
    grantAccessContainer.classList.add("active");
   }
   else{
    const coordinates=JSON.parse(localCoordinates);
    fetchUserWeatherInfoByCoordinates(coordinates);
   }
}

async function fetchUserWeatherInfoByCoordinates(coordinates){
    const {lat,lon}=coordinates;
    // make grantContainer invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");
    //API Call
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        //make loader invisible
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");
        console.log(err);
    }
}

function renderWeatherInfo(weatherInfo){
    //first fetch the element
    const cityName=document.querySelector("[data-cityName]");
    const countryIcon=document.querySelector("[data-countryIcon]"); 
    const desc=document.querySelector("[data-weatherDesc]");
    const weatherIcon=document.querySelector("[data-weatherIcon]");
    const temp=document.querySelector("[data-temp]");
    const windSpeed=document.querySelector("[data-windspeed]");
    const humidity=document.querySelector("[data-humidity]");
    const cloudiness=document.querySelector("[data-cloudiness]");

    //fetch values from WeatherInfo object and put it in UI object
    cityName.innerText=weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText=weatherInfo?.weather?.[0].description;
    weatherIcon.src=`http://openweathermap.org/img/wn/${weatherInfo?.weather?.[0].icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windSpeed.innerText=`${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText=`${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText=`${weatherInfo?.clouds?.all} %`;

}

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        alert("Geolocation is not supported by your browser");
    }
}
function showPosition(position){
    const userCoordinates= {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfoByCoordinates(userCoordinates);
}
const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchInput = document.querySelector("[data-searchInput]");
    let cityName =searchInput.value;
    if(cityName ===""){
        return;
    }
    fetchUserWeatherInfoByCity(cityName);
});

async function fetchUserWeatherInfoByCity(cityName){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try{
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
        );
        if (!response.ok) {
          throw new Error("City not found");
        }
        const data = await response.json();
        //make loader invisible
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");
        console.log(err);
    }
}