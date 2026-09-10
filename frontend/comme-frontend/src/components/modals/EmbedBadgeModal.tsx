import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Copy, Check, Code2, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { getApiBaseUrl } from '@/services/api';

interface EmbedBadgeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    username: string;
    profileId?: number | string;
    displayName?: string;
}

export const EmbedBadgeModal: React.FC<EmbedBadgeModalProps> = ({
    open,
    onOpenChange,
    username,
    profileId,
    displayName,
}) => {
    const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

    const apiBase = getApiBaseUrl().replace(/\/api\/?$/, '');
    const badgeUrl = `${apiBase}/api/artists/${username}/badge.svg`;
    const targetUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/artists/${profileId || username}`
        : `http://localhost:5173/artists/${profileId || username}`;

    const markdownSnippet = `[![Comme Commissions](${badgeUrl})](${targetUrl})`;
    const htmlSnippet = `<a href="${targetUrl}" target="_blank" rel="noopener noreferrer">\n  <img src="${badgeUrl}" alt="Comme Commissions" />\n</a>`;
    const directUrl = badgeUrl;

    const copyToClipboard = (text: string, format: string) => {
        navigator.clipboard.writeText(text);
        setCopiedFormat(format);
        toast.success(`Copied ${format} snippet to clipboard!`);
        setTimeout(() => setCopiedFormat(null), 2500);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg bg-card border-border rounded-2xl p-6">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                        <Code2 className="h-5 w-5 text-primary" /> Embed Commission Badge
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Showcase your live commission availability on your Carrd, Notion, GitHub profile, or portfolio site.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 my-2">
                    {/* Live Preview Card */}
                    <div className="p-4 rounded-xl bg-muted/40 border border-border/80 flex flex-col items-center justify-center gap-2">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase font-mono tracking-wider">
                            Live Badge Preview
                        </p>
                        <div className="py-2">
                            <img
                                src={badgeUrl}
                                alt={`Comme Commission Status for ${displayName || username}`}
                                className="h-8 shadow-xs rounded-md"
                            />
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                            Updates automatically whenever you change your commission status in Comme
                        </span>
                    </div>

                    {/* Snippet Tabs */}
                    <Tabs defaultValue="markdown" className="w-full">
                        <TabsList className="grid grid-cols-3 w-full h-9">
                            <TabsTrigger value="markdown" className="text-xs">Markdown</TabsTrigger>
                            <TabsTrigger value="html" className="text-xs">HTML (Carrd)</TabsTrigger>
                            <TabsTrigger value="direct" className="text-xs">Direct SVG URL</TabsTrigger>
                        </TabsList>

                        {/* Markdown */}
                        <TabsContent value="markdown" className="space-y-2 mt-3">
                            <pre className="p-3 bg-muted/70 text-foreground rounded-xl text-xs font-mono overflow-x-auto border border-border/60">
                                {markdownSnippet}
                            </pre>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(markdownSnippet, 'Markdown')}
                                className="w-full rounded-xl gap-2 font-semibold text-xs h-9"
                            >
                                {copiedFormat === 'Markdown' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                Copy Markdown Code
                            </Button>
                        </TabsContent>

                        {/* HTML */}
                        <TabsContent value="html" className="space-y-2 mt-3">
                            <pre className="p-3 bg-muted/70 text-foreground rounded-xl text-xs font-mono overflow-x-auto border border-border/60">
                                {htmlSnippet}
                            </pre>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(htmlSnippet, 'HTML')}
                                className="w-full rounded-xl gap-2 font-semibold text-xs h-9"
                            >
                                {copiedFormat === 'HTML' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                Copy HTML Embed
                            </Button>
                        </TabsContent>

                        {/* Direct URL */}
                        <TabsContent value="direct" className="space-y-2 mt-3">
                            <pre className="p-3 bg-muted/70 text-foreground rounded-xl text-xs font-mono overflow-x-auto border border-border/60">
                                {directUrl}
                            </pre>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(directUrl, 'Direct URL')}
                                    className="flex-1 rounded-xl gap-2 font-semibold text-xs h-9"
                                >
                                    {copiedFormat === 'Direct URL' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                    Copy URL
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => window.open(directUrl, '_blank')}
                                    className="rounded-xl text-xs h-9 cursor-pointer"
                                    title="Open badge image in new tab"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
};
