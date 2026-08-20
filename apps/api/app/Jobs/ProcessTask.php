<?php

namespace App\Jobs;

use App\Enums\TaskState;
use App\Events\TaskStatusChanged;
use App\Models\Task;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class ProcessTask implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 120;

    public bool $failOnTimeout = true;

    public function __construct(public string $taskId) {}

    /**
     * @return array<int, int>
     */
    public function backoff(): array
    {
        return [10, 60];
    }

    public function uniqueId(): string
    {
        return $this->taskId;
    }

    public function handle(): void
    {
        $task = Task::find($this->taskId);

        if ($task === null || $task->state->isFinal()) {
            return;
        }

        $claimed = Task::query()
            ->whereKey($this->taskId)
            ->where('state', TaskState::Queued)
            ->update([
                'state' => TaskState::Processing,
                'version' => DB::raw('version + 1'),
                'started_at' => now(),
            ]);

        if ($claimed === 0 && $task->refresh()->state !== TaskState::Processing) {
            return;
        }

        TaskStatusChanged::dispatch(...self::payload($task->refresh()));

        $delayMs = (int) config('tasks.simulated_delay_ms');

        if ($delayMs > 0) {
            usleep($delayMs * 1000);
        }

        $output = [
            'word_count' => str_word_count($task->input),
            'reversed' => Str::reverse($task->input),
        ];

        DB::transaction(function () use ($task, $output): void {
            $task->forceFill([
                'state' => TaskState::Completed,
                'version' => $task->version + 1,
                'output' => $output,
                'finished_at' => now(),
            ])->save();

            TaskStatusChanged::dispatch(...self::payload($task));
        });
    }

    public function failed(?Throwable $exception): void
    {
        $task = Task::find($this->taskId);

        if ($task === null || $task->state->isFinal()) {
            return;
        }

        DB::transaction(function () use ($task): void {
            $task->forceFill([
                'state' => TaskState::Failed,
                'version' => $task->version + 1,
                'error_code' => 'task_failed',
                'finished_at' => now(),
            ])->save();

            TaskStatusChanged::dispatch(...self::payload($task));
        });
    }

    /**
     * @return array<int, mixed>
     */
    private static function payload(Task $task): array
    {
        $event = TaskStatusChanged::fromTask($task);

        return [
            $event->taskId,
            $event->state,
            $event->version,
            $event->occurredAt,
            $event->correlationId,
        ];
    }
}
