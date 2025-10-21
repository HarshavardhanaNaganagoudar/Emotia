import ollamaService from '../services/ollama.service.js';
import entryService from '../services/entry.service.js';
import sentimentService from '../services/sentiment.service.js';

class MonthController {
  async getMonthSummary(req, res) {
    try {
      const { year, month } = req.params;
      
      if (!year || !month) {
        return res.status(400).json({ error: 'Year and month are required' });
      }

      const entries = await entryService.getEntriesForMonth(parseInt(year), month);
      
      if (entries.length === 0) {
        return res.json({
          year: parseInt(year),
          month,
          positives: ['No entries found for this month'],
          negatives: [],
          entryCount: 0,
          sentiment: 0
        });
      }

      const summary = await ollamaService.generateSummary(entries, month, year);
      
      // Calculate and save sentiment
      const sentiment = await sentimentService.saveSentiment(
        parseInt(year),
        month,
        summary.positives,
        summary.negatives
      );
      
      res.json({
        year: parseInt(year),
        month,
        positives: summary.positives,
        negatives: summary.negatives,
        entryCount: entries.length,
        sentiment
      });
    } catch (error) {
      console.error('Error in getMonthSummary:', error);
      res.status(500).json({ error: 'Failed to generate month summary' });
    }
  }

  async getMonthEntries(req, res) {
    try {
      const { year, month } = req.params;
      
      const entries = await entryService.getEntriesForMonth(parseInt(year), month);
      
      res.json({
        year: parseInt(year),
        month,
        entries,
        count: entries.length
      });
    } catch (error) {
      console.error('Error in getMonthEntries:', error);
      res.status(500).json({ error: 'Failed to fetch entries' });
    }
  }

  async getYearStatus(req, res) {
    try {
      const { year } = req.params;
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];
      
      const monthStatus = await Promise.all(
        months.map(async (month) => {
          const entries = await entryService.getEntriesForMonth(parseInt(year), month);
          return {
            month,
            hasEntries: entries.length > 0,
            entryCount: entries.length
          };
        })
      );
      
      res.json({
        year: parseInt(year),
        months: monthStatus
      });
    } catch (error) {
      console.error('Error in getYearStatus:', error);
      res.status(500).json({ error: 'Failed to fetch year status' });
    }
  }

  // NEW: Get sentiment data for mood graph
  // Get sentiment data for mood graph
async getYearSentiment(req, res) {
  try {
    const { year } = req.params;
    const sentimentData = await sentimentService.getYearSentiment(parseInt(year));
    
    // Format for graph
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    const graphData = months.map(month => {
      const monthData = sentimentData[month];
      
      // Use nullish coalescing to preserve 0 values
      const sentimentValue = monthData?.sentiment ?? null;
      
      return {
        month: month.substring(0, 3), // Abbreviate
        fullMonth: month,
        sentiment: sentimentValue,
        positiveCount: monthData?.positiveCount || 0,
        negativeCount: monthData?.negativeCount || 0,
        hasData: !!monthData
      };
    });
    
    // Debug logging
    console.log('📊 Sending sentiment data for year', year);
    graphData.filter(d => d.hasData).forEach(d => {
      console.log(`  ${d.fullMonth}: sentiment=${d.sentiment} (type: ${typeof d.sentiment}), pos=${d.positiveCount}, neg=${d.negativeCount}`);
    });
    
    res.json({
      year: parseInt(year),
      data: graphData
    });
  } catch (error) {
    console.error('Error in getYearSentiment:', error);
    res.status(500).json({ error: 'Failed to fetch sentiment data' });
  }
}

  async createEntry(req, res) {
    try {
      const { year, month, day, content } = req.body;
      
      if (!year || !month || !day || !content) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const result = await entryService.createEntry(year, month, day, content);
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Error in createEntry:', error);
      res.status(500).json({ error: 'Failed to create entry' });
    }
  }
}

export default new MonthController();