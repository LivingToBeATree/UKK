import React, { useState, useEffect, useRef } from 'react';
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
    Star,
    MessageSquare,
    Image as ImageIcon,
    ExternalLink,
    Globe,
    Heart,
    Bookmark,
    Camera,
    Loader2,
    Maximize2,
    Flag,
    ShieldAlert,
} from 'lucide-react';
import { ReportModal } from '@/components/modals/ReportModal';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { followApi, portfolioApi, artistProfileApi, type Portfolio } from '@/services/artistService';
import { commissionServiceApi, commissionReviewApi, type CommissionReview } from '@/services/commissionService';
import { userService } from '@/services/userService';
import { postService } from '@/services/postService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { MediaLightboxModal } from '@/components/ui/MediaLightboxModal';
import { ImageCropperModal } from '@/components/ui/ImageCropperModal';
import { toast } from '@/components/ui/sonner';
import { formatPrice, formatDateSafe } from '@/utils/format';
import { UnavailableContentState } from '@/components/common/UnavailableContentState';
import type { User, ArtistProfile, CommissionService, Post } from '@/types';

export const UserProfilePage: React.FC = () => {
    const params = useParams<Record<string, string | undefined>>();
    const { user: currentUser, refreshUser } = useAuth();
    const { requireAuth } = useAuthModal();
    const navigate = useNavigate();

    // Extract handle or id from params or pathname
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    let extractedParam = params.username || params.id || params['*'];
    if (!extractedParam) {
        if (pathname.startsWith('/@')) {
            extractedParam = pathname.replace(/^\/@\/?/, '');
        } else if (pathname.startsWith('/users/')) {
            extractedParam = pathname.replace(/^\/users\/?/, '');
        } else if (pathname.startsWith('/profile/')) {
            extractedParam = pathname.replace(/^\/profile\/?/, '');
        } else if (pathname.startsWith('/artists/')) {
            extractedParam = pathname.replace(/^\/artists\/?/, '');
        }
    }

    const cleanParam = extractedParam ? decodeURIComponent(extractedParam).replace(/^@/, '').split('/')[0].trim() : undefined;
    const cleanUsername = cleanParam || currentUser?.username;

    const isOwnProfile = !!(
        currentUser &&
        cleanUsername &&
        currentUser.username.toLowerCase() === cleanUsername.toLowerCase() &&
        (!cleanParam || isNaN(Number(cleanParam)))
    );

    const [user, setUser] = useState<User | null>(isOwnProfile ? currentUser : null);
    const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(currentUser?.artist_profile || null);
    const [services, setServices] = useState<CommissionService[]>([]);
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [reviews, setReviews] = useState<CommissionReview[]>([]);
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [likedPosts, setLikedPosts] = useState<Post[]>([]);
    const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
    const [following, setFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Upload state
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    // Cropper Modal state
    const [cropperOpen, setCropperOpen] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState<string>('');
    const [cropType, setCropType] = useState<'avatar' | 'banner'>('avatar');

    // Lightbox modal state for portfolio
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxMedia, setLightboxMedia] = useState<{ url: string; file_name?: string; media_type?: string }[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Reporting modal state
    const [showReportUserModal, setShowReportUserModal] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchUserData = async () => {
            setLoading(true);
            try {
                let fetchedUser: User | null = null;

                // 1. If accessed via /artists/:id with numeric ID
                if (cleanParam && !isNaN(Number(cleanParam))) {
                    try {
                        const artistRes = await artistProfileApi.show(Number(cleanParam));
                        if (artistRes?.user?.username) {
                            fetchedUser = await userService.getByUsername(artistRes.user.username);
                        }
                    } catch {
                        /* fallback to username */
                    }
                }

                // 2. Resolve by clean username
                if (!fetchedUser && cleanUsername) {
                    try {
                        fetchedUser = await userService.getByUsername(cleanUsername);
                    } catch {
                        /* not found */
                    }
                }

                if (!fetchedUser) {
                    if (isMounted) {
                        setUser(null);
                        setLoading(false);
                    }
                    return;
                }

                if (isMounted) {
                    setUser(fetchedUser);
                    setFollowing(!!fetchedUser.is_following);
                    setFollowersCount(fetchedUser.followers_count || 0);

                    const profile = fetchedUser.artist_profile || null;
                    setArtistProfile(profile);

                    // Concurrently fetch profile content
                    const promises: Promise<any>[] = [
                        postService.list(1).then((res) => {
                            const userSpecificPosts = (res.data || []).filter((p) => p.user_id === fetchedUser.id);
                            if (isMounted) setUserPosts(userSpecificPosts);
                        }).catch(() => null),
                    ];

                    // If viewing own profile, also load Likes and Bookmarks
                    if (currentUser && fetchedUser.id === currentUser.id) {
                        promises.push(
                            postService.getLikes(1).then((res) => {
                                if (isMounted) setLikedPosts(res.data || []);
                            }).catch(() => null),
                            postService.getBookmarks(1).then((res) => {
                                if (isMounted) setBookmarkedPosts(res.data || []);
                            }).catch(() => null)
                        );
                    }

                    if (profile) {
                        promises.push(
                            commissionServiceApi.list(1, { artist_profile_id: String(profile.id) })
                                .then((res) => { if (isMounted) setServices(res.data || []); })
                                .catch(() => null),
                            portfolioApi.list(1)
                                .then((res) => { if (isMounted) setPortfolios(res.data || []); })
                                .catch(() => null),
                            commissionReviewApi.listForArtist(profile.id)
                                .then((res) => { if (isMounted) setReviews(res.data || []); })
                                .catch(() => null)
                        );
                    }

                    await Promise.all(promises);
                }
            } catch {
                if (isMounted) {
                    setUser(null);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchUserData();
        return () => {
            isMounted = false;
        };
    }, [cleanUsername, currentUser]);

    const handleFollow = async () => {
        if (!user || user.id === 0) return;
        if (!requireAuth('follow')) return;
        try {
            const res = await followApi.toggle(user.id);
            setFollowing(res.following);
            setFollowersCount((prev) => (res.following ? prev + 1 : Math.max(0, prev - 1)));
            toast.success(res.following ? `Following @${user.username}` : `Unfollowed @${user.username}`);
        } catch {
            toast.error('Failed to update follow status');
        }
    };

    const handleShareProfile = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Profile URL copied to clipboard');
    };

    // Avatar Select & Open Cropper
    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 20 * 1024 * 1024) {
            toast.error('Image file size must be less than 20MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setCropImageSrc(reader.result as string);
            setCropType('avatar');
            setCropperOpen(true);
        };
        reader.readAsDataURL(file);
        if (avatarInputRef.current) avatarInputRef.current.value = '';
    };

    // Banner Select & Open Cropper
    const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 25 * 1024 * 1024) {
            toast.error('Banner file size must be less than 25MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setCropImageSrc(reader.result as string);
            setCropType('banner');
            setCropperOpen(true);
        };
        reader.readAsDataURL(file);
        if (bannerInputRef.current) bannerInputRef.current.value = '';
    };

    // Crop Complete Handler (Uploads precisely cropped area)
    const handleCropComplete = async (croppedFile: File) => {
        if (cropType === 'avatar') {
            setUploadingAvatar(true);
            try {
                const media = await userService.uploadMedia(croppedFile, true);
                const formData = new FormData();
                formData.append('avatar', media.url);
                const updatedUser = await userService.updateProfile(formData);

                setUser(updatedUser);
                await refreshUser();
                toast.success('Profile picture updated successfully!');
            } catch (err: any) {
                toast.error(err?.response?.data?.message || 'Failed to update profile photo');
            } finally {
                setUploadingAvatar(false);
            }
        } else {
            setUploadingBanner(true);
            try {
                const media = await userService.uploadMedia(croppedFile);
                const formData = new FormData();
                formData.append('banner', media.url);
                const updatedUser = await userService.updateProfile(formData);

                setUser(updatedUser);
                await refreshUser();
                toast.success('Profile banner updated successfully!');
            } catch (err: any) {
                toast.error(err?.response?.data?.message || 'Failed to update profile banner');
            } finally {
                setUploadingBanner(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
                <Skeleton className="h-56 w-full rounded-3xl" />
                <div className="flex gap-4 items-center px-4">
                    <Skeleton className="h-24 w-24 rounded-2xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48 rounded-lg" />
                        <Skeleton className="h-4 w-32 rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'moderator';

    if (!user) {
        return (
            <UnavailableContentState
                variant="not_found"
                type="profile"
                title="User Profile Not Found"
                description={`The user handle @${cleanUsername} does not exist on Comme or may have been removed.`}
            />
        );
    }

    if (user.is_suspended && !isStaff) {
        return (
            <UnavailableContentState
                variant="suspended"
                type="profile"
                title="Account Suspended"
                description={`The account @${user.username} has been suspended for violations of Comme's Community Guidelines.`}
            />
        );
    }

    const bannerUrl = user.banner || user.banner_url || artistProfile?.banner;
    const avatarUrl = user.avatar || user.avatar_url;

    const defaultTab = artistProfile
        ? (services.length > 0 ? 'services' : portfolios.length > 0 ? 'portfolio' : 'posts')
        : (userPosts.length > 0 ? 'posts' : isOwnProfile && likedPosts.length > 0 ? 'likes' : 'about');

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
        >
            {user.is_suspended && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-300">
                    <div className="flex items-center gap-2.5">
                        <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0" />
                        <div>
                            <span className="font-bold uppercase tracking-wider text-amber-400">Staff Notice: </span>
                            This user account is currently suspended. Public visitors are blocked from viewing this profile.
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-[11px] h-7 rounded-xl border-amber-500/40 text-amber-300 hover:bg-amber-500/20 cursor-pointer shrink-0"
                        onClick={() => navigate('/admin/reports')}
                    >
                        Manage in Reports
                    </Button>
                </div>
            )}
            {/* Hidden File Inputs for In-Place Avatar & Banner Changes */}
            <input
                type="file"
                ref={avatarInputRef}
                accept="image/*"
                onChange={handleAvatarSelect}
                className="hidden"
            />
            <input
                type="file"
                ref={bannerInputRef}
                accept="image/*"
                onChange={handleBannerSelect}
                className="hidden"
            />

            {/* Profile Card */}
            <Card className="overflow-hidden border border-border/80 bg-card rounded-3xl shadow-sm">
                {/* Header Banner */}
                <div className="h-48 sm:h-64 bg-gradient-to-r from-primary/20 via-primary/10 to-card border-b border-border/50 relative overflow-hidden group">
                    {bannerUrl ? (
                        <img
                            src={bannerUrl}
                            alt="Profile banner"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-primary)_0%,transparent_60%)] opacity-20" />
                    )}

                    {/* Change Banner Button for Owner */}
                    {isOwnProfile && (
                        <div className="absolute top-4 right-4 z-10 opacity-90 group-hover:opacity-100 transition-opacity">
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => bannerInputRef.current?.click()}
                                disabled={uploadingBanner}
                                className="rounded-xl text-xs font-semibold gap-1.5 bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 shadow-lg cursor-pointer"
                            >
                                {uploadingBanner ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading Banner...
                                    </>
                                ) : (
                                    <>
                                        <Camera className="h-3.5 w-3.5" /> Change Banner
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                <CardContent className="p-6 sm:p-8 pt-0 relative">
                    {/* Avatar & Action Row */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 -mt-16 sm:-mt-20 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                            {/* Avatar with Edit Overlay for Owner */}
                            <div className="relative inline-block self-start group">
                                <Avatar
                                    size="xl"
                                    fallback={user.display_name || user.username}
                                    src={avatarUrl}
                                    className="border-4 border-card ring-2 ring-primary/30 shadow-xl rounded-2xl w-24 h-24 sm:w-28 sm:h-28 overflow-hidden"
                                />

                                {isOwnProfile && (
                                    <button
                                        type="button"
                                        onClick={() => avatarInputRef.current?.click()}
                                        disabled={uploadingAvatar}
                                        className="absolute inset-0 bg-black/50 hover:bg-black/70 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-4 border-card"
                                        title="Change profile picture"
                                    >
                                        {uploadingAvatar ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Camera className="h-5 w-5" />
                                                <span className="text-[10px] font-bold mt-0.5">Edit</span>
                                            </>
                                        )}
                                    </button>
                                )}

                                {artistProfile && (
                                    <div className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-primary text-primary-foreground shadow-md border-2 border-card z-10" title="Verified Creator">
                                        <Sparkles className="h-3.5 w-3.5" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                                        {user.display_name || user.username}
                                    </h1>
                                    {artistProfile && (
                                        <Badge variant="default" className="text-[10px] font-mono uppercase font-bold py-0.5">
                                            Creator
                                        </Badge>
                                    )}
                                    {user.role === 'admin' && (
                                        <Badge variant="secondary" className="text-[10px] font-mono uppercase font-bold py-0.5 gap-1">
                                            <Shield className="h-3 w-3 text-primary" /> Staff
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs font-mono text-muted-foreground">@{user.username}</p>
                            </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                            {isOwnProfile ? (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate('/settings')}
                                        className="rounded-xl text-xs font-semibold gap-1.5"
                                    >
                                        <Settings className="h-3.5 w-3.5" /> Edit Profile
                                    </Button>

                                    {currentUser?.role === 'admin' || currentUser?.role === 'moderator' ? (
                                        <Button
                                            size="sm"
                                            onClick={() => navigate('/admin')}
                                            className="rounded-xl text-xs font-semibold gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 cursor-pointer"
                                        >
                                            <Shield className="h-3.5 w-3.5" /> {currentUser?.role === 'admin' ? 'Admin Panel' : 'Moderator Panel'}
                                        </Button>
                                    ) : artistProfile ? (
                                        <Button
                                            size="sm"
                                            onClick={() => navigate('/dashboard')}
                                            className="rounded-xl text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                                        >
                                            <Palette className="h-3.5 w-3.5" /> Studio
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={() => navigate('/apply-artist')}
                                            className="rounded-xl text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
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
                                        className={`rounded-xl text-xs font-semibold gap-1.5 ${
                                            following
                                                ? 'hover:border-destructive hover:text-destructive'
                                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                        }`}
                                    >
                                        {following ? (
                                            <>
                                                <UserCheck className="h-3.5 w-3.5 text-primary" /> Following
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
                                        onClick={handleShareProfile}
                                        className="rounded-xl text-xs font-semibold gap-1.5"
                                    >
                                        <Share2 className="h-3.5 w-3.5" /> Share
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            if (currentUser?.role === 'admin' || currentUser?.role === 'moderator') {
                                                navigate('/admin/reports');
                                                toast.info('Fast-travelled to Moderation Workbench');
                                                return;
                                            }
                                            if (!requireAuth('report')) return;
                                            setShowReportUserModal(true);
                                        }}
                                        className={`rounded-xl text-xs font-semibold gap-1.5 cursor-pointer ${
                                            currentUser?.role === 'admin' || currentUser?.role === 'moderator'
                                                ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border border-purple-500/30'
                                                : 'text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10'
                                        }`}
                                        title={currentUser?.role === 'admin' || currentUser?.role === 'moderator' ? 'Open Moderation Workbench' : 'Report this user'}
                                    >
                                        {currentUser?.role === 'admin' || currentUser?.role === 'moderator' ? (
                                            <>
                                                <Shield className="h-3.5 w-3.5 text-purple-400" />
                                                <span>Moderate</span>
                                            </>
                                        ) : (
                                            <>
                                                <Flag className="h-3.5 w-3.5" />
                                                <span>Report</span>
                                            </>
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Bio & Social Summary */}
                    <div className="space-y-4 border-t border-border/60 pt-4">
                        <p className="text-xs sm:text-sm text-foreground/90 max-w-3xl leading-relaxed whitespace-pre-wrap">
                            {user.bio || artistProfile?.bio || 'Art enthusiast and creator on Comme.'}
                        </p>

                        {/* Meta Tags / Social Links */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                Member since {new Date(user.created_at || '2026-01-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </span>

                            {artistProfile && (
                                <span className="flex items-center gap-1.5 text-primary">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {artistProfile.commission_status === 'open' ? 'Commissions Open' : 'Commissions Paused'}
                                </span>
                            )}

                            {artistProfile?.portfolio_url && (
                                <a
                                    href={artistProfile.portfolio_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors underline"
                                >
                                    <Globe className="h-3.5 w-3.5" />
                                    <span>Portfolio Link</span>
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-border/60">
                        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 text-left">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase font-mono">Followers</p>
                            <p className="text-lg font-black text-foreground mt-0.5">{followersCount}</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 text-left">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase font-mono">Following</p>
                            <p className="text-lg font-black text-foreground mt-0.5">{user.following_count || 0}</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 text-left">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase font-mono">Posts</p>
                            <p className="text-lg font-black text-foreground mt-0.5">{userPosts.length || user.posts_count || 0}</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 text-left">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase font-mono">
                                {artistProfile ? 'Rating' : 'Role'}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                                {artistProfile ? (
                                    <>
                                        <Star className="h-4 w-4 fill-primary text-primary" />
                                        <span className="text-lg font-black text-foreground">
                                            {artistProfile.rating_avg ? artistProfile.rating_avg.toFixed(1) : '5.0'}
                                        </span>
                                        <span className="text-xs text-muted-foreground font-mono">
                                            ({reviews.length})
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-sm font-bold text-foreground capitalize">
                                        {user.role || 'Patron'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Profile Tabbed Showcase */}
            <Tabs defaultValue={defaultTab} className="space-y-6">
                <TabsList className="bg-muted/40 p-1 rounded-2xl border border-border/60 flex-wrap h-auto gap-1">
                    {artistProfile && (
                        <>
                            <TabsTrigger value="services" className="gap-1.5 rounded-xl text-xs font-semibold">
                                <Layers className="h-3.5 w-3.5" /> Services ({services.length})
                            </TabsTrigger>
                            <TabsTrigger value="portfolio" className="gap-1.5 rounded-xl text-xs font-semibold">
                                <Palette className="h-3.5 w-3.5" /> Portfolio ({portfolios.length})
                            </TabsTrigger>
                            <TabsTrigger value="reviews" className="gap-1.5 rounded-xl text-xs font-semibold">
                                <Star className="h-3.5 w-3.5" /> Reviews ({reviews.length})
                            </TabsTrigger>
                        </>
                    )}
                    <TabsTrigger value="posts" className="gap-1.5 rounded-xl text-xs font-semibold">
                        <ImageIcon className="h-3.5 w-3.5" /> Posts ({userPosts.length})
                    </TabsTrigger>

                    {/* Own Profile: Likes & Bookmarks Tabs */}
                    {isOwnProfile && (
                        <>
                            <TabsTrigger value="likes" className="gap-1.5 rounded-xl text-xs font-semibold">
                                <Heart className="h-3.5 w-3.5 text-primary" /> Likes ({likedPosts.length})
                            </TabsTrigger>
                            <TabsTrigger value="bookmarks" className="gap-1.5 rounded-xl text-xs font-semibold">
                                <Bookmark className="h-3.5 w-3.5 text-primary" /> Bookmarks ({bookmarkedPosts.length})
                            </TabsTrigger>
                        </>
                    )}

                    <TabsTrigger value="about" className="gap-1.5 rounded-xl text-xs font-semibold">
                        <MessageSquare className="h-3.5 w-3.5" /> About
                    </TabsTrigger>
                </TabsList>

                {/* 1. Services Tab (If Artist) */}
                {artistProfile && (
                    <TabsContent value="services" className="space-y-4">
                        {services.length === 0 ? (
                            <Card className="p-12 text-center rounded-3xl border-dashed border-border/80 space-y-2">
                                <Layers className="h-10 w-10 mx-auto text-muted-foreground/30" />
                                <h3 className="text-sm font-bold text-foreground">No Commission Services Active</h3>
                                <p className="text-xs text-muted-foreground">This creator has not listed active commission packages currently.</p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                {services.map((svc) => {
                                    const option = svc.options?.[0];
                                    const price = option?.base_price ?? option?.price ?? 0;
                                    const duration = option?.duration_days;
                                    const coverImg = svc.media?.[0]?.url;

                                    return (
                                        <Card key={svc.id} className="overflow-hidden border border-border/80 hover:border-primary/50 transition-all rounded-3xl bg-card shadow-xs group flex flex-col justify-between">
                                            <div>
                                                <div className="h-44 bg-muted/40 relative overflow-hidden flex items-center justify-center">
                                                    {coverImg ? (
                                                        <img src={coverImg} alt={svc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                    ) : (
                                                        <Palette className="h-8 w-8 text-muted-foreground/30" />
                                                    )}
                                                    {duration && (
                                                        <Badge variant="secondary" className="absolute top-3 right-3 text-[10px] font-mono">
                                                            {duration} Days
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardContent className="p-5 space-y-2">
                                                    <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                                        {svc.name}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                        {svc.description}
                                                    </p>
                                                </CardContent>
                                            </div>

                                            <div className="p-5 pt-0 flex items-center justify-between border-t border-border/40 mt-2">
                                                <div>
                                                    <span className="text-[10px] font-mono text-muted-foreground uppercase block">Starting at</span>
                                                    <span className="text-sm font-black text-foreground font-mono">
                                                        {formatPrice(price)}
                                                    </span>
                                                </div>
                                                <Link to={`/store/${svc.id}`}>
                                                    <Button size="sm" className="rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                                                        View Tier
                                                    </Button>
                                                </Link>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>
                )}

                {/* 2. Portfolio Tab (If Artist) */}
                {artistProfile && (
                    <TabsContent value="portfolio" className="space-y-4">
                        {portfolios.length === 0 ? (
                            <Card className="p-12 text-center rounded-3xl border-dashed border-border/80 space-y-2">
                                <Palette className="h-10 w-10 mx-auto text-muted-foreground/30" />
                                <h3 className="text-sm font-bold text-foreground">No Portfolio Items Yet</h3>
                                <p className="text-xs text-muted-foreground">Portfolio works published by the artist will be displayed here.</p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {portfolios.map((item, idx) => {
                                    const thumbUrl =
                                        (item as any).thumbnail_media?.url ||
                                        item.media?.[0]?.url ||
                                        item.cover_image_url ||
                                        null;

                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => {
                                                const mediaItems = portfolios
                                                    .map((p) => ({
                                                        url: (p as any).thumbnail_media?.url || p.media?.[0]?.url || p.cover_image_url || '',
                                                        file_name: p.title,
                                                        media_type: 'image',
                                                    }))
                                                    .filter((m) => m.url);
                                                setLightboxMedia(mediaItems);
                                                setLightboxIndex(idx);
                                                setLightboxOpen(true);
                                            }}
                                            className="group relative rounded-2xl overflow-hidden border border-border/80 hover:border-primary/60 bg-card transition-all cursor-pointer aspect-square shadow-xs"
                                        >
                                            {thumbUrl ? (
                                                <img
                                                    src={thumbUrl}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-muted/40">
                                                    <Palette className="h-6 w-6 text-muted-foreground/40" />
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                                                <div className="self-end">
                                                    <Maximize2 className="h-4 w-4 text-white" />
                                                </div>
                                                <p className="text-xs font-bold text-white truncate">
                                                    {item.title}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>
                )}

                {/* 3. Reviews Tab (If Artist) */}
                {artistProfile && (
                    <TabsContent value="reviews" className="space-y-4">
                        {reviews.length === 0 ? (
                            <Card className="p-12 text-center rounded-3xl border-dashed border-border/80 space-y-2">
                                <Star className="h-10 w-10 mx-auto text-muted-foreground/30" />
                                <h3 className="text-sm font-bold text-foreground">No Client Reviews Yet</h3>
                                <p className="text-xs text-muted-foreground">Reviews left by verified clients after completed commissions will appear here.</p>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {reviews.map((rev) => (
                                    <Card key={rev.id} className="p-5 rounded-2xl border border-border/80 bg-card space-y-3 shadow-xs">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar size="sm" fallback={rev.user?.display_name || '?'} src={rev.user?.avatar_url} />
                                                <div>
                                                    <p className="font-bold text-xs text-foreground">{rev.user?.display_name || rev.user?.username || 'Verified Client'}</p>
                                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                        <span className="text-[10px] text-muted-foreground font-mono">
                                                            {formatDateSafe(rev.created_at)}
                                                        </span>
                                                        {rev.commission?.service && (
                                                            <Link
                                                                to={`/store/${rev.commission.service.id}`}
                                                                className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-md border border-primary/20 transition-colors"
                                                            >
                                                                <Layers className="h-2.5 w-2.5" />
                                                                <span>{rev.commission.service.name}</span>
                                                                {rev.commission.option && (
                                                                    <span className="text-muted-foreground font-normal">
                                                                        • {rev.commission.option.title}
                                                                    </span>
                                                                )}
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-primary shrink-0">
                                                {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                                                    <Star key={i} className="h-3.5 w-3.5 fill-primary" />
                                                ))}
                                            </div>
                                        </div>

                                        {rev.comment && (
                                            <p className="text-xs text-foreground/90 leading-relaxed pl-11">
                                                {rev.comment}
                                            </p>
                                        )}

                                        {rev.artist_reply && (
                                            <div className="ml-11 p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-1 text-xs">
                                                <div className="flex items-center gap-1.5 font-bold text-[11px] text-foreground">
                                                    <Sparkles className="h-3 w-3 text-primary" />
                                                    <span>Artist Response</span>
                                                    {rev.artist_replied_at && (
                                                        <span className="text-[10px] font-normal text-muted-foreground font-mono">
                                                            • {formatDateSafe(rev.artist_replied_at)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-muted-foreground leading-relaxed text-xs">
                                                    {rev.artist_reply}
                                                </p>
                                            </div>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                )}

                {/* 4. Posts Tab */}
                <TabsContent value="posts" className="space-y-4">
                    {userPosts.length === 0 ? (
                        <Card className="p-12 text-center rounded-3xl border-dashed border-border/80 space-y-2">
                            <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground/30" />
                            <h3 className="text-sm font-bold text-foreground">No Public Posts Yet</h3>
                            <p className="text-xs text-muted-foreground">Artwork posts and community updates published by @{user.username} will be featured here.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                            {userPosts.map((post) => {
                                const mediaImg = post.media?.[0]?.url || post.portfolio?.cover_image_url;

                                return (
                                    <Link
                                        key={post.id}
                                        to={`/posts/${post.id}`}
                                        className="group block rounded-3xl overflow-hidden border border-border/80 hover:border-primary/50 bg-card transition-all shadow-xs"
                                    >
                                        <div className="aspect-video bg-muted/30 relative overflow-hidden flex items-center justify-center">
                                            {mediaImg ? (
                                                <img src={mediaImg} alt="Artwork post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                                            )}
                                        </div>
                                        <div className="p-4 space-y-2">
                                            <p className="text-xs text-foreground line-clamp-2 leading-relaxed font-medium">
                                                {post.content || 'Artwork post'}
                                            </p>
                                            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Heart className="h-3 w-3 text-primary" /> {post.likes_count || 0}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MessageSquare className="h-3 w-3" /> {post.comments_count || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* 5. Likes Tab (If Own Profile) */}
                {isOwnProfile && (
                    <TabsContent value="likes" className="space-y-4">
                        {likedPosts.length === 0 ? (
                            <Card className="p-12 text-center rounded-3xl border-dashed border-border/80 space-y-2">
                                <Heart className="h-10 w-10 mx-auto text-muted-foreground/30" />
                                <h3 className="text-sm font-bold text-foreground">No Liked Posts Yet</h3>
                                <p className="text-xs text-muted-foreground">Artwork posts that you like on the Explore feed will appear in this collection.</p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                {likedPosts.map((post) => {
                                    const mediaImg = post.media?.[0]?.url || post.portfolio?.cover_image_url;

                                    return (
                                        <Link
                                            key={post.id}
                                            to={`/posts/${post.id}`}
                                            className="group block rounded-3xl overflow-hidden border border-border/80 hover:border-primary/50 bg-card transition-all shadow-xs"
                                        >
                                            <div className="aspect-video bg-muted/30 relative overflow-hidden flex items-center justify-center">
                                                {mediaImg ? (
                                                    <img src={mediaImg} alt="Liked post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                ) : (
                                                    <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                                                )}
                                            </div>
                                            <div className="p-4 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Avatar size="sm" fallback={post.user?.display_name || 'U'} src={post.user?.avatar_url} />
                                                    <span className="text-xs font-bold text-foreground truncate">{post.user?.display_name || post.user?.username}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {post.content || 'Artwork post'}
                                                </p>
                                                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                                                    <span className="flex items-center gap-1 text-primary">
                                                        <Heart className="h-3 w-3 fill-primary" /> {post.likes_count || 0}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MessageSquare className="h-3 w-3" /> {post.comments_count || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>
                )}

                {/* 6. Bookmarks Tab (If Own Profile) */}
                {isOwnProfile && (
                    <TabsContent value="bookmarks" className="space-y-4">
                        {bookmarkedPosts.length === 0 ? (
                            <Card className="p-12 text-center rounded-3xl border-dashed border-border/80 space-y-2">
                                <Bookmark className="h-10 w-10 mx-auto text-muted-foreground/30" />
                                <h3 className="text-sm font-bold text-foreground">No Saved Bookmarks</h3>
                                <p className="text-xs text-muted-foreground">Bookmarked artworks and commission inspirations are safely collected here.</p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                {bookmarkedPosts.map((post) => {
                                    const mediaImg = post.media?.[0]?.url || post.portfolio?.cover_image_url;

                                    return (
                                        <Link
                                            key={post.id}
                                            to={`/posts/${post.id}`}
                                            className="group block rounded-3xl overflow-hidden border border-border/80 hover:border-primary/50 bg-card transition-all shadow-xs"
                                        >
                                            <div className="aspect-video bg-muted/30 relative overflow-hidden flex items-center justify-center">
                                                {mediaImg ? (
                                                    <img src={mediaImg} alt="Bookmarked post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                ) : (
                                                    <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                                                )}
                                            </div>
                                            <div className="p-4 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Avatar size="sm" fallback={post.user?.display_name || 'U'} src={post.user?.avatar_url} />
                                                    <span className="text-xs font-bold text-foreground truncate">{post.user?.display_name || post.user?.username}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {post.content || 'Artwork post'}
                                                </p>
                                                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Heart className="h-3 w-3 text-primary" /> {post.likes_count || 0}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-primary">
                                                        <Bookmark className="h-3 w-3 fill-primary" /> Saved
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>
                )}

                {/* 7. About Tab */}
                <TabsContent value="about" className="space-y-4">
                    <Card className="p-6 sm:p-8 rounded-3xl border border-border/80 bg-card space-y-5">
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-foreground">About @{user.username}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {user.bio || artistProfile?.bio || 'This member has not written a personal bio yet.'}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1">
                                <span className="font-bold text-foreground block">Account Type</span>
                                <span className="text-muted-foreground">
                                    {artistProfile ? 'Verified Creator & Artist' : 'Art Patron & Collector'}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <span className="font-bold text-foreground block">Platform Status</span>
                                <span className="text-primary font-medium">Active Member</span>
                            </div>
                        </div>

                        {/* If Own Profile & Not Artist: Invite to apply */}
                        {isOwnProfile && !artistProfile && (
                            <div className="pt-4 border-t border-border/60">
                                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="font-bold text-xs text-foreground flex items-center gap-1.5">
                                            <Sparkles className="h-4 w-4 text-primary" /> Want to sell your artwork on Comme?
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            Set up commission tiers, showcase your portfolio, and receive automated escrow payouts.
                                        </p>
                                    </div>
                                    <Link to="/apply-artist">
                                        <Button size="sm" className="rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap">
                                            Apply as Artist
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Lightbox for Portfolio Showcase */}
            <MediaLightboxModal
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                mediaList={lightboxMedia}
                initialIndex={lightboxIndex}
            />

            {/* Image Cropper Modal for Avatar & Banner */}
            <ImageCropperModal
                isOpen={cropperOpen}
                onClose={() => setCropperOpen(false)}
                imageSrc={cropImageSrc}
                cropType={cropType}
                onCropComplete={handleCropComplete}
            />

            {/* Report User Modal */}
            {user && (
                <ReportModal
                    isOpen={showReportUserModal}
                    onClose={() => setShowReportUserModal(false)}
                    reportableType="user"
                    reportableId={user.id}
                    targetTitle={user.display_name || user.username}
                    targetSubtitle={`@${user.username}`}
                />
            )}
        </motion.div>
    );
};
