import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SentimentService {
  constructor() {
    // Store sentiment data as JSON
    this.sentimentFilePath = path.resolve(__dirname, '../data/sentiment.json');
  }

  // Calculate sentiment score from positives and negatives
  calculateSentiment(positives, negatives) {
    const posCount = positives.length;
    const negCount = negatives.length;
    const total = posCount + negCount;
    
    if (total === 0) return 0;
    
    const sentiment = (posCount - negCount) / total;
    
    // IMPORTANT: Ensure it returns a plain number, not an object
    return Number(sentiment);
  }

  // Save sentiment data for a specific month
  async saveSentiment(year, month, positives, negatives) {
    try {
      const sentiment = this.calculateSentiment(positives, negatives);
      
      // Verify it's a number
      if (typeof sentiment !== 'number' || isNaN(sentiment)) {
        console.error('Invalid sentiment value:', sentiment);
        throw new Error('Sentiment must be a number');
      }
      
      // Read existing data
      let data = {};
      try {
        const fileContent = await fs.readFile(this.sentimentFilePath, 'utf-8');
        data = JSON.parse(fileContent);
      } catch (error) {
        // File doesn't exist yet, start fresh
        console.log('Creating new sentiment data file');
      }

      // Update data structure
      if (!data[year]) {
        data[year] = {};
      }

      data[year][month] = {
        sentiment: sentiment,  // Plain number
        positiveCount: positives.length,
        negativeCount: negatives.length,
        lastUpdated: new Date().toISOString()
      };

      // Save back to file
      await fs.writeFile(this.sentimentFilePath, JSON.stringify(data, null, 2));
      
      console.log(`✅ Saved sentiment for ${month} ${year}: ${sentiment.toFixed(2)} (type: ${typeof sentiment})`);
      return sentiment;
    } catch (error) {
      console.error('Error saving sentiment:', error);
      throw error;
    }
  }

  // Get sentiment data for a year
  async getYearSentiment(year) {
    try {
      const fileContent = await fs.readFile(this.sentimentFilePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      const yearData = data[year] || {};
      
      // Ensure all sentiment values are numbers
      Object.keys(yearData).forEach(month => {
        if (typeof yearData[month].sentiment !== 'number') {
          console.warn(`Converting sentiment for ${month} from ${typeof yearData[month].sentiment} to number`);
          yearData[month].sentiment = Number(yearData[month].sentiment) || 0;
        }
      });
      
      return yearData;
    } catch (error) {
      console.log('No sentiment data found for year:', year);
      return {};
    }
  }

  // Get all years' sentiment data
  async getAllSentiment() {
    try {
      const fileContent = await fs.readFile(this.sentimentFilePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      return {};
    }
  }
}

export default new SentimentService();