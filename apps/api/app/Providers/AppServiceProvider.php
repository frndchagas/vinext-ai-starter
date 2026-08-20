<?php

namespace App\Providers;

use Illuminate\Foundation\DevCommands;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (! $this->app->runningInConsole()) {
            return;
        }

        DevCommands::except('logs', 'queue', 'vite');
        DevCommands::artisan(
            'serve --host=127.0.0.1 --port='.(int) config('development.api_port', 18000),
            'server',
        );
        DevCommands::artisan(
            'reverb:start --host=0.0.0.0 --port='.(int) config('development.reverb_port', 19080),
            'reverb',
        );
        DevCommands::inline();
    }
}
