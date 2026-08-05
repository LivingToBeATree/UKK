<?php

namespace App\Enums;

enum RevisionItemType: string
{
    case DEADLINE = 'deadline';

    case NOTES = 'notes';

    case ADDON = 'addon';

    case PRICE = 'price';

    case OPTION = 'option';
}