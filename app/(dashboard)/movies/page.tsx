'use client';

import React, { useState, useEffect } from 'react';
import { Film, Bookmark, BookmarkCheck, ExternalLink, Sparkles } from 'lucide-react';
import { useTodayMood, useTodayWellness } from '@/lib/hooks/use-wellness';

type MovieCategory = 'all' | 'watchlist' | 'low-energy' | 'warm-heart' | 'nostalgia' | 'anime';

interface MovieItem {
  id: string;
  title: string;
  year: string;
  genre: string;
  language: string;
  category: MovieCategory;
  description: string;
  whyPicked: string;
  comfortTag: string;
  watchQuery: string;
}

const allMovies: MovieItem[] = [
  {
    id: 'totoro',
    title: 'My Neighbor Totoro',
    year: '1988',
    genre: 'Gentle Animation',
    language: 'Japanese / English Dub',
    category: 'anime',
    description: 'Two young sisters move to the quiet countryside and meet gentle forest spirits in a sun-dappled world.',
    whyPicked: 'Almost zero conflict, calming forest rain, and a peaceful atmosphere ideal for restful days.',
    comfortTag: 'Soft Rain & Quiet Woods',
    watchQuery: 'My Neighbor Totoro watch online stream',
  },
  {
    id: 'kiki',
    title: "Kiki's Delivery Service",
    year: '1989',
    genre: 'Cozy Slice-of-Life',
    language: 'Japanese / English Dub',
    category: 'anime',
    description: 'A young witch moves to a breezy seaside town with her talking cat and starts a gentle bakery delivery service.',
    whyPicked: 'A soothing story that reminds you that resting is a natural part of regaining your energy.',
    comfortTag: 'Bakery Warmth & Sea Air',
    watchQuery: "Kiki's Delivery Service watch online stream",
  },
  {
    id: 'paddington2',
    title: 'Paddington 2',
    year: '2017',
    genre: 'Warmhearted Comedy',
    language: 'English',
    category: 'warm-heart',
    description: 'Paddington bear spreads genuine kindness, marmalade sandwiches, and optimism to everyone in his community.',
    whyPicked: 'Unfiltered warmth and delightful humor that effortlessly lifts a low-energy afternoon.',
    comfortTag: 'Pure Kindness & Comfort',
    watchQuery: 'Paddington 2 watch online stream',
  },
  {
    id: 'little-women',
    title: 'Little Women',
    year: '2019',
    genre: 'Cozy Period Drama',
    language: 'English',
    category: 'warm-heart',
    description: 'Four sisters grow up together surrounded by sisterhood, creative passions, and warm winter firesides.',
    whyPicked: 'Brimming with heartfelt family loyalty and rich, comforting domestic aesthetics.',
    comfortTag: 'Fireside Warmth & Sisterhood',
    watchQuery: 'Little Women 2019 watch online stream',
  },
  {
    id: 'fantastic-mr-fox',
    title: 'Fantastic Mr. Fox',
    year: '2009',
    genre: 'Stop-Motion Warmth',
    language: 'English',
    category: 'nostalgia',
    description: 'A clever wild animal family navigates countryside farm escapades in richly detailed autumn tones.',
    whyPicked: 'Warm golden-amber color palette and soothing acoustic folk music.',
    comfortTag: 'Autumn Colors & Witty Charm',
    watchQuery: 'Fantastic Mr Fox watch online stream',
  },
  {
    id: 'amelie',
    title: 'Amélie',
    year: '2001',
    genre: 'Whimsical Romantic Comedy',
    language: 'French (Subtitled)',
    category: 'low-energy',
    description: 'An imaginative Paris waitress quietly performs small, secret acts of kindness for people in her neighborhood.',
    whyPicked: 'Rich, comforting colors and gentle human touches that make a quiet evening feel lighter.',
    comfortTag: 'Warm Parisian Whimsy',
    watchQuery: 'Amelie movie watch online stream',
  },
  {
    id: 'parent-trap',
    title: 'The Parent Trap',
    year: '1998',
    genre: '90s Nostalgia',
    language: 'English',
    category: 'nostalgia',
    description: 'Twin sisters separated as babies meet by chance at summer camp and hatch a scheme to trade places.',
    whyPicked: 'Familiar, comforting late-90s nostalgia that lets your mind completely unwind without tension.',
    comfortTag: 'Summer Camp Nostalgia',
    watchQuery: 'The Parent Trap 1998 watch online stream',
  },
  {
    id: 'pride-and-prejudice',
    title: 'Pride & Prejudice',
    year: '2005',
    genre: 'Period Romance',
    language: 'English',
    category: 'low-energy',
    description: 'Spirited Elizabeth Bennet navigates social expectations and guarded emotions in the English countryside.',
    whyPicked: 'Gentle classical piano score, soft morning light, and peaceful English meadows.',
    comfortTag: 'English Meadows & Piano Score',
    watchQuery: 'Pride and Prejudice 2005 watch online stream',
  },
];

export default function MoviesPage() {
  const [activeCategory, setActiveCategory] = useState<MovieCategory>('all');
  const [watchlist, setWatchlist] = useState<string[]>([]);

  const { mood } = useTodayMood();
  const { energy } = useTodayWellness();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lunara_movie_watchlist');
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleWatchlist = (id: string) => {
    const updated = watchlist.includes(id)
      ? watchlist.filter((item) => item !== id)
      : [...watchlist, id];
    setWatchlist(updated);
    try {
      localStorage.setItem('lunara_movie_watchlist', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Determine truthful context based on user's real today logs
  const isLowEnergy = energy === 'very low' || energy === 'low' || mood === 'Tired';
  const isEmotional = mood === 'Emotional' || mood === 'Uncomfortable';

  const filteredMovies = allMovies.filter((m) => {
    if (activeCategory === 'watchlist') return watchlist.includes(m.id);
    if (activeCategory === 'all') return true;
    return m.category === activeCategory;
  });

  return (
    <div className="space-y-5 pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Film className="w-5 h-5 text-primary" />
          <span>Comfort Movies</span>
        </h1>
        <p className="text-sm text-muted-fg">
          Low-tension, calming watches curated for days when your body needs quiet rest.
        </p>
      </div>

      {/* Truthful Context-Aware Recommendation Notice */}
      {(isLowEnergy || isEmotional) && (
        <div className="p-4 rounded-3xl bg-primary-soft/60 border border-border/80 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-foreground block">
              {isLowEnergy
                ? 'Curated for low energy'
                : 'Curated for a tender day'}
            </span>
            <span className="text-muted-fg leading-relaxed">
              {isLowEnergy
                ? 'Because you logged low energy or feeling tired today, we recommend gentle stories with calming soundtracks and minimal conflict.'
                : 'Because today feels a little more emotional or tender, we recommend stories filled with family loyalty and comforting warmth.'}
            </span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'all', label: 'All Picks' },
          { key: 'watchlist', label: `Saved (${watchlist.length})` },
          { key: 'low-energy', label: 'Very Low Energy' },
          { key: 'warm-heart', label: 'Warm Hugs' },
          { key: 'anime', label: 'Gentle Animation' },
          { key: 'nostalgia', label: 'Nostalgic' },
        ].map((tab) => {
          const isActive = activeCategory === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key as MovieCategory)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[40px] ${
                isActive
                  ? 'bg-primary text-primary-fg shadow-soft font-bold'
                  : 'bg-muted/40 hover:bg-muted text-foreground border border-border/70'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <div className="p-10 rounded-3xl border border-dashed border-border text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">No saved movies yet</p>
          <p className="text-xs text-muted-fg">Tap the bookmark on any movie to save it for your next quiet evening.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredMovies.map((movie) => {
            const isSaved = watchlist.includes(movie.id);

            return (
              <div
                key={movie.id}
                className="p-5 rounded-3xl border border-border bg-card/60 backdrop-blur-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-base font-bold text-foreground leading-snug">{movie.title}</h2>
                      <p className="text-[11px] text-muted-fg mt-0.5">
                        {movie.year} • {movie.genre}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleWatchlist(movie.id)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isSaved
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'bg-muted/40 text-muted-fg hover:text-foreground border-border/60'
                      }`}
                      title={isSaved ? 'Remove from Saved' : 'Save to Watchlist'}
                      aria-label={`Save ${movie.title}`}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  <p className="text-xs text-muted-fg leading-relaxed">
                    {movie.description}
                  </p>

                  <div className="p-2.5 rounded-2xl bg-muted/40 text-[11px] text-muted-fg space-y-0.5">
                    <span className="font-semibold text-primary block">Why it feels good today:</span>
                    <span>{movie.whyPicked}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                  <span className="text-[10px] font-semibold text-primary px-2.5 py-0.5 rounded-full bg-primary-soft">
                    {movie.comfortTag}
                  </span>

                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(movie.watchQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] font-medium text-muted-fg hover:text-foreground transition-colors"
                  >
                    <span>Where to watch</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
