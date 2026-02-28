import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import moment from "moment";

const SPORT_EMOJIS = {
  Basketball: "🏀",
  Soccer: "⚽",
  Football: "🏈",
  Baseball: "⚾",
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

async function fetchFeed(feed) {
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`;
  const res = await fetch(proxy, { signal: AbortSignal.timeout(10000) });
  const { contents } = await res.json();
  if (!contents) return [];

  const doc = new DOMParser().parseFromString(contents, "text/xml");
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

async function fetchAllNews() {
  const results = await Promise.allSettled(RSS_FEEDS.map(fetchFeed));
  const allItems = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value);

  const seen = new Set();
  return allItems
    .filter((item) => {
      if (!item.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
}

export const SPORTS_NEWS_QUERY_KEY = ["sports-news"];

export default function SportNewsWidget() {
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
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-36 flex-shrink-0 bg-gray-800 rounded-xl h-28 animate-pulse" />
          ))}
        </div>
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
        <p className="text-gray-500 text-xs text-center py-2">Live sports news loading...</p>
      </div>
    );
  }

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
                {moment(article.pubDate).fromNow()}
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
                {moment(selectedArticle.pubDate).fromNow()}
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
