import { Router, Request, Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { cityName } = req.body;
    
    if (!cityName) {
      return res.status(400).json({ message: 'City name is required' });
    }
    
    // Add city to search history
    const city = await HistoryService.addCity(cityName);
    
    // Get weather data for the city
    const weatherData = await WeatherService.getWeatherForCity(city.name);
    
    return res.json(weatherData);
  } catch (error) {
    console.error('Error getting weather data:', error);
    return res.status(500).json({ message: 'Failed to get weather data' });
  }
});

// GET search history
router.get('/history', async (_req: Request, res: Response): Promise<Response> => {
  try {
    const cities = await HistoryService.getCities();
    return res.json(cities);
  } catch (error) {
    console.error('Error getting search history:', error);
    return res.status(500).json({ message: 'Failed to get search history' });
  }
});

// DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const success = await HistoryService.removeCity(id);
    
    if (success) {
      return res.json({ message: 'City removed from search history' });
    } else {
      return res.status(404).json({ message: 'City not found in search history' });
    }
  } catch (error) {
    console.error('Error removing city from search history:', error);
    return res.status(500).json({ message: 'Failed to remove city from search history' });
  }
});

export default router;