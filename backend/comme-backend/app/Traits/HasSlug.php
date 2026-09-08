<?php

namespace App\Traits;

use Illuminate\Support\Str;

trait HasSlug
{
    public static function bootHasSlug(): void
    {
        static::creating(function ($model) {
            if (empty($model->slug)) {
                $source = $model->getSlugSource();
                $model->slug = static::generateUniqueSlug($source);
            }
        });

        static::updating(function ($model) {
            if (empty($model->slug)) {
                $source = $model->getSlugSource();
                $model->slug = static::generateUniqueSlug($source, $model->id);
            }
        });
    }

    abstract public function getSlugSource(): string;

    public static function generateUniqueSlug(?string $source, ?int $ignoreId = null): string
    {
        $base = Str::slug((string) $source);
        if (empty($base)) {
            $base = strtolower(class_basename(static::class));
        }

        $base = Str::limit($base, 100, '');

        $slug = $base;
        $counter = 1;

        while (static::where('slug', $slug)->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    public function resolveRouteBinding($value, $field = null)
    {
        $field = $field ?? 'slug';

        if ($field === 'slug') {
            return $this->where('slug', $value)
                ->orWhere('id', is_numeric($value) ? (int) $value : 0)
                ->firstOrFail();
        }

        return parent::resolveRouteBinding($value, $field);
    }
}
