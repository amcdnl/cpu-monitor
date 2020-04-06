import moment from 'moment';
import { ChartShallowDataShape } from 'reaviz';

export interface CPUData {
  loadAverage: any;
  cpus: number;
  hostname: string;
  time: string;
  totalMemory: number;
  freeMemory: number;
}

export const calculateThreshold = (
  loadAverage: number,
  cpuData: ChartShallowDataShape[],
  threshold = 1
) => {
  // Detect if our load avg is greater than the threshold
  const curThresholdExceeded = loadAverage >= threshold;

  // If our threshold is not exceeded, check if our previous tick had
  // and return the result if so
  let thresholdRecovered = false;
  let thresholdExceeded = false;

  if (cpuData.length) {
    // Find the last one that was not exceeded
    const lastSuccess = cpuData
      .reverse()
      .find(c => !c.metadata?.thresholdExceeded);

    // Calculate a date that was one minute ago
    const dateAgo = moment(new Date()).subtract(1, 'm');

    // If we found the last successful one, lets check when its date was
    if (lastSuccess) {
      // Deteremine if the found one is greater than 1 minute ago
      if (moment(lastSuccess.key as Date).isSameOrBefore(dateAgo)) {
        if (curThresholdExceeded) {
          thresholdExceeded = true;
        } else {
          thresholdRecovered = true;
        }
      }
    } else {
      // If there was never a successful one and the first one was 1 minute ago,
      if (moment(cpuData[0].key as Date).isSameOrBefore(dateAgo)) {
        thresholdExceeded = true;
      }
    }
  }

  return {
    thresholdExceeded,
    thresholdRecovered
  };
};

export const buildData = (
  data: Partial<CPUData>,
  cpuData: ChartShallowDataShape[],
  memoryData: ChartShallowDataShape[],
  threshold = 1
) => {
  // Calculate the load average
  const loadAverage = data.loadAverage[0] / data.cpus;

  // Filter out events that are less than 10 minutes
  const nextCpuData = cpuData.filter(m =>
    moment(m.key as Date).isSameOrAfter(moment(new Date()).subtract(10, 'm'))
  );

  const results = calculateThreshold(loadAverage, nextCpuData, threshold);

  return {
    loadAverage,
    ...results,
    cpuData: [
      ...nextCpuData,
      {
        key: new Date(data.time),
        data: loadAverage,
        metadata: {
          thresholdExceeded: results.thresholdExceeded
        }
      }
    ],
    memoryData: [
      // Filter out events that are less than 10 minutes
      ...memoryData.filter(m =>
        moment(m.key as Date).isSameOrAfter(
          moment(new Date()).subtract(10, 'm')
        )
      ),
      {
        key: new Date(data.time),
        data: data.freeMemory
      }
    ]
  };
};
