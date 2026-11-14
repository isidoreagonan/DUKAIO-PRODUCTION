import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Plus, Trash2, GripVertical, Video, Upload, Link,
  ChevronDown, ChevronUp, Clock, PlayCircle,
  Loader2, CheckCircle2, Cloud, AlertCircle, Film
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadToBunny, deleteFromBunny } from "@/lib/bunnyStorage";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  video_type: "external" | "upload";
  duration_minutes: number | null;
  position: number;
  file?: File | null;
  isUploading?: boolean;
  progress?: number;
  error?: string;
  file_name?: string;
  file_size?: number;
  bunny_path?: string;
}

interface CourseLessonsManagerProps {
  lessons: Lesson[];
  onLessonsChange: (lessons: Lesson[]) => void;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  fileName: string;
  fileSize?: number;
  error?: string;
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
  isUploading: false,
  progress: 0,
});

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

const CourseLessonsManager = ({ lessons, onLessonsChange }: CourseLessonsManagerProps) => {
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadMap, setUploadMap] = useState<Record<string, UploadState>>({});

  // Use a ref to guarantee closures always access the latest lessons array
  const lessonsRef = useRef<Lesson[]>(lessons);
  useEffect(() => {
    lessonsRef.current = lessons;
  }, [lessons]);

  const updateLesson = (id: string, changes: Partial<Lesson>) => {
    const updated = lessonsRef.current.map(l => l.id === id ? { ...l, ...changes } : l);
    lessonsRef.current = updated;
    onLessonsChange(updated);
  };

  const addLesson = () => {
    const newLesson = createLesson(lessons.length);
    const updated = [...lessonsRef.current, newLesson];
    lessonsRef.current = updated;
    onLessonsChange(updated);
    setExpandedId(newLesson.id);
  };

  const removeLesson = async (id: string) => {
    const target = lessonsRef.current.find(l => l.id === id);
    if (target?.bunny_path) {
      await deleteFromBunny(target.bunny_path, "files");
    }
    const updated = lessonsRef.current
      .filter(l => l.id !== id)
      .map((l, i) => ({ ...l, position: i }));
    lessonsRef.current = updated;
    onLessonsChange(updated);
    if (expandedId === id) setExpandedId(null);
  };

  const handleReorder = (reordered: Lesson[]) => {
    const updated = reordered.map((l, i) => ({ ...l, position: i }));
    lessonsRef.current = updated;
    onLessonsChange(updated);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleVideoSelect = async (lessonId: string, file: File) => {
    if (!file) return;

    // Max size 500MB
    const maxBytes = 500 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error("La vidéo ne doit pas dépasser 500 Mo");
      return;
    }

    // Set local state to prevent disappearance
    setUploadMap(prev => ({
      ...prev,
      [lessonId]: {
        isUploading: true,
        progress: 0,
        fileName: file.name,
        fileSize: file.size,
        error: undefined,
      }
    }));

    // Update parent lesson state
    updateLesson(lessonId, {
      isUploading: true,
      progress: 0,
      file_name: file.name,
      file_size: file.size,
      error: undefined,
    });

    try {
      let currentUserId = user?.id;
      if (!currentUserId) {
        const { data } = await supabase.auth.getUser();
        currentUserId = data?.user?.id || "anonymous";
      }

      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storagePath = `courses/${currentUserId}/${Date.now()}_${cleanName}`;

      const res = await uploadToBunny(file, storagePath, "files", (percent) => {
        setUploadMap(prev => {
          if (!prev[lessonId]) return prev;
          return {
            ...prev,
            [lessonId]: {
              ...prev[lessonId],
              progress: percent,
              isUploading: true,
            }
          };
        });

        updateLesson(lessonId, {
          isUploading: true,
          progress: percent,
        });
      });

      // Succeeded
      setUploadMap(prev => {
        const next = { ...prev };
        delete next[lessonId];
        return next;
      });

      updateLesson(lessonId, {
        isUploading: false,
        progress: 100,
        video_url: res.url,
        bunny_path: res.path,
        file_name: file.name,
        file_size: file.size,
        file: null,
        error: undefined,
      });

      toast.success(`Vidéo "${file.name}" téléversée avec succès !`);
    } catch (err: any) {
      console.error("[CourseLessonsManager] Video upload error:", err);
      const errMsg = err.message || "Erreur de connexion lors du téléversement";

      setUploadMap(prev => ({
        ...prev,
        [lessonId]: {
          isUploading: false,
          progress: 0,
          fileName: file.name,
          error: errMsg,
        }
      }));

      updateLesson(lessonId, {
        isUploading: false,
        error: errMsg,
      });

      toast.error(`Échec du téléversement : ${errMsg}`);
    }
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
            {lessons.map((lesson, index) => {
              const uploadInfo = uploadMap[lesson.id];
              const isUploading = uploadInfo?.isUploading || lesson.isUploading;
              const uploadProgress = uploadInfo?.progress ?? lesson.progress ?? 0;
              const uploadFileName = uploadInfo?.fileName || lesson.file_name;
              const uploadFileSize = uploadInfo?.fileSize || lesson.file_size;
              const uploadError = uploadInfo?.error || lesson.error;

              return (
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
                          <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => toggleExpand(lesson.id)}
                          >
                            <p className="text-sm font-medium text-foreground truncate">
                              {lesson.title || <span className="text-muted-foreground italic">Sans titre</span>}
                            </p>
                            {isUploading && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full shrink-0">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                {uploadProgress}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {lesson.video_url && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1" title="Vidéo configurée">
                            <Video className="h-3 w-3 text-emerald-500" />
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
                                onValueChange={(v) => updateLesson(lesson.id, { video_type: v as "external" | "upload", video_url: "", file: null, error: undefined })}
                              >
                                <SelectTrigger className="h-9 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="external">
                                    <span className="flex items-center gap-2"><Link className="h-3.5 w-3.5" /> Lien externe (YouTube, Vimeo…)</span>
                                  </SelectItem>
                                  <SelectItem value="upload">
                                    <span className="flex items-center gap-2"><Upload className="h-3.5 w-3.5" /> Upload vidéo direct</span>
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
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="text-xs font-medium text-foreground">Fichier vidéo</label>
                                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <Cloud className="h-3 w-3 text-blue-500" />
                                    <span>Hébergement cloud sécurisé</span>
                                  </span>
                                </div>

                                {/* Upload in progress state */}
                                {isUploading ? (
                                  <div className="rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 p-3 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <div className="h-7 w-7 rounded-md bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                                          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-xs font-semibold text-foreground truncate">
                                            {uploadFileName || "Vidéo en cours"}
                                          </p>
                                          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                                            Téléversement en cours...
                                            {uploadFileSize ? ` (${formatFileSize(uploadFileSize)})` : ""}
                                          </p>
                                        </div>
                                      </div>
                                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
                                        {uploadProgress}%
                                      </span>
                                    </div>

                                    <Progress value={uploadProgress} className="h-1.5 w-full bg-blue-100 dark:bg-blue-900/40" />

                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                      <span className="italic">Ne quittez pas la page pendant le transfert</span>
                                      <span className="font-semibold text-foreground">{uploadProgress}% / 100%</span>
                                    </div>
                                  </div>
                                ) : lesson.video_url && !uploadError ? (
                                  /* Uploaded state */
                                  <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-2.5 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="h-7 w-7 rounded-md bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                                        <Film className="h-3.5 w-3.5" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-semibold text-foreground truncate">
                                          {uploadFileName || lesson.file_name || lesson.video_url.split("/").pop() || "Vidéo téléversée"}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                            Vidéo téléversée avec succès (100%)
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                                        onClick={() => document.getElementById(`lesson-video-${lesson.id}`)?.click()}
                                      >
                                        Remplacer
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                        onClick={async () => {
                                          if (lesson.bunny_path) {
                                            await deleteFromBunny(lesson.bunny_path, "files");
                                          }
                                          updateLesson(lesson.id, {
                                            video_url: "",
                                            bunny_path: undefined,
                                            file_name: undefined,
                                            file_size: undefined,
                                            progress: 0,
                                            isUploading: false,
                                            error: undefined,
                                          });
                                        }}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                ) : uploadError ? (
                                  /* Error state */
                                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 space-y-2">
                                    <div className="flex items-center gap-2 text-destructive text-xs font-semibold">
                                      <AlertCircle className="h-4 w-4 shrink-0" />
                                      <span>Échec du téléversement : {uploadError}</span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-xs"
                                      onClick={() => document.getElementById(`lesson-video-${lesson.id}`)?.click()}
                                    >
                                      Réessayer le téléversement
                                    </Button>
                                  </div>
                                ) : (
                                  /* Empty state / Dropzone */
                                  <div
                                    className="rounded-lg border-2 border-dashed border-border bg-secondary/20 hover:bg-secondary/40 p-5 text-center cursor-pointer hover:border-primary/50 transition-all"
                                    onClick={() => document.getElementById(`lesson-video-${lesson.id}`)?.click()}
                                  >
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1.5 text-primary">
                                      <Upload className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs font-semibold text-foreground">
                                      Cliquez pour choisir et uploader la vidéo
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                      MP4, WebM, MOV (jusqu'à 500 Mo)
                                    </p>
                                    <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full bg-blue-50/60 dark:bg-blue-950/40 text-[10px] font-medium text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50">
                                      <Cloud className="h-3 w-3 text-blue-500" />
                                      <span>Hébergement vidéo haute vitesse</span>
                                    </div>
                                  </div>
                                )}

                                <input
                                  id={`lesson-video-${lesson.id}`}
                                  type="file"
                                  accept="video/mp4,video/webm,video/quicktime,video/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleVideoSelect(lesson.id, f);
                                    e.target.value = "";
                                  }}
                                />
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
              );
            })}
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
