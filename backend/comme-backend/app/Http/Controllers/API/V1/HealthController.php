<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Helpers\ApiResponseHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class HealthController extends Controller
{
    /**
     * Return comprehensive system health and telemetry metrics.
     */
    public function show(Request $request): JsonResponse
    {
        // 1. Measure database latency
        $dbStart = microtime(true);
        $dbConnected = false;
        $dbLatencyMs = 0;

        try {
            DB::select('SELECT 1');
            $dbConnected = true;
            $dbLatencyMs = round((microtime(true) - $dbStart) * 1000, 2);
        } catch (\Throwable) {
            $dbConnected = false;
        }

        // 2. Measure cache status
        $cacheStart = microtime(true);
        $cacheWorking = false;
        $cacheLatencyMs = 0;

        try {
            $testKey = 'health_check_' . microtime(true);
            Cache::put($testKey, 'ok', 5);
            $val = Cache::get($testKey);
            Cache::forget($testKey);
            $cacheWorking = ($val === 'ok');
            $cacheLatencyMs = round((microtime(true) - $cacheStart) * 1000, 2);
        } catch (\Throwable) {
            $cacheWorking = false;
        }

        // 3. Storage disk metrics
        $disk = config('filesystems.default', 'public');
        $storagePath = storage_path('app');
        $freeBytes = @disk_free_space($storagePath);
        $totalBytes = @disk_total_space($storagePath);

        $freeSpaceMb = $freeBytes !== false ? round($freeBytes / 1024 / 1024, 1) : null;
        $totalSpaceMb = $totalBytes !== false ? round($totalBytes / 1024 / 1024, 1) : null;

        // 4. Queue metrics
        $queueDriver = config('queue.default', 'database');
        $pendingJobsCount = 0;
        $failedJobsCount = 0;

        try {
            if (DB::getSchemaBuilder()->hasTable('jobs')) {
                $pendingJobsCount = DB::table('jobs')->count();
            }
            if (DB::getSchemaBuilder()->hasTable('failed_jobs')) {
                $failedJobsCount = DB::table('failed_jobs')->count();
            }
        } catch (\Throwable) {}

        $isHealthy = $dbConnected && $cacheWorking;

        $telemetry = [
            'status' => $isHealthy ? 'healthy' : 'degraded',
            'timestamp' => now()->toISOString(),
            'database' => [
                'connected' => $dbConnected,
                'latency_ms' => $dbLatencyMs,
                'driver' => config('database.default'),
            ],
            'cache' => [
                'working' => $cacheWorking,
                'latency_ms' => $cacheLatencyMs,
                'driver' => config('cache.default'),
            ],
            'storage' => [
                'driver' => $disk,
                'free_space_mb' => $freeSpaceMb,
                'total_space_mb' => $totalSpaceMb,
            ],
            'queue' => [
                'driver' => $queueDriver,
                'pending_jobs' => $pendingJobsCount,
                'failed_jobs' => $failedJobsCount,
            ],
            'links' => [
                'pulse' => url('/pulse'),
                'log_viewer' => url('/log-viewer'),
            ],
        ];

        return ApiResponseHelper::successResponse($telemetry, 'System health metrics retrieved successfully.');
    }
}
