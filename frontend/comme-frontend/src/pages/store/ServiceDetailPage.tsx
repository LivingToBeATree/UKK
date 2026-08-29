import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Star, ShoppingCart, Clock, DollarSign } from 'lucide-react';
import { commissionServiceApi, commissionReviewApi, type CommissionReview } from '@/services/commissionService';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import type { CommissionService, CommissionOption } from '@/types';

export const ServiceDetailPage: React.FC = () => {
    const { serviceId } = useParams<{ serviceId: string }>();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [service, setService] = useState<CommissionService | null>(null);
    const [reviews, setReviews] = useState<CommissionReview[]>([]);
    const [selectedOption, setSelectedOption] = useState<CommissionOption | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const svc = await commissionServiceApi.show(Number(serviceId));
                setService(svc);
                if (svc.options && svc.options.length > 0) setSelectedOption(svc.options[0]);
                if (svc.artist_profile_id) {
                    const reviewsRes = await commissionReviewApi.listForArtist(svc.artist_profile_id);
                    setReviews(reviewsRes.data);
                }
            } catch {
                toast.error('Failed to load service');
            } finally {
                setLoading(false);
            }
        };
        if (serviceId) fetchData();
    }, [serviceId]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!service) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <p className="text-muted-foreground">Service not found</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/store" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4" /> Back to Store
            </Link>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-3 gap-8">
                {/* Left: Service Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Media */}
                    <div className="rounded-xl overflow-hidden bg-muted h-64 flex items-center justify-center">
                        {service.media && service.media[0] ? (
                            <img src={service.media[0].url} alt={service.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-muted-foreground">No image</span>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold">{service.name}</h1>
                            <Badge variant={service.status === 'open' ? 'secondary' : 'rose'}>
                                {service.status}
                            </Badge>
                        </div>
                        {service.artist_profile?.user && (
                            <Link
                                to={`/artists/${service.artist_profile_id}`}
                                className="text-sm text-muted-foreground hover:text-primary"
                            >
                                by {service.artist_profile.user.display_name || service.artist_profile.user.username}
                            </Link>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>

                    {/* Options */}
                    {service.options && service.options.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="font-bold text-lg">Options</h2>
                            <div className="grid gap-3">
                                {service.options.map((option) => (
                                    <Card
                                        key={option.id}
                                        className={`cursor-pointer transition-all ${
                                            selectedOption?.id === option.id
                                                ? 'border-primary ring-1 ring-primary/30'
                                                : 'hover:border-primary/40'
                                        }`}
                                        onClick={() => setSelectedOption(option)}
                                    >
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-sm">{option.title}</h3>
                                                {option.description && (
                                                    <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="font-bold text-primary flex items-center gap-1">
                                                    <DollarSign className="h-4 w-4" />
                                                    {(option.base_price ?? option.price ?? 0).toLocaleString()}
                                                </p>
                                                {option.duration_days && (
                                                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {option.duration_days} days
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reviews */}
                    <div className="space-y-3">
                        <h2 className="font-bold text-lg">Reviews ({reviews.length})</h2>
                        {reviews.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No reviews yet</p>
                        ) : (
                            reviews.map((review) => (
                                <Card key={review.id}>
                                    <CardContent className="p-4 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-3 w-3 ${
                                                            i < review.rating ? 'text-amber-400 fill-current' : 'text-muted'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[11px] text-muted-foreground">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm">{review.comment}</p>
                                        {review.artist_reply && (
                                            <div className="ml-4 pl-4 border-l-2 border-primary/30 mt-2">
                                                <p className="text-xs text-muted-foreground">Artist reply:</p>
                                                <p className="text-sm">{review.artist_reply}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Order Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-20">
                        <CardContent className="p-6 space-y-4">
                            <h2 className="font-bold">Order Summary</h2>
                            {selectedOption ? (
                                <div className="space-y-2">
                                    <p className="text-sm">{selectedOption.title}</p>
                                    <p className="text-2xl font-bold text-primary">
                                        ${(selectedOption.base_price ?? selectedOption.price ?? 0).toLocaleString()}
                                    </p>
                                    {selectedOption.duration_days && (
                                        <p className="text-xs text-muted-foreground">
                                            Estimated delivery: {selectedOption.duration_days} days
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Select an option above</p>
                            )}

                            <Button
                                className="w-full"
                                disabled={!selectedOption || service.status !== 'open'}
                                onClick={() => {
                                    if (!isAuthenticated) {
                                        navigate('/login');
                                        return;
                                    }
                                    navigate(`/store/${serviceId}/order`, {
                                        state: { service, selectedOption },
                                    });
                                }}
                            >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                {service.status === 'open' ? 'Order Now' : 'Service Closed'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
};
