<?php

namespace App\Http\Requests\API\V1\Report;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use App\Models\Report;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\CommissionReview;
use App\Models\Portfolio;
use App\Models\CommissionService;
use App\Models\User;
use App\Enum\ReportReason;

class StoreReportRequest extends FormRequest
{
    public const REPORTABLE_TYPES = [
        'post' => Post::class,
        'post_comment' => PostComment::class,
        'commission_review' => CommissionReview::class,
        'portfolio' => Portfolio::class,
        'commission_service' => CommissionService::class,
        'user' => User::class
    ];

    public function authorize(): bool
    {
        return $this->user()->can('create', Report::class);
    }

    public function rules(): array
    {
        return [
            'reportable_type' => ['required', Rule::in(array_keys(self::REPORTABLE_TYPES))],
            'reportable_id' => ['required', 'integer'],
            'reason' => ['required', new Enum(ReportReason::class)],
            'description' => ['nullable', 'string', 'max:1000'],

            // status, handled_by, handled_at absent — a report always
            // starts 'pending' with no handler, set server-side only.
        ];
    }

    /**
     * reportable_id can't use a simple 'exists:table,id' rule, since which
     * table to check depends on reportable_type — resolved dynamically here
     * instead. Also enforces "can't report something you can't access."
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $modelClass = self::REPORTABLE_TYPES[$this->reportable_type] ?? null;

            if (! $modelClass) {
                return; // already caught by the Rule::in check above
            }

            $target = $modelClass::find($this->reportable_id);

            if (! $target) {
                $validator->errors()->add('reportable_id', 'That item could not be found.');

                return;
            }

            if ($this->reportable_type === "user" && $target->id === $this->user()->id && $this->reason !== ReportReason::APPEAL->value && $this->reason !== ReportReason::INQUIRY->value) {
                $validator->errors()->add('reportable_id', 'You cannot report yourself.');

                return;
            }

            if (! $this->user()->can('view', $target) && ! ($this->reason === ReportReason::APPEAL->value || $this->reason === ReportReason::INQUIRY->value)) {
                $validator->errors()->add('reportable_id', 'You cannot report something you do not have access to.');
            }
        });
    }

    /**
     * Resolves the friendly type name into the real class — the
     * controller calls this instead of re-doing the lookup itself.
     */
    public function resolveReportableClass(): string
    {
        return self::REPORTABLE_TYPES[$this->reportable_type];
    }
}
