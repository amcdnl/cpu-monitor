import { calculateThreshold, buildData } from './builder';
import moment from 'moment';

describe('calculateThreshold', () => {
  it('should not return exceeded', () => {
    const { thresholdExceeded } = calculateThreshold(0.5, [], 1);
    expect(thresholdExceeded).toEqual(false);
  });

  it('should return exceeded', () => {
    const { thresholdExceeded } = calculateThreshold(
      1,
      [
        {
          key: moment().subtract(3, 'm').toDate(),
          data: 1,
          metadata: { thresholdExceeded: true }
        },
        {
          key: moment().subtract(2, 'm').toDate(),
          data: 1,
          metadata: { thresholdExceeded: true }
        },
        {
          key: moment().subtract(1, 'm').toDate(),
          data: 1,
          metadata: { thresholdExceeded: true }
        }
      ],
      1
    );
    expect(thresholdExceeded).toEqual(true);
  });

  it('should return not recovered', () => {
    const { thresholdExceeded, thresholdRecovered } = calculateThreshold(
      0.9,
      [
        {
          key: moment().subtract(3, 'm').toDate(),
          data: 1,
          metadata: { thresholdExceeded: true }
        },
        {
          key: moment().subtract(2, 'm').toDate(),
          data: 1,
          metadata: { thresholdExceeded: true }
        },
        {
          key: moment().subtract(1, 'm').toDate(),
          data: 1,
          metadata: { thresholdExceeded: true }
        }
      ],
      1
    );

    expect(thresholdExceeded).toEqual(true);
    expect(thresholdRecovered).toEqual(false);
  });

  it('should return recovered', () => {
    const { thresholdExceeded, thresholdRecovered } = calculateThreshold(
      0.9,
      [
        {
          key: moment().subtract(3, 'm').toDate(),
          data: 1,
          metadata: { thresholdExceeded: true }
        },
        {
          key: moment().subtract(2, 'm').toDate(),
          data: 1,
          metadata: { thresholdExceeded: false }
        },
        {
          key: moment().subtract(1, 'm').toDate(),
          data: 1,
          metadata: { thresholdExceeded: false }
        }
      ],
      1
    );

    expect(thresholdExceeded).toEqual(false);
    expect(thresholdRecovered).toEqual(true);
  });
});

describe('buildData', () => {
  it('should calculate load avg correctly', () => {
    const { thresholdExceeded } = calculateThreshold(0.5, [], 1);
    expect(thresholdExceeded).toEqual(false);

    const result = buildData(
      {
        loadAverage: [0.4, 0, 0],
        cpus: 12
      },
      [],
      []
    );

    expect(result.loadAverage).toEqual(0.03333333333333333);
    expect(result.thresholdExceeded).toEqual(false);
    expect(result.thresholdRecovered).toEqual(false);
  });
});
