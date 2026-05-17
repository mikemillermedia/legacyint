
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Added missing Artist interface used in components/ArtistCard.tsx
export interface Artist {
  name: string;
  image: string;
  day: string;
  genre: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export enum Section {
  HERO = 'hero',
  STRUGGLES = 'struggles',
  SYSTEM = 'system',
  WORKFLOW = 'workflow',
  CTA = 'cta',
}
