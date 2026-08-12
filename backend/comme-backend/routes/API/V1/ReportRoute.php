<?php

use App\Http\Controllers\API\V1\ReportController;
use Illuminate\Support\Facades\Route;

// No destroy route — ReportController has no destroy() method, since
// the spec never described a delete flow for reports (dismissing one
// is a status update via update(), not a deletion).
Route::apiResource('reports', ReportController::class)->except(['destroy']);
