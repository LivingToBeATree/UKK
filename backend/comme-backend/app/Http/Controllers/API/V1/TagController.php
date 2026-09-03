<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Helpers\ApiResponseHelper;
use App\Http\Resources\API\V1\TagResource;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    /**
     * Display a listing of popular tags with usage counts.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Tag::query()
            ->withCount(['posts', 'commissionServices', 'portfolios']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'ILIKE', "%{$search}%")
                ->orWhere('slug', 'ILIKE', "%{$search}%");
        }

        $type = $request->get('type');
        if ($type === 'services') {
            $query->has('commissionServices');
        } elseif ($type === 'portfolios') {
            $query->has('portfolios');
        } elseif ($type === 'posts') {
            $query->has('posts');
        }

        $tags = $query
            ->orderByDesc('posts_count')
            ->orderByDesc('commission_services_count')
            ->limit($request->integer('limit', 40))
            ->get();

        return ApiResponseHelper::successResponse(
            TagResource::collection($tags),
            'Tags retrieved successfully.'
        );
    }
}
