<?php

namespace Tests\Feature\Tasks;

use App\Enums\TaskState;
use App\Events\TaskStatusChanged;
use App\Jobs\ProcessTask;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use RuntimeException;
use Tests\TestCase;

class ProcessTaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_processes_a_queued_task_to_completed_with_versioned_events(): void
    {
        Event::fake([TaskStatusChanged::class]);

        $task = Task::factory()->create(['input' => 'reverse these three words']);

        (new ProcessTask((string) $task->getKey()))->handle();

        $task->refresh();
        $this->assertSame(TaskState::Completed, $task->state);
        $this->assertSame(3, $task->version);
        $this->assertSame(4, $task->output['word_count']);
        $this->assertSame('sdrow eerht eseht esrever', $task->output['reversed']);
        $this->assertNotNull($task->started_at);
        $this->assertNotNull($task->finished_at);

        Event::assertDispatched(TaskStatusChanged::class, fn (TaskStatusChanged $event) => $event->state === 'processing' && $event->version === 2);
        Event::assertDispatched(TaskStatusChanged::class, fn (TaskStatusChanged $event) => $event->state === 'completed' && $event->version === 3 && $event->correlationId === $task->correlation_id);
    }

    public function test_it_does_not_repeat_work_for_a_completed_task(): void
    {
        Event::fake([TaskStatusChanged::class]);

        $task = Task::factory()->completed()->create();
        $originalOutput = $task->output;

        (new ProcessTask((string) $task->getKey()))->handle();

        $this->assertSame($originalOutput, $task->refresh()->output);
        Event::assertNotDispatched(TaskStatusChanged::class);
    }

    public function test_failed_persists_the_failed_state_with_a_safe_error_code(): void
    {
        Event::fake([TaskStatusChanged::class]);

        $task = Task::factory()->create();

        (new ProcessTask((string) $task->getKey()))->failed(new RuntimeException('secret stack detail'));

        $task->refresh();
        $this->assertSame(TaskState::Failed, $task->state);
        $this->assertSame('task_failed', $task->error_code);
        $this->assertSame(2, $task->version);
        $this->assertNotNull($task->finished_at);

        Event::assertDispatched(TaskStatusChanged::class, fn (TaskStatusChanged $event) => $event->state === 'failed');
    }

    public function test_failed_does_not_override_a_final_state(): void
    {
        Event::fake([TaskStatusChanged::class]);

        $task = Task::factory()->completed()->create();

        (new ProcessTask((string) $task->getKey()))->failed(new RuntimeException('late failure'));

        $this->assertSame(TaskState::Completed, $task->refresh()->state);
        Event::assertNotDispatched(TaskStatusChanged::class);
    }
}
