import {
  svglDrive,
  svglFigma,
  svglGithubLight,
  svglGitlab,
  svglGoogle,
  svglMicrosoft,
  svglSlack,
} from '@ng-icons/svgl';

/**
 * The GitHub logo follows the text color, so it turns light in the dark theme (integration guide,
 * "Icônes"); the other logos keep their brand colors. svgl ships it with a fixed dark fill on its
 * root element: that fill is swapped for `currentColor`, under the same name.
 */
const githubFollowingText = svglGithubLight.replace(/fill="[^"]*"/, 'fill="currentColor"');

/** Brand logos (svgl): sign-in providers, Git integrations and the tools the landing page names. */
export const BRAND_ICONS = {
  svglDrive,
  svglFigma,
  svglGithubLight: githubFollowingText,
  svglGitlab,
  svglGoogle,
  svglMicrosoft,
  svglSlack,
};
