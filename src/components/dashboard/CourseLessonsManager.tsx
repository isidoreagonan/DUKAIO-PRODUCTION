import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Plus, Trash2, GripVertical, Video, Upload, Link,
  ChevronDown, ChevronUp, Clock, PlayCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  video_type: "external" | "upload";
  duration_minutes: number | null;
  position: number;
  file?: File | null;
}

interface CourseLessonsManagerProps {
  lessons: Lesson[];
  onLessonsChange: (lessons: Lesson[]) => void;
}

const createLesson = (position: number): Lesson => ({
  id: crypto.randomUUID(),
  title: "",
  description: "",
  video_url: "",
  video_type: "external",
  duration_minutes: null,
  position,
  file: null,
});

const CourseLessonsManager = ({ lessons, onLessonsChange }: CourseLessonsManagerProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addLesson = () => {
    const newLesson = createLesson(lessons.length);
    const updated = [...lessons, newLesson];
    onLessonsChange(updated);
    setExpandedId(newLesson.id);
  };

  const updateLesson = (id: string, changes: Partial<Lesson>) => {
    onLessonsChange(lessons.map(l => l.id === id ? { ...l, ...changes } : l));
  };

  const removeLesson = (id: string) => {
    const updated = lessons
      .filter(l => l.id !== id)
      .map((l, i) => ({ ...l, position: i }));
    onLessonsChange(updated);
    if (expandedId === id) setExpandedId(null);
  };

  const handleReorder = (reordered: Lesson[]) => {
    onLessonsChange(reordered.map((l, i) => ({ ...l, position: i })));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Leçons du cours</h3>
          <p className="text-xs text-muted-foreground">
            {lessons.length} leçon{lessons.length !== 1 ? "s" : ""} • Glissez pour réorganiser
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-full"
          onClick={addLesson}
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter
        </Button>
      </div>

      {lessons.length === 0 ? (
        <div
          className="rounded-xl border-2 border-dashed border-border bg-secondary/30 p-10 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={addLesson}
        >
          <PlayCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Aucune leçon pour le moment</p>
          <p className="text-xs text-muted-foreground mt-1">Cliquez pour ajouter votre première leçon</p>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={lessons}
          onReorder={handleReorder}
          className="space-y-2"
        >
          <AnimatePresence initial={false}>
            {lessons.map((lesson, index) => (
              <Reorder.Item
                key={lesson.id}
                value={lesson}
                className="list-none"
              >
                <motion.div
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  {/* Header row */}
                  <div className="flex items-center gap-2 p-3">
                    <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors">
                      <GripVertical className="h-4 w-4" />
                    </div>

                    <div className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{index + 1}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {expandedId === lesson.id ? (
                        <Input
                          value={lesson.title}
                          onChange={(e) => updateLesson(lesson.id, { title: e.target.value })}
                          placeholder="Titre de la leçon"
                          className="h-8 text-sm"
                          autoFocus
                        />
                      ) : (
                        <p
                          className="text-sm font-medium text-foreground truncate cursor-pointer"
                          onClick={() => toggleExpand(lesson.id)}
                        >
                          {lesson.title || <span className="text-muted-foreground italic">Sans titre</span>}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {lesson.video_url && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Video className="h-3 w-3" />
                        </span>
                      )}
                      {lesson.duration_minutes && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {lesson.duration_minutes}min
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => toggleExpand(lesson.id)}
                      >
                        {expandedId === lesson.id ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeLesson(lesson.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {expandedId === lesson.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-4 space-y-4 border-t border-border pt-3">
                          {/* Description */}
                          <div>
                            <label className="text-xs font-medium text-foreground mb-1 block">Description (optionnel)</label>
                            <Input
                              value={lesson.description}
                              onChange={(e) => updateLesson(lesson.id, { description: e.target.value })}
                              placeholder="Brève description de la leçon"
                              className="h-9 text-sm"
                            />
                          </div>

                          {/* Video type selector */}
                          <div>
                            <label className="text-xs font-medium text-foreground mb-1 block">Type de contenu vidéo</label>
                            <Select
                              value={lesson.video_type}
                              onValueChange={(v) => updateLesson(lesson.id, { video_type: v as "external" | "upload", video_url: "", file: null })}
                            >
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="external">
                                  <span className="flex items-center gap-2"><Link className="h-3.5 w-3.5" /> Lien externe (YouTube, Vimeo…)</span>
                                </SelectItem>
                                <SelectItem value="upload">
                                  <span className="flex items-center gap-2"><Upload className="h-3.5 w-3.5" /> Upload vidéo</span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Video input */}
                          {lesson.video_type === "external" ? (
                            <div>
                              <label className="text-xs font-medium text-foreground mb-1 block">URL de la vidéo</label>
                              <Input
                                value={lesson.video_url}
                                onChange={(e) => updateLesson(lesson.id, { video_url: e.target.value })}
                                placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                                className="h-9 text-sm"
                              />
                            </div>
                          ) : (
                            <div>
                              <label className="text-xs font-medium text-foreground mb-1 block">Fichier vidéo</label>
                              <div
                                className="rounded-lg border-2 border-dashed border-border bg-secondary/30 p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                                onClick={() => document.getElementById(`lesson-video-${lesson.id}`)?.click()}
                              >
                                <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                                <p className="text-xs text-muted-foreground">
                                  {lesson.file ? `📎 ${lesson.file.name}` : "Cliquez pour uploader (MP4, WebM… max 500MB)"}
                                </p>
                                <input
                                  id={`lesson-video-${lesson.id}`}
                                  type="file"
                                  accept="video/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) updateLesson(lesson.id, { file: f, video_url: f.name });
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Duration */}
                          <div>
                            <label className="text-xs font-medium text-foreground mb-1 block">Durée (minutes)</label>
                            <Input
                              type="number"
                              value={lesson.duration_minutes ?? ""}
                              onChange={(e) => updateLesson(lesson.id, { duration_minutes: e.target.value ? parseInt(e.target.value) : null })}
                              placeholder="Ex: 15"
                              className="h-9 text-sm w-32"
                              min="0"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      {lessons.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={addLesson}
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter une leçon
        </Button>
      )}
    </div>
  );
};

export default CourseLessonsManager;
