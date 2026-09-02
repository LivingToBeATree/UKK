import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    Wallet,
    DollarSign,
    ShieldCheck,
    Building2,
    CheckCircle2,
    Plus,
    Edit2,
    Trash2,
    Lock,
} from 'lucide-react';
import { artistPayoutApi } from '@/services/artistService';
import { commissionOrderApi } from '@/services/commissionService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { formatPrice, formatDateSafe } from '@/utils/format';
import type { ArtistPayoutAccount, CommissionOrder } from '@/types';

const POPULAR_BANKS = [
    { code: 'BCA', name: 'Bank Central Asia (BCA)' },
    { code: 'MANDIRI', name: 'Bank Mandiri' },
    { code: 'BNI', name: 'Bank Negara Indonesia (BNI)' },
    { code: 'BRI', name: 'Bank Rakyat Indonesia (BRI)' },
    { code: 'CIMB', name: 'CIMB Niaga' },
    { code: 'PERMATA', name: 'Bank Permata' },
    { code: 'GOPAY', name: 'GoPay E-Wallet' },
    { code: 'OVO', name: 'OVO E-Wallet' },
];

export const ArtistEarningsPage: React.FC = () => {
    const [payoutAccount, setPayoutAccount] = useState<ArtistPayoutAccount | null>(null);
    const [orders, setOrders] = useState<CommissionOrder[]>([]);
    const [loading, setLoading] = useState(true);

    // Account modal state
    const [isEditingAccount, setIsEditingAccount] = useState(false);
    const [bankName, setBankName] = useState('BCA');
    const [accountName, setAccountName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [savingAccount, setSavingAccount] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [accountRes, ordersRes] = await Promise.all([
                artistPayoutApi.get().catch(() => null),
                commissionOrderApi.list(1).catch(() => ({ data: [] })),
            ]);

            setPayoutAccount(accountRes || null);
            setOrders(ordersRes?.data || []);

            if (accountRes) {
                setBankName(accountRes.bank_name || 'BCA');
                setAccountName(accountRes.bank_account_name || '');
            }
        } catch {
            toast.error('Failed to load financial records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountName.trim() || !accountNumber.trim()) {
            toast.error('Please fill in all bank account details');
            return;
        }

        try {
            setSavingAccount(true);
            const updated = await artistPayoutApi.update({
                bank_name: bankName,
                bank_account_name: accountName.trim(),
                bank_account_number: accountNumber.trim(),
            });
            setPayoutAccount(updated);
            setIsEditingAccount(false);
            setAccountNumber('');
            toast.success('Payout account saved successfully!');
        } catch {
            toast.error('Failed to save payout account');
        } finally {
            setSavingAccount(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure you want to remove your payout account?')) return;

        try {
            await artistPayoutApi.destroy();
            setPayoutAccount(null);
            toast.success('Payout account removed');
        } catch {
            toast.error('Failed to remove payout account');
        }
    };

    // Calculate Financial metrics
    const completedOrders = orders.filter((o) => o.status === 'completed');
    const activeOrders = orders.filter((o) => ['accepted', 'in_progress', 'revision'].includes(o.status));

    const totalEarned = completedOrders.reduce((acc, o) => acc + Number(o.total_price || 0), 0);
    const inEscrow = activeOrders.reduce((acc, o) => acc + Number(o.total_price || 0), 0);
    const availableForPayout = totalEarned;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-2.5 text-foreground">
                        <Wallet className="h-6 w-6 text-emerald-400" />
                        Earnings & Escrow Payouts
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Secure escrow management, revenue records, and Midtrans Iris disbursement accounts.
                    </p>
                </div>
            </div>

            {/* Escrow Guarantee Banner */}
            <Card className="rounded-3xl border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-card to-card p-5">
                <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 shrink-0 border border-emerald-500/20">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-emerald-300">
                            Automated 100% Escrow Protection
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Client payments are secured in Midtrans Escrow the moment an order is approved. Once you deliver the final artwork and the client accepts, funds are released immediately to your payout balance.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="rounded-3xl border-border/80 bg-card p-5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Total Revenue
                    </span>
                    <p className="text-2xl sm:text-3xl font-black text-foreground font-mono">
                        {loading ? <Skeleton className="h-8 w-32" /> : formatPrice(totalEarned)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                        {completedOrders.length} completed commissions
                    </p>
                </Card>

                <Card className="rounded-3xl border-border/80 bg-card p-5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                        <Lock className="h-3.5 w-3.5 text-blue-400" /> In Escrow
                    </span>
                    <p className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
                        {loading ? <Skeleton className="h-8 w-32" /> : formatPrice(inEscrow)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                        {activeOrders.length} active in-progress orders
                    </p>
                </Card>

                <Card className="rounded-3xl border-border/80 bg-card p-5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" /> Available for Payout
                    </span>
                    <p className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">
                        {loading ? <Skeleton className="h-8 w-32" /> : formatPrice(availableForPayout)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                        Disbursed to your registered bank account
                    </p>
                </Card>
            </div>

            {/* Payout Bank Account Card */}
            <Card className="rounded-3xl border-border/80 bg-card/60 backdrop-blur-md overflow-hidden">
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/20">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-foreground">
                                    Disbursement Payout Account
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Where your earnings will be transferred via Midtrans Iris.
                                </p>
                            </div>
                        </div>

                        {!isEditingAccount && payoutAccount && (
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setIsEditingAccount(true)}
                                    className="h-8 px-3 rounded-xl text-xs font-bold gap-1 cursor-pointer"
                                >
                                    <Edit2 className="h-3 w-3" /> Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleDeleteAccount}
                                    className="h-8 px-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {isEditingAccount ? (
                        <form onSubmit={handleSaveAccount} className="space-y-4 pt-2 border-t border-border/60">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Bank / E-Wallet
                                    </label>
                                    <select
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border/80 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    >
                                        {POPULAR_BANKS.map((b) => (
                                            <option key={b.code} value={b.code}>
                                                {b.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Account Holder Name
                                    </label>
                                    <Input
                                        value={accountName}
                                        onChange={(e) => setAccountName(e.target.value)}
                                        placeholder="e.g. John Doe"
                                        required
                                        className="h-10 rounded-xl bg-secondary/50 border-border/80 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Account Number
                                    </label>
                                    <Input
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        placeholder="e.g. 1234567890"
                                        required
                                        className="h-10 rounded-xl bg-secondary/50 border-border/80 text-xs font-mono"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={savingAccount}
                                    className="h-9 px-5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-xs"
                                >
                                    {savingAccount ? 'Saving...' : 'Save Payout Account'}
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setIsEditingAccount(false)}
                                    className="h-9 text-xs font-semibold cursor-pointer"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    ) : payoutAccount ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/60">
                            <div>
                                <span className="text-[11px] font-bold text-muted-foreground uppercase">Bank Name</span>
                                <p className="font-bold text-sm text-foreground mt-0.5">{payoutAccount.bank_name}</p>
                            </div>
                            <div>
                                <span className="text-[11px] font-bold text-muted-foreground uppercase">Account Name</span>
                                <p className="font-bold text-sm text-foreground mt-0.5">{payoutAccount.bank_account_name}</p>
                            </div>
                            <div>
                                <span className="text-[11px] font-bold text-muted-foreground uppercase">Account Number</span>
                                <p className="font-bold text-sm text-foreground font-mono mt-0.5">{payoutAccount.bank_account_number}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="py-6 text-center space-y-3 pt-2 border-t border-border/60">
                            <p className="text-xs text-muted-foreground">
                                No bank account linked yet. Link a bank account to receive automatic commission payouts.
                            </p>
                            <Button
                                size="sm"
                                onClick={() => setIsEditingAccount(true)}
                                className="h-9 px-4 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-xs gap-1.5"
                            >
                                <Plus className="h-3.5 w-3.5" /> Link Bank Account
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Transactions & Order Escrow Ledger */}
            <Card className="rounded-3xl border-border/80 bg-card overflow-hidden">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                        Commission Earnings Ledger
                    </h3>

                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-14 w-full rounded-2xl" />
                            ))}
                        </div>
                    ) : orders.length > 0 ? (
                        <div className="divide-y divide-border/60">
                            {orders.map((order) => {
                                const isCompleted = order.status === 'completed';
                                const isActive = ['accepted', 'in_progress', 'revision'].includes(order.status);

                                return (
                                    <div key={order.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-foreground">
                                                    {order.commission_service?.name || order.description || 'Commission Project'}
                                                </span>
                                                <span className="text-[11px] font-mono text-muted-foreground">
                                                    #{order.id}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Client: <span className="text-foreground font-medium">@{order.user?.username || 'client'}</span> • {formatDateSafe(order.created_at)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4 justify-between sm:justify-end">
                                            <span className="font-mono font-bold text-sm text-foreground">
                                                {formatPrice(order.total_price || 0)}
                                            </span>
                                            <div>
                                                {isCompleted && (
                                                    <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
                                                        Released / Paid
                                                    </Badge>
                                                )}
                                                {isActive && (
                                                    <Badge className="bg-blue-500/15 border-blue-500/30 text-blue-400 font-bold text-[10px]">
                                                        Secured in Escrow
                                                    </Badge>
                                                )}
                                                {order.status === 'pending' && (
                                                    <Badge className="bg-amber-500/15 border-amber-500/30 text-amber-400 font-bold text-[10px]">
                                                        Pending Approval
                                                    </Badge>
                                                )}
                                                {['cancelled', 'declined'].includes(order.status) && (
                                                    <Badge variant="outline" className="text-muted-foreground text-[10px]">
                                                        Cancelled
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-xs text-muted-foreground">
                            No commission payments recorded yet.
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};
