<?php

namespace App\Http\Controllers\API\V1;

use App\Enum\CommissionStatus;
use App\Http\Helpers\ApiResponseHelper;
use App\Models\Commission;
use App\Models\CommissionMedia;
use App\Models\CommissionMessageMedia;
use App\Models\Media;
use App\Services\API\V1\WatermarkService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class CommissionDeliveryController extends Controller
{
    /**
     * Resolve the target media model across CommissionMessageMedia, CommissionMedia, or base Media.
     */
    private function resolveCommissionMedia(Commission $commission, mixed $media): ?Media
    {
        if ($media instanceof CommissionMessageMedia) {
            $msg = $media->commissionMessage;
            return ($msg && $msg->commission_id === $commission->id) ? $media : null;
        }

        if ($media instanceof CommissionMedia) {
            return ($media->commission_id === $commission->id) ? $media : null;
        }

        if ($media instanceof Media) {
            $msgMedia = CommissionMessageMedia::where('id', $media->id)
                ->whereHas('commissionMessage', function ($q) use ($commission) {
                    $q->where('commission_id', $commission->id);
                })
                ->first();

            if ($msgMedia) {
                return $msgMedia;
            }

            $commMedia = CommissionMedia::where('id', $media->id)
                ->where('commission_id', $commission->id)
                ->first();

            if ($commMedia) {
                return $commMedia;
            }

            $prefix = 'commissions/' . $commission->id . '/';
            if (str_starts_with((string) $media->file_path, $prefix)) {
                return $media;
            }

            return null;
        }

        $mediaId = is_numeric($media) ? (int) $media : null;
        if (! $mediaId) {
            return null;
        }

        // Deliverables and commission message media (most common for deliverables)
        $messageMedia = CommissionMessageMedia::where('id', $mediaId)
            ->whereHas('commissionMessage', function ($q) use ($commission) {
                $q->where('commission_id', $commission->id);
            })
            ->first();

        if ($messageMedia) {
            return $messageMedia;
        }

        // Direct commission attachment media
        $commMedia = CommissionMedia::where('id', $mediaId)
            ->where('commission_id', $commission->id)
            ->first();

        if ($commMedia) {
            return $commMedia;
        }

        // Base Media scoped strictly to this commission's dedicated directory path
        $prefix = 'commissions/' . $commission->id . '/';
        $baseMedia = Media::where('id', $mediaId)->first();
        if ($baseMedia && str_starts_with((string) $baseMedia->file_path, $prefix)) {
            return $baseMedia;
        }

        // Strictly scoped to the specified commission — no cross-commission fallbacks
        return null;
    }

    /**
     * Download or view the watermarked proof preview for an in-progress or review commission.
     */
    public function proof(
        Request $request,
        Commission $commission,
        mixed $media,
        WatermarkService $watermarkService
    ): BinaryFileResponse|\Illuminate\Http\JsonResponse {
        $user = $request->user();

        if (! $user) {
            return ApiResponseHelper::errorResponse('Unauthenticated.', Response::HTTP_UNAUTHORIZED);
        }

        // Authorization check: participant or staff
        $isParticipant = $user->id === $commission->user_id
            || $user->id === $commission->artistProfile?->user_id
            || $user->isStaff()
            || $user->isAdmin();

        if (! $isParticipant) {
            return ApiResponseHelper::errorResponse(
                'You are not authorized to access files for this commission.',
                Response::HTTP_FORBIDDEN
            );
        }

        $mediaModel = $this->resolveCommissionMedia($commission, $media);
        if (! $mediaModel) {
            return ApiResponseHelper::errorResponse('Deliverable file not found.', Response::HTTP_NOT_FOUND);
        }

        $disk = $mediaModel->getDisk();

        // Check for existing generated proof
        $dir = dirname($mediaModel->file_path);
        $dirPrefix = ($dir === '.' || $dir === '/' || $dir === '') ? '' : $dir . '/';
        $filename = pathinfo($mediaModel->file_path, PATHINFO_FILENAME);
        $expectedProofPath = $dirPrefix . $filename . '_proof.webp';

        $targetPath = null;
        if (! empty($mediaModel->thumbnail_path) && Storage::disk($disk)->exists($mediaModel->thumbnail_path)) {
            $targetPath = $mediaModel->thumbnail_path;
        } elseif (Storage::disk($disk)->exists($expectedProofPath)) {
            $targetPath = $expectedProofPath;
        }

        // If no proof exists yet, attempt to generate one
        if (! $targetPath) {
            $generated = $watermarkService->generateProof($commission, $mediaModel);
            if ($generated && Storage::disk($disk)->exists($generated)) {
                $targetPath = $generated;
                if (Schema::hasColumn($mediaModel->getTable(), 'thumbnail_path')) {
                    $mediaModel->thumbnail_path = $generated;
                    $mediaModel->saveQuietly();
                }
            } else {
                // Fail-closed security: Never expose pristine original deliverable if proof generation fails
                return ApiResponseHelper::errorResponse(
                    'Watermarked proof preview could not be generated. Please contact support.',
                    Response::HTTP_INTERNAL_SERVER_ERROR
                );
            }
        }

        if (! Storage::disk($disk)->exists($targetPath)) {
            return ApiResponseHelper::errorResponse('Preview file not found in storage.', Response::HTTP_NOT_FOUND);
        }

        $fullPath = Storage::disk($disk)->path($targetPath);
        $ext = pathinfo($targetPath, PATHINFO_EXTENSION) ?: 'webp';
        $baseName = pathinfo($mediaModel->file_name ?: basename($targetPath), PATHINFO_FILENAME);
        $downloadName = 'proof_' . $baseName . '.' . $ext;

        return response()->download($fullPath, $downloadName, $this->getDownloadCorsHeaders($request));
    }

    /**
     * Download the pristine full-resolution deliverable asset.
     * Enforces anti-art theft: buyers can only download once order is completed.
     */
    public function downloadOriginal(
        Request $request,
        Commission $commission,
        mixed $media
    ): BinaryFileResponse|\Illuminate\Http\JsonResponse {
        $user = $request->user();

        if (! $user) {
            return ApiResponseHelper::errorResponse('Unauthenticated.', Response::HTTP_UNAUTHORIZED);
        }

        $isArtist = $user->id === $commission->artistProfile?->user_id;
        $isStaff = $user->isStaff() || $user->isAdmin();
        $isBuyer = $user->id === $commission->user_id;

        if (! ($isBuyer || $isArtist || $isStaff)) {
            return ApiResponseHelper::errorResponse(
                'You are not authorized to download deliverables for this commission.',
                Response::HTTP_FORBIDDEN
            );
        }

        $statusValue = $commission->status instanceof CommissionStatus ? $commission->status->value : $commission->status;

        // If requester is the buyer and order is not completed yet, protect the artist
        if ($isBuyer && ! in_array($statusValue, ['completed'], true) && ! $isStaff) {
            return ApiResponseHelper::errorResponse(
                'Original full-resolution asset unlocks once you approve delivery and complete the order. Please review the watermarked proof preview first.',
                Response::HTTP_FORBIDDEN
            );
        }

        $mediaModel = $this->resolveCommissionMedia($commission, $media);
        if (! $mediaModel) {
            return ApiResponseHelper::errorResponse('Deliverable file not found.', Response::HTTP_NOT_FOUND);
        }

        $disk = $mediaModel->getDisk();

        if (! Storage::disk($disk)->exists($mediaModel->file_path)) {
            return ApiResponseHelper::errorResponse('File not found in storage.', Response::HTTP_NOT_FOUND);
        }

        $fullPath = Storage::disk($disk)->path($mediaModel->file_path);

        return response()->download(
            $fullPath,
            $mediaModel->file_name ?: basename($mediaModel->file_path),
            $this->getDownloadCorsHeaders($request)
        );
    }

    /**
     * Download an all-in-one ZIP bundle containing original deliverables, commercial license, invoice, and manifest.
     */
    public function downloadBundle(
        Request $request,
        Commission $commission
    ): BinaryFileResponse|\Illuminate\Http\JsonResponse {
        $user = $request->user();

        if (! $user) {
            return ApiResponseHelper::errorResponse('Unauthenticated.', Response::HTTP_UNAUTHORIZED);
        }

        $isArtist = $user->id === $commission->artistProfile?->user_id;
        $isStaff = $user->isStaff() || $user->isAdmin();
        $isBuyer = $user->id === $commission->user_id;

        if (! ($isBuyer || $isArtist || $isStaff)) {
            return ApiResponseHelper::errorResponse(
                'You are not authorized to download deliverable bundles for this commission.',
                Response::HTTP_FORBIDDEN
            );
        }

        $statusValue = $commission->status instanceof CommissionStatus ? $commission->status->value : $commission->status;

        if ($isBuyer && $statusValue !== 'completed' && ! $isStaff) {
            return ApiResponseHelper::errorResponse(
                'Original deliverable bundle unlocks once you approve delivery and complete the order. Please review watermarked proofs first.',
                Response::HTTP_FORBIDDEN
            );
        }

        $commission->load(['user', 'artistProfile.user', 'service', 'commissionService', 'addonsSelections', 'payment', 'payout']);

        // Collect deliverable media
        $mediaItems = collect();

        // Deliverable messages media
        $deliverableMessages = $commission->messages()
            ->where('message', 'like', '[Final Work Delivered]%')
            ->with('media')
            ->get();

        foreach ($deliverableMessages as $msg) {
            foreach ($msg->media as $m) {
                $mediaItems->push($m);
            }
        }

        // Direct commission media
        if ($mediaItems->isEmpty()) {
            $directMedia = CommissionMedia::where('commission_id', $commission->id)->get();
            foreach ($directMedia as $dm) {
                $mediaItems->push($dm);
            }
        }

        // Fallback: all message media attached to this commission
        if ($mediaItems->isEmpty()) {
            $allMsgMedia = CommissionMessageMedia::whereHas('commissionMessage', function ($q) use ($commission) {
                $q->where('commission_id', $commission->id);
            })->get();
            foreach ($allMsgMedia as $amm) {
                $mediaItems->push($amm);
            }
        }

        // Initialize ZipArchive
        if (! class_exists(\ZipArchive::class)) {
            return ApiResponseHelper::errorResponse('ZIP archive generation is not supported on this server.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $tempDir = storage_path('app/temp');
        if (! file_exists($tempDir)) {
            @mkdir($tempDir, 0755, true);
        }

        $tempZipPath = $tempDir . DIRECTORY_SEPARATOR . 'comme_bundle_' . $commission->id . '_' . uniqid() . '.zip';
        $zip = new \ZipArchive();

        if ($zip->open($tempZipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            return ApiResponseHelper::errorResponse('Failed to create deliverable ZIP bundle.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        // Add artwork files to ZIP
        $addedNames = [];
        foreach ($mediaItems as $media) {
            $disk = $media->getDisk();
            if (Storage::disk($disk)->exists($media->file_path)) {
                $fullPath = Storage::disk($disk)->path($media->file_path);
                $origName = $media->file_name ?: basename($media->file_path);

                $name = $origName;
                $counter = 1;
                while (in_array($name, $addedNames, true)) {
                    $ext = pathinfo($origName, PATHINFO_EXTENSION);
                    $base = pathinfo($origName, PATHINFO_FILENAME);
                    $name = $base . "_{$counter}." . ($ext ?: 'dat');
                    $counter++;
                }
                $addedNames[] = $name;

                $zip->addFile($fullPath, 'Artwork/' . $name);
            }
        }

        // Generate Invoice HTML
        $receiptHash = strtoupper(substr(md5("comme-receipt-{$commission->id}-{$commission->created_at}"), 0, 8));
        $receiptNumber = "REC-COM-{$commission->id}-{$receiptHash}";
        $hasCommercial = $commission->addonsSelections->contains(function ($addon) {
            return str_contains(strtolower($addon->title ?? ''), 'commercial');
        });

        try {
            $invoiceHtml = view('documents.invoice', [
                'commission' => $commission,
                'receiptNumber' => $receiptNumber,
                'user' => $user,
                'hasCommercialRights' => $hasCommercial,
                'autoPrint' => false,
            ])->render();
            $zip->addFromString("Documents/Invoice-Receipt-COM-#{$commission->id}.html", $invoiceHtml);
        } catch (\Throwable $e) {
            // Ignore rendering errors if any
        }

        // Generate Commercial License HTML (if completed)
        if ($statusValue === 'completed') {
            try {
                $licenseHash = strtoupper(substr(sha1("comme-license-{$commission->id}-{$commission->created_at}"), 0, 12));
                $licenseNumber = "LIC-COM-{$commission->id}-{$licenseHash}";
                $licenseHtml = view('documents.license', [
                    'commission' => $commission,
                    'licenseNumber' => $licenseNumber,
                    'user' => $user,
                    'hasCommercialRights' => $hasCommercial,
                    'autoPrint' => false,
                ])->render();
                $zip->addFromString("Documents/Commercial-License-COM-#{$commission->id}.html", $licenseHtml);
            } catch (\Throwable $e) {
                // Ignore rendering errors if any
            }
        }

        // Add README Manifest
        $artistName = $commission->artistProfile?->user?->display_name ?: $commission->artistProfile?->user?->username ?: 'Artist';
        $clientName = $commission->user?->display_name ?: $commission->user?->username ?: 'Client';
        $serviceName = $commission->commissionService?->name ?? 'Custom Artwork';
        $priceFormatted = 'Rp ' . number_format((float) $commission->total_price, 0, ',', '.');
        $completedDate = $commission->completed_at ? $commission->completed_at->toFormattedDateString() : now()->toFormattedDateString();

        $manifest = <<<EOT
================================================================================
COMME CREATIVE PLATFORM — OFFICIAL DELIVERABLE BUNDLE
================================================================================
Order ID       : COM-#{$commission->id}
Service        : {$serviceName}
Artist         : {$artistName} (@{$commission->artistProfile?->user?->username})
Client         : {$clientName} (@{$commission->user?->username})
Completed Date : {$completedDate}
Total Price    : {$priceFormatted} IDR
================================================================================

PACKAGE CONTENTS:
1. Artwork/
   Contains full-resolution, pristine original deliverable assets.
2. Documents/Invoice-Receipt-COM-#{$commission->id}.html
   Official printable proof of transaction and escrow release receipt.
3. Documents/Commercial-License-COM-#{$commission->id}.html
   Official certificate of authenticity and licensing agreement terms.

USAGE RIGHTS:
All deliverable items in this archive are governed by the Commercial License
agreement contained in the Documents directory.

Thank you for commissioning through Comme (https://comme.art)!
================================================================================
EOT;

        $zip->addFromString('README-Manifest.txt', $manifest);
        $zip->close();

        $downloadFilename = "comme-order-{$commission->id}-deliverables.zip";

        return response()->download(
            $tempZipPath,
            $downloadFilename,
            $this->getDownloadCorsHeaders($request, ['Content-Type' => 'application/zip'])
        )->deleteFileAfterSend(true);
    }
}
