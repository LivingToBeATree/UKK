<?php

namespace App\Services;

use App\Enum\ReportStatus;
use App\Enum\TicketPriority;
use App\Models\ModerationAction;
use App\Models\Report;
use App\Models\TicketMessage;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ModerationSyncService
{
    /**
     * When an author deletes a reported or taken-down piece of content,
     * automatically resolve and close all associated reports and tickets.
     */
    public static function handleContentDeleted(Model $model, User $actor): void
    {
        $types = array_unique([
            $model->getMorphClass(),
            get_class($model),
            strtolower(class_basename($model)),
            \Illuminate\Support\Str::snake(class_basename($model)),
        ]);
        $reportableId = $model->id;
        $modelName = class_basename($model);

        $reports = Report::whereIn('reportable_type', $types)
            ->where('reportable_id', $reportableId)
            ->whereIn('status', [ReportStatus::PENDING, ReportStatus::INVESTIGATING])
            ->with('ticket')
            ->get();

        foreach ($reports as $report) {
            $report->update([
                'status' => ReportStatus::RESOLVED,
                'handled_by' => $actor->id,
                'handled_at' => now(),
            ]);

            if ($report->ticket) {
                $ticket = $report->ticket;
                $ticket->update([
                    'closed_at' => now(),
                ]);

                TicketMessage::create([
                    'ticket_id' => $ticket->id,
                    'user_id' => $actor->id,
                    'content' => "System Notice: The author (@{$actor->username}) has permanently deleted this reported {$modelName} #{$reportableId}. All open reports and support tickets regarding this item have been automatically resolved and closed.",
                ]);

                ModerationAction::create([
                    'ticket_id' => $ticket->id,
                    'user_id' => $actor->id,
                    'type' => \App\Enum\ModerationActionType::REMOVE_CONTENT,
                    'notes' => "Author @{$actor->username} permanently deleted {$modelName} #{$reportableId}. Report auto-resolved.",
                ]);
            }
        }
    }

    /**
     * When an author edits a reported or taken-down piece of content,
     * notify moderators on the ticket thread and flag for re-investigation.
     */
    public static function handleContentUpdated(Model $model, User $actor): void
    {
        $types = array_unique([
            $model->getMorphClass(),
            get_class($model),
            strtolower(class_basename($model)),
            \Illuminate\Support\Str::snake(class_basename($model)),
        ]);
        $reportableId = $model->id;
        $modelName = class_basename($model);

        $reports = Report::whereIn('reportable_type', $types)
            ->where('reportable_id', $reportableId)
            ->with('ticket')
            ->get();

        foreach ($reports as $report) {
            if ($report->ticket) {
                $ticket = $report->ticket;

                // If ticket was closed or report was resolved, reopen it for review
                if ($ticket->closed_at || $report->status === ReportStatus::RESOLVED) {
                    $report->update(['status' => ReportStatus::INVESTIGATING]);
                    $ticket->update([
                        'closed_at' => null,
                        'priority' => TicketPriority::HIGH,
                    ]);
                }

                TicketMessage::create([
                    'ticket_id' => $ticket->id,
                    'user_id' => $actor->id,
                    'content' => "📝 Revision Submitted: The author (@{$actor->username}) has updated and edited this {$modelName} #{$reportableId}. The item is ready for moderation re-review.",
                ]);
            }
        }
    }
}
