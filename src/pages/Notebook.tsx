import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Download,
  FilePlus2,
  Folder,
  Pin,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

type NoteCategory = 'expense' | 'debt' | 'useful' | 'general';
type NotesView = 'all' | 'pinned' | NoteCategory;

interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  folder: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_FOLDER = 'My Notes';

const Notebook = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const storageKey = `kokotoa_notebook_${user?.id || 'guest'}`;
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<NotesView>('all');
  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as NoteItem[];
      if (Array.isArray(parsed)) {
        setNotes(parsed);
        if (parsed[0]) setSelectedId(parsed[0].id);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notes));
  }, [notes, storageKey]);

  const folders = useMemo(() => {
    const unique = new Set<string>();
    notes.forEach((note) => unique.add(note.folder || DEFAULT_FOLDER));
    return [DEFAULT_FOLDER, ...Array.from(unique).filter((f) => f !== DEFAULT_FOLDER)];
  }, [notes]);

  const filteredNotes = useMemo(() => {
    let data = [...notes];

    if (activeView === 'pinned') {
      data = data.filter((n) => n.pinned);
    } else if (activeView !== 'all') {
      data = data.filter((n) => n.category === activeView);
    }

    if (activeFolder !== 'all') {
      data = data.filter((n) => (n.folder || DEFAULT_FOLDER) === activeFolder);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter((n) => {
        return (
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.join(' ').toLowerCase().includes(q)
        );
      });
    }

    return data.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [notes, activeView, activeFolder, searchQuery]);

  const selectedNote = useMemo(() => {
    if (!selectedId) return null;
    return notes.find((n) => n.id === selectedId) || null;
  }, [notes, selectedId]);

  const categoryLabel = (category: NoteCategory) => {
    if (category === 'expense') return language === 'sw' ? 'Matumizi' : 'Expense';
    if (category === 'debt') return language === 'sw' ? 'Deni' : 'Debt';
    if (category === 'useful') return language === 'sw' ? 'Muhimu' : 'Useful';
    return language === 'sw' ? 'Kawaida' : 'General';
  };

  const createNote = () => {
    const now = new Date().toISOString();
    const item: NoteItem = {
      id: `note_${Date.now()}`,
      title: language === 'sw' ? 'Dokezo Jipya' : 'New Note',
      content: '',
      category: 'general',
      folder: DEFAULT_FOLDER,
      tags: [],
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [item, ...prev]);
    setSelectedId(item.id);
  };

  const updateSelected = (patch: Partial<NoteItem>) => {
    if (!selectedId) return;
    setNotes((prev) =>
      prev.map((item) =>
        item.id === selectedId
          ? { ...item, ...patch, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setNotes((prev) => prev.filter((item) => item.id !== selectedId));
    setSelectedId((current) => {
      if (current !== selectedId) return current;
      const next = filteredNotes.find((n) => n.id !== selectedId);
      return next?.id || null;
    });
  };

  const downloadNote = (note: NoteItem) => {
    const text = `Title: ${note.title}\nCategory: ${categoryLabel(note.category)}\nFolder: ${note.folder}\nTags: ${note.tags.join(', ')}\nCreated: ${note.createdAt}\nUpdated: ${note.updatedAt}\n\n${note.content}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title || 'note'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kokotoa-notes.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseTags = (raw: string) => {
    return raw
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  };

  return (
    <DashboardLayout
      title={language === 'sw' ? 'Notebook' : 'Notebook'}
      subtitle={language === 'sw' ? 'Andika matumizi, madeni na mawazo yako kwa mpangilio' : 'Premium notes for expenses, debts and useful records'}
    >
      <div className="space-y-4">
        <div className="rounded-2xl p-4 sm:p-5 border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <p className="font-semibold">
                {language === 'sw' ? 'Notebook ya kisasa kama Apple Notes' : 'Apple-notes style workspace'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadAll}>
                <Download className="w-4 h-4 mr-2" />
                {language === 'sw' ? 'Pakua Zote' : 'Download All'}
              </Button>
              <Button className="btn-kokotoa" onClick={createNote}>
                <FilePlus2 className="w-4 h-4 mr-2" />
                {language === 'sw' ? 'Dokezo Jipya' : 'New Note'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4">
          <Card className="card-kokotoa overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'sw' ? 'Tafuta notes...' : 'Search notes...'}
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: language === 'sw' ? 'Zote' : 'All' },
                  { id: 'pinned', label: language === 'sw' ? 'Zilizobandikwa' : 'Pinned' },
                  { id: 'expense', label: language === 'sw' ? 'Matumizi' : 'Expense' },
                  { id: 'debt', label: language === 'sw' ? 'Madeni' : 'Debts' },
                  { id: 'useful', label: language === 'sw' ? 'Muhimu' : 'Useful' },
                ].map((item) => (
                  <Button
                    key={item.id}
                    size="sm"
                    variant={activeView === (item.id as NotesView) ? 'default' : 'outline'}
                    onClick={() => setActiveView(item.id as NotesView)}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1">
                  <Folder className="w-3 h-3" />
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

              <div className="space-y-2 max-h-[50vh] overflow-auto pr-1">
                {filteredNotes.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>{language === 'sw' ? 'Hakuna notes zilizopatikana.' : 'No notes found.'}</p>
                  </div>
                ) : (
                  filteredNotes.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => setSelectedId(note.id)}
                      className={`w-full text-left rounded-xl border p-3 transition ${
                        selectedId === note.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40 hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm line-clamp-1">{note.title || (language === 'sw' ? 'Bila kichwa' : 'Untitled')}</p>
                        {note.pinned && <Pin className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{note.content || (language === 'sw' ? 'Hakuna maudhui bado' : 'No content yet')}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-[10px]">{categoryLabel(note.category)}</Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="card-kokotoa overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              {selectedNote ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={selectedNote.title}
                      onChange={(e) => updateSelected({ title: e.target.value })}
                      placeholder={language === 'sw' ? 'Kichwa cha dokezo...' : 'Note title...'}
                      className="text-base font-semibold"
                    />
                    <Button
                      variant={selectedNote.pinned ? 'default' : 'outline'}
                      onClick={() => updateSelected({ pinned: !selectedNote.pinned })}
                    >
                      <Pin className="w-4 h-4 mr-2" />
                      {language === 'sw' ? 'Bandika' : 'Pin'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                        {language === 'sw' ? 'Aina' : 'Category'}
                      </p>
                      <select
                        value={selectedNote.category}
                        onChange={(e) => updateSelected({ category: e.target.value as NoteCategory })}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="expense">{categoryLabel('expense')}</option>
                        <option value="debt">{categoryLabel('debt')}</option>
                        <option value="useful">{categoryLabel('useful')}</option>
                        <option value="general">{categoryLabel('general')}</option>
                      </select>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                        {language === 'sw' ? 'Folder' : 'Folder'}
                      </p>
                      <Input
                        value={selectedNote.folder}
                        onChange={(e) => updateSelected({ folder: e.target.value || DEFAULT_FOLDER })}
                        placeholder={DEFAULT_FOLDER}
                      />
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                        {language === 'sw' ? 'Tags (comma)' : 'Tags (comma)'}
                      </p>
                      <Input
                        value={selectedNote.tags.join(', ')}
                        onChange={(e) => updateSelected({ tags: parseTags(e.target.value) })}
                        placeholder={language === 'sw' ? 'mfano: kodi, supplier' : 'e.g. rent, supplier'}
                      />
                    </div>
                  </div>

                  <Textarea
                    value={selectedNote.content}
                    onChange={(e) => updateSelected({ content: e.target.value })}
                    placeholder={language === 'sw' ? 'Andika hapa...' : 'Write your note here...'}
                    className="min-h-[52vh] text-sm leading-6 bg-background/70"
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      {language === 'sw' ? 'Imehaririwa:' : 'Updated:'} {new Date(selectedNote.updatedAt).toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => downloadNote(selectedNote)}>
                        <Download className="w-4 h-4 mr-2" />
                        {language === 'sw' ? 'Pakua Note' : 'Download Note'}
                      </Button>
                      <Button variant="destructive" onClick={deleteSelected}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        {language === 'sw' ? 'Futa' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="min-h-[55vh] grid place-items-center text-center text-muted-foreground">
                  <div>
                    <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>{language === 'sw' ? 'Chagua note au tengeneza jipya.' : 'Select a note or create a new one.'}</p>
                    <Button className="mt-4 btn-kokotoa" onClick={createNote}>
                      <FilePlus2 className="w-4 h-4 mr-2" />
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
