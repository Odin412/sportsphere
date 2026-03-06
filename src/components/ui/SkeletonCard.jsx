import React from "react";

export function SkeletonPostCard() {
  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 animate-pulse">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-gray-700 rounded w-1/3" />
          <div className="h-2 bg-gray-700 rounded w-1/4" />
        </div>
      </div>
      <div className="h-48 bg-gray-800" />
      <div className="px-4 py-3 space-y-2">
        <div className="h-3 bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-700 rounded w-1/2" />
      </div>
      <div className="flex gap-4 px-4 pb-3">
        <div className="h-8 bg-gray-800 rounded-xl w-16" />
        <div className="h-8 bg-gray-800 rounded-xl w-16" />
        <div className="h-8 bg-gray-800 rounded-xl w-16" />
      </div>
    </div>
  );
}

export function SkeletonProfileHeader() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-32 bg-gray-200 rounded-xl" />
      <div className="flex items-end gap-4 px-4 -mt-12">
        <div className="w-20 h-20 rounded-full bg-gray-300 border-4 border-white" />
        <div className="space-y-2 flex-1 pb-2">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
      <div className="px-4 flex gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center space-y-1">
            <div className="h-5 bg-gray-200 rounded w-12" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonReelGrid() {
  return (
    <div className="grid grid-cols-2 gap-1 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="aspect-[9/16] bg-gray-800 rounded-lg" />
      ))}
    </div>
  );
}

export function SkeletonEventCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
      <div className="flex gap-3">
        <div className="w-14 h-14 bg-gray-200 rounded-xl flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-2 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-3/4" />
    </div>
  );
}
