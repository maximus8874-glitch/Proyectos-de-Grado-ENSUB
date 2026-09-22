
"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, deleteDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Plus, FileText, Loader2, FileWarning, ArrowRight, Trash2, TrendingUp, Search, Edit3 } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/project/status-badge";
import { DegreeProject } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useLanguage } from "@/context/language-context";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function StudentDashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const { t } = useLanguage();

  const projectsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "projects"),
      where("studentId", "==", user.uid)
    );
  }, [db, user]);

  const { data: projects, isLoading } = useCollection<DegreeProject>(projectsQuery);

  const handleDeleteDraft = (projectId: string) => {
    if (!db) return;
    const docRef = doc(db, "projects", projectId);
    deleteDoc(docRef).catch(async (serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' }));
    });
    toast({ title: t('saved') });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const drafts = projects?.filter(p => p.status === 'Borrador') || [];
  const activeProjects = projects?.filter(p => p.status !== 'Borrador') || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">{t('studentTitle')}</h1>
          <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest mt-1">{t('studentDesc')}</p>
        </div>
        <Button className="gap-2 rounded-full shadow-lg" asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="h-5 w-5" /> {t('newProposal')}
          </Link>
        </Button>
      </div>

      {drafts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-accent" />
            <h2 className="text-sm font-black uppercase tracking-tight">{t('draftProposals')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drafts.map(draft => (
              <Card key={draft.id} className="border-accent/20 bg-accent/5 hover:bg-accent/10 transition-colors shadow-none border-dashed border-2 relative">
                <div className="absolute top-2 right-2 z-10">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('confirmDeleteDesc')}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteDraft(draft.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          {t('deleteDraft')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <CardHeader className="pb-3 pr-10">
                  <CardTitle className="text-base font-bold line-clamp-1">{draft.title || "..."}</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold text-accent">{t('lastUpdate')}: {draft.updatedAt ? new Date(draft.updatedAt).toLocaleString() : 'N/A'}</CardDescription>
                </CardHeader>
                <CardFooter className="flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase text-accent">
                      <span className="flex items-center gap-1"><TrendingUp className="h-2.5 w-2.5" /> {t('progress')}</span>
                      <span>{draft.progressPercent || 1}%</span>
                    </div>
                    <Progress value={draft.progressPercent || 1} className="h-1 bg-accent/20" />
                  </div>
                  <Button variant="ghost" size="sm" className="h-auto py-1.5 px-3 text-accent font-bold group shrink-0 border border-accent/10 hover:bg-accent/10" asChild>
                    <Link href={`/dashboard/projects/new?draftId=${draft.id}`} className="flex items-center gap-2">
                      <div className="flex flex-col items-end leading-none text-[10px] uppercase tracking-tighter">
                        <span>{t('continueDrafting').split(' ')[0]}</span>
                        <span className="mt-0.5 opacity-80">{t('continueDrafting').split(' ').slice(1).join(' ')}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-black uppercase tracking-tight">{t('sentProjects')}</h2>
        </div>
        {!activeProjects || activeProjects.length === 0 ? (
          <Card className="bg-muted/30 border-dashed py-12 text-center">
            <CardContent className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold">{t('noSentProjects')}</h3>
                <p className="text-sm text-muted-foreground">{t('noSentProjectsDesc')}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {activeProjects.map(project => {
              // Si no es borrador, el progreso de la propuesta es 100%
              const displayProgress = project.status !== 'Borrador' ? 100 : (project.progressPercent || 1);

              return (
                <Card key={project.id} className="hover:shadow-md transition-all group overflow-hidden border-none shadow-sm">
                  <div className="h-1 w-full bg-primary/20 group-hover:bg-primary transition-colors" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div className="space-y-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        <Link href={`/dashboard/projects/${project.id}`}>{project.title}</Link>
                      </CardTitle>
                      <div className="flex items-center gap-3">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">
                          {t('sentAt')}: {project.proposalDate ? new Date(project.proposalDate).toLocaleDateString() : 'N/A'}
                        </p>
                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                        <p className="text-[10px] font-bold uppercase text-primary">{project.programa}</p>
                      </div>
                    </div>
                    <StatusBadge status={project.status} />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground line-clamp-1 flex-1 pr-10">{project.summary}</p>
                      <Button variant="outline" size="sm" asChild className="rounded-full px-6 group transition-all">
                        <Link href={project.status === 'Corregir' ? `/dashboard/projects/new?draftId=${project.id}` : `/dashboard/projects/${project.id}`}>
                          {project.status === 'Corregir' ? (
                            <span className="flex items-center gap-2 text-orange-600 font-black">
                              <Edit3 className="h-3 w-3" /> {t('corregir')} <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Search className="h-3 w-3" /> {t('observe')}
                            </span>
                          )}
                        </Link>
                      </Button>
                    </div>
                    
                    <div className="space-y-1.5 p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase">
                        <span className="flex items-center gap-1.5 text-primary">
                          <TrendingUp className="h-3 w-3" /> Progreso de Avance
                        </span>
                        <span>{displayProgress}%</span>
                      </div>
                      <Progress value={displayProgress} className="h-1.5 bg-slate-200" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
