import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useCurrentUserId } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, User, ExternalLink, FileText, Video, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';
import ViewingAsBanner from '@/components/layout/ViewingAsBanner';

type Review = Tables<'reviews'>;
type Document = Tables<'documents'>;

export default function Reviews() {
  const userId = useCurrentUserId();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setSelectedId(null);

    Promise.all([
      supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .order('review_date', { ascending: false, nullsFirst: false }),
      supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId),
    ]).then(([reviewsRes, docsRes]) => {
      const list = reviewsRes.data ?? [];
      setReviews(list);
      setDocuments(docsRes.data ?? []);
      setSelectedId(list[0]?.id ?? null);
      setLoading(false);
    });
  }, [userId]);

  const selected = reviews.find(r => r.id === selectedId) ?? null;

  const reviewDocs = documents.filter(d =>
    d.type.toLowerCase().includes('review')
  );

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <ViewingAsBanner />
        
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Reviews</h1>
          <p className="text-muted-foreground text-sm mt-1">Performance reviews and meeting notes</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No reviews yet. Past and upcoming performance reviews will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
            <Card className="lg:w-64 shrink-0">
              <CardContent className="p-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Reviews</p>
                <div className="space-y-1">
                  {reviews.map(r => {
                    const isActive = r.id === selectedId;
                    const isCompleted = !!r.completed_date;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setSelectedId(r.id)}
                        className={cn(
                          'w-full text-left rounded-lg px-3 py-2.5 text-sm transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-muted text-foreground'
                        )}
                      >
                        <p className="font-medium truncate">{r.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-muted-foreground">{formatDate(r.review_date)}</span>
                          {isCompleted && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">Done</Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {selected && (
              <Card className="flex-1">
                <CardContent className="p-4 md:p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold">{selected.title}</h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      {selected.completed_date ? (
                        <Badge variant="default">Completed</Badge>
                      ) : (
                        <Badge variant="secondary">Scheduled</Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-2">Summary</h3>
                    {selected.summary ? (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selected.summary}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No summary available.</p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-3">Review Session</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-muted-foreground text-xs">Review Date</p>
                          <p>{formatDate(selected.review_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-muted-foreground text-xs">Meeting Link</p>
                          {selected.meeting_link ? (
                            <a
                              href={selected.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate block"
                            >
                              Open Link
                            </a>
                          ) : (
                            <p className="text-muted-foreground italic">Not provided</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-3">Compensation Outcome</h3>
                    <div className="flex items-center gap-2 text-sm">
                      {selected.raise ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>Raise applicable</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">No raise applicable</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-3">Documents</h3>
                    {reviewDocs.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No documents attached.</p>
                    ) : (
                      <div className="space-y-2">
                        {reviewDocs.map(doc => (
                          <a
                            key={doc.id}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <FileText className="h-4 w-4" />
                            {doc.type}
                            <ExternalLink className="h-3 w-3 ml-auto" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-3">Metadata</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-muted-foreground text-xs">Reviewer</p>
                          <p>{selected.reviewer ?? '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-muted-foreground text-xs">Completed Date</p>
                          <p>{formatDate(selected.completed_date)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
