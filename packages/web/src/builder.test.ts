import { calculateThreshold, buildData } from './builder';

describe('calculateThreshold', () => {
  it('should not return exceeded', () => {
    const { thresholdExceeded } = calculateThreshold(0.5, [], 1);
    expect(thresholdExceeded).toEqual(false);
  });

  it('should return exceeded', () => {
    const { thresholdExceeded } = calculateThreshold(1, [], 1);
    expect(thresholdExceeded).toEqual(true);
  });

  it('should return recovered', () => {
    const { thresholdExceeded, thresholdRecovered } = calculateThreshold(
      0.9,
      [{ key: new Date(), data: 1 }],
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
    expect(result.thresholdRecovered).toEqual(undefined);
  });
});
