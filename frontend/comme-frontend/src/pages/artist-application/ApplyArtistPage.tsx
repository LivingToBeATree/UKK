import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Palette, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { artistApplicationApi } from '@/services/artistService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';

interface ApplicationForm {
    portfolio_url: string;
    social_links: string;
    note: string;
}

export const ApplyArtistPage: React.FC = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ApplicationForm>();

    const onSubmit = async (data: ApplicationForm) => {
        try {
            const socialLinks = data.social_links ? data.social_links.split(',').map((s) => s.trim()).filter(Boolean) : [];
            await artistApplicationApi.create({
                portfolio_url: data.portfolio_url,
                social_links: socialLinks.length > 0 ? socialLinks : undefined,
                note: data.note || undefined,
            });
            toast.success('Application submitted!');
            navigate('/apply-artist/status');
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to submit';
            toast.error(message);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Palette className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Apply as Artist</h1>
                    <p className="text-sm text-muted-foreground mt-2">Share your portfolio and join the Comme artist community</p>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="portfolio_url">Portfolio URL *</Label>
                                <Input
                                    id="portfolio_url"
                                    placeholder="https://your-portfolio.com"
                                    {...register('portfolio_url', { required: 'Portfolio URL is required' })}
                                />
                                {errors.portfolio_url && <p className="text-xs text-destructive">{errors.portfolio_url.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="social_links">Social Links (comma-separated)</Label>
                                <Input
                                    id="social_links"
                                    placeholder="https://twitter.com/you, https://instagram.com/you"
                                    {...register('social_links')}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="note">Additional Note</Label>
                                <Textarea
                                    id="note"
                                    placeholder="Tell us about your art style, experience, etc."
                                    {...register('note')}
                                    rows={4}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                <Send className="h-4 w-4 mr-2" />
                                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};
