<?php

use App\Http\Controllers\API\V1\PaymentController;
use Illuminate\Support\Facades\Route;

// initiate() lives here (inside the authenticated group, via api.php's
// glob loop) — the webhook itself is registered separately in api.php's
// PUBLIC section, since Midtrans's server has no session to authenticate with.
Route::post('/commissions/{commission}/payment',[PaymentController::class, 'initiate']);
