import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

// Define the directory path for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define a City class with name and id properties
export class City {
  id: string;
  name: string;

  constructor(name: string, id: string = uuidv4()) {
    this.name = name;
    this.id = id;
  }
}

// Complete the HistoryService class
class HistoryService {
  private filePath: string;

  constructor() {
    // Path to searchHistory.json file
    this.filePath = path.join(__dirname, '../../db/searchHistory.json');
  }

  // Define a read method that reads from the searchHistory.json file
  private async read(): Promise<City[]> {
    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      
      try {
        const data = await fs.readFile(this.filePath, 'utf8');
        return JSON.parse(data);
      } catch (error) {
        // If file doesn't exist or is empty, create it with an empty array
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          await this.write([]);
          return [];
        }
        throw error;
      }
    } catch (error) {
      console.error('Error reading search history:', error);
      return [];
    }
  }

  // Define a write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]): Promise<void> {
    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      
      // Write data to file
      await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2), 'utf8');
    } catch (error) {
      console.error('Error writing search history:', error);
      throw error;
    }
  }

  // Define a getCities method that reads the cities from the searchHistory.json file
  async getCities(): Promise<City[]> {
    return await this.read();
  }

  // Define an addCity method that adds a city to the searchHistory.json file
  async addCity(cityName: string): Promise<City> {
    // Normalize city name (capitalize first letter of each word)
    const normalizedName = cityName
      .trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Read existing cities
    const cities = await this.read();
    
    // Check if city already exists
    const existingCity = cities.find(city => city.name.toLowerCase() === normalizedName.toLowerCase());
    if (existingCity) {
      return existingCity;
    }
    
    // Create new city object
    const newCity = new City(normalizedName);
    
    // Add to cities array and save
    cities.push(newCity);
    await this.write(cities);
    
    return newCity;
  }

  // Define a removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string): Promise<boolean> {
    const cities = await this.read();
    const initialLength = cities.length;
    
    // Filter out the city with the given id
    const updatedCities = cities.filter(city => city.id !== id);
    
    // If city was found and removed, save updated list
    if (updatedCities.length < initialLength) {
      await this.write(updatedCities);
      return true;
    }
    
    return false;
  }
}

// Create and export the service instance
const historyService = new HistoryService();
export default historyService;