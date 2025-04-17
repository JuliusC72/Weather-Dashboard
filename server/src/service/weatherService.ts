import dotenv from 'dotenv';
dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object
class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;

  constructor(city: string, date: string, icon: string, iconDescription: string, tempF: number, windSpeed: number, humidity: number) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

// Complete WeatherService class
class WeatherService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || 'https://api.openweathermap.org';
    this.apiKey = process.env.API_KEY || 'f04f26c1119cdccbb55194ff2bd29724'; // Fallback to provided key
  }

  // Create fetchLocationData method
  private async fetchLocationData(query: string): Promise<any> {
    const geocodeQuery = this.buildGeocodeQuery(query);
    try {
      const response = await fetch(geocodeQuery);
      if (!response.ok) {
        throw new Error(`Failed to fetch location data: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching location data:', error);
      throw error;
    }
  }

  // Create destructureLocationData method
  private destructureLocationData(locationData: any): Coordinates {
    if (!locationData || !locationData[0]) {
      throw new Error('Invalid location data');
    }
    return {
      lat: locationData[0].lat,
      lon: locationData[0].lon
    };
  }

  // Create buildGeocodeQuery method
  private buildGeocodeQuery(query: string): string {
    return `${this.baseURL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${this.apiKey}`;
  }

  // Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`;
  }

  // Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData);
  }

  // Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const weatherQuery = this.buildWeatherQuery(coordinates);
    try {
      const response = await fetch(weatherQuery);
      if (!response.ok) {
        throw new Error(`Failed to fetch weather data: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  // Build parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    const city = response.city.name;
    const currentData = response.list[0];
    const date = new Date(currentData.dt * 1000).toLocaleDateString();
    const icon = currentData.weather[0].icon;
    const iconDescription = currentData.weather[0].description;
    const tempF = Math.round(currentData.main.temp);
    const windSpeed = Math.round(currentData.wind.speed);
    const humidity = currentData.main.humidity;

    return new Weather(city, date, icon, iconDescription, tempF, windSpeed, humidity);
  }

  // Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any): Weather[] {
    const result: Weather[] = [currentWeather];
    const city = currentWeather.city;
    
    // For the 5-day forecast, we'll get data for noon each day
    // First, find all unique dates from the data
    const uniqueDates = new Set<string>();
    weatherData.list.forEach((data: any) => {
      const date = new Date(data.dt * 1000).toLocaleDateString();
      uniqueDates.add(date);
    });
    
    // Remove today's date to avoid duplication with current weather
    uniqueDates.delete(currentWeather.date);
    
    // Convert to array and take the first 5 dates
    const dates = Array.from(uniqueDates).slice(0, 5);
    
    // For each date, find the forecast closest to noon
    dates.forEach((date) => {
      const dayForecasts = weatherData.list.filter((data: any) => 
        new Date(data.dt * 1000).toLocaleDateString() === date
      );
      
      // Find forecast closest to noon
      let noonForecast = dayForecasts[0];
      let minTimeDiff = Infinity;
      
      dayForecasts.forEach((forecast: any) => {
        const forecastHour = new Date(forecast.dt * 1000).getHours();
        const timeDiff = Math.abs(12 - forecastHour);
        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff;
          noonForecast = forecast;
        }
      });
      
      const forecastDate = new Date(noonForecast.dt * 1000).toLocaleDateString();
      const icon = noonForecast.weather[0].icon;
      const iconDescription = noonForecast.weather[0].description;
      const tempF = Math.round(noonForecast.main.temp);
      const windSpeed = Math.round(noonForecast.wind.speed);
      const humidity = noonForecast.main.humidity;
      
      result.push(new Weather(city, forecastDate, icon, iconDescription, tempF, windSpeed, humidity));
    });
    
    return result;
  }

  // Complete getWeatherForCity method
  async getWeatherForCity(city: string): Promise<Weather[]> {
    try {
      const coordinates = await this.fetchAndDestructureLocationData(city);
      const weatherData = await this.fetchWeatherData(coordinates);
      const currentWeather = this.parseCurrentWeather(weatherData);
      return this.buildForecastArray(currentWeather, weatherData);
    } catch (error) {
      console.error('Error getting weather for city:', error);
      throw error;
    }
  }
}

// Create and export the service instance
const weatherService = new WeatherService();
export default weatherService;