<?php

namespace App\Observers;

use App\Models\ArtistProfile;
use App\Models\CommissionReview;
use App\Models\CommissionService;
use App\Models\Post;
use App\Services\API\V1\CacheService;
use Illuminate\Database\Eloquent\Model;

class CacheInvalidationObserver
{
    /**
     * Handle the Model "saved" event (created or updated).
     */
    public function saved(Model $model): void
    {
        $this->handleInvalidation($model);
    }

    /**
     * Handle the Model "deleted" event.
     */
    public function deleted(Model $model): void
    {
        $this->handleInvalidation($model);
    }

    /**
     * Handle the Model "restored" event.
     */
    public function restored(Model $model): void
    {
        $this->handleInvalidation($model);
    }

    /**
     * Route model invalidation to the appropriate CacheService method.
     */
    protected function handleInvalidation(Model $model): void
    {
        if ($model instanceof Post) {
            CacheService::invalidatePosts();
        } elseif ($model instanceof CommissionService) {
            CacheService::invalidateServices();
        } elseif ($model instanceof ArtistProfile) {
            CacheService::invalidateArtist($model->id, $model->user_id, $model->user?->username);
        } elseif ($model instanceof CommissionReview) {
            CacheService::invalidateArtist($model->artist_profile_id);
        }
    }
}
