<?php

namespace Tests\Feature;

use App\Enum\MediaType;
use App\Enum\UserRole;
use App\Jobs\ProcessMediaJob;
use App\Models\Media;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\User;
use App\Services\API\V1\MediaProcessingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class QueueAndFilesystemTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        Storage::fake('private');
    }

    public function test_media_upload_dispatches_process_media_job(): void
    {
        Queue::fake([ProcessMediaJob::class]);

        $user = User::factory()->create(['role' => UserRole::USER]);
        $file = UploadedFile::fake()->create('test_artwork.png', 500, 'image/png');

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/media', [
            'file' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.disk', 'public')
            ->assertJsonPath('data.file_name', 'test_artwork.png')
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'disk',
                    'url',
                    'thumbnail_url',
                    'file_size',
                    'mime_type',
                ],
            ]);

        Queue::assertPushed(ProcessMediaJob::class, function ($job) use ($response) {
            return $job->mediaId === $response->json('data.id');
        });
    }

    public function test_media_upload_to_private_disk(): void
    {
        Queue::fake([ProcessMediaJob::class]);

        $user = User::factory()->create(['role' => UserRole::USER]);
        $file = UploadedFile::fake()->create('confidential_wip.pdf', 2048, 'application/pdf');

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/media', [
            'file' => $file,
            'disk' => 'private',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.disk', 'private');

        $mediaId = $response->json('data.id');
        $media = Media::find($mediaId);

        $this->assertNotNull($media);
        $this->assertEquals('private', $media->disk);
        $this->assertTrue($media->isPrivate());
        Storage::disk('private')->assertExists($media->file_path);
    }

    public function test_process_media_job_executes_cleanly(): void
    {
        $user = User::factory()->create();
        $storedPath = 'uploads/' . date('Y/m') . '/test_job_image.png';
        Storage::disk('public')->put($storedPath, 'fake image data');

        $media = Media::create([
            'user_id' => $user->id,
            'file_name' => 'test_job_image.png',
            'file_path' => $storedPath,
            'disk' => 'public',
            'media_type' => MediaType::IMAGE,
            'file_size' => 1024,
            'mime_type' => 'image/png',
        ]);

        $job = new ProcessMediaJob($media->id);
        $service = app(MediaProcessingService::class);
        $job->handle($service);

        $this->assertDatabaseHas('medias', [
            'id' => $media->id,
        ]);
    }

    public function test_prune_orphaned_media_cleans_unattached_files_and_preserves_attached(): void
    {
        $user = User::factory()->create();

        // 1. Create an orphaned file created 48 hours ago
        $orphanPath = 'uploads/' . date('Y/m') . '/abandoned_upload.png';
        Storage::disk('public')->put($orphanPath, 'orphan data');

        $orphanMedia = Media::create([
            'user_id' => $user->id,
            'file_name' => 'abandoned_upload.png',
            'file_path' => $orphanPath,
            'disk' => 'public',
            'media_type' => MediaType::IMAGE,
            'file_size' => 500,
            'mime_type' => 'image/png',
        ]);
        Media::where('id', $orphanMedia->id)->update(['created_at' => now()->subHours(48)]);

        // 2. Create an attached file created 48 hours ago linked to a PostMedia
        $attachedPath = 'uploads/' . date('Y/m') . '/active_artwork.png';
        Storage::disk('public')->put($attachedPath, 'attached artwork data');

        $attachedMedia = Media::create([
            'user_id' => $user->id,
            'file_name' => 'active_artwork.png',
            'file_path' => $attachedPath,
            'disk' => 'public',
            'media_type' => MediaType::IMAGE,
            'file_size' => 1200,
            'mime_type' => 'image/png',
        ]);
        Media::where('id', $attachedMedia->id)->update(['created_at' => now()->subHours(48)]);

        $post = Post::create([
            'user_id' => $user->id,
            'title' => 'Sample Post',
            'content' => 'Sample Content',
            'slug' => 'sample-post-active',
        ]);
        PostMedia::create([
            'post_id' => $post->id,
            'file_name' => 'active_artwork.png',
            'file_path' => $attachedPath,
            'media_type' => MediaType::IMAGE,
            'file_size' => 1200,
            'mime_type' => 'image/png',
            'sort_order' => 0,
            'alt_text' => 'Post artwork',
        ]);

        // Run artisan media:prune
        $this->artisan('media:prune', ['--hours' => 24])
            ->assertExitCode(0);

        // Orphan media should be deleted from DB and storage
        $this->assertDatabaseMissing('medias', ['id' => $orphanMedia->id]);
        Storage::disk('public')->assertMissing($orphanPath);

        // Attached media must still exist
        $this->assertDatabaseHas('medias', ['id' => $attachedMedia->id]);
        Storage::disk('public')->assertExists($attachedPath);
    }

    public function test_private_media_download_authorization_enforced(): void
    {
        $owner = User::factory()->create(['role' => UserRole::USER]);
        $stranger = User::factory()->create(['role' => UserRole::USER]);
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);

        $filePath = 'uploads/' . date('Y/m') . '/secret_brief.pdf';
        Storage::disk('private')->put($filePath, 'Top secret commission details');

        $media = Media::create([
            'user_id' => $owner->id,
            'file_name' => 'secret_brief.pdf',
            'file_path' => $filePath,
            'disk' => 'private',
            'media_type' => MediaType::IMAGE,
            'file_size' => 1024,
            'mime_type' => 'application/pdf',
        ]);

        $url = '/api/media/private/' . $media->id . '/download';

        // 1. Unauthenticated guest -> 401
        $this->getJson($url)->assertStatus(401);

        // 2. Unauthorized stranger -> 403
        $this->actingAs($stranger, 'sanctum')
            ->getJson($url)
            ->assertStatus(403);

        // 3. Owner -> 200 (download successful)
        $this->actingAs($owner, 'sanctum')
            ->get($url)
            ->assertStatus(200);

        // 4. Admin -> 200 (download successful)
        $this->actingAs($admin, 'sanctum')
            ->get($url)
            ->assertStatus(200);
    }
}
