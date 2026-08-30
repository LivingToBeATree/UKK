<?php

return [
    'server_key' => env('MIDTRANS_SERVER_KEY'),
    'client_key' => env('MIDTRANS_CLIENT_KEY'),
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),

    // Iris (Payout/Disbursement API)
    'iris_api_key' => env('MIDTRANS_IRIS_API_KEY'),
    'iris_base_url' => env('MIDTRANS_IS_PRODUCTION', false)
        ? 'https://app.midtrans.com/iris/api/v1'
        : 'https://app.sandbox.midtrans.com/iris/api/v1',
];
