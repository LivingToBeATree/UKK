import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Star, ExternalLink, UserPlus, UserCheck } from 'lucide-react';
import { artistProfileApi, followApi, portfolioApi, type Portfolio } from '@/services/artistService';
import { commissionServiceApi, commissionReviewApi, type CommissionReview } from '@/services/commissionService';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import type { ArtistProfile, CommissionService } from '@/types';

export const ArtistProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const { requireAuth } = useAuthModal();
    const [profile, setProfile] = useState<ArtistProfile | null>(null);
    const [services, setServices] = useState<CommissionService[]>([]);
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [reviews, setReviews] = useState<CommissionReview[]>([]);
    const [following, setFollowing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        if (isNaN(Number(id))) {
            navigate(`/users/${id}`, { replace: true });
            return;
        }

        const fetchData = async () => {
            try {
                const artistProfile = await artistProfileApi.show(Number(id));
                setProfile(artistProfile);
                const [svcRes, reviewsRes] = await Promise.all([
                    commissionServiceApi.list(1, { artist_profile_id: String(id) }),
                    commissionReviewApi.listForArtist(Number(id)),
                ]);
                setServices(svcRes.data);
                setReviews(reviewsRes.data);
                try {
                    const portRes = await portfolioApi.list(1);
                    setPortfolios(portRes.data);
                } catch { /* portfolios might not be accessible */ }
            } catch {
                toast.error('Failed to load artist profile');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    const handleFollow = async () => {
        if (!profile?.user_id) return;
        if (!requireAuth('follow')) return;
        try {
            const res = await followApi.toggle(profile.user_id);
            setFollowing(res.following);
            toast.success(res.following ? 'Followed!' : 'Unfollowed');
        } catch {
            toast.error('Failed to follow');
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-8 w-48" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <p className="text-muted-foreground">Artist not found</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/artists" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4" /> Back to Artists
            </Link>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {/* Profile Header */}
                <Card className="mb-8">
                    <CardContent className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <Avatar
                                size="xl"
                                fallback={profile.user?.display_name || profile.user?.username || 'A'}
                                src={profile.user?.avatar_url}
                            />
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-2xl font-bold">{profile.user?.display_name || profile.user?.username}</h1>
                                <p className="text-sm text-muted-foreground">@{profile.user?.username}</p>
                                {profile.bio && <p className="text-sm mt-3 leading-relaxed">{profile.bio}</p>}
                                <div className="flex items-center gap-4 mt-4 justify-center sm:justify-start">
                                    <Badge variant="secondary">{profile.commission_status}</Badge>
                                    {profile.rating_avg && (
                                        <span className="flex items-center gap-1 text-sm text-amber-400">
                                            <Star className="h-4 w-4 fill-current" />
                                            {profile.rating_avg.toFixed(1)} ({profile.reviews_count} reviews)
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {currentUser && currentUser.id !== profile.user_id && (
                                    <Button variant={following ? 'secondary' : 'default'} onClick={handleFollow}>
                                        {following ? (
                                            <><UserCheck className="h-4 w-4 mr-2" /> Following</>
                                        ) : (
                                            <><UserPlus className="h-4 w-4 mr-2" /> Follow</>
                                        )}
                                    </Button>
                                )}
                                {profile.portfolio_url && (
                                    <a href={profile.portfolio_url} target="_blank" rel="noreferrer">
                                        <Button variant="outline" size="icon">
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="services">
                    <TabsList className="mb-6">
                        <TabsTrigger value="services">Services ({services.length})</TabsTrigger>
                        <TabsTrigger value="portfolio">Portfolio ({portfolios.length})</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="services">
                        <div className="grid sm:grid-cols-2 gap-4">
                            {services.length === 0 ? (
                                <p className="text-muted-foreground col-span-full">No services available</p>
                            ) : (
                                services.map((svc) => (
                                    <Link key={svc.id} to={`/store/${svc.id}`}>
                                        <Card className="h-full hover:border-primary/40 transition-colors">
                                            <CardContent className="p-4 space-y-2">
                                                <h3 className="font-bold text-sm">{svc.name}</h3>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{svc.description}</p>
                                                <Badge variant="secondary" className="text-[10px]">{svc.status}</Badge>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="portfolio">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {portfolios.length === 0 ? (
                                <p className="text-muted-foreground col-span-full">No portfolio items yet</p>
                            ) : (
                                portfolios.map((item) => (
                                    <Card key={item.id} className="overflow-hidden">
                                        <div className="h-48 bg-muted">
                                            {item.media && item.media[0] ? (
                                                <img src={item.media[0].url} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No image</div>
                                            )}
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="font-bold text-sm">{item.title}</h3>
                                            {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="reviews">
                        <div className="space-y-3">
                            {reviews.length === 0 ? (
                                <p className="text-muted-foreground">No reviews yet</p>
                            ) : (
                                reviews.map((review) => (
                                    <Card key={review.id}>
                                        <CardContent className="p-4 space-y-2">
                                            <div className="flex items-center gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-amber-400 fill-current' : 'text-muted'}`} />
                                                ))}
                                                <span className="text-[11px] text-muted-foreground ml-2">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm">{review.comment}</p>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </motion.div>
        </div>
    );
};
