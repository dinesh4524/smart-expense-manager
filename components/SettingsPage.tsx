
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import Card from './ui/Card';
import Button from './ui/Button';
import { Moon, Sun, Download, Upload } from 'lucide-react';

interface SettingsPageProps {
  theme: string;
  toggleTheme: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ theme, toggleTheme }) => {
  const { settings, updateSettings, expenses, categories, people } = useAppContext();

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ currency: e.target.value });
  };
  
  const handleExportData = () => {
    const data = {
        expenses,
        categories,
        people,
        settings
    };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "expense-manager-backup.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const text = e.target?.result;
              if (typeof text !== 'string') throw new Error("Invalid file content");
              const importedData = JSON.parse(text);
              
              // Basic validation
              if (importedData.expenses && importedData.categories && importedData.people && importedData.settings) {
                  localStorage.setItem('expenses', JSON.stringify(importedData.expenses));
                  localStorage.setItem('categories', JSON.stringify(importedData.categories));
                  localStorage.setItem('people', JSON.stringify(importedData.people));
                  localStorage.setItem('settings', JSON.stringify(importedData.settings));
                  alert("Data imported successfully! Please refresh the page.");
                  window.location.reload();
              } else {
                  alert("Invalid backup file format.");
              }
          } catch (error) {
              alert("Error importing data. Please check the file format.");
              console.error("Import error:", error);
          }
      };
      reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold">Settings</h2>
      
      <Card>
        <h3 className="text-lg font-semibold mb-4">Appearance</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="currency-select" className="font-medium">Currency Symbol</label>
            <select
              id="currency-select"
              value={settings.currency}
              onChange={handleCurrencyChange}
              className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="$">USD ($)</option>
              <option value="€">EUR (€)</option>
              <option value="£">GBP (£)</option>
              <option value="₹">INR (₹)</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Theme</span>
            <Button variant="secondary" onClick={toggleTheme} className="w-24">
              {theme === 'light' ? <Sun className="mr-2" size={18} /> : <Moon className="mr-2" size={18} />}
              {theme === 'light' ? 'Light' : 'Dark'}
            </Button>
          </div>
        </div>
      </Card>
      
      <Card>
        <h3 className="text-lg font-semibold mb-4">Data Management</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <Button onClick={handleExportData} className="w-full">
            <Download size={18} className="mr-2" />
            Export All Data (JSON)
          </Button>
          <Button as="label" variant="secondary" className="w-full cursor-pointer">
            <Upload size={18} className="mr-2" />
            Import Data (JSON)
            <input type="file" accept=".json" className="hidden" onChange={handleImportData} />
          </Button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Importing data will overwrite all existing expenses, categories, and people. It's recommended to export your current data as a backup first.
        </p>
      </Card>
    </div>
  );
};

export default SettingsPage;
