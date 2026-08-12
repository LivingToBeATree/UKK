<?php

use App\Http\Controllers\API\V1\TicketController;
use Illuminate\Support\Facades\Route;

Route::get('/tickets', [TicketController::class, 'index']);
Route::get('/tickets/{ticket}', [TicketController::class, 'show']);
Route::patch('/tickets/{ticket}', [TicketController::class, 'update']);
Route::patch('/tickets/{ticket}/close', [TicketController::class, 'close']);
