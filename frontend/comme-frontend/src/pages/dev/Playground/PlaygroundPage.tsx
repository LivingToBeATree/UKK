import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { NotificationCard } from '@/components/NotificationCard';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarMobileTrigger } from '@/components/ui/sidebar';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { useColorTheme } from '@/hooks/useColorTheme';

// Design System & Advanced Components
import { ModeToggle } from '@/components/mode-toggle';
import { ColorThemeToggle } from '@/components/color-theme-toggle';
import { DatePicker } from '@/components/ui/date-picker';
import { CustomColorPicker } from '@/components/ui/color-picker';
import { CustomVideoPlayer } from '@/components/ui/CustomVideoPlayer';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { TipArtistModal } from '@/components/modals/TipArtistModal';
import { EmbedBadgeModal } from '@/components/modals/EmbedBadgeModal';
import { GifPickerModal } from '@/components/ui/GifPickerModal';
import { MidtransPaymentModal } from '@/components/ui/MidtransPaymentModal';
import { MediaLightboxModal } from '@/components/ui/MediaLightboxModal';
import { UnavailableContentState, type UnavailableVariant } from '@/components/common/UnavailableContentState';
import type { CommissionOrder } from '@/types';

import {
    Sparkles,
    Heart,
    MessageSquare,
    Share2,
    MoreHorizontal,
    Upload,
    CheckCircle2,
    AlertTriangle,
    Shield,
    Terminal,
    Calendar,
    Palette,
    Video,
    FileText,
    Gift,
    Code2,
    Smile,
    CreditCard,
    Maximize2,
    Eye,
} from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            damping: 24,
            stiffness: 280,
        },
    },
};

const sampleMarkdown = `### 🎨 Commission Scope & Specifications
Welcome to the creative studio! Review the deliverables below:

* **Initial Concept**: 3 rough thumbnail compositions within 48h
* **Revisions**: 2 comprehensive rounds of color & pose adjustments
* **Deliverables**: High-res PNG (4000×6000px, 300 DPI) + layered PSD archive

> "Art is not what you see, but what you make others see." — Edgar Degas

\`\`\`typescript
interface ArtworkSpec {
    dimensions: '4K' | '8K';
    colorSpace: 'Display P3' | 'sRGB';
    commercialLicense: boolean;
}
\`\`\`

Ready to finalize details! Feel free to ask any questions below. :sparkles: :rocket: :heart:`;

export const PlaygroundPage: React.FC = () => {
    const navigate = useNavigate();
    const { setColorTheme } = useColorTheme();
    const [rememberMe, setRememberMe] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [sidebarTab, setSidebarTab] = useState('overview');

    // Interactive component states
    const [selectedDate, setSelectedDate] = useState<string>('2026-10-15');
    const [customColor, setCustomColor] = useState<string>('#A802F5');
    const [unavailableVariant, setUnavailableVariant] = useState<UnavailableVariant>('not_found');

    // Modals state
    const [isTipModalOpen, setIsTipModalOpen] = useState(false);
    const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
    const [isGifModalOpen, setIsGifModalOpen] = useState(false);
    const [selectedGifUrl, setSelectedGifUrl] = useState<string | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Dummy commission model for Midtrans modal showcase
    const dummyCommission: CommissionOrder = {
        id: 4921,
        commission_service_id: 10,
        artist_profile_id: 1,
        user_id: 42,
        status: 'pending',
        total_price: 750000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        commission_service: {
            id: 10,
            artist_profile_id: 1,
            name: 'Full Body Anime Illustration',
            description: 'High-detail anime character drawing with custom background',
            status: 'open',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        commission_option: {
            id: 2,
            title: 'Full Body + Detailed Background',
            base_price: 750000,
        },
        artist_profile: {
            id: 1,
            user_id: 2,
            handle: 'aether_art',
            display_name: 'Aether Art Studio',
            bio: 'Concept artist & illustrator',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as unknown as CommissionOrder['artist_profile'],
        user: {
            id: 42,
            name: 'Art Patron',
            username: 'patron_user',
            display_name: 'Art Patron',
            email: 'patron@example.com',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as unknown as CommissionOrder['user'],
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="min-h-screen bg-background text-foreground p-6 sm:p-12 max-w-[1440px] mx-auto space-y-12 font-sans"
        >
            {/* Header with Theme Switcher, Color Theme Picker & Dev Console Button */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/30 text-primary">
                        <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Comme Design System & Sandbox</h1>
                        <p className="text-sm text-muted-foreground">
                            Interactive developer environment showcasing atomic tokens, rich media, modals & live theme palettes
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                    <ModeToggle />
                    <ColorThemeToggle />
                    <Button variant="outline" size="sm" onClick={() => navigate('/dev')} className="gap-2 text-xs font-semibold">
                        <Terminal className="h-4 w-4 text-primary" /> Developer Console
                    </Button>
                </div>
            </motion.div>

            {/* Buttons & Badges */}
            <motion.section variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-bold border-l-4 border-primary pl-3">1. Buttons & Badges</h2>
                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Button Variants & Sizes</span>
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Button>Default Primary</Button>
                                <Button variant="secondary">Secondary</Button>
                                <Button variant="outline">Outline</Button>
                                <Button variant="ghost">Ghost</Button>
                                <Button variant="destructive">Destructive</Button>
                                <Button variant="link">Link Button</Button>
                                <Button size="sm">Small</Button>
                                <Button size="lg">Large CTA</Button>
                            </div>
                        </div>

                        {/* Badges: Core variants, status accents & HTTP methods */}
                        <div className="space-y-3 pt-4 border-t border-border">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Badge Variants & HTTP API Methods</span>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="default">Default Solid</Badge>
                                <Badge variant="primary">Brand Primary</Badge>
                                <Badge variant="secondary">Secondary</Badge>
                                <Badge variant="outline">Outline</Badge>
                                <Badge variant="teal">Teal / Mint</Badge>
                                <Badge variant="gold">Gold / Amber</Badge>
                                <Badge variant="rose">Rose / Error</Badge>
                                <Badge variant="get">GET 200</Badge>
                                <Badge variant="post">POST 201</Badge>
                                <Badge variant="patch">PATCH 200</Badge>
                                <Badge variant="delete">DELETE 204</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.section>

            {/* Sonner Toast Notifications */}
            <motion.section variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-bold border-l-4 border-primary pl-3">2. Sonner Toast Notifications</h2>
                <Card>
                    <CardContent className="p-6 flex flex-wrap gap-3">
                        <Button
                            onClick={() =>
                                toast.success('Order Placed Successfully!', {
                                    description: 'Your commission request was submitted to the artist.',
                                })
                            }
                        >
                            <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-400" /> Trigger Success Toast
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                toast.error('Payment Failed', {
                                    description: 'Midtrans transaction was declined. Please try another method.',
                                })
                            }
                        >
                            <AlertTriangle className="h-4 w-4 mr-1" /> Trigger Error Toast
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() =>
                                toast.info('New Commission Message', {
                                    description: 'Artist sent an updated sketch draft.',
                                })
                            }
                        >
                            <MessageSquare className="h-4 w-4 mr-1 text-primary" /> Trigger Info Toast
                        </Button>
                    </CardContent>
                </Card>
            </motion.section>

            {/* Form & Date Controls */}
            <motion.section variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-bold border-l-4 border-primary pl-3">3. Form & Date Controls</h2>
                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="demo-email">Email Address</Label>
                                <Input id="demo-email" type="email" placeholder="artist@comme.app" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="demo-service">Commission Category</Label>
                                <Select
                                    id="demo-service"
                                    containerClassName="w-full"
                                    className="w-full"
                                    options={[
                                        { label: 'Character Illustration (Full Body)', value: 'full_body' },
                                        { label: 'Portrait / Bust', value: 'portrait' },
                                        { label: 'Live2D / Vtuber Model', value: 'vtuber' },
                                        { label: 'Pixel Art Animation', value: 'pixel' },
                                    ]}
                                />
                            </div>

                            {/* DatePicker Component Showcase */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-primary" /> Commission Deadline (DatePicker)
                                </Label>
                                <DatePicker
                                    value={selectedDate}
                                    onChange={(dateStr) => setSelectedDate(dateStr)}
                                    placeholder="Pick delivery date..."
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    Selected target: <span className="font-mono font-bold text-foreground">{selectedDate || 'None'}</span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="demo-budget">Estimated Budget (IDR)</Label>
                                <Input id="demo-budget" type="text" defaultValue="Rp 1,500,000" placeholder="e.g. Rp 500,000" />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="demo-notes">Project Brief & Details</Label>
                                <Textarea id="demo-notes" placeholder="Describe the scene, pose, and reference links..." />
                            </div>

                            <div className="flex items-center gap-3 md:col-span-2">
                                <Checkbox
                                    id="demo-check"
                                    checked={rememberMe}
                                    onCheckedChange={(val) => setRememberMe(val)}
                                />
                                <Label htmlFor="demo-check" className="cursor-pointer">
                                    Remember this session for 30 days
                                </Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.section>

            {/* Interactive Color Studio */}
            <motion.section variants={itemVariants} className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold border-l-4 border-primary pl-3">4. Interactive Color Studio</h2>
                    <Badge variant="outline" className="gap-1.5 font-mono text-xs">
                        <Palette className="h-3.5 w-3.5 text-primary" /> Live HSV Canvas & Swatches
                    </Badge>
                </div>
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <p className="text-xs text-muted-foreground">
                            Full-featured 2D saturation/value canvas, 1D hue slider bar, RGB channels, and one-click palette inspiration. Applying a color updates your active brand theme across the entire application in real time.
                        </p>
                        <CustomColorPicker
                            value={customColor}
                            onChange={(hex) => setCustomColor(hex)}
                            onApply={(hex) => {
                                setCustomColor(hex);
                                setColorTheme('custom');
                                toast.success(`Custom Brand Accent Applied: ${hex.toUpperCase()}`);
                            }}
                        />
                    </CardContent>
                </Card>
            </motion.section>

            {/* Rich Media & Markdown Content */}
            <motion.section variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-bold border-l-4 border-primary pl-3">5. Rich Media & Markdown Content</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Markdown Renderer Card */}
                    <Card>
                        <CardContent className="p-6 space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-bold">MarkdownContent (GFM & Emojis)</span>
                                </div>
                                <Badge variant="outline">Client Brief Spec</Badge>
                            </div>
                            <div className="p-4 rounded-xl bg-secondary/20 border border-border/70 text-sm">
                                <MarkdownContent content={sampleMarkdown} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Custom Video Player Card */}
                    <Card>
                        <CardContent className="p-6 space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <Video className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-bold">CustomVideoPlayer (Scrubber & Controls)</span>
                                </div>
                                <Badge variant="primary">MP4 / WebM</Badge>
                            </div>
                            <div className="rounded-xl overflow-hidden border border-border bg-black/40">
                                <CustomVideoPlayer
                                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                                    poster="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"
                                    className="w-full aspect-video"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </motion.section>

            {/* Interactive Feature Modals & Dialogs */}
            <motion.section variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-bold border-l-4 border-primary pl-3">6. Interactive Modals & Feature Dialogs</h2>
                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex flex-wrap gap-3">
                            {/* Tip Artist Modal Trigger */}
                            <Button variant="outline" onClick={() => setIsTipModalOpen(true)} className="gap-2">
                                <Gift className="h-4 w-4 text-primary" /> Open Tip Jar Modal
                            </Button>

                            {/* Embed Badge Modal Trigger */}
                            <Button variant="outline" onClick={() => setIsBadgeModalOpen(true)} className="gap-2">
                                <Code2 className="h-4 w-4 text-primary" /> Open Embed Badge Modal
                            </Button>

                            {/* GIF Picker Modal Trigger */}
                            <Button variant="outline" onClick={() => setIsGifModalOpen(true)} className="gap-2">
                                <Smile className="h-4 w-4 text-primary" /> Open Tenor GIF Picker
                            </Button>

                            {/* Midtrans Payment Simulation Trigger */}
                            <Button variant="outline" onClick={() => setIsPaymentModalOpen(true)} className="gap-2">
                                <CreditCard className="h-4 w-4 text-primary" /> Open Escrow Payment Modal
                            </Button>

                            {/* Media Lightbox Trigger */}
                            <Button variant="outline" onClick={() => setIsLightboxOpen(true)} className="gap-2">
                                <Maximize2 className="h-4 w-4 text-primary" /> Open Fullscreen Lightbox
                            </Button>

                            {/* Standard Animated Dialog */}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <Upload className="h-4 w-4 mr-2" /> Open Upload Dialog
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Upload Artwork to Portfolio</DialogTitle>
                                        <DialogDescription>
                                            Share your latest illustration with clients and the community.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-2">
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input placeholder="Sunset Cyberpunk Cityscape" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tags</Label>
                                            <Input placeholder="#anime #cyberpunk #digitalart" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            onClick={() =>
                                                toast.success('Artwork Published!', {
                                                    description: 'Your piece is now live on your profile.',
                                                })
                                            }
                                        >
                                            Publish Piece
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {/* Alert Dialog */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        <AlertTriangle className="h-4 w-4 mr-2" /> Cancel Commission
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will immediately cancel order #CM-4921. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Keep Order</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() =>
                                                toast.error('Order Cancelled', {
                                                    description: 'Commission has been marked as cancelled.',
                                                })
                                            }
                                        >
                                            Yes, Cancel Order
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            {/* Dropdown Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => toast.info('Post Bookmarked')}>
                                        <Heart className="h-4 w-4 mr-2" /> Bookmark Post
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => toast.info('Link Copied')}>
                                        <Share2 className="h-4 w-4 mr-2" /> Share Link
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem destructive onClick={() => toast.error('Report Submitted')}>
                                        <Shield className="h-4 w-4 mr-2" /> Report to Staff
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Preview Selected GIF if any */}
                        {selectedGifUrl && (
                            <div className="p-4 rounded-xl border border-border bg-secondary/20 flex items-center gap-4">
                                <img
                                    src={selectedGifUrl}
                                    alt="Selected GIF"
                                    className="h-20 w-auto rounded-lg object-contain border border-border"
                                />
                                <div>
                                    <span className="text-xs font-bold text-primary block">Picked via GifPickerModal:</span>
                                    <span className="text-xs text-muted-foreground font-mono break-all">{selectedGifUrl}</span>
                                </div>
                                <Button size="xs" variant="ghost" onClick={() => setSelectedGifUrl(null)} className="ml-auto">
                                    Clear
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Modals rendered when active */}
                <TipArtistModal
                    open={isTipModalOpen}
                    onOpenChange={setIsTipModalOpen}
                    username="aether_art"
                    displayName="Aether Art Studio"
                    avatarUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=face"
                />

                <EmbedBadgeModal
                    open={isBadgeModalOpen}
                    onOpenChange={setIsBadgeModalOpen}
                    username="aether_art"
                    profileId={1}
                    displayName="Aether Art Studio"
                />

                <GifPickerModal
                    isOpen={isGifModalOpen}
                    onClose={() => setIsGifModalOpen(false)}
                    onSelectGif={(gif) => {
                        setSelectedGifUrl(gif.url);
                        setIsGifModalOpen(false);
                        toast.success('GIF Selected!', { description: gif.title });
                    }}
                />

                <MidtransPaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    commission={dummyCommission}
                    isMock={true}
                    onPaymentSuccess={() => {
                        toast.success('Simulated Payment Captured into Escrow!');
                        setIsPaymentModalOpen(false);
                    }}
                />

                <MediaLightboxModal
                    isOpen={isLightboxOpen}
                    onClose={() => setIsLightboxOpen(false)}
                    mediaList={[
                        {
                            url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
                            file_name: 'cyberpunk_cityscape.jpg',
                            media_type: 'image',
                        },
                        {
                            url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200',
                            file_name: 'oil_painting_study.jpg',
                            media_type: 'image',
                        },
                    ]}
                />
            </motion.section>

            {/* User Avatars & Presence Indicators */}
            <motion.section variants={itemVariants} className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold border-l-4 border-primary pl-3">7. User Avatars & Presence Indicators</h2>
                    <Badge variant="outline" className="font-mono text-xs">SM • MD • LG • XL</Badge>
                </div>
                <Card>
                    <CardContent className="p-6 space-y-6">
                        {/* Size scale with active image & presence indicators */}
                        <div className="space-y-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                                Size Scale with Photography & Online Presence
                            </span>
                            <div className="flex items-center gap-5 pt-1">
                                <Avatar
                                    size="sm"
                                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=face"
                                    fallback="Sarah Connor"
                                    isOnline={true}
                                />
                                <Avatar
                                    size="md"
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face"
                                    fallback="Aether Art"
                                    isOnline={true}
                                />
                                <Avatar
                                    size="lg"
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=face"
                                    fallback="Studio Ghibli"
                                    isOnline={false}
                                />
                                <Avatar
                                    size="xl"
                                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&h=160&fit=crop&crop=face"
                                    fallback="Comme Admin"
                                    isOnline={true}
                                />
                            </div>
                        </div>

                        {/* Fallback Initials */}
                        <div className="space-y-2 pt-4 border-t border-border">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                                Fallback Initials (When No Image is Provided)
                            </span>
                            <div className="flex items-center gap-5 pt-1">
                                <Avatar size="sm" fallback="Sarah Connor" isOnline={true} />
                                <Avatar size="md" fallback="Aether Art" isOnline={true} />
                                <Avatar size="lg" fallback="Studio Ghibli" isOnline={false} />
                                <Avatar size="xl" fallback="Comme Admin" isOnline={true} />
                            </div>
                        </div>

                        {/* Overlapping Avatar Stacks & User Chip */}
                        <div className="space-y-2 pt-4 border-t border-border">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                                Overlapping Team Stack & Interactive User Chip
                            </span>
                            <div className="flex flex-wrap items-center gap-6 pt-1">
                                {/* Overlapping Stack */}
                                <div className="flex -space-x-3 overflow-hidden p-1">
                                    <Avatar
                                        size="md"
                                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=face"
                                        fallback="SC"
                                        className="ring-2 ring-card"
                                    />
                                    <Avatar
                                        size="md"
                                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face"
                                        fallback="AA"
                                        className="ring-2 ring-card"
                                    />
                                    <Avatar
                                        size="md"
                                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=face"
                                        fallback="SG"
                                        className="ring-2 ring-card"
                                    />
                                    <div className="h-10 w-10 rounded-full ring-2 ring-card bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                                        +5
                                    </div>
                                </div>

                                {/* User Chip */}
                                <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl border border-border bg-card/60">
                                    <Avatar
                                        size="md"
                                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=face"
                                        fallback="Aether Art"
                                        isOnline={true}
                                    />
                                    <div>
                                        <span className="text-xs font-bold block">Aether Art Studio</span>
                                        <span className="text-[11px] text-emerald-400 font-medium">● Online • 4 Active Orders</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.section>

            {/* Tabs & Scroll Area */}
            <motion.section variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-bold border-l-4 border-primary pl-3">8. Tabs (Gliding Indicator) & ScrollArea</h2>
                <Card>
                    <CardContent className="p-6">
                        <Tabs defaultValue="overview">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="messages">Chat Thread (3)</TabsTrigger>
                                <TabsTrigger value="reviews">Client Reviews</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="p-4 rounded-xl bg-secondary/30 space-y-2">
                                <h4 className="font-bold text-sm">Commission Service Details</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Standard full-body illustration with dynamic anime cel-shading. 2 free revisions included.
                                    Delivery deadline: 7 business days.
                                </p>
                            </TabsContent>

                            <TabsContent value="messages">
                                <ScrollArea maxHeight="180px" className="p-4 rounded-xl bg-secondary/30 space-y-3">
                                    <div className="flex gap-3 text-xs">
                                        <Avatar size="sm" fallback="Buyer" />
                                        <div className="bg-card p-3 rounded-lg border border-border">
                                            <span className="font-bold block mb-1">Buyer:</span>
                                            Hi! I would love a pose with magical flame particles around the sword.
                                        </div>
                                    </div>
                                    <div className="flex gap-3 text-xs justify-end">
                                        <div className="bg-primary/15 text-foreground p-3 rounded-lg border border-primary/30">
                                            <span className="font-bold block mb-1 text-primary">Artist:</span>
                                            Got it! I will start on the thumbnail sketch today.
                                        </div>
                                        <Avatar size="sm" fallback="Artist" isOnline={true} />
                                    </div>
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="reviews" className="p-4 rounded-xl bg-secondary/30">
                                <p className="text-xs text-muted-foreground">⭐⭐⭐⭐⭐ "Incredible art and fast delivery!" - @kazuma</p>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </motion.section>

            {/* Moderation Table & Pagination */}
            <motion.section variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-bold border-l-4 border-primary pl-3">9. Table & Pagination</h2>
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ticket ID</TableHead>
                                    <TableHead>Reporter</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-mono font-bold">#REP-102</TableCell>
                                    <TableCell>@cyber_samurai</TableCell>
                                    <TableCell>Spam / Unauthorized AI Art</TableCell>
                                    <TableCell>
                                        <Badge variant="rose">Pending Review</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="xs" variant="outline">
                                            Inspect
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-mono font-bold">#REP-103</TableCell>
                                    <TableCell>@luna_draws</TableCell>
                                    <TableCell>Harassment in Commission Chat</TableCell>
                                    <TableCell>
                                        <Badge variant="gold">Investigating</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="xs" variant="outline">
                                            Inspect
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>

                        <Pagination
                            meta={{
                                current_page: currentPage,
                                from: (currentPage - 1) * 10 + 1,
                                last_page: 5,
                                per_page: 10,
                                to: currentPage * 10,
                                total: 50,
                                path: '/reports',
                            }}
                            onPageChange={(p) => setCurrentPage(p)}
                        />
                    </CardContent>
                </Card>
            </motion.section>

            {/* Empty & Moderated States (UnavailableContentState) & Skeleton Shimmers */}
            <motion.section variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-bold border-l-4 border-primary pl-3">10. States & Feedback (UnavailableContentState & Skeletons)</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* UnavailableContentState Showcase */}
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-bold">UnavailableContentState</span>
                                </div>
                                <div className="flex gap-1">
                                    {(['not_found', 'taken_down', 'suspended', 'private'] as UnavailableVariant[]).map((v) => (
                                        <Button
                                            key={v}
                                            size="xs"
                                            variant={unavailableVariant === v ? 'default' : 'outline'}
                                            onClick={() => setUnavailableVariant(v)}
                                            className="capitalize text-[10px] px-2 py-0 h-6"
                                        >
                                            {v.replace('_', ' ')}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <UnavailableContentState
                                variant={unavailableVariant}
                                type="artwork"
                                reason={
                                    unavailableVariant === 'taken_down'
                                        ? 'Removed due to copyright infringement report #REP-102.'
                                        : undefined
                                }
                            />
                        </CardContent>
                    </Card>

                    {/* Skeletons */}
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-border">
                                <span className="text-sm font-bold">Dynamic Skeleton Shimmers</span>
                                <Badge variant="outline">Pulse State</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[1, 2].map((i) => (
                                    <div key={i} className="space-y-3 rounded-xl border border-border p-3.5">
                                        <Skeleton className="h-28 w-full rounded-lg" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </motion.section>

            {/* Notification Cards */}
            <motion.section variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-bold border-l-4 border-primary pl-3">11. Notification Cards (Comme Model)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <NotificationCard
                        notification={{
                            id: 1,
                            user_id: 42,
                            type: 'commission_request',
                            data: {
                                title: 'New Commission Inquiry',
                                message: '@kazuma sent a request for Full Body Anime Illustration (Deadline: 7 Days)',
                                action_url: '/commissions/4921',
                            },
                            read_at: null,
                            created_at: '2026-08-27T08:30:00Z',
                        }}
                        onMarkAsRead={() => toast.info('Marked notification as read')}
                        onActionClick={(url) => toast.success(`Navigating to ${url}`)}
                    />
                    <NotificationCard
                        notification={{
                            id: 2,
                            user_id: 42,
                            type: 'payment_received',
                            data: {
                                title: 'Midtrans Payment Verified',
                                message: 'Escrow payment of Rp 750,000 was captured for Order #CM-4921.',
                                action_url: '/orders/4921',
                            },
                            read_at: '2026-08-27T08:00:00Z',
                            created_at: '2026-08-27T06:30:00Z',
                        }}
                        onActionClick={(url) => toast.success(`Navigating to ${url}`)}
                    />
                </div>
            </motion.section>

            {/* Studio Navigation Sidebar */}
            <motion.section variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-bold border-l-4 border-primary pl-3">12. Studio Navigation Sidebar</h2>
                <Card className="overflow-hidden border border-border">
                    <SidebarProvider defaultCollapsed={false}>
                        <div className="flex h-105 w-full bg-background/50">
                            {/* App Sidebar Instance */}
                            <AppSidebar activeTab={sidebarTab} onTabChange={(t) => setSidebarTab(t)} />

                            {/* Simulated Live Content Area */}
                            <div className="flex-1 p-6 overflow-y-auto space-y-4">
                                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <SidebarMobileTrigger />
                                        <div>
                                            <h3 className="text-lg font-bold capitalize">
                                                {sidebarTab.replace('_', ' ')} Panel
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                Simulated workspace view inside dashboard layout
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="primary">Live Layout Preview</Badge>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2">
                                        <span className="text-xs font-semibold text-muted-foreground">Active Order Revenue</span>
                                        <p className="text-xl font-black text-foreground">Rp 4,250,000</p>
                                        <p className="text-[11px] text-emerald-400 font-medium">↑ +18% from last month</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2">
                                        <span className="text-xs font-semibold text-muted-foreground">Pending Revisions</span>
                                        <p className="text-xl font-black text-foreground">2 Orders</p>
                                        <p className="text-[11px] text-amber-400 font-medium">Due in 48 hours</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                                    <p className="text-xs font-semibold text-primary">Tip:</p>
                                    <p className="text-xs text-muted-foreground">
                                        Switch between Studio Overview, Portfolio, Services, and Orders in the sidebar to preview active-route highlighting and synchronized dashboard panel switching.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </SidebarProvider>
                </Card>
            </motion.section>
        </motion.div>
    );
};
