import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    Palette,
    Calendar,
    Settings,
    UserCheck,
    UserPlus,
    Sparkles,
    Shield,
    CheckCircle2,
    Layers,
    Share2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { followApi, artistProfileApi, portfolioApi, type Portfolio } from '@/services/artistService';
import { commissionServiceApi } from '@/services/commissionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import type { User, ArtistProfile, CommissionService } from '@/types';

export const UserProfilePage: React.FC = () => {
    const { username } = useParams<{ username?: string }>();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const cleanUsername = username?.replace(/^@/, '') || currentUser?.username;
    const isOwnProfile = currentUser && currentUser.username === cleanUsername;

    const [user, setUser] = useState<User | null>(isOwnProfile ? currentUser : null);
    const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(
        isOwnProfile ? currentUser?.artist_profile || null : null
    );
    const [services, setServices] = useState<CommissionService[]>([]);
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [following, setFollowing] = useState(false);
    const [loading, setLoading] = useState(!isOwnProfile);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!cleanUsername) return;
            setLoading(true);
            try {
                // If own profile, we already have currentUser
                if (isOwnProfile && currentUser) {
                    setUser(currentUser);
                    setArtistProfile(currentUser.artist_profile || null);
                    if (currentUser.artist_profile) {
                        const [svcRes, portRes] = await Promise.all([
                            commissionServiceApi.list(1, { artist_profile_id: String(currentUser.artist_profile.id) }),
                            portfolioApi.list(1).catch(() => ({ data: [] })),
                        ]);
                        setServices(svcRes.data);
                        setPortfolios(portRes.data);
                    }
                    return;
                }

                // If looking at another user by username:
                // Check if they are an artist via artist-profiles endpoint
                try {
                    const artistsRes = await artistProfileApi.list(1);
                    const match = artistsRes.data.find(
                        (a) => a.user?.username.toLowerCase() === cleanUsername.toLowerCase()
                    );
                    if (match) {
                        setArtistProfile(match);
                        setUser(match.user || {
                            id: match.user_id,
                            username: cleanUsername,
                            display_name: cleanUsername,
                            role: 'user',
                            email: '',
                            avatar_url: null,
                            bio: match.bio,
                            email_verified_at: null,
                            created_at: match.created_at,
                            updated_at: match.updated_at,
                            artist_profile: match,
                        });
                        const [svcRes, portRes] = await Promise.all([
                            commissionServiceApi.list(1, { artist_profile_id: String(match.id) }),
                            portfolioApi.list(1).catch(() => ({ data: [] })),
                        ]);
                        setServices(svcRes.data);
                        setPortfolios(portRes.data);
                    } else {
                        // Regular user fallback
                        setUser({
                            id: 0,
                            username: cleanUsername,
                            display_name: cleanUsername,
                            role: 'user',
                            email: '',
                            avatar_url: null,
                            bio: 'Member of the Comme community.',
                            email_verified_at: null,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        });
                    }
                } catch {
                    setUser({
                        id: 0,
                        username: cleanUsername,
                        display_name: cleanUsername,
                        role: 'user',
                        email: '',
                        avatar_url: null,
                        bio: 'Comme Member',
                        email_verified_at: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    });
                }
            } catch {
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [cleanUsername, isOwnProfile, currentUser]);

    const handleFollow = async () => {
        if (!user?.id) return;
        try {
            const res = await followApi.toggle(user.id);
            setFollowing(res.following);
            toast.success(res.following ? 'Following creator' : 'Unfollowed creator');
        } catch {
            toast.error('Failed to update follow status');
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <div className="flex gap-4 items-center">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20 space-y-4">
                <h2 className="text-2xl font-bold">User Not Found</h2>
                <p className="text-sm text-muted-foreground">The profile you are looking for does not exist.</p>
                <Button onClick={() => navigate('/')}>Back to Home</Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8"
        >
            {/* Header Card */}
            <Card className="overflow-hidden border border-border">
                {/* Banner Gradient */}
                <div className="h-44 sm:h-52 bg-gradient-to-r from-primary/30 via-emerald-500/20 to-amber-500/25 relative" />

                <CardContent className="p-6 pt-0 relative">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
                        <div className="flex items-end gap-4">
                            <Avatar
                                size="xl"
                                fallback={user.display_name || user.username}
                                src={user.avatar_url}
                                isOnline={true}
                                className="border-4 border-card ring-2 ring-primary/30"
                            />
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl sm:text-2xl font-black text-foreground">
                                        {user.display_name || user.username}
                                    </h1>
                                    {artistProfile && (
                                        <Badge variant="purple" className="gap-1 font-bold">
                                            <Sparkles className="h-3 w-3" /> Verified Creator
                                        </Badge>
                                    )}
                                    {user.role === 'admin' && (
                                        <Badge variant="gold" className="gap-1">
                                            <Shield className="h-3 w-3" /> Admin
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">@{user.username}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            {isOwnProfile ? (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate('/settings')}
                                        className="gap-1.5 text-xs"
                                    >
                                        <Settings className="h-3.5 w-3.5" /> Edit Profile
                                    </Button>
                                    {artistProfile ? (
                                        <Button
                                            size="sm"
                                            onClick={() => navigate('/dashboard')}
                                            className="gap-1.5 text-xs"
                                        >
                                            <Palette className="h-3.5 w-3.5" /> Artist Studio
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={() => navigate('/apply-artist')}
                                            className="gap-1.5 text-xs"
                                        >
                                            <Sparkles className="h-3.5 w-3.5" /> Become an Artist
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Button
                                        size="sm"
                                        variant={following ? 'outline' : 'default'}
                                        onClick={handleFollow}
                                        className="gap-1.5 text-xs"
                                    >
                                        {following ? (
                                            <>
                                                <UserCheck className="h-3.5 w-3.5 text-emerald-400" /> Following
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="h-3.5 w-3.5" /> Follow
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            toast.success('Profile URL copied to clipboard');
                                        }}
                                        className="gap-1.5 text-xs"
                                    >
                                        <Share2 className="h-3.5 w-3.5" /> Share
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Bio & Details */}
                    <div className="space-y-3 border-t border-border pt-4">
                        <p className="text-xs sm:text-sm text-foreground/90 max-w-3xl leading-relaxed">
                            {user.bio || artistProfile?.bio || 'Passionate digital creator on Comme.'}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-medium">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                Member since {new Date(user.created_at || '2026-01-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </span>
                            {artistProfile && (
                                <span className="flex items-center gap-1 text-emerald-400">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Open for Commissions
                                </span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Profile Tabs */}
            {artistProfile ? (
                <Tabs defaultValue="services" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="services" className="gap-1.5">
                            <Layers className="h-3.5 w-3.5" /> Commission Services ({services.length})
                        </TabsTrigger>
                        <TabsTrigger value="portfolio" className="gap-1.5">
                            <Palette className="h-3.5 w-3.5" /> Portfolio ({portfolios.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Commission Services Tab */}
                    <TabsContent value="services" className="space-y-4">
                        {services.length === 0 ? (
                            <Card className="p-8 text-center border-dashed">
                                <p className="text-sm text-muted-foreground">No commission services currently listed.</p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {services.map((svc) => (
                                    <Card key={svc.id} className="overflow-hidden border border-border hover:border-primary/50 transition-all">
                                        <div className="h-40 bg-secondary/50 flex items-center justify-center p-4 border-b border-border">
                                            <Palette className="h-8 w-8 text-muted-foreground/40" />
                                        </div>
                                        <CardContent className="p-4 space-y-3">
                                            <h4 className="font-bold text-sm text-foreground">{svc.name}</h4>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{svc.description}</p>
                                            <div className="pt-2 flex items-center justify-between border-t border-border">
                                                <Badge variant="teal">{svc.status}</Badge>
                                                <Link to={`/store/${svc.id}`}>
                                                    <Button size="xs">View Tier</Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Portfolio Tab */}
                    <TabsContent value="portfolio" className="space-y-4">
                        {portfolios.length === 0 ? (
                            <Card className="p-8 text-center border-dashed">
                                <p className="text-sm text-muted-foreground">No portfolio works uploaded yet.</p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {portfolios.map((item) => (
                                    <Card key={item.id} className="overflow-hidden border border-border">
                                        <div className="aspect-square bg-secondary flex items-center justify-center">
                                            <Palette className="h-6 w-6 text-muted-foreground/40" />
                                        </div>
                                        <div className="p-2.5">
                                            <p className="text-xs font-bold truncate">{item.title}</p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            ) : (
                <Card className="p-8 text-center space-y-4 border border-border">
                    <div className="max-w-md mx-auto space-y-2">
                        <h3 className="text-base font-bold">Community Member Profile</h3>
                        <p className="text-xs text-muted-foreground">
                            This user is a client and art enthusiast on Comme.
                        </p>
                        {isOwnProfile && (
                            <div className="pt-4">
                                <Button onClick={() => navigate('/apply-artist')} className="gap-2">
                                    <Sparkles className="h-4 w-4" /> Apply to Become a Verified Artist
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </motion.div>
    );
};
