import React from 'react';
import { Trophy, TrendingUp, Medal } from 'lucide-react';

const leaderboardData = [
  { rank: 1, name: 'Trading Pro', returns: '+45.2%', profit: '$45,200' },
  { rank: 2, name: 'Market Wizard', returns: '+38.7%', profit: '$38,700' },
  { rank: 3, name: 'Smart Investor', returns: '+32.1%', profit: '$32,100' },
  { rank: 4, name: 'Value Seeker', returns: '+28.4%', profit: '$28,400' },
  { rank: 5, name: 'Risk Manager', returns: '+25.9%', profit: '$25,900' },
];

export function Leaderboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg p-6 text-white">
          <Trophy className="w-8 h-8 mb-2" />
          <div className="text-sm opacity-90">Top Performer</div>
          <div className="text-2xl font-bold">Trading Pro</div>
          <div className="mt-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            +45.2%
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg p-6 text-white">
          <Medal className="w-8 h-8 mb-2" />
          <div className="text-sm opacity-90">Runner Up</div>
          <div className="text-2xl font-bold">Market Wizard</div>
          <div className="mt-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            +38.7%
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg p-6 text-white">
          <Medal className="w-8 h-8 mb-2" />
          <div className="text-sm opacity-90">Third Place</div>
          <div className="text-2xl font-bold">Smart Investor</div>
          <div className="mt-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            +32.1%
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium">Top Performers</h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {leaderboardData.map((trader) => (
            <div
              key={trader.rank}
              className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    trader.rank === 1
                      ? 'bg-yellow-100 text-yellow-600'
                      : trader.rank === 2
                      ? 'bg-gray-100 text-gray-600'
                      : trader.rank === 3
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {trader.rank}
                </div>
                <div>
                  <div className="font-medium">{trader.name}</div>
                  <div className="text-sm text-gray-500">
                    Total Profit: {trader.profit}
                  </div>
                </div>
              </div>
              <div className="text-green-500 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                {trader.returns}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}