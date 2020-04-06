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
  const thresholdExceeded = loadAverage >= threshold;

  // If our threshold is not exceeded, check if our previous tick had
  // and return the result if so
  let thresholdRecovered;
  if (!thresholdExceeded && cpuData.length) {
    const lastTick = cpuData[cpuData.length - 1];
    if (lastTick.data >= threshold) {
      thresholdRecovered = true;
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

  return {
    loadAverage,
    ...calculateThreshold(loadAverage, nextCpuData, threshold),
    cpuData: [
      ...nextCpuData,
      {
        key: new Date(data.time),
        data: loadAverage
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
