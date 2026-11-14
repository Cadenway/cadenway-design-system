import { InjectionToken } from '@angular/core';

/**
 * Constant COMMAND_GROUP
 *
 * @description
 * The group an item sits in, so the group can hide itself when none of its items matches. The
 * group provides itself under this token; the item never imports the group class. Not exported
 * from the entry point.
 *
 * @type {InjectionToken<object>}
 */
export const COMMAND_GROUP: InjectionToken<object> = new InjectionToken<object>('COMMAND_GROUP');
