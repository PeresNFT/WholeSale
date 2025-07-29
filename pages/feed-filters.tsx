import { useState } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const FeedFilters = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

  const categories = [
    'Meditation',
    'Exercise',
    'Reading',
    'Writing',
    'Nutrition',
    'Sleep',
    'Mindfulness',
    'Productivity',
    'Creativity',
    'Social',
  ];

  const timeframes = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
  ];

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-[#141414] ${inter.className}`}>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-black dark:text-white">Feed Filters</h1>
        
        {/* Categories Section */}
        <div className="bg-white dark:bg-[#1c1c1c] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategories.includes(category)
                    ? 'bg-[#d6fc37] text-black'
                    : 'bg-gray-200 dark:bg-[#262626] text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#333333]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Timeframe Section */}
        <div className="bg-white dark:bg-[#1c1c1c] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Timeframe</h2>
          <div className="flex flex-wrap gap-3">
            {timeframes.map((timeframe) => (
              <button
                key={timeframe.id}
                onClick={() => setSelectedTimeframe(timeframe.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTimeframe === timeframe.id
                    ? 'bg-[#d6fc37] text-black'
                    : 'bg-gray-200 dark:bg-[#262626] text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#333333]'
                }`}
              >
                {timeframe.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {(selectedCategories.length > 0 || selectedTimeframe !== 'all') && (
          <div className="bg-white dark:bg-[#1c1c1c] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Active Filters</h2>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-[#d6fc37] text-black rounded-full text-sm font-medium"
                >
                  {category}
                </span>
              ))}
              {selectedTimeframe !== 'all' && (
                <span className="px-3 py-1 bg-[#d6fc37] text-black rounded-full text-sm font-medium">
                  {timeframes.find(t => t.id === selectedTimeframe)?.label}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedFilters; 