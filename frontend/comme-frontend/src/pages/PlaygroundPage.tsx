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
import { SidebarProvider } from '@/components/ui/sidebar';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
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

export const PlaygroundPage: React.FC = () => {
    const [progressVal, setProgressVal] = useState(65);
    const [rememberMe, setRememberMe] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [sidebarTab, setSidebarTab] = useState('overview');

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="min-h-screen bg-background text-foreground p-6 sm:p-12 max-w-6xl mx-auto space-y-12 font-sans"
        >
            {/* Header with Theme-Aware Star Accent */}
            <motion.div variants={itemVariants} className="space-y-2 border-b border-border pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/30 text-primary">
                        <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Comme Design System</h1>
                        <p className="text-sm text-muted-foreground">
                            Interactive showcase for all 19 atomic components, Motion micro-interactions & brand color themes
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* 1. Buttons & Badges */}
            <motion.section variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-bold border-l-4 border-primary pl-3">1. Buttons & Badges</h2>
                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <Button>Default Primary</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="destructive">Destructive</Button>
                            <Button variant="link">Link Button</Button>
                            <Button size="sm">Small</Button>
                            <Button size="lg">Large CTA</Button>
                        </div>

                        {/* Predetermined Fixed Badges */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                            <Badge variant="purple">Purple Accent</Badge>
                            <Badge variant="teal">Teal / Mint</Badge>
                            <Badge variant="gold">Gold / Amber</Badge>
                            <Badge variant="rose">Rose / Error</Badge>
                            <Badge variant="get">GET 200</Badge>
                            <Badge variant="post">POST 201</Badge>
                            <Badge variant="patch">PATCH 200</Badge>
                            <Badge variant="delete">DELETE 204</Badge>
                        </div>
                    </CardContent>
                </Card>
            </motion.section>

            {/* 2. Toast Notifications */}
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

            {/* 3. Form Controls (Input, Textarea, Select, Checkbox) */}
            <motion.section variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-bold border-l-4 border-primary pl-3">3. Form Controls</h2>
                <Card>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="demo-email">Email Address</Label>
                            <Input id="demo-email" type="email" placeholder="artist@comme.app" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="demo-service">Commission Category</Label>
                            <Select
                                id="demo-service"
                                options={[
                                    { label: 'Character Illustration (Full Body)', value: 'full_body' },
                                    { label: 'Portrait / Bust', value: 'portrait' },
                                    { label: 'Live2D / Vtuber Model', value: 'vtuber' },
                                    { label: 'Pixel Art Animation', value: 'pixel' },
                                ]}
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="demo-notes">Project Brief & Details</Label>
                            <Textarea id="demo-notes" placeholder="Describe the scene, pose, and reference links..." />
                        </div>

                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="demo-check"
                                checked={rememberMe}
                                onCheckedChange={(val) => setRememberMe(val)}
                            />
                            <Label htmlFor="demo-check" className="cursor-pointer">
                                Remember this session for 30 days
                            </Label>
                        </div>
                    </CardContent>
                </Card>
            </motion.section>

            {/* 4. Avatars & Progress */}
            <motion.section variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-bold border-l-4 border-primary pl-3">4. Avatars & Progress</h2>
                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar size="sm" fallback="Sarah Connor" isOnline={true} />
                            <Avatar size="md" fallback="Aether Art" isOnline={true} />
                            <Avatar size="lg" fallback="Studio Ghibli" isOnline={false} />
                            <Avatar size="xl" fallback="Comme Admin" isOnline={true} />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                                <span>Commission Progress (Step 3 of 4)</span>
                                <span>{progressVal}%</span>
                            </div>
                            <Progress value={progressVal} />
                            <div className="flex gap-2 pt-2">
                                <Button size="xs" variant="outline" onClick={() => setProgressVal(Math.max(0, progressVal - 15))}>
                                    -15%
                                </Button>
                                <Button size="xs" variant="outline" onClick={() => setProgressVal(Math.min(100, progressVal + 15))}>
                                    +15%
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.section>

            {/* 5. Modals (Dialog & AlertDialog & Dropdown) */}
            <motion.section variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-bold border-l-4 border-primary pl-3">5. Dialogs & Dropdowns (Animated)</h2>
                <Card>
                    <CardContent className="p-6 flex flex-wrap gap-4 items-center">
                        {/* Standard Dialog using asChild with spring animation */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Upload className="h-4 w-4 mr-2" /> Open Animated Modal
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

                        {/* Alert Dialog using asChild with destructive predetermined style */}
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

                        {/* Dropdown Menu with fade-scale animation */}
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
                    </CardContent>
                </Card>
            </motion.section>

            {/* 6. Tabs & Scroll Area */}
            <motion.section variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-bold border-l-4 border-primary pl-3">6. Tabs (Gliding Indicator) & ScrollArea</h2>
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

            {/* 7. Moderation Table & Pagination */}
            <motion.section variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-bold border-l-4 border-primary pl-3">7. Table & Pagination</h2>
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

            {/* 8. Skeleton Loading States (Dynamic Theme Shimmers) */}
            <motion.section variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-bold border-l-4 border-primary pl-3">8. Skeleton Shimmers</h2>
                <Card>
                    <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-3 rounded-xl border border-border p-4">
                                <Skeleton className="h-36 w-full rounded-lg" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </motion.section>

            {/* 9. Domain-Specific Notification Cards */}
            <motion.section variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-bold border-l-4 border-primary pl-3">9. Notification Cards (Comme Model)</h2>
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

            {/* 10. Collapsible Studio Sidebar Component */}
            <motion.section variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-bold border-l-4 border-primary pl-3">10. Collapsible Studio Sidebar</h2>
                <Card className="overflow-hidden border border-border">
                    <SidebarProvider defaultCollapsed={false}>
                        <div className="flex h-[420px] w-full bg-background/50">
                            {/* App Sidebar Instance */}
                            <AppSidebar activeTab={sidebarTab} onTabChange={(t) => setSidebarTab(t)} />

                            {/* Simulated Live Content Area */}
                            <div className="flex-1 p-6 overflow-y-auto space-y-4">
                                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                                    <div>
                                        <h3 className="text-lg font-bold capitalize">
                                            {sidebarTab.replace('_', ' ')} Panel
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Simulated workspace view inside dashboard layout
                                        </p>
                                    </div>
                                    <Badge variant="purple">Live Layout Preview</Badge>
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
                                    <p className="text-xs font-semibold text-primary">💡 Pro Tip:</p>
                                    <p className="text-xs text-muted-foreground">
                                        Click the collapse button at the bottom of the sidebar to see smooth spring transitions between full navigation and compact icon-only mode!
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
