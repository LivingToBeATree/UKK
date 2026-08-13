<?php

namespace App\Http\Helpers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class ApiResponseHelper
{
    /**
     * A consistent success envelope for every endpoint — instead of each
     * controller shaping response()->json(...) slightly differently, they
     * all go through this one place. $data can be a model, a collection,
     * an array, or an API Resource.
     */
    public static function successResponse(
        mixed $data = null,
        string $message = 'Success',
        int $statusCode = Response::HTTP_OK,
    ): JsonResponse {
        $response = [
            'status_code' => $statusCode,
            'status' => 'SUCCESS',
            'message' => $message,
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * For paginated resource collections specifically — reuses Laravel's
     * own pagination serialization (via ->response()->getData(true)) so
     * the page-number math isn't reimplemented here, then lifts 'links'
     * and 'meta' up to sit alongside 'data' in the envelope, instead of
     * both ending up buried one level deeper under 'data.data'.
     */
    public static function paginatedResponse(
        mixed $resourceCollection,
        string $message = 'Success',
        int $statusCode = Response::HTTP_OK,
    ): JsonResponse {
        $paginated = $resourceCollection->response()->getData(true);

        return response()->json([
            'status_code' => $statusCode,
            'status' => 'SUCCESS',
            'message' => $message,
            'data' => $paginated['data'],
            'links' => $paginated['links'] ?? null,
            'meta' => $paginated['meta'] ?? null,
        ], $statusCode);
    }

    public static function errorResponse(
        string $message = 'Error',
        int $statusCode = Response::HTTP_BAD_REQUEST,
        mixed $errors = null,
    ): JsonResponse {
        $response = [
            'status_code' => $statusCode,
            'status' => 'ERROR',
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }
}
