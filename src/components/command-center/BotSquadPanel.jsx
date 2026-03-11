import React, { useState } from 'react';
import { useCommandCenter } from '@/hooks/useCommandCenter';

const BOT_PERSONAS = [
  { id: 'bb-parent-jake', email: 'jake.dad@sportsphere.app', name: 'Mike Thompson', role: 'parent', sport: 'Baseball' },
  { id: 'bb-parent-emma', email: 'emma.mom@sportsphere.app', name: 'Sarah Collins', role: 'parent', sport: 'Baseball' },
  { id: 'bb-parent-aiden', email: 'aiden.dad@sportsphere.app', name: 'James Rivera', role: 'parent', sport: 'Baseball' },
  { id: 'bb-parent-mia', email: 'mia.mom@sportsphere.app', name: 'Lisa Chen', role: 'parent', sport: 'Baseball' },
  { id: 'bb-parent-tyler', email: 'tyler.dad@sportsphere.app', name: 'David Martinez', role: 'parent', sport: 'Baseball' },
  { id: 'sb-parent-riley', email: 'riley.mom@sportsphere.app', name: 'Jennifer Wright', role: 'parent', sport: 'Softball' },
  { id: 'bb-parent-noah', email: 'noah.dad@sportsphere.app', name: 'Chris Johnson', role: 'parent', sport: 'Baseball' },
  { id: 'bb-parent-chloe', email: 'chloe.mom@sportsphere.app', name: 'Amanda Torres', role: 'parent', sport: 'Baseball' },
  { id: 'bb-college-pitcher', email: 'marcus.bb@sportsphere.app', name: 'Marcus Williams', role: 'athlete', sport: 'Baseball' },
  { id: 'bb-minor-outfielder', email: 'derek.bb@sportsphere.app', name: 'Derek Santos', role: 'athlete', sport: 'Baseball' },
  { id: 'bk-adult-athlete', email: 'jaylen.bk@sportsphere.app', name: 'Jaylen Carter', role: 'athlete', sport: 'Basketball' },
  { id: 'bk-parent-youth', email: 'jordan.bkmom@sportsphere.app', name: 'Keisha Williams', role: 'parent', sport: 'Basketball' },
  { id: 'bk-coach', email: 'coach.davis.bk@sportsphere.app', name: 'Coach Marcus Davis', role: 'coach', sport: 'Basketball' },
  { id: 'bk-youth-org', email: 'hoops-academy@sportsphere.app', name: 'Midwest Hoops Academy', role: 'organization', sport: 'Basketball' },
  { id: 'bk-fan', email: 'hoopsfan23@sportsphere.app', name: 'Marcus Bell', role: 'fan', sport: 'Basketball' },
  { id: 'fb-adult-athlete', email: 'trevon.fb@sportsphere.app', name: 'Trevon Jackson', role: 'athlete', sport: 'Football' },
  { id: 'fb-parent-youth', email: 'cam.fbdad@sportsphere.app', name: 'Robert Mitchell', role: 'parent', sport: 'Football' },
  { id: 'fb-coach', email: 'coach.williams.fb@sportsphere.app', name: 'Coach Ray Williams', role: 'coach', sport: 'Football' },
  { id: 'fb-fan', email: 'gridiron.guru@sportsphere.app', name: 'Tony Morales', role: 'fan', sport: 'Football' },
  { id: 'sc-athlete', email: 'diego.sc@sportsphere.app', name: 'Diego Herrera', role: 'athlete', sport: 'Soccer' },
  { id: 'sc-parent-youth', email: 'sofia.scmom@sportsphere.app', name: 'Maria Gonzalez', role: 'parent', sport: 'Soccer' },
  { id: 'sc-coach', email: 'coach.alex.sc@sportsphere.app', name: 'Coach Alex Petrov', role: 'coach', sport: 'Soccer' },
  { id: 'gen-multi-parent', email: 'multisport.mom@sportsphere.app', name: 'Rachel Kim', role: 'parent', sport: 'Multi' },
  { id: 'gen-sports-fan', email: 'allsports.mike@sportsphere.app', name: 'Mike Patterson', role: 'fan', sport: 'Multi' },
  { id: 'gen-news-org', email: 'sports-daily@sportsphere.app', name: 'Sports Daily Network', role: 'organization', sport: 'All' },
];

const SPORT_COLORS = {
  Baseball: 'bg-red-500/20 text-red-300',
  Softball: 'bg-pink-500/20 text-pink-300',
  Basketball: 'bg-orange-500/20 text-orange-300',
  Football: 'bg-green-500/20 text-green-300',
  Soccer: 'bg-blue-500/20 text-blue-300',
  Multi: 'bg-purple-500/20 text-purple-300',
  All: 'bg-gray-500/20 text-gray-300',
};

const ROLE_ICONS = { parent: '👨‍👧', athlete: '🏃', coach: '📋', organization: '🏢', fan: '📣' };

export default function BotSquadPanel() {
  const { data, loading, refresh } = useCommandCenter({ section: 'bots' });
  const [selectedBot, setSelectedBot] = useState(null);
  const [filter, setFilter] = useState('all');

  const stats = data.stats || { activityByBot: {}, activityByType: {}, successCount: 0, errorCount: 0, total: 0 };

  const filteredBots = filter === 'all'
    ? BOT_PERSONAS
    : filter === 'general'
    ? BOT_PERSONAS.filter(b => ['Multi', 'All'].includes(b.sport))
    : BOT_PERSONAS.filter(b => b.sport.toLowerCase() === filter);

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/40 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-gray-500">Total Actions</p>
        </div>
        <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/40 text-center">
          <p className="text-2xl font-bold text-emerald-400">{stats.successCount}</p>
          <p className="text-xs text-gray-500">Successful</p>
        </div>
        <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/40 text-center">
          <p className="text-2xl font-bold text-red-400">{stats.errorCount}</p>
          <p className="text-xs text-gray-500">Failed</p>
        </div>
        <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/40 text-center">
          <p className="text-2xl font-bold text-blue-400">
            {stats.total > 0 ? Math.round(stats.successCount / stats.total * 100) : 0}%
          </p>
          <p className="text-xs text-gray-500">Success Rate</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'baseball', 'softball', 'basketball', 'football', 'soccer', 'general'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Bot Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredBots.map(bot => {
          const actionCount = stats.activityByBot[bot.email] || 0;
          const hasActivity = actionCount > 0;

          return (
            <div
              key={bot.id}
              onClick={() => setSelectedBot(selectedBot === bot.id ? null : bot.id)}
              className={`bg-gray-800/60 rounded-lg p-3 border cursor-pointer transition-all hover:border-gray-600 ${
                selectedBot === bot.id ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-gray-700/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${hasActivity ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                <span className="text-sm font-medium text-gray-200 truncate">{bot.name}</span>
                <span className="text-xs ml-auto">{ROLE_ICONS[bot.role]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full ${SPORT_COLORS[bot.sport] || SPORT_COLORS.All}`}>
                  {bot.sport}
                </span>
                <span className="text-xs text-gray-500">{actionCount} actions</span>
              </div>

              {/* Expanded detail */}
              {selectedBot === bot.id && (
                <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-1">
                  <p className="text-xs text-gray-400">{bot.email}</p>
                  <p className="text-xs text-gray-400">Role: {bot.role}</p>
                  {/* Recent activity for this bot */}
                  {data.activity?.filter(a => a.bot_email === bot.email).slice(0, 5).map((a, i) => (
                    <div key={i} className="flex justify-between text-[10px]">
                      <span className="text-gray-400">{a.action_type}</span>
                      <span className={a.success ? 'text-emerald-500' : 'text-red-500'}>
                        {a.success ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Activity Feed */}
      <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/40">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-300">Activity Feed</h3>
          <button onClick={refresh} className="text-xs text-blue-400 hover:text-blue-300">Refresh</button>
        </div>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {(data.activity || []).slice(0, 30).map((a, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gray-700/30">
              <span className="text-gray-400 w-32 truncate">{a.bot_email?.split('@')[0]}</span>
              <span className="text-gray-300">{a.action_type}</span>
              <span className={`w-8 text-right ${a.success ? 'text-emerald-400' : 'text-red-400'}`}>
                {a.success ? 'OK' : 'ERR'}
              </span>
              <span className="text-gray-600 w-20 text-right">
                {new Date(a.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
          {(!data.activity || data.activity.length === 0) && (
            <p className="text-sm text-gray-500 py-4 text-center">No activity yet. Start the bot squad.</p>
          )}
        </div>
      </div>
    </div>
  );
}
