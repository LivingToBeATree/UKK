<?php

namespace App\Http\Controllers\API\V1;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class GifController extends Controller
{
    /**
     * Search or fetch trending GIFs securely via server-side KLIPY API proxy.
     * The client never receives or touches the private KLIPY API key.
     */
    public function index(Request $request): JsonResponse
    {
        $key = config('services.klipy.key') ?: env('KLIPY_API_KEY');
        if (!$key) {
            return response()->json([
                'data' => [
                    'results' => [],
                    'hasNext' => false,
                ],
                'message' => 'GIF service is not configured on the server.',
            ]);
        }

        $query = trim((string) $request->query('q', ''));
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(40, max(1, (int) $request->query('per_page', 24)));

        $isSearch = !empty($query);
        $endpoint = $isSearch
            ? "https://api.klipy.com/api/v1/{$key}/gifs/search"
            : "https://api.klipy.com/api/v1/{$key}/gifs/trending";

        $cacheKey = "klipy_gifs_" . md5($query . '_' . $page . '_' . $perPage);

        $data = Cache::remember($cacheKey, 180, function () use ($endpoint, $query, $page, $perPage, $isSearch) {
            $params = [
                'page' => $page,
                'per_page' => $perPage,
            ];
            if ($isSearch) {
                $params['q'] = $query;
            }

            try {
                $response = Http::timeout(8)->get($endpoint, $params);
                if (!$response->successful()) {
                    return [
                        'results' => [],
                        'hasNext' => false,
                    ];
                }

                $json = $response->json();
                $rawItems = $json['data']['data'] ?? $json['data'] ?? [];
                if (!is_array($rawItems)) {
                    $rawItems = [];
                }

                $parsed = [];
                foreach ($rawItems as $item) {
                    $file = $item['file'] ?? $item['files'] ?? [];

                    // High-quality GIF URL for posting / attachments
                    $gifUrl = $file['hd']['gif']['url'] ??
                              $file['md']['gif']['url'] ??
                              $file['sm']['gif']['url'] ??
                              $file['gif']['url'] ??
                              ($item['url'] ?? null);

                    if (!$gifUrl) {
                        continue;
                    }

                    // Lightweight thumbnail for modal grid
                    $previewUrl = $file['sm']['webp']['url'] ??
                                  $file['sm']['gif']['url'] ??
                                  $file['md']['webp']['url'] ??
                                  $file['hd']['webp']['url'] ??
                                  $gifUrl;

                    $parsed[] = [
                        'id' => (string) ($item['id'] ?? uniqid()),
                        'title' => (string) ($item['title'] ?? $item['slug'] ?? 'GIF'),
                        'url' => $gifUrl,
                        'previewUrl' => $previewUrl,
                        'width' => (int) ($file['hd']['gif']['width'] ?? $file['md']['gif']['width'] ?? 320),
                        'height' => (int) ($file['hd']['gif']['height'] ?? $file['md']['gif']['height'] ?? 240),
                        'source' => 'klipy',
                    ];
                }

                return [
                    'results' => $parsed,
                    'hasNext' => count($parsed) >= $perPage,
                ];
            } catch (\Throwable) {
                return [
                    'results' => [],
                    'hasNext' => false,
                ];
            }
        });

        return response()->json([
            'data' => $data,
            'message' => 'GIFs retrieved successfully.',
        ]);
    }
}
