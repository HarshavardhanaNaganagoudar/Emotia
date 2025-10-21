const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  async getMonthSummary(year, month) {
    try {
      const response = await fetch(`${API_BASE_URL}/months/${year}/${month}/summary`);
      if (!response.ok) {
        throw new Error('Failed to fetch month summary');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching month summary:', error);
      throw error;
    }
  }

  async getMonthEntries(year, month) {
    try {
      const response = await fetch(`${API_BASE_URL}/months/${year}/${month}/entries`);
      if (!response.ok) {
        throw new Error('Failed to fetch month entries');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching month entries:', error);
      throw error;
    }
  }

  async createEntry(year, month, day, content) {
    try {
      const response = await fetch(`${API_BASE_URL}/months/entry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ year, month, day, content }),
      });
      if (!response.ok) {
        throw new Error('Failed to create entry');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating entry:', error);
      throw error;
    }
  }
}

export default new ApiService();