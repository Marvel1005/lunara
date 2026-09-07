'use client';

import React, { useState } from 'react';
import { ThemeCornerDecor, ThemeBadge } from '@/components/theme/theme-decorations';
import { Film, Sparkles, Heart, Star, Tv, ExternalLink, HelpCircle } from 'lucide-react';

type MovieMood = 'all' | 'warm-hugs' | 'soft-giggles' | 'nostalgic' | 'gentle-anime';

interface MovieItem {
  id: string;
  title: string;
  year: string;
  genre: string;
  language: string;
  mood: MovieMood;
  description: string;
  whyPicked: string;
  comfortTag: string;
  watchQuery: string;
}

export default function MoviesPage() {
  const [activeMood, setActiveMood] = useState<MovieMood>('all');

  const movies: MovieItem[] = [
    {
      id: 'totoro',
      title: 'My Neighbor Totoro',
      year: '1988',
      genre: 'Anime / Gentle Comfort',
      language: 'Japanese / English Dub',
      mood: 'gentle-anime',
      description: 'Two young sisters move to the countryside and discover friendly forest spirits in a heartwarming world.',
      whyPicked: 'Low conflict, calming nature visuals, and soothing music ideal for restful days.',
      comfortTag: 'Soft Rain & Forest Whimsy',
      watchQuery: 'My Neighbor Totoro stream watch online',
    },
    {
      id: 'kiki',
      title: "Kiki's Delivery Service",
      year: '1989',
      genre: 'Anime / Cozy Life',
      language: 'Japanese / English Dub',
      mood: 'gentle-anime',
      description: 'A young witch moves to a seaside town with her talking cat and starts a bakery delivery service.',
      whyPicked: 'A gentle reminder that taking breaks and resting is part of regaining your creative spirit.',
      comfortTag: 'Ocean Breeze & Bakery Warmth',
      watchQuery: "Kiki's Delivery Service stream watch online",
    },
    {
      id: 'paddington2',
      title: 'Paddington 2',
      year: '2017',
      genre: 'Comedy / Warm Hug',
      language: 'English',
      mood: 'warm-hugs',
      description: 'Paddington bear brings warmth and marmalade to everyone he meets in a delightful, wholesome adventure.',
      whyPicked: 'Pure joy and kindness that lifts low energy and brings instant smiles.',
      comfortTag: '100% Pure Warmth',
      watchQuery: 'Paddington 2 stream watch online',
    },
    {
      id: 'little-women',
      title: 'Little Women',
      year: '2019',
      genre: 'Period Drama / Family',
      language: 'English',
      mood: 'warm-hugs',
      description: 'The beloved story of four sisters coming of age surrounded by family love, art, and cozy winter firesides.',
      whyPicked: 'Encapsulates emotional warmth, sisterhood, and comforting aesthetic visuals.',
      comfortTag: 'Cozy Fireside & Sisterhood',
      watchQuery: 'Little Women 2019 stream watch online',
    },
    {
      id: 'amelie',
      title: 'Amélie',
      year: '2001',
      genre: 'Whimsical Romantic Comedy',
      language: 'French (Subtitled)',
      mood: 'soft-giggles',
      description: 'An imaginative Paris waitress quietly orchestrates small acts of joy for the people around her.',
      whyPicked: 'Playful color palettes and lighthearted human connection to brighten quiet hours.',
      comfortTag: 'Whimsical Parisian Magic',
      watchQuery: 'Amelie movie watch online',
    },
    {
      id: 'parent-trap',
      title: 'The Parent Trap',
      year: '1998',
      genre: 'Nostalgic Comedy',
      language: 'English',
      mood: 'nostalgic',
      description: 'Identical twins separated at birth meet at summer camp and scheme to reunite their parents.',
      whyPicked: 'Familiar 90s nostalgia that lets your mind wander without tension.',
      comfortTag: 'Nostalgic Summer Comfort',
      watchQuery: 'The Parent Trap 1998 watch online',
    },
  ];

  const filteredMovies = activeMood === 'all'
    ? movies
    : movies.filter((m) => m.mood === activeMood);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Film className="w-6 h-6 text-primary" />
            <span>Comfort Movies</span>
          </h1>
          <p className="text-sm text-muted-fg mt-1">
            Curated feel-good films for quiet evenings, low-energy days, and cozy rest.
          </p>
        </div>
      </div>

      {/* Mood Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: 'all', label: 'All Picks', icon: Sparkles },
          { key: 'warm-hugs', label: 'Warm Hugs', icon: Heart },
          { key: 'gentle-anime', label: 'Gentle Anime', icon: Tv },
          { key: 'soft-giggles', label: 'Soft Giggles', icon: Star },
          { key: 'nostalgic', label: 'Nostalgic Favorites', icon: Film },
        ].map((cat) => {
          const Icon = cat.icon;
          const isActive = activeMood === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveMood(cat.key as MovieMood)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer shrink-0 min-h-[44px] ${
                isActive
                  ? 'bg-primary text-primary-fg shadow-comfort font-bold'
                  : 'bg-muted/40 hover:bg-muted text-foreground border border-border/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMovies.map((movie) => (
          <div key={movie.id} className="card-depth-secondary p-6 space-y-4 relative overflow-hidden flex flex-col justify-between">
            <ThemeCornerDecor size="sm" className="top-1 right-1" />

            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-primary-soft text-primary font-bold text-[10px]">
                  {movie.genre}
                </span>
                <span className="text-xs font-semibold text-muted-fg">{movie.year}</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground">{movie.title}</h3>
                <span className="text-[11px] text-muted-fg block mb-1">{movie.language}</span>
                <p className="text-xs text-muted-fg leading-relaxed">{movie.description}</p>
              </div>

              {/* Why I Picked This for You */}
              <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Why I picked this for you</span>
                </div>
                <p className="text-muted-fg text-[11px] leading-relaxed">{movie.whyPicked}</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-border/50 text-xs">
              <div className="flex items-center gap-1 text-primary font-medium text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{movie.comfortTag}</span>
              </div>

              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(movie.watchQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
              >
                <span>Where to watch</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
