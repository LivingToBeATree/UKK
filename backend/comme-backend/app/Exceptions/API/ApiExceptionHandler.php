<?php

namespace App\Exceptions\API;

use App\Http\Helpers\ApiResponseHelper;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class ApiExceptionHandler
{
    /**
     * One place mapping every exception type the APIs can throw to a
     * clean JSON shape — instead of Laravel's default behavior, which
     * would sometimes return an HTML error page (validation failures
     * aside, those are always JSON already) or a raw stack trace.
     *
     * This only changes what the CLIENT sees. Laravel still logs every
     * exception to storage/logs/laravel.log exactly as before — render()
     * callbacks don't suppress that, they only shape the HTTP response.
     */

    public function handle(Throwable $e): JsonResponse
    {
        return match (true) {
            $e instanceof ValidationException => ApiResponseHelper::errorResponse(
                'The given data was invalid.',
                Response::HTTP_UNPROCESSABLE_ENTITY,
                $e->errors(),
            ),

            $e instanceof AuthenticationException => ApiResponseHelper::errorResponse(
                'Unauthenticated.',
                Response::HTTP_UNAUTHORIZED,
            ),

            $e instanceof AuthorizationException => ApiResponseHelper::errorResponse(
                $e->getMessage() ?: 'This action is unauthorized.',
                Response::HTTP_FORBIDDEN,
            ),

            $e instanceof ModelNotFoundException, $e instanceof NotFoundHttpException => ApiResponseHelper::errorResponse(
                'The requested resource was not found.',
                Response::HTTP_NOT_FOUND,
            ),

            $e instanceof MethodNotAllowedHttpException => ApiResponseHelper::errorResponse(
                'This HTTP method is not supported for this endpoint.',
                Response::HTTP_METHOD_NOT_ALLOWED,
            ),

            // Anything else (a raw QueryException, a bug, whatever) — hide
            // the real message and trace behind config('app.debug'), so
            // production never leaks internals, but local dev still sees
            // exactly what broke.

            default => ApiResponseHelper::errorResponse(
                config('app.debug') ? $e->getMessage() : 'Something went wrong. Please try again later.',
                Response::HTTP_INTERNAL_SERVER_ERROR,
                config('app.debug') ? ['exception' => get_class($e)] : null,
            )
        };
    }
}
