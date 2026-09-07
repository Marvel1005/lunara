'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ThemeCornerDecor, ThemeEmptyStateDecor, ThemeBadge } from '@/components/theme/theme-decorations';
import { BookHeart, Plus, Trash2, Edit3, Calendar as CalendarIcon, Sparkles, CheckCircle2, X, Tag } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  mood?: string;
  tags?: string[];
  created_at: string;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newContent, setNewContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('Calm');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Sanctuary', 'Rest']);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit state
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editMood, setEditMood] = useState('Calm');

  const moods = [
    { label: 'Calm', emoji: '🧘' },
    { label: 'Tired', emoji: '😴' },
    { label: 'Reflective', emoji: '💭' },
    { label: 'Sensitive', emoji: '🌸' },
    { label: 'Grateful', emoji: '✨' },
    { label: 'Uncomfortable', emoji: '😣' },
  ];

  useEffect(() => {
    async function loadJournalEntries() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('journal_entries')
          .select('id, date, content, mood, tags, created_at')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;
        if (data) {
          setEntries(data as JournalEntry[]);
        }
      } catch (err) {
        console.error('Failed to fetch journal entries from Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadJournalEntries();
  }, []);

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim().replace(/^#/, '');
    if (!tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setIsSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const todayStr = format(new Date(), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          date: todayStr,
          content: newContent.trim(),
          mood: selectedMood,
          tags: tags.length > 0 ? tags : null,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setEntries((prev) => [data as JournalEntry, ...prev]);
        setNewContent('');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save journal entry to Supabase:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('journal_entries').delete().eq('id', id);
      if (error) throw error;
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Failed to delete journal entry:', err);
    }
  };

  const handleStartEdit = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setEditContent(entry.content);
    setEditMood(entry.mood || 'Calm');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editContent.trim()) return;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('journal_entries')
        .update({
          content: editContent.trim(),
          mood: editMood,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, content: editContent.trim(), mood: editMood } : e))
      );
      setEditingEntryId(null);
    } catch (err) {
      console.error('Failed to update journal entry:', err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BookHeart className="w-6 h-6 text-primary" />
            <span>Private Journal</span>
          </h1>
          <p className="text-sm text-muted-fg mt-1">
            A quiet sanctuary for putting your feelings, body sensations, and reflections into words.
          </p>
        </div>
      </div>

      {/* New Journal Entry Card */}
      <div className="card-depth-primary p-6 sm:p-7 space-y-4 relative overflow-hidden">
        <ThemeCornerDecor size="md" className="top-0 right-0" />

        <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-primary">
          <Sparkles className="w-4 h-4" />
          <span>Today&apos;s Reflection — {format(new Date(), 'MMMM d, yyyy')}</span>
        </div>

        {saveSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Reflection saved privately to your Supabase sanctuary.</span>
          </div>
        )}

        <form onSubmit={handleSaveEntry} className="space-y-4">
          {/* Mood Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">How are you feeling right now?</label>
            <div className="flex flex-wrap gap-2">
              {moods.map((m) => (
                <button
                  type="button"
                  key={m.label}
                  onClick={() => setSelectedMood(m.label)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedMood === m.label
                      ? 'bg-primary text-primary-fg font-bold shadow-soft'
                      : 'bg-muted/40 hover:bg-muted text-foreground border border-border/60'
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Write freely... How is your body feeling today? What do you need right now?"
            rows={4}
            className="w-full p-4 rounded-2xl bg-muted/20 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none leading-relaxed"
          />

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-muted-fg" />
              <span className="text-xs font-semibold text-foreground">Tags</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-soft text-primary text-xs font-medium"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:opacity-75 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="px-2.5 py-1 text-xs rounded-xl bg-muted/30 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="p-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving || !newContent.trim()}
              className="px-6 py-2.5 rounded-2xl bg-primary text-primary-fg text-xs font-semibold shadow-comfort hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 tactile-button"
            >
              <Plus className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Private Entry'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Entries Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Past Journal Reflections</h2>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-28 rounded-3xl bg-muted/40" />
            <div className="h-28 rounded-3xl bg-muted/30" />
          </div>
        ) : entries.length === 0 ? (
          <ThemeEmptyStateDecor
            title="Your story is just getting started"
            description="Your thoughts are completely private and encrypted in Supabase. Write your first reflection whenever you feel ready."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {entries.map((entry) => (
              <div key={entry.id} className="card-depth-secondary p-6 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-border/60 pb-3 text-xs">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{format(parseISO(entry.date), 'MMMM d, yyyy')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {entry.mood && (
                      <ThemeBadge className="text-[10px]">
                        {entry.mood}
                      </ThemeBadge>
                    )}
                    <button
                      onClick={() => handleStartEdit(entry)}
                      className="p-1 rounded-lg text-muted-fg hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      title="Edit Entry"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-1 rounded-lg text-muted-fg hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {editingEntryId === entry.id ? (
                  <div className="space-y-3 pt-1">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full p-3 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="flex justify-end gap-2 text-xs">
                      <button
                        onClick={() => setEditingEntryId(null)}
                        className="px-3 py-1.5 rounded-xl bg-muted text-foreground font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(entry.id)}
                        className="px-3 py-1.5 rounded-xl bg-primary text-primary-fg font-semibold"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {entry.content}
                    </p>

                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {entry.tags.map((t) => (
                          <span key={t} className="text-[10px] font-semibold text-muted-fg px-2 py-0.5 rounded-md bg-muted/40">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
