/**
 * MOZY Product Source of Truth Configuration
 * Store-facing facts come from the App Store and Google Play listings (checked October 10, 2026).
 * Anything not on a listing is marked `verified: false` and must stay off public pages
 * until it has been confirmed against the current build.
 */

export interface PlatformPricing {
  downloadFree: boolean;
  /** Free-trial length in days, or null while no trial is confirmed on the store listing. */
  trialDays: number | null;
  /** Null when the listing doesn't say whether the features need a purchase. */
  subscriptionRequired: boolean | null;
  monthlyUsd?: number;
  yearlyUsd?: number;
  inAppPurchaseRangeUsd?: [number, number];
}

export interface PlatformPermission {
  name: string;
  api: string;
  purpose: string;
}

export interface PlatformSpec {
  name: string;
  storeName: string;
  storeUrl: string;
  minOs: string;
  pricing: PlatformPricing;
  permissions: PlatformPermission[];
  stepSource: string;
  blockingScope: 'entire_app';
  offlineCapable: boolean;
  accountRequired: boolean;
}

export interface UnverifiedRule {
  verified: false;
  description: string;
}

export interface ProductFacts {
  brandName: 'MOZY';
  tagline: string;
  parentCompany: string;
  parentUrl: string;
  siteUrl: string;
  supportEmail: string;
  developerName: string;
  pricesCheckedOn: string;
  stepExchangeRatio: {
    stepsPerMinute: number;
    isConfigurable: boolean;
    /** Platforms whose store listing states the ratio. */
    statedOn: ('ios' | 'android')[];
    description: string;
  };
  midnightReset: UnverifiedRule & {
    resetsAtMidnight: boolean;
    rolloverEnabled: boolean;
  };
  emergencyBypass: UnverifiedRule & {
    sessionDurationMinutes: number;
    maxSessionsPerDay: number;
    maxTotalMinutesPerDay: number;
  };
  platforms: {
    ios: PlatformSpec;
    android: PlatformSpec;
  };
  guarantees: {
    noAccountRequired: boolean;
    noGpsTracking: boolean;
    /** iOS App Store privacy label: "Data Not Collected" (developer disclosure). */
    iosPrivacyLabelDataNotCollected: boolean;
    offlineExecution: boolean;
  };
  limitations: string[];
}

export const PRODUCT_FACTS: ProductFacts = {
  brandName: 'MOZY',
  tagline: 'Walk to Earn Screen Time',
  parentCompany: 'mcrudra.com',
  parentUrl: 'https://mcrudra.com',
  siteUrl: 'https://mozy.mcrudra.com',
  supportEmail: 'hello@mcrudra.com',
  developerName: 'Mahesh Chambhare',
  pricesCheckedOn: 'October 10, 2026',
  stepExchangeRatio: {
    stepsPerMinute: 34,
    isConfigurable: false,
    statedOn: ['ios'],
    description: '34 steps earn 1 minute of screen time (stated on the App Store listing; confirm the Android build uses the same ratio).',
  },
  midnightReset: {
    verified: false,
    resetsAtMidnight: true,
    rolloverEnabled: false,
    description: 'Earned balance resets at midnight with no rollover. Not on either store listing; confirm before showing publicly.',
  },
  emergencyBypass: {
    verified: false,
    sessionDurationMinutes: 10,
    maxSessionsPerDay: 3,
    maxTotalMinutesPerDay: 30,
    description: '3 emergency sessions of 10 minutes per day. Not on either store listing; confirm before showing publicly.',
  },
  platforms: {
    ios: {
      name: 'iPhone (iOS)',
      storeName: 'Mozy: Walk to Earn Screen Time',
      storeUrl: 'https://apps.apple.com/us/app/mozy-walk-to-earn-screen-time/id6792097497',
      minOs: 'iOS 16.4 or later',
      pricing: {
        downloadFree: true,
        trialDays: null,
        subscriptionRequired: true,
        monthlyUsd: 4.99,
        yearlyUsd: 29.99,
      },
      permissions: [
        {
          name: 'Screen Time',
          api: 'FamilyControls & ManagedSettings',
          purpose: 'Applies system shields to selected distracting apps when earned screen time expires.',
        },
        {
          name: 'Motion & Fitness',
          api: 'CoreMotion (CMPedometer)',
          purpose: "Reads your step count from the iPhone's motion sensor to calculate earned screen-time minutes, without GPS.",
        },
      ],
      stepSource: "iPhone motion sensor (Motion & Fitness), processed on device",
      blockingScope: 'entire_app',
      offlineCapable: true,
      accountRequired: false,
    },
    android: {
      name: 'Android',
      storeName: 'Mozy: Walk to Unlock Apps',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.moxstudio.mozy',
      minOs: 'Android 8.0 or later',
      pricing: {
        downloadFree: true,
        trialDays: null,
        subscriptionRequired: null,
        inAppPurchaseRangeUsd: [4.99, 34.99],
      },
      permissions: [
        {
          name: 'Accessibility Service',
          api: 'AccessibilityService',
          purpose: 'Detects when a selected blocked application is brought to the foreground.',
        },
        {
          name: 'Display Over Other Apps',
          api: 'SYSTEM_ALERT_WINDOW',
          purpose: 'Displays the blocking overlay screen over designated apps when screen time expires.',
        },
        {
          name: 'Physical Activity',
          api: 'ACTIVITY_RECOGNITION',
          purpose: 'Reads built-in hardware step-counter sensor without GPS or location logging.',
        },
      ],
      stepSource: 'Android hardware step counter sensor',
      blockingScope: 'entire_app',
      offlineCapable: true,
      accountRequired: false,
    },
  },
  guarantees: {
    noAccountRequired: true,
    noGpsTracking: true,
    iosPrivacyLabelDataNotCollected: true,
    offlineExecution: true,
  },
  limitations: [
    'Blocks entire applications rather than isolating internal features like Instagram Reels or YouTube Shorts.',
    'Step tracking relies on phone hardware sensors; steps are counted when carrying your phone.',
  ],
};
