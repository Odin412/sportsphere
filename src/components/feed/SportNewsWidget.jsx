import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const SPORT_EMOJIS = {
  Basketball: "🏀",
  Soccer: "⚽",
  Football: "🏈",
  Baseball: "⚾",
  Softball: "🥎",
  Tennis: "🎾",
  Golf: "⛳",
  MMA: "🥋",
  Hockey: "🏒",
  Track: "🏃",
};

const RSS_FEEDS = [
  { url: "https://www.espn.com/espn/rss/news",        sport: null,         source: "ESPN" },
  { url: "https://www.espn.com/espn/rss/nba/news",    sport: "Basketball", source: "ESPN NBA" },
  { url: "https://www.espn.com/espn/rss/nfl/news",    sport: "Football",   source: "ESPN NFL" },
  { url: "https://www.espn.com/espn/rss/mlb/news",    sport: "Baseball",   source: "ESPN MLB" },
  { url: "https://www.espn.com/espn/rss/nhl/news",    sport: "Hockey",     source: "ESPN NHL" },
  { url: "https://www.espn.com/espn/rss/soccer/news", sport: "Soccer",     source: "ESPN Soccer" },
  { url: "https://www.espn.com/espn/rss/tennis/news", sport: "Tennis",     source: "ESPN Tennis" },
  { url: "https://www.espn.com/espn/rss/golf/news",   sport: "Golf",       source: "ESPN Golf" },
  { url: "https://www.espn.com/espn/rss/mma/news",    sport: "MMA",        source: "ESPN MMA" },
];

// Priority sports get more slots in the mixed feed
const PRIORITY_SPORTS = ["Football", "Basketball", "Baseball", "Softball"];
const PRIORITY_SLOTS = 3; // max articles per priority sport
const OTHER_SLOTS = 1;    // max articles per other sport

const CORS_PROXIES = [
  (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

const NEWS_CACHE_KEY = "sportsphere_news_cache";
const NEWS_CACHE_TTL = 30 * 60 * 1000; // 30 min

function getCachedNews() {
  try {
    const raw = localStorage.getItem(NEWS_CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts < NEWS_CACHE_TTL && data?.length) return data;
  } catch { /* ignore */ }
  return null;
}

function setCachedNews(data) {
  try {
    localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* ignore */ }
}

function parseRssXml(text, feed) {
  const doc = new DOMParser().parseFromString(text, "text/xml");
  const items = [...doc.querySelectorAll("item")].slice(0, 8);
  return items.map((item) => {
    const get = (tag) => item.querySelector(tag)?.textContent?.trim() || "";
    const link = get("link") || get("guid");
    return {
      id: link,
      title: get("title"),
      link,
      pubDate: get("pubDate"),
      sport: feed.sport,
      source: feed.source,
      description: get("description")
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .substring(0, 200)
        .trim(),
    };
  });
}

async function fetchFeed(feed) {
  for (const buildProxy of CORS_PROXIES) {
    try {
      const proxyUrl = buildProxy(feed.url);
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) continue;

      const contentType = res.headers.get("content-type") || "";

      // allorigins returns JSON with a `contents` field
      if (contentType.includes("application/json") || proxyUrl.includes("allorigins")) {
        const json = await res.json();
        const xml = json.contents || json.body || "";
        if (!xml) continue;
        const items = parseRssXml(xml, feed);
        if (items.length) return items;
        continue;
      }

      // corsproxy.io and codetabs return the raw XML/text
      const text = await res.text();
      if (!text || text.length < 100) continue;
      const items = parseRssXml(text, feed);
      if (items.length) return items;
    } catch {
      // proxy failed, try next
    }
  }
  return [];
}

function diversifyNews(items) {
  // Group articles by sport
  const bySport = {};
  for (const item of items) {
    const key = item.sport || "General";
    if (!bySport[key]) bySport[key] = [];
    bySport[key].push(item);
  }

  // Pick from each sport with priority weighting
  const picked = [];
  const sports = Object.keys(bySport);
  for (const sport of sports) {
    const limit = PRIORITY_SPORTS.includes(sport) ? PRIORITY_SLOTS : OTHER_SLOTS;
    picked.push(...bySport[sport].slice(0, limit));
  }

  // Sort by date, then backfill with remaining articles if under 30
  picked.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  if (picked.length < 30) {
    const pickedIds = new Set(picked.map((p) => p.id));
    for (const item of items) {
      if (picked.length >= 30) break;
      if (!pickedIds.has(item.id)) {
        picked.push(item);
        pickedIds.add(item.id);
      }
    }
  }
  return picked;
}

async function fetchAllNews() {
  const results = await Promise.allSettled(RSS_FEEDS.map(fetchFeed));
  const allItems = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value);

  const seen = new Set();
  const deduped = allItems
    .filter((item) => {
      if (!item.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Diversify: ensure mix of sports with priority weighting
  const news = diversifyNews(deduped);

  // Cache successful fetches; fall back to cache if all proxies failed
  if (news.length) {
    setCachedNews(news);
    return news;
  }
  return getCachedNews() || [];
}

export const SPORTS_NEWS_QUERY_KEY = ["sports-news"];

export default function SportNewsWidget({ compact = false }) {
  const [selectedArticle, setSelectedArticle] = useState(null);

  const { data: news = [], isLoading } = useQuery({
    queryKey: SPORTS_NEWS_QUERY_KEY,
    queryFn: fetchAllNews,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">📰</span>
          <h3 className="font-bold text-white text-xs tracking-widest uppercase">Sports News</h3>
        </div>
        {compact ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-36 flex-shrink-0 bg-gray-800 rounded-xl h-28 animate-pulse" />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!news.length) {
    return (
      <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">📰</span>
          <h3 className="font-bold text-white text-xs tracking-widest uppercase">Sports News</h3>
        </div>
        <p className="text-gray-500 text-xs text-center py-2">No news available right now. Check back soon.</p>
      </div>
    );
  }

  /* ── Compact vertical mode (sidebar) ─────────────────────────── */
  if (compact) {
    return (
      <>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
            <span className="text-sm">📰</span>
            <h3 className="font-bold text-white text-xs tracking-widest uppercase flex-1">Sports News</h3>
            <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">LIVE</span>
          </div>
          <div className="divide-y divide-gray-800">
            {news.slice(0, 10).map((article) => (
              <button
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="flex items-start gap-3 px-4 py-3 hover:bg-gray-800 transition-colors group w-full text-left"
              >
                <span className="text-lg flex-shrink-0">{SPORT_EMOJIS[article.sport] || "🏆"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold line-clamp-2 group-hover:text-red-300 leading-snug transition-colors">
                    {article.title}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{article.source} · {formatDistanceToNow(new Date(article.pubDate), { addSuffix: true })}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedArticle && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedArticle(null)}
          >
            <div
              className="bg-gray-900 rounded-2xl border border-gray-800 p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{SPORT_EMOJIS[selectedArticle.sport] || "🏆"}</span>
                <span className="text-xs text-gray-500 font-semibold">{selectedArticle.source}</span>
                <span className="text-xs text-gray-600 ml-auto">{formatDistanceToNow(new Date(selectedArticle.pubDate), { addSuffix: true })}</span>
              </div>
              <h2 className="text-white font-bold text-lg leading-snug mb-3">{selectedArticle.title}</h2>
              {selectedArticle.description && (
                <p className="text-gray-400 text-sm leading-relaxed mb-5">{selectedArticle.description}</p>
              )}
              <a href={selectedArticle.link} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-3 text-sm font-semibold transition-colors w-full justify-center">
                <ExternalLink className="w-4 h-4" /> Read Full Article
              </a>
              <button onClick={() => setSelectedArticle(null)}
                className="mt-3 text-gray-500 hover:text-white text-sm w-full text-center transition-colors py-2">
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  /* ── Default horizontal carousel mode (inline) ───────────────── */
  return (
    <>
      <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">📰</span>
            <h3 className="font-bold text-white text-xs tracking-widest uppercase">Sports News</h3>
          </div>
          <span className="text-xs text-gray-600">Live</span>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {news.slice(0, 30).map((article) => (
            <button
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="w-36 flex-shrink-0 bg-gray-800 rounded-xl p-3 text-left transition-all border border-gray-700 hover:border-red-800 hover:bg-gray-750 group"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">{SPORT_EMOJIS[article.sport] || "🏆"}</span>
                <span className="text-xs text-gray-500 truncate">{article.source}</span>
              </div>
              <p className="text-white text-xs font-medium line-clamp-3 leading-snug group-hover:text-red-300 transition-colors">
                {article.title}
              </p>
              <p className="text-gray-600 text-xs mt-2">
                {formatDistanceToNow(new Date(article.pubDate), { addSuffix: true })}
              </p>
            </button>
          ))}
        </div>
      </div>

      {selectedArticle && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-gray-900 rounded-2xl border border-gray-800 p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{SPORT_EMOJIS[selectedArticle.sport] || "🏆"}</span>
              <span className="text-xs text-gray-500 font-semibold">{selectedArticle.source}</span>
              <span className="text-xs text-gray-600 ml-auto">
                {formatDistanceToNow(new Date(selectedArticle.pubDate), { addSuffix: true })}
              </span>
            </div>

            <h2 className="text-white font-bold text-lg leading-snug mb-3">
              {selectedArticle.title}
            </h2>

            {selectedArticle.description && (
              <p className="text-gray-400 text-sm leading-relaxed mb-5">
                {selectedArticle.description}
              </p>
            )}

            <a
              href={selectedArticle.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-3 text-sm font-semibold transition-colors w-full justify-center"
            >
              <ExternalLink className="w-4 h-4" />
              Read Full Article
            </a>

            <button
              onClick={() => setSelectedArticle(null)}
              className="mt-3 text-gray-500 hover:text-white text-sm w-full text-center transition-colors py-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
