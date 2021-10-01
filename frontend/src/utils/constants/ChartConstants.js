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
    GMP_STATS : '/api/analytics/gmp/stats',
    GMP_ALL_STATUS_LAST_12_MONTH: '/api/analytics/gmp/stats?statsType=ALL_STATUSES_LAST_12_MONTH'
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
