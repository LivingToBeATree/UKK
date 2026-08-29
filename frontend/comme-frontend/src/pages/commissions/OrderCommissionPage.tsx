import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Send } from 'lucide-react';
import { commissionOrderApi } from '@/services/commissionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import type { CommissionService, CommissionOption } from '@/types';

export const OrderCommissionPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { service, selectedOption } = (location.state || {}) as {
        service?: CommissionService;
        selectedOption?: CommissionOption;
    };
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!service || !selectedOption) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <p className="text-muted-foreground">No service selected. Please choose a service first.</p>
                <Link to="/store">
                    <Button variant="outline" className="mt-4">Browse Store</Button>
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const order = await commissionOrderApi.create({
                commission_service_id: service.id,
                commission_option_id: selectedOption.id,
                description,
            });
            toast.success('Commission ordered!');
            navigate(`/commissions/${order.id}`);
        } catch {
            toast.error('Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <Link to={`/store/${service.id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4" /> Back to Service
            </Link>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold mb-6">Place Your Order</h1>

                <Card className="mb-6">
                    <CardContent className="p-6 space-y-2">
                        <h2 className="font-bold">{service.name}</h2>
                        <p className="text-sm text-muted-foreground">Option: {selectedOption.title}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                            <span className="text-sm text-muted-foreground">Total</span>
                            <span className="text-xl font-bold text-primary">${(selectedOption.base_price ?? selectedOption.price ?? 0).toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="description">Describe your commission</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Include character references, specific poses, or visual background notes..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={6}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={submitting}>
                                <Send className="h-4 w-4 mr-2" />
                                {submitting ? 'Placing Order...' : 'Place Order'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};
