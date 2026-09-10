<?php

namespace App\Services\API\V1;

use Illuminate\Support\Facades\Cache;

class CacheService
{
    /**
     * Cache TTL in seconds (5 minutes for public feed posts).
     */
    public const TTL_POSTS = 300;

    /**
     * Cache TTL in seconds (10 minutes for service listings).
     */
    public const TTL_SERVICES = 600;

    /**
     * Cache TTL in seconds (15 minutes for public artist profiles).
     */
    public const TTL_ARTIST_PROFILES = 900;

    /**
     * Cache TTL in seconds (1 hour for static categories and tags).
     */
    public const TTL_TAGS = 3600;

    /**
     * Remember public posts feed using epoch-based cache versioning.
     */
    public static function rememberPosts(int $page, ?string $tag, ?string $sort, callable $callback): mixed
    {
        $epoch = Cache::get('cache_epoch_posts', 1);
        $cleanTag = $tag ? preg_replace('/[^a-zA-Z0-9_\-]/', '', $tag) : 'all';
        $cleanSort = $sort ? preg_replace('/[^a-zA-Z0-9_\-]/', '', $sort) : 'latest';
        $key = "posts:v{$epoch}:page_{$page}:tag_{$cleanTag}:sort_{$cleanSort}";

        return Cache::remember($key, self::TTL_POSTS, $callback);
    }

    /**
     * Invalidate all cached posts by bumping the epoch counter.
     */
    public static function invalidatePosts(): void
    {
        $current = (int) Cache::get('cache_epoch_posts', 1);
        Cache::forever('cache_epoch_posts', $current + 1);
    }

    /**
     * Remember commission services catalog using epoch-based cache versioning.
     */
    public static function rememberServices(int $page, ?string $category, ?string $sort, callable $callback): mixed
    {
        $epoch = (int) Cache::get('cache_epoch_services', 1);
        $cleanCat = $category ? preg_replace('/[^a-zA-Z0-9_\-]/', '', $category) : 'all';
        $cleanSort = $sort ? preg_replace('/[^a-zA-Z0-9_\-]/', '', $sort) : 'default';
        $key = "services:v{$epoch}:page_{$page}:cat_{$cleanCat}:sort_{$cleanSort}";

        return Cache::remember($key, self::TTL_SERVICES, $callback);
    }

    /**
     * Invalidate all cached commission services by bumping the epoch counter.
     */
    public static function invalidateServices(): void
    {
        $current = (int) Cache::get('cache_epoch_services', 1);
        Cache::forever('cache_epoch_services', $current + 1);
    }

    /**
     * Remember public artist profile by ID or slug.
     */
    public static function rememberArtist(string|int $identifier, callable $callback): mixed
    {
        $cleanId = preg_replace('/[^a-zA-Z0-9_\-]/', '', (string) $identifier);
        $key = "artist_profile:{$cleanId}";

        return Cache::remember($key, self::TTL_ARTIST_PROFILES, $callback);
    }

    /**
     * Invalidate specific artist profile cache.
     */
    public static function invalidateArtist(string|int ...$identifiers): void
    {
        foreach ($identifiers as $identifier) {
            if ($identifier) {
                $cleanId = preg_replace('/[^a-zA-Z0-9_\-]/', '', (string) $identifier);
                Cache::forget("artist_profile:{$cleanId}");
            }
        }
    }
}
