import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EntryService {
  constructor() {
    // Use absolute path from project root
    this.dataPath = path.resolve(__dirname, '../data/entries');
    console.log('📁 Data path:', this.dataPath);
  }

  async getEntriesForMonth(year, month) {
    try {
      console.log(`🔍 Looking for entries: ${year} ${month}`);
      
      // Convert month name to number (0-11)
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const monthIndex = monthNames.indexOf(month);
      
      if (monthIndex === -1) {
        throw new Error('Invalid month name');
      }

      // Check if directory exists
      try {
        await fs.access(this.dataPath);
      } catch (error) {
        console.error('❌ Data directory does not exist:', this.dataPath);
        return [];
      }

      // Read all files in the entries directory
      const files = await fs.readdir(this.dataPath);
      console.log('📄 Files found:', files);
      
      // Filter files for the specific month and year
      const entries = [];
      
      for (const file of files) {
        if (!file.endsWith('.txt')) continue;
        
        // Parse filename (format: YYYY-MM-DD.txt)
        const match = file.match(/^(\d{4})-(\d{2})-(\d{2})\.txt$/);
        if (!match) {
          console.log('⚠️  Skipping invalid filename:', file);
          continue;
        }
        
        const [, fileYear, fileMonth, fileDay] = match;
        
        console.log(`Checking: ${file} -> Year: ${fileYear}, Month: ${fileMonth}, Day: ${fileDay}`);
        
        if (parseInt(fileYear) === year && parseInt(fileMonth) === monthIndex + 1) {
          const filePath = path.join(this.dataPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          
          entries.push({
            date: `${fileYear}-${fileMonth}-${fileDay}`,
            content: content.trim()
          });
          
          console.log('✅ Added entry:', file);
        }
      }
      
      // Sort entries by date
      entries.sort((a, b) => a.date.localeCompare(b.date));
      
      console.log(`📊 Found ${entries.length} entries for ${month} ${year}`);
      return entries;
    } catch (error) {
      console.error('❌ Error reading entries:', error);
      throw error;
    }
  }

  async createEntry(year, month, day, content) {
    try {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const monthIndex = monthNames.indexOf(month) + 1;
      
      const paddedMonth = monthIndex.toString().padStart(2, '0');
      const paddedDay = day.toString().padStart(2, '0');
      const filename = `${year}-${paddedMonth}-${paddedDay}.txt`;
      
      const filePath = path.join(this.dataPath, filename);
      await fs.writeFile(filePath, content, 'utf-8');
      
      console.log('✅ Created entry:', filename);
      return { success: true, filename };
    } catch (error) {
      console.error('❌ Error creating entry:', error);
      throw error;
    }
  }
}

export default new EntryService();