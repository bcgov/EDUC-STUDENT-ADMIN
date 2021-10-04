export const CHART_TYPES = Object.freeze(
  {
    NEW_PENS: 'New PENs',
    MERGES: 'Merges',
    GMP: 'GMP',
    UMP: 'UMP'
  }
);

export const CHART_STAT_URLS = Object.freeze(
  {
    UMP: '/api/analytics/ump/stats?statsType=ALL_STATUSES_LAST_12_MONTH',
    GMP: '/api/analytics/gmp/stats?statsType=ALL_STATUSES_LAST_12_MONTH',
    NEW_PEN: '/api/analytics/new-pen',
    MERGE: '/api/analytics/merge'
  }
);

export const COMPLETION_STATES = Object.freeze(
  {
    UMP: [
      'COMPLETED',
      'REJECTED',
      'ABANDONED'
    ],
    GMP: [
      'AUTO',
      'MANUAL',
      'REJECTED',
      'ABANDONED'
    ]
  }
);
