<?php

namespace Tests\Feature;

use App\Enum\MediaType;
use App\Models\Media;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaUploadTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_unauthenticated_user_cannot_upload_media(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->create('avatar.jpg', 500, 'image/jpeg');

        $this->postJson('/api/v1/media', [
            'file' => $file,
        ])->assertUnauthorized();
    }

    public function test_authenticated_user_can_upload_image(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->create('artwork.png', 1000, 'image/png');

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/media', [
                'file' => $file,
                'is_thumbnail' => true,
                'sort_order' => 1,
            ])
            ->assertCreated();

        $response->assertJsonStructure([
            'status',
            'message',
            'data' => [
                'id',
                'file_name',
                'file_path',
                'url',
                'media_type',
                'file_size',
                'mime_type',
                'is_thumbnail',
                'sort_order',
                'created_at',
            ]
        ]);

        $this->assertEquals('artwork.png', $response->json('data.file_name'));
        $this->assertEquals(MediaType::IMAGE->value, $response->json('data.media_type'));
        $this->assertTrue($response->json('data.is_thumbnail'));

        $mediaId = $response->json('data.id');
        $media = Media::find($mediaId);
        $this->assertNotNull($media);
        Storage::disk('public')->assertExists($media->file_path);
    }

    public function test_authenticated_user_can_upload_video(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->create('speedpaint.mp4', 5000, 'video/mp4');

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/media', [
                'file' => $file,
            ])
            ->assertCreated();

        $this->assertEquals(MediaType::VIDEO->value, $response->json('data.media_type'));
    }

    public function test_upload_rejects_invalid_file_type(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->create('script.exe', 1000, 'application/x-msdownload');

        $this->actingAs($this->user)
            ->postJson('/api/v1/media', [
                'file' => $file,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['file']);
    }

    public function test_user_can_view_media_metadata(): void
    {
        Storage::fake('public');

        $media = Media::create([
            'file_name' => 'sample.jpg',
            'file_path' => 'uploads/2026/08/sample.jpg',
            'media_type' => MediaType::IMAGE,
            'file_size' => 1024,
            'mime_type' => 'image/jpeg',
            'sort_order' => 0,
            'is_thumbnail' => false,
        ]);

        $response = $this->getJson("/api/v1/media/{$media->id}")
            ->assertOk();

        $this->assertEquals('sample.jpg', $response->json('data.file_name'));
        $this->assertEquals($media->id, $response->json('data.id'));
    }

    public function test_authenticated_user_can_delete_media(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->create('delete_me.png', 500, 'image/png');
        $path = $file->storeAs('uploads/2026/08', 'delete_me.png', 'public');

        $media = Media::create([
            'file_name' => 'delete_me.png',
            'file_path' => $path,
            'media_type' => MediaType::IMAGE,
            'file_size' => 1024,
            'mime_type' => 'image/png',
            'sort_order' => 0,
            'is_thumbnail' => false,
        ]);

        Storage::disk('public')->assertExists($path);

        $this->actingAs($this->user)
            ->deleteJson("/api/v1/media/{$media->id}")
            ->assertOk();

        $this->assertDatabaseMissing('medias', ['id' => $media->id]);
        Storage::disk('public')->assertMissing($path);
    }
}
