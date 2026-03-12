import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  Download,
  FilePlus2,
  Folder,
  Layers3,
  Pin,
  Search,
  Trash2,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Note, notebookApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import MathLoader from '@/components/ui/MathLoader';
import LogoSpinner from '@/components/ui/LogoSpinner';

type NoteCategory = 'expense' | 'debt' | 'useful' | 'general';
type NotesView = 'all' | 'pinned' | NoteCategory;
type MobileView = 'list' | 'editor';
type SaveState = 'idle' | 'pending' | 'saving' | 'saved';
type NoteSavePayload = Pick<
  Note,
  'title' | 'content' | 'category' | 'folder' | 'tags' | 'is_pinned' | 'is_archived'
>;

const DEFAULT_FOLDER = 'My Notes';

const Notebook = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<string[]>([DEFAULT_FOLDER]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<NotesView>('all');
  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>('list');
  const [tagsInput, setTagsInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const pendingSaveRef = useRef<{ id: number; payload: NoteSavePayload } | null>(null);

  const selectedNote = useMemo(() => {
    if (!selectedId) return null;
    return notes.find((note) => note.id === selectedId) || null;
  }, [notes, selectedId]);

  const noteSummary = useMemo(() => {
    const visibleFolders = new Set(
      notes.map((note) => (note.folder || DEFAULT_FOLDER).trim() || DEFAULT_FOLDER)
    );

    return {
      total: notes.length,
      pinned: notes.filter((note) => note.is_pinned).length,
      folders: visibleFolders.size || folders.length,
    };
  }, [folders.length, notes]);

  const viewOptions: Array<{ id: NotesView; label: string }> = [
    { id: 'all', label: language === 'sw' ? 'Zote' : 'All' },
    { id: 'pinned', label: language === 'sw' ? 'Zilizobandikwa' : 'Pinned' },
    { id: 'expense', label: language === 'sw' ? 'Matumizi' : 'Expense' },
    { id: 'debt', label: language === 'sw' ? 'Madeni' : 'Debts' },
    { id: 'useful', label: language === 'sw' ? 'Muhimu' : 'Useful' },
    { id: 'general', label: language === 'sw' ? 'Kawaida' : 'General' },
  ];

  const categoryLabel = (category: NoteCategory) => {
    if (category === 'expense') return language === 'sw' ? 'Matumizi' : 'Expense';
    if (category === 'debt') return language === 'sw' ? 'Deni' : 'Debt';
    if (category === 'useful') return language === 'sw' ? 'Muhimu' : 'Useful';
    return language === 'sw' ? 'Kawaida' : 'General';
  };

  const saveMessage = useMemo(() => {
    if (saveState === 'saving') {
      return language === 'sw' ? 'Inahifadhi...' : 'Saving changes...';
    }

    if (saveState === 'pending') {
      return language === 'sw' ? 'Mabadiliko yako yapo tayari kuhifadhiwa' : 'Changes queued for autosave';
    }

    if (lastSavedAt) {
      const timestamp = new Date(lastSavedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      return language === 'sw' ? `Imehifadhiwa saa ${timestamp}` : `Saved at ${timestamp}`;
    }

    return language === 'sw' ? 'Tayari kuandika' : 'Ready to write';
  }, [language, lastSavedAt, saveState]);

  const parseTags = (raw: string) =>
    raw
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

  const buildSavePayload = (note: Note): NoteSavePayload => ({
    title: note.title,
    content: note.content,
    category: note.category,
    folder: note.folder.trim() || DEFAULT_FOLDER,
    tags: note.tags,
    is_pinned: note.is_pinned,
    is_archived: note.is_archived,
  });

  const loadFolders = async () => {
    try {
      const response = await notebookApi.getFolders();
      const fromApi = response.success && response.data?.folders ? response.data.folders.filter(Boolean) : [];
      const nextFolders = Array.from(new Set([DEFAULT_FOLDER, ...fromApi]));

      setFolders(nextFolders);
      setActiveFolder((current) => (current === 'all' || nextFolders.includes(current) ? current : 'all'));
    } catch (error) {
      console.error('Failed to load folders:', error);
      setFolders([DEFAULT_FOLDER]);
      setActiveFolder((current) => (current === 'all' || current === DEFAULT_FOLDER ? current : 'all'));
    }
  };

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const response = await notebookApi.list({
        search: searchQuery.trim() || undefined,
        category: activeView !== 'all' && activeView !== 'pinned' ? activeView : undefined,
        is_pinned: activeView === 'pinned' ? true : undefined,
        folder: activeFolder !== 'all' ? activeFolder : undefined,
      });

      if (response.success && response.data?.notes) {
        setNotes(response.data.notes);
        setSelectedId((currentId) => {
          if (currentId && response.data.notes.some((note) => note.id === currentId)) return currentId;
          return response.data.notes[0]?.id ?? null;
        });
      }
    } catch (error: any) {
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: error?.message || (language === 'sw' ? 'Imeshindwa kupata notes.' : 'Failed to load notes.'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const persistNote = async (id: number, payload: NoteSavePayload) => {
    setIsSaving(true);
    setSaveState('saving');

    try {
      const response = await notebookApi.update(id, payload);

      if (response.success && response.data) {
        setNotes((prev) =>
          prev.map((note) =>
            note.id === id
              ? {
                  ...response.data,
                  title: note.title,
                  content: note.content,
                  category: note.category,
                  folder: note.folder,
                  tags: note.tags,
                  is_pinned: note.is_pinned,
                  is_archived: note.is_archived,
                }
              : note
          )
        );
        setLastSavedAt(new Date().toISOString());
        await loadFolders();
      }
    } catch (error: any) {
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: error?.message || (language === 'sw' ? 'Imeshindwa kuhifadhi dokezo.' : 'Failed to save note.'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
      setSaveState(pendingSaveRef.current ? 'pending' : 'saved');
    }
  };

  const queueSave = (id: number, payload: NoteSavePayload) => {
    pendingSaveRef.current = { id, payload };
    setSaveState('pending');

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      const pendingSave = pendingSaveRef.current;
      pendingSaveRef.current = null;
      saveTimerRef.current = null;

      if (!pendingSave) return;
      void persistNote(pendingSave.id, pendingSave.payload);
    }, 650);
  };

  const flushPendingSave = async () => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    const pendingSave = pendingSaveRef.current;
    pendingSaveRef.current = null;

    if (pendingSave) {
      await persistNote(pendingSave.id, pendingSave.payload);
    }
  };

  useEffect(() => {
    void loadFolders();
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadNotes();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [activeFolder, activeView, searchQuery]);

  useEffect(() => {
    if (selectedNote) {
      setTagsInput(selectedNote.tags.join(', '));
      setLastSavedAt(selectedNote.updated_at);
      setSaveState('idle');
      return;
    }

    setTagsInput('');
    setLastSavedAt(null);
    setSaveState('idle');
  }, [selectedId]);

  const createNote = () => {
    const run = async () => {
      await flushPendingSave();
      setIsCreating(true);

      try {
        const response = await notebookApi.create({
          title: language === 'sw' ? 'Dokezo Jipya' : 'New Note',
          content: '',
          category: 'general',
          folder: DEFAULT_FOLDER,
          tags: [],
          is_pinned: false,
        });

        if (response.success && response.data) {
          setNotes((prev) => [response.data, ...prev]);
          setSelectedId(response.data.id);
          setTagsInput('');
          setLastSavedAt(response.data.updated_at);
          setSaveState('idle');
          setMobileView('editor');
          await loadFolders();
        }
      } catch (error: any) {
        toast({
          title: language === 'sw' ? 'Kosa!' : 'Error!',
          description: error?.message || (language === 'sw' ? 'Imeshindwa kuunda dokezo.' : 'Failed to create note.'),
          variant: 'destructive',
        });
      } finally {
        setIsCreating(false);
      }
    };

    void run();
  };

  const handleSelectNote = (noteId: number) => {
    const run = async () => {
      if (noteId === selectedId) {
        setMobileView('editor');
        return;
      }

      await flushPendingSave();
      const nextNote = notes.find((note) => note.id === noteId) || null;

      setSelectedId(noteId);
      setTagsInput(nextNote?.tags.join(', ') || '');
      setLastSavedAt(nextNote?.updated_at || null);
      setSaveState('idle');
      setMobileView('editor');
    };

    void run();
  };

  const updateSelected = (patch: Partial<Note>) => {
    if (!selectedNote) return;

    const nextNote: Note = {
      ...selectedNote,
      ...patch,
      updated_at: new Date().toISOString(),
    };

    setNotes((prev) => prev.map((item) => (item.id === selectedNote.id ? nextNote : item)));
    queueSave(selectedNote.id, buildSavePayload(nextNote));
  };

  const deleteSelected = () => {
    if (!selectedNote) return;

    const run = async () => {
      try {
        if (saveTimerRef.current) {
          window.clearTimeout(saveTimerRef.current);
          saveTimerRef.current = null;
        }

        if (pendingSaveRef.current?.id === selectedNote.id) {
          pendingSaveRef.current = null;
        }

        await notebookApi.delete(selectedNote.id);

        const remainingNotes = notes.filter((note) => note.id !== selectedNote.id);
        setNotes(remainingNotes);

        const nextSelected = remainingNotes[0] || null;
        setSelectedId(nextSelected?.id ?? null);
        setTagsInput(nextSelected?.tags.join(', ') || '');
        setLastSavedAt(nextSelected?.updated_at || null);
        setSaveState('idle');

        if (!nextSelected) {
          setMobileView('list');
        }

        await loadFolders();
      } catch (error: any) {
        toast({
          title: language === 'sw' ? 'Kosa!' : 'Error!',
          description: error?.message || (language === 'sw' ? 'Imeshindwa kufuta dokezo.' : 'Failed to delete note.'),
          variant: 'destructive',
        });
      }
    };

    void run();
  };

  const downloadNote = (note: Note) => {
    const safeTitle = (note.title || 'note').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '');
    const text = `Title: ${note.title}\nCategory: ${categoryLabel(note.category)}\nFolder: ${note.folder || DEFAULT_FOLDER}\nTags: ${note.tags.join(', ')}\nCreated: ${note.created_at}\nUpdated: ${note.updated_at}\n\n${note.content}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeTitle || 'note'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = async () => {
    setIsExporting(true);

    try {
      await flushPendingSave();

      const response = await notebookApi.export({
        search: searchQuery.trim() || undefined,
        category: activeView !== 'all' && activeView !== 'pinned' ? activeView : undefined,
        is_pinned: activeView === 'pinned' ? true : undefined,
        folder: activeFolder !== 'all' ? activeFolder : undefined,
      });

      const payload = response?.data?.notes || notes;
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kokotoa-notes.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: error?.message || (language === 'sw' ? 'Imeshindwa kupakua notes.' : 'Failed to export notes.'),
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout
      title={language === 'sw' ? 'Notebook' : 'Notebook'}
      subtitle={language === 'sw' ? 'Andika matumizi, madeni na mawazo yako kwa mpangilio' : 'Premium notes for expenses, debts and useful records'}
    >
      <div className="space-y-4">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <p className="font-semibold text-foreground">
                  {language === 'sw' ? 'Daftari lililopangwa vizuri' : 'Notebook, organized properly'}
                </p>
              </div>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {language === 'sw'
                  ? 'Tafuta haraka, chagua note kwa urahisi, na uandike bila maandishi kupotea wakati autosave inafanya kazi.'
                  : 'Search faster, switch between notes more cleanly, and type without losing edits while autosave runs.'}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={downloadAll} isLoading={isExporting}>
                <Download className="mr-2 h-4 w-4" />
                {language === 'sw' ? 'Pakua Zote' : 'Download All'}
              </Button>
              <Button className="btn-kokotoa" onClick={createNote} isLoading={isCreating}>
                <FilePlus2 className="mr-2 h-4 w-4" />
                {language === 'sw' ? 'Dokezo Jipya' : 'New Note'}
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {language === 'sw' ? 'Notes Zinazoonekana' : 'Visible Notes'}
              </p>
              <p className="mt-2 text-2xl font-black text-foreground">{noteSummary.total}</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {language === 'sw' ? 'Zilizobandikwa' : 'Pinned'}
              </p>
              <p className="mt-2 text-2xl font-black text-foreground">{noteSummary.pinned}</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {language === 'sw' ? 'Folders' : 'Folders'}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Layers3 className="h-5 w-5 text-primary" />
                <p className="text-2xl font-black text-foreground">{noteSummary.folders}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 xl:hidden">
          <Button
            className="flex-1"
            variant={mobileView === 'list' ? 'default' : 'outline'}
            onClick={() => setMobileView('list')}
          >
            {language === 'sw' ? 'Orodha ya Notes' : 'Notes List'}
          </Button>
          <Button
            className="flex-1"
            variant={mobileView === 'editor' ? 'default' : 'outline'}
            disabled={!selectedNote}
            onClick={() => setMobileView('editor')}
          >
            {language === 'sw' ? 'Sehemu ya Kuandika' : 'Editor'}
          </Button>
        </div>

        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
          <Card
            className={cn(
              'card-kokotoa overflow-hidden xl:sticky xl:top-6',
              mobileView === 'editor' && 'hidden xl:block'
            )}
          >
            <CardContent className="space-y-4 p-4">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'sw' ? 'Tafuta notes...' : 'Search notes...'}
                  />
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {language === 'sw' ? 'Chuja kwa aina' : 'Browse by type'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {viewOptions.map((item) => (
                      <Button
                        key={item.id}
                        size="sm"
                        variant={activeView === item.id ? 'default' : 'outline'}
                        onClick={() => setActiveView(item.id)}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2 rounded-2xl border border-border/60 bg-background/50 p-3">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <Folder className="h-3.5 w-3.5" />
                  {language === 'sw' ? 'Folders' : 'Folders'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={activeFolder === 'all' ? 'default' : 'outline'}
                    onClick={() => setActiveFolder('all')}
                  >
                    {language === 'sw' ? 'Yote' : 'All'}
                  </Button>
                  {folders.map((folder) => (
                    <Button
                      key={folder}
                      size="sm"
                      variant={activeFolder === folder ? 'default' : 'outline'}
                      onClick={() => setActiveFolder(folder)}
                    >
                      {folder}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {language === 'sw' ? 'Orodha ya Notes' : 'Notes list'}
                  </p>
                  <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[10px]">
                    {noteSummary.total}
                  </Badge>
                </div>

                <div className="max-h-[58vh] space-y-2 overflow-auto pr-1">
                  {isLoading ? (
                    <div className="flex justify-center py-10">
                      <MathLoader size="md" text={language === 'sw' ? 'Inapakia...' : 'Loading...'} />
                    </div>
                  ) : notes.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground">
                      <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-50" />
                      <p>{language === 'sw' ? 'Hakuna notes zilizopatikana.' : 'No notes found.'}</p>
                    </div>
                  ) : (
                    notes.map((note) => (
                      <button
                        key={note.id}
                        onClick={() => handleSelectNote(note.id)}
                        className={cn(
                          'w-full rounded-2xl border p-3 text-left transition',
                          selectedId === note.id
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border hover:border-primary/40 hover:bg-muted/40'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="line-clamp-1 text-sm font-semibold text-foreground">
                              {note.title || (language === 'sw' ? 'Bila kichwa' : 'Untitled')}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                              {note.content || (language === 'sw' ? 'Hakuna maudhui bado' : 'No content yet')}
                            </p>
                          </div>
                          {note.is_pinned && <Pin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {categoryLabel(note.category)}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {note.folder || DEFAULT_FOLDER}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(note.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              'card-kokotoa overflow-hidden',
              mobileView === 'list' && 'hidden xl:block'
            )}
          >
            <CardContent className="p-4 sm:p-5">
              {selectedNote ? (
                <div className="space-y-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 xl:hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-2 h-8 px-2"
                          onClick={() => setMobileView('list')}
                        >
                          <ArrowLeft className="mr-1 h-4 w-4" />
                          {language === 'sw' ? 'Rudi' : 'Back'}
                        </Button>
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {language === 'sw' ? 'Editor ya Dokezo' : 'Note editor'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'sw'
                          ? 'Andika kwa utulivu, autosave itahifadhi note yote uliyo nayo sasa.'
                          : 'Write without interruption. Autosave now stores the full note snapshot each time.'}
                      </p>
                    </div>

                    <Button
                      variant={selectedNote.is_pinned ? 'default' : 'outline'}
                      onClick={() => updateSelected({ is_pinned: !selectedNote.is_pinned })}
                    >
                      <Pin className="mr-2 h-4 w-4" />
                      {language === 'sw' ? 'Bandika' : 'Pin'}
                    </Button>
                  </div>

                  <Input
                    value={selectedNote.title}
                    onChange={(e) => updateSelected({ title: e.target.value })}
                    placeholder={language === 'sw' ? 'Kichwa cha dokezo...' : 'Note title...'}
                    className="h-12 rounded-2xl text-base font-semibold"
                  />

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <div>
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {language === 'sw' ? 'Aina' : 'Category'}
                      </p>
                      <select
                        value={selectedNote.category}
                        onChange={(e) => updateSelected({ category: e.target.value as NoteCategory })}
                        className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm"
                      >
                        <option value="expense">{categoryLabel('expense')}</option>
                        <option value="debt">{categoryLabel('debt')}</option>
                        <option value="useful">{categoryLabel('useful')}</option>
                        <option value="general">{categoryLabel('general')}</option>
                      </select>
                    </div>

                    <div>
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {language === 'sw' ? 'Folder' : 'Folder'}
                      </p>
                      <Input
                        value={selectedNote.folder}
                        onChange={(e) => updateSelected({ folder: e.target.value })}
                        onBlur={() => {
                          if (!selectedNote.folder.trim()) {
                            updateSelected({ folder: DEFAULT_FOLDER });
                          }
                        }}
                        placeholder={DEFAULT_FOLDER}
                        className="h-11 rounded-2xl"
                      />
                    </div>

                    <div>
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {language === 'sw' ? 'Tags' : 'Tags'}
                      </p>
                      <Input
                        value={tagsInput}
                        onChange={(e) => {
                          setTagsInput(e.target.value);
                          updateSelected({ tags: parseTags(e.target.value) });
                        }}
                        placeholder={language === 'sw' ? 'mfano: kodi, supplier' : 'e.g. rent, supplier'}
                        className="h-11 rounded-2xl"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-background/60 p-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{categoryLabel(selectedNote.category)}</Badge>
                        <Badge variant="secondary">{selectedNote.folder.trim() || DEFAULT_FOLDER}</Badge>
                        {selectedNote.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="border-primary/30 text-primary">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        <span>
                          {language === 'sw' ? 'Imebadilishwa:' : 'Updated:'}{' '}
                          {new Date(selectedNote.updated_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Textarea
                    value={selectedNote.content}
                    onChange={(e) => updateSelected({ content: e.target.value })}
                    placeholder={language === 'sw' ? 'Andika hapa...' : 'Write your note here...'}
                    className="min-h-[56vh] resize-y rounded-3xl border-border/60 bg-background/70 text-sm leading-6 shadow-inner"
                  />

                  <div className="flex flex-col gap-3 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {isSaving ? <LogoSpinner size="xs" /> : <Clock3 className="h-3.5 w-3.5" />}
                      <span>{saveMessage}</span>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button variant="outline" onClick={() => downloadNote(selectedNote)}>
                        <Download className="mr-2 h-4 w-4" />
                        {language === 'sw' ? 'Pakua Note' : 'Download Note'}
                      </Button>
                      <Button variant="destructive" onClick={deleteSelected}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {language === 'sw' ? 'Futa' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid min-h-[55vh] place-items-center text-center text-muted-foreground">
                  <div>
                    <BookOpen className="mx-auto mb-2 h-10 w-10 opacity-50" />
                    <p>{language === 'sw' ? 'Chagua note au tengeneza jipya.' : 'Select a note or create a new one.'}</p>
                    <Button className="mt-4 btn-kokotoa" onClick={createNote}>
                      <FilePlus2 className="mr-2 h-4 w-4" />
                      {language === 'sw' ? 'Anza Kuandika' : 'Start Writing'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notebook;
