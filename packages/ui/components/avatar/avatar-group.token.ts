import { InjectionToken } from '@angular/core';

import type { CwAvatarGroup } from './avatar-group/avatar-group.component';

/**
 * Constant AVATAR_GROUP
 *
 * @description
 * Lets an avatar read its surrounding group's size and overflow state.
 *
 * @type {InjectionToken<CwAvatarGroup>}
 */
export const AVATAR_GROUP: InjectionToken<CwAvatarGroup> = new InjectionToken<CwAvatarGroup>(
  'AVATAR_GROUP',
);
