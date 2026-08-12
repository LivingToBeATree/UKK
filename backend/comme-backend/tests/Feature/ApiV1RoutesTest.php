<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ApiV1RoutesTest extends TestCase
{
    public function test_api_v1_resource_routes_use_their_expected_targets(): void
    {
        $routes = collect(Route::getRoutes())->map(fn ($route) => [
            'methods' => $route->methods(),
            'uri' => $route->uri(),
            'action' => $route->getActionName(),
        ]);

        $expected = [
            'api/posts' => 'PostController@index',
            'api/posts/{post}' => 'PostController@show',
            'api/reports' => 'ReportController@index',
            'api/reports/{report}' => 'ReportController@show',
            'api/tickets' => 'TicketController@index',
            'api/tickets/{ticket}' => 'TicketController@show',
            'api/tickets/{ticket}/close' => 'TicketController@close',
            'api/artist-profiles/{artist_profile}/reviews' => 'CommissionReviewController@index',
            'api/commissions/{commission}/reviews' => 'CommissionReviewController@store',
            'api/reviews/{review}' => 'CommissionReviewController@show',
            'api/reviews/{review}/reply' => 'CommissionReviewController@reply',
        ];

        foreach ($expected as $uri => $action) {
            $this->assertTrue(
                $routes->contains(fn ($route) => $route['uri'] === $uri && str_ends_with($route['action'], $action)),
                "Missing expected API route [{$uri}] targeting [{$action}]."
            );
        }

        $this->assertFalse($routes->contains(fn ($route) => str_contains($route['uri'], 'postfolios')));
        $this->assertFalse($routes->contains(fn ($route) => $route['uri'] === 'api/routes'));
        $this->assertFalse($routes->contains(fn ($route) => str_contains($route['uri'], 'commission-reviews')));
    }
}
