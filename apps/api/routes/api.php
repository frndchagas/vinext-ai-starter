<?php

use App\Http\Controllers\MeController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/me', MeController::class)->name('me');
    });
});
