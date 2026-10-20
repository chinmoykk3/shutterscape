'use client';

import React, { useState, useMemo } from 'react';
import { Search, Film, Calendar, Camera } from 'lucide-react';
import { ActivityCard } from './ActivityCard';

export interface ActivityData {
  _id: string;
  title: string;
  slug: string;
  date: string;
  endDate?: string;
  venue?: string;
  descriptionHtml: string;
  pullQuote?: string;
  image: {
    url: string;
    publicId: string;
    blurDataURL?: string;
  };
  registrationLink?: string;
  status: 'draft' | 'published';
  isUpcoming?: boolean;
}

interface ActivitiesViewProps {
  initialActivities: ActivityData[];
}

export function ActivitiesView({ initialActivities }: ActivitiesViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActivities = useMemo(() => {
    return initialActivities.filter((activity) => {
      const isUpcoming = activity.isUpcoming ?? false;

      // Tab filter
      if (activeTab === 'upcoming' && !isUpcoming) return false;
      if (activeTab === 'archived' && isUpcoming) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = activity.title.toLowerCase().includes(query);
        const matchesVenue = activity.venue?.toLowerCase().includes(query);
        const matchesQuote = activity.pullQuote?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesVenue && !matchesQuote) return false;
      }

      return true;
    });
  }, [initialActivities, activeTab, searchQuery]);

  const upcomingCount = useMemo(() => {
    return initialActivities.filter((a) => a.isUpcoming).length;
  }, [initialActivities]);

  const archivedCount = initialActivities.length - upcomingCount;

  return (
    <div className="space-y-8">
      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-charcoal/80 p-3 sm:p-4 rounded-2xl border border-charcoal-border backdrop-blur-md">
        {/* Analog Tab Switchers */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-amber text-black font-semibold shadow-md shadow-amber/20'
                : 'text-offwhite-muted hover:text-offwhite hover:bg-white/5'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            All Rolls ({initialActivities.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'upcoming'
                ? 'bg-amber text-black font-semibold shadow-md shadow-amber/20'
                : 'text-offwhite-muted hover:text-offwhite hover:bg-white/5'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Upcoming Missions ({upcomingCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('archived')}
            className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'archived'
                ? 'bg-amber text-black font-semibold shadow-md shadow-amber/20'
                : 'text-offwhite-muted hover:text-offwhite hover:bg-white/5'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Archived Exposures ({archivedCount})
          </button>
        </div>

        {/* Search input with analog feel */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-offwhite-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search manifests, venues..."
            className="w-full bg-black/60 border border-charcoal-border rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-offwhite placeholder:text-offwhite-dim focus:outline-none focus:border-amber transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-offwhite-dim hover:text-offwhite text-xs font-mono"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Grid of 35mm Roll Cards */}
      {filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity, idx) => (
            <ActivityCard
              key={activity._id}
              activity={activity}
              frameIndex={idx + 1}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl bg-charcoal/40 border border-charcoal-border/70 border-dashed space-y-4">
          <div className="w-12 h-12 rounded-full bg-charcoal border border-charcoal-border flex items-center justify-center mx-auto text-offwhite-dim">
            <Film className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-title text-lg text-offwhite font-bold">No Exposures Found</h4>
            <p className="text-xs font-mono text-offwhite-muted max-w-sm mx-auto">
              {searchQuery
                ? `No film rolls match query "${searchQuery}". Clear your search to view all logged events.`
                : 'No activities logged in this category yet. Check back soon for new field expeditions.'}
            </p>
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs font-mono text-amber hover:underline"
            >
              Reset Search Query
            </button>
          )}
        </div>
      )}
    </div>
  );
}
