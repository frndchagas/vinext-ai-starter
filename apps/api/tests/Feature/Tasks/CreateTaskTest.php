<?php

namespace Tests\Feature\Tasks;

use App\Jobs\ProcessTask;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Str;
use Tests\TestCase;

class CreateTaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_a_queued_task_and_dispatches_the_job_after_commit(): void
    {
        Bus::fake([ProcessTask::class]);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/tasks', ['input' => 'hello queued world'], [
            'Idempotency-Key' => (string) Str::uuid7(),
        ]);

        $response->assertStatus(202);
        $response->assertHeader('Location');
        $response->assertHeader('X-Correlation-Id');
        $response->assertJson(['state' => 'queued', 'version' => 1, 'input' => 'hello queued world']);

        $task = Task::query()->firstOrFail();
        $this->assertTrue(Str::isUuid($task->getKey()));
        $this->assertSame($response->headers->get('X-Correlation-Id'), $task->correlation_id);

        Bus::assertDispatched(ProcessTask::class, fn (ProcessTask $job) => $job->taskId === (string) $task->getKey());
    }

    public function test_repeating_the_key_with_the_same_payload_replays_the_first_response(): void
    {
        Bus::fake([ProcessTask::class]);

        $user = User::factory()->create();
        $key = (string) Str::uuid7();

        $first = $this->actingAs($user)->postJson('/api/v1/tasks', ['input' => 'same payload'], ['Idempotency-Key' => $key]);
        $second = $this->actingAs($user)->postJson('/api/v1/tasks', ['input' => 'same payload'], ['Idempotency-Key' => $key]);

        $second->assertStatus(202);
        $this->assertSame($first->json('id'), $second->json('id'));
        $this->assertSame(1, Task::query()->count());

        Bus::assertDispatchedTimes(ProcessTask::class, 1);
    }

    public function test_repeating_the_key_with_a_different_payload_returns_conflict(): void
    {
        Bus::fake([ProcessTask::class]);

        $user = User::factory()->create();
        $key = (string) Str::uuid7();

        $this->actingAs($user)->postJson('/api/v1/tasks', ['input' => 'original payload'], ['Idempotency-Key' => $key]);
        $response = $this->actingAs($user)->postJson('/api/v1/tasks', ['input' => 'tampered payload'], ['Idempotency-Key' => $key]);

        $response->assertStatus(409);
        $response->assertHeader('Content-Type', 'application/problem+json');
        $response->assertJson(['code' => 'idempotency_key_reused']);
        $this->assertSame(1, Task::query()->count());
    }

    public function test_the_idempotency_key_header_is_required(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/tasks', ['input' => 'no key']);

        $response->assertUnprocessable();
        $response->assertJsonStructure(['errors' => ['idempotency_key']]);
    }

    public function test_unverified_users_cannot_create_tasks(): void
    {
        $user = User::factory()->unverified()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/tasks', ['input' => 'nope'], [
            'Idempotency-Key' => (string) Str::uuid7(),
        ]);

        $response->assertForbidden();
    }

    public function test_two_users_can_reuse_the_same_key_independently(): void
    {
        Bus::fake([ProcessTask::class]);

        $key = (string) Str::uuid7();
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $this->actingAs($userA)->postJson('/api/v1/tasks', ['input' => 'a'], ['Idempotency-Key' => $key])->assertStatus(202);

        $this->flushSession();

        $this->actingAs($userB)->postJson('/api/v1/tasks', ['input' => 'b'], ['Idempotency-Key' => $key])->assertStatus(202);

        $this->assertSame(2, Task::query()->count());
    }
}
