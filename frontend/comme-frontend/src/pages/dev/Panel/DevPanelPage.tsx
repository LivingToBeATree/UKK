import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Terminal,
    UserCheck,
    LogOut,
    Send,
    RefreshCw,
    Trash2,
    CheckCircle2,
    Shield,
    Palette,
    ShoppingBag,
    Database,
    Zap,
    Code,
    Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api, initCsrf } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';

const SEEDED_PERSONAS = [
    {
        role: 'Admin',
        name: 'Comme Administrator',
        email: 'admin@comme.test',
        username: 'admin',
        icon: Shield,
        badgeVariant: 'gold' as const,
        description: 'Super-admin with full access to moderation, reports, and system settings.',
    },
    {
        role: 'Moderator',
        name: 'Comme Moderator',
        email: 'moderator@comme.test',
        username: 'moderator',
        icon: Shield,
        badgeVariant: 'secondary' as const,
        description: 'Staff member managing artist applications and support tickets.',
    },
    {
        role: 'Artist',
        name: 'Sakura Art',
        email: 'artist@comme.test',
        username: 'sakura_art',
        icon: Palette,
        badgeVariant: 'purple' as const,
        description: 'Verified digital creator with listed services, portfolio, and active commission slots.',
    },
    {
        role: 'Buyer',
        name: 'Art Lover',
        email: 'client@comme.test',
        username: 'art_lover',
        icon: ShoppingBag,
        badgeVariant: 'teal' as const,
        description: 'Regular client placing commissions, submitting briefs, and reviewing artists.',
    },
];

export const DevPanelPage: React.FC = () => {
    const { user, isAuthenticated, login, logout, refreshUser } = useAuth();
    const navigate = useNavigate();

    // Persona Switcher state
    const [switchingUser, setSwitchingUser] = useState<string | null>(null);

    // Custom Login state
    const [customEmail, setCustomEmail] = useState('');
    const [customPassword, setCustomPassword] = useState('password');

    // Midtrans Simulator state
    const [orderId, setOrderId] = useState('COMM-DEV-101');
    const [grossAmount, setGrossAmount] = useState('500000');
    const [transactionStatus, setTransactionStatus] = useState('settlement');
    const [fraudStatus, setFraudStatus] = useState('accept');
    const [webhookResponse, setWebhookResponse] = useState<string | null>(null);
    const [sendingWebhook, setSendingWebhook] = useState(false);

    // API Health state
    const [pingResults, setPingResults] = useState<{ [key: string]: string }>({});
    const [pinging, setPinging] = useState(false);

    // Persona Quick Switch
    const handleSwitchPersona = async (email: string) => {
        setSwitchingUser(email);
        try {
            await initCsrf();
            await login(email, 'password');
            toast.success(`Switched active session to ${email}`);
        } catch (err: unknown) {
            toast.error(`Login failed for ${email}. Ensure database is seeded.`);
            console.error(err);
        } finally {
            setSwitchingUser(null);
        }
    };

    // Logout
    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out (Guest Persona)');
        } catch {
            toast.error('Logout error');
        }
    };

    // Midtrans Webhook Simulation
    const handleSendMidtransWebhook = async () => {
        setSendingWebhook(true);
        setWebhookResponse(null);
        try {
            const payload = {
                order_id: orderId,
                transaction_status: transactionStatus,
                fraud_status: fraudStatus,
                gross_amount: grossAmount,
                payment_type: 'qris',
                transaction_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
                status_code: transactionStatus === 'settlement' ? '200' : '201',
                status_message: `Midtrans payment status is ${transactionStatus}`,
                signature_key: 'dev_mock_signature',
            };

            const res = await api.post('/midtrans/webhook', payload);
            setWebhookResponse(JSON.stringify({ status: res.status, data: res.data }, null, 2));
            toast.success(`Webhook triggered: ${transactionStatus}`);
        } catch (err: unknown) {
            const axiosErr = err as { response?: { status: number; data: unknown }; message: string };
            setWebhookResponse(JSON.stringify(axiosErr.response?.data || { error: axiosErr.message }, null, 2));
            toast.error(`Webhook error: ${axiosErr.response?.status || 'network error'}`);
        } finally {
            setSendingWebhook(false);
        }
    };

    // API Health Ping
    const handleRunHealthCheck = async () => {
        setPinging(true);
        const results: { [key: string]: string } = {};
        try {
            // Ping CSRF
            try {
                await initCsrf();
                results['Sanctum CSRF Cookie'] = '204 OK (Cookie Established)';
            } catch {
                results['Sanctum CSRF Cookie'] = 'Failed';
            }

            // Ping Me
            try {
                const meRes = await api.get('/me');
                results['GET /api/me'] = `200 OK (User: ${meRes.data.data?.username || 'Authenticated'})`;
            } catch (e: unknown) {
                const status = (e as { response?: { status: number } }).response?.status;
                results['GET /api/me'] = status === 401 ? '401 (Guest / Not Logged In)' : `Error ${status}`;
            }

            // Ping Commission Services
            try {
                const svcRes = await api.get('/commission-services');
                results['GET /api/commission-services'] = `200 OK (${svcRes.data.data?.length ?? 0} services loaded)`;
            } catch (e: unknown) {
                results['GET /api/commission-services'] = `Error ${(e as { response?: { status: number } }).response?.status}`;
            }

            setPingResults(results);
            toast.success('Health checks finished');
        } finally {
            setPinging(false);
        }
    };

    return (
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 py-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                            <Terminal className="h-5 w-5" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Developer Console</h1>
                        <Badge variant="purple" className="font-mono text-[11px]">
                            ENV: {import.meta.env.DEV ? 'LOCAL DEV' : 'PROD'}
                        </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Internal developer workbench for session switching, webhook simulation, API probing, and component testing.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/dev/sandbox')}
                        className="gap-2 text-xs font-semibold"
                    >
                        <Sparkles className="h-4 w-4 text-primary" /> Component Sandbox
                    </Button>
                </div>
            </div>

            {/* Current Active Session Status Bar */}
            <Card className="bg-card/70 border-border/80">
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm text-foreground">
                            {user ? user.username.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-foreground">
                                    {user ? user.display_name || user.username : 'Guest (Logged Out)'}
                                </span>
                                {user && (
                                    <Badge variant={user.role === 'admin' ? 'gold' : 'secondary'} className="text-[10px]">
                                        {user.role.toUpperCase()}
                                    </Badge>
                                )}
                                {user?.artist_profile && (
                                    <Badge variant="purple" className="text-[10px]">
                                        ARTIST PROFILE
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">
                                {user ? `ID: ${user.id} • ${user.email}` : 'No active session token'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isAuthenticated && (
                            <>
                                <Button size="xs" variant="outline" onClick={() => refreshUser()}>
                                    <RefreshCw className="h-3 w-3 mr-1" /> Refresh Session
                                </Button>
                                <Button size="xs" variant="destructive" onClick={handleLogout}>
                                    <LogOut className="h-3 w-3 mr-1" /> Log Out
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Main Tabs */}
            <Tabs defaultValue="personas" className="space-y-6">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full md:w-auto h-auto p-1 gap-1">
                    <TabsTrigger value="personas" className="gap-2 py-2 text-xs">
                        <UserCheck className="h-3.5 w-3.5" /> Personas & Roles
                    </TabsTrigger>
                    <TabsTrigger value="webhooks" className="gap-2 py-2 text-xs">
                        <Zap className="h-3.5 w-3.5" /> Webhooks & API
                    </TabsTrigger>
                    <TabsTrigger value="storage" className="gap-2 py-2 text-xs">
                        <Database className="h-3.5 w-3.5" /> Storage & Cache
                    </TabsTrigger>
                    <TabsTrigger value="inspect" className="gap-2 py-2 text-xs">
                        <Code className="h-3.5 w-3.5" /> State Inspector
                    </TabsTrigger>
                </TabsList>

                {/* TAB 1: Personas & Fast Role Switcher */}
                <TabsContent value="personas" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {SEEDED_PERSONAS.map((persona) => {
                            const Icon = persona.icon;
                            const isActive = user?.email === persona.email;
                            const isPending = switchingUser === persona.email;

                            return (
                                <Card
                                    key={persona.email}
                                    className={`relative overflow-hidden transition-all ${
                                        isActive ? 'border-primary ring-1 ring-primary/40 bg-primary/5' : 'hover:border-border'
                                    }`}
                                >
                                    <CardContent className="p-5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="p-2 rounded-lg bg-secondary text-foreground">
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <Badge variant={persona.badgeVariant} className="text-[10px]">
                                                {persona.role}
                                            </Badge>
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-sm text-foreground">{persona.name}</h3>
                                            <p className="text-xs text-muted-foreground font-mono truncate">{persona.email}</p>
                                        </div>

                                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                            {persona.description}
                                        </p>

                                        <Button
                                            size="sm"
                                            className="w-full text-xs font-semibold"
                                            variant={isActive ? 'outline' : 'default'}
                                            disabled={isActive || isPending}
                                            onClick={() => handleSwitchPersona(persona.email)}
                                        >
                                            {isActive ? 'Current Session' : isPending ? 'Switching...' : `Switch to ${persona.role}`}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Custom Login Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Custom Credentials Login</CardTitle>
                            <CardDescription className="text-xs">
                                Authenticate as any custom user currently registered in the database.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (customEmail) handleSwitchPersona(customEmail);
                                }}
                                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                            >
                                <div>
                                    <Label className="text-xs">Email</Label>
                                    <Input
                                        placeholder="user@comme.test"
                                        value={customEmail}
                                        onChange={(e) => setCustomEmail(e.target.value)}
                                        className="text-xs mt-1"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Password</Label>
                                    <Input
                                        type="password"
                                        value={customPassword}
                                        onChange={(e) => setCustomPassword(e.target.value)}
                                        className="text-xs mt-1"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button type="submit" className="w-full text-xs font-semibold">
                                        Authenticate
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 2: Webhooks & API Prober */}
                <TabsContent value="webhooks" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Midtrans Simulator */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-primary" /> Midtrans Webhook Simulator
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Send simulated payment event notifications to <code className="text-primary font-mono">POST /api/midtrans/webhook</code>.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs">Order ID</Label>
                                        <Input
                                            value={orderId}
                                            onChange={(e) => setOrderId(e.target.value)}
                                            className="text-xs font-mono mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Gross Amount (IDR)</Label>
                                        <Input
                                            value={grossAmount}
                                            onChange={(e) => setGrossAmount(e.target.value)}
                                            className="text-xs font-mono mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs">Transaction Status</Label>
                                        <Select
                                            value={transactionStatus}
                                            onChange={(e) => setTransactionStatus(e.target.value)}
                                            className="text-xs mt-1"
                                        >
                                            <option value="settlement">settlement (Paid / Success)</option>
                                            <option value="pending">pending (Waiting Payment)</option>
                                            <option value="deny">deny (Payment Rejected)</option>
                                            <option value="expire">expire (Session Expired)</option>
                                            <option value="cancel">cancel (Cancelled by User)</option>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-xs">Fraud Status</Label>
                                        <Select
                                            value={fraudStatus}
                                            onChange={(e) => setFraudStatus(e.target.value)}
                                            className="text-xs mt-1"
                                        >
                                            <option value="accept">accept</option>
                                            <option value="challenge">challenge</option>
                                            <option value="deny">deny</option>
                                        </Select>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSendMidtransWebhook}
                                    disabled={sendingWebhook}
                                    className="w-full text-xs font-semibold gap-2"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    {sendingWebhook ? 'Triggering Webhook...' : 'Dispatch Simulated Webhook'}
                                </Button>

                                {webhookResponse && (
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Server Response:</Label>
                                        <pre className="p-3 bg-secondary/70 rounded-lg text-[11px] font-mono overflow-auto max-h-40 text-foreground border border-border">
                                            {webhookResponse}
                                        </pre>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* API Health & Probe */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Backend Endpoint Health Probe
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Test connectivity against live Laravel API endpoints.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    onClick={handleRunHealthCheck}
                                    disabled={pinging}
                                    variant="outline"
                                    className="w-full text-xs font-semibold gap-2"
                                >
                                    <RefreshCw className={`h-3.5 w-3.5 ${pinging ? 'animate-spin' : ''}`} />
                                    {pinging ? 'Probing...' : 'Run Connectivity Checks'}
                                </Button>

                                <div className="space-y-2 pt-2">
                                    {Object.entries(pingResults).length === 0 ? (
                                        <p className="text-xs text-muted-foreground text-center py-6">
                                            Click "Run Connectivity Checks" to ping endpoints.
                                        </p>
                                    ) : (
                                        Object.entries(pingResults).map(([endpoint, status]) => (
                                            <div
                                                key={endpoint}
                                                className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 border border-border text-xs"
                                            >
                                                <span className="font-mono text-muted-foreground">{endpoint}</span>
                                                <Badge
                                                    variant={status.startsWith('200') || status.startsWith('204') ? 'teal' : 'secondary'}
                                                    className="font-mono text-[10px]"
                                                >
                                                    {status}
                                                </Badge>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* TAB 3: Storage & Client Cache */}
                <TabsContent value="storage" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-bold">LocalStorage State</CardTitle>
                                <CardDescription className="text-xs">
                                    Inspect browser cached tokens and user session data.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {['comme_user', 'comme-ui-theme', 'comme-color-theme'].map((key) => {
                                    const val = localStorage.getItem(key);
                                    return (
                                        <div key={key} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-mono font-semibold text-primary">{key}</span>
                                                <Button
                                                    size="xs"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        localStorage.removeItem(key);
                                                        toast.success(`Removed ${key}`);
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                                </Button>
                                            </div>
                                            <pre className="p-2 bg-secondary/60 rounded text-[10px] font-mono text-muted-foreground overflow-auto max-h-24">
                                                {val || '(empty)'}
                                            </pre>
                                        </div>
                                    );
                                })}

                                <div className="pt-2">
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="w-full text-xs font-semibold gap-1.5"
                                        onClick={() => {
                                            localStorage.clear();
                                            toast.success('Cleared all localStorage keys');
                                        }}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" /> Wipe All LocalStorage
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* UI Feedback Tester */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-bold">Sonner Toast Feedback Sandbox</CardTitle>
                                <CardDescription className="text-xs">
                                    Test various toast notification variants across active themes.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <Button size="sm" variant="outline" onClick={() => toast.success('Success notification triggered!')}>
                                        Toast Success
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => toast.error('Error alert triggered!')}>
                                        Toast Error
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => toast.info('Informational notification')}>
                                        Toast Info
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => toast.warning('Warning message shown')}>
                                        Toast Warning
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* TAB 4: Active Session JSON Inspector */}
                <TabsContent value="inspect" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Code className="h-4 w-4 text-primary" /> Active React AuthContext Payload
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Live representation of the <code className="font-mono text-primary">user</code> state object currently held in memory.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <pre className="p-4 bg-secondary/70 rounded-xl text-xs font-mono overflow-auto max-h-96 text-foreground border border-border">
                                {JSON.stringify(user, null, 2) || '// No active user session'}
                            </pre>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
