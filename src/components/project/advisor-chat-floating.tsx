
"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, setDoc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

interface AdvisorChatFloatingProps {
  projectId: string;
  projectTitle: string;
  studentId: string;
  advisorIds: string[];
}

export function AdvisorChatFloating({ projectId, projectTitle, studentId, advisorIds }: AdvisorChatFloatingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const db = useFirestore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const commentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "projects", projectId, "comments"),
      orderBy("createdAt", "asc")
    );
  }, [db, projectId]);

  const { data: comments, isLoading } = useCollection(commentsQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments, isOpen]);

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !db) return;
    setIsSubmitting(true);

    try {
      const commentId = doc(collection(db, `projects/${projectId}/comments`)).id;
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      await setDoc(doc(db, "projects", projectId, "comments", commentId), {
        id: commentId,
        projectId,
        studentId,
        advisorIds,
        authorId: user.uid,
        authorName: `${userData?.firstName} ${userData?.lastName}`,
        authorRole: userData?.role,
        content: message,
        targetEntityType: "Project",
        targetEntityId: projectId,
        createdAt: new Date().toISOString(),
      });

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <Card className="w-80 md:w-96 h-[450px] shadow-2xl border-none animate-in slide-in-from-bottom-5 duration-300 flex flex-col overflow-hidden">
          <CardHeader className="bg-primary p-4 text-white flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-tight">Canal de Asesoría</CardTitle>
                <p className="text-[10px] text-white/70 truncate max-w-[150px]">{projectTitle}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 h-8 w-8">
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 flex flex-col bg-slate-50">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-primary opacity-50" />
                  </div>
                ) : comments?.length === 0 ? (
                  <div className="text-center py-10 space-y-2 opacity-50">
                    <User className="h-10 w-10 mx-auto text-muted-foreground" />
                    <p className="text-xs font-bold">Inicia la conversación con tu asesor</p>
                  </div>
                ) : (
                  comments?.map((comment) => (
                    <div key={comment.id} className={cn(
                      "flex flex-col space-y-1",
                      comment.authorId === user?.uid ? "items-end" : "items-start"
                    )}>
                      <span className="text-[9px] font-black uppercase text-muted-foreground px-1">{comment.authorName}</span>
                      <div className={cn(
                        "p-3 rounded-2xl text-xs max-w-[85%] shadow-sm",
                        comment.authorId === user?.uid 
                          ? "bg-primary text-white rounded-tr-none" 
                          : "bg-white border text-slate-800 rounded-tl-none"
                      )}>
                        {comment.content}
                      </div>
                      <span className="text-[8px] text-muted-foreground px-1">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
            
            <div className="p-4 bg-white border-t space-y-2">
              <Textarea 
                placeholder="Escribe tu mensaje..."
                className="min-h-[60px] max-h-[120px] text-xs resize-none bg-slate-50 border-none focus-visible:ring-primary"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <div className="flex justify-end">
                <Button size="sm" onClick={handleSendMessage} disabled={isSubmitting || !message.trim()} className="rounded-full gap-2 px-4 shadow-md">
                  {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                  Enviar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full shadow-2xl transition-all duration-300",
          isOpen ? "bg-accent rotate-90" : "bg-primary hover:scale-110"
        )}
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
}
