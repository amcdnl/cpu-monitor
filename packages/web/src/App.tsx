import React, { FC, useState } from 'react';
import {
  AreaChart,
  LinearXAxis,
  LinearXAxisTickSeries,
  LinearYAxis,
  LinearYAxisTickSeries,
  LinearYAxisTickLabel,
  ChartShallowDataShape
} from 'reaviz';
import './App.css';
import humanFormat from 'human-format';
import { motion } from 'framer-motion';
import { timeMinute } from 'd3-time';
import { CPUData, buildData } from './builder';
import { useSocket } from './useSocket';

export const App: FC = () => {
  // Lets create some simple states to render below
  const [cpus, setCpus] = useState<number>(0);
  const [totalMemory, setTotalMemory] = useState<number>(0);
  const [loadAverage, setLoadAverage] = useState<number>(0);
  const [hostname, setHostname] = useState<string>('');
  const [memoryData, setMemoryData] = useState<ChartShallowDataShape[]>([]);
  const [cpuData, setCpuData] = useState<ChartShallowDataShape[]>([]);

  // Listen for all our updates and update the sate
  useSocket('updates', (data: CPUData) => {
    console.log('Updates', data);

    // Set some basic info for the user
    setCpus(data.cpus);
    setHostname(data.hostname);
    setTotalMemory(data.totalMemory);

    // Call our data builder to calc the data
    const results = buildData(data, cpuData, memoryData);
    setLoadAverage(results.loadAverage);
    setCpuData(results.cpuData);
    setMemoryData(results.memoryData);

    // Alert the user if the threshold has exceeded
    if (results.thresholdExceeded) {
      alert('Exceeded CPU Load Threshold');
    }

    // Alert the user when the threshold has recovered
    if (results.thresholdRecovered) {
      alert('CPU Load Threshold Recovered');
    }
  });

  return (
    <div className="App">
      <header>
        <h1>Hello {hostname}!</h1>
      </header>
      <div className="main">
        <motion.section
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          exit={{ opacity: 0, y: -15 }}
        >
          {cpuData.length > 0 ? (
            <>
              <h2>
                CPUs - {cpus.toLocaleString()} - Load Avg {loadAverage}
              </h2>
              <AreaChart
                height={200}
                data={cpuData}
                yAxis={<LinearYAxis type="value" />}
                xAxis={
                  <LinearXAxis
                    type="time"
                    tickSeries={<LinearXAxisTickSeries interval={timeMinute} />}
                  />
                }
              />
            </>
          ) : (
            <>Loading...</>
          )}
        </motion.section>
        <motion.section
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          exit={{ opacity: 0, y: -15 }}
        >
          {memoryData.length > 0 ? (
            <>
              <h2>Memory - {humanFormat(totalMemory)}</h2>
              <AreaChart
                height={200}
                data={memoryData}
                yAxis={
                  <LinearYAxis
                    type="value"
                    domain={[0, totalMemory]}
                    tickSeries={
                      <LinearYAxisTickSeries
                        label={
                          <LinearYAxisTickLabel format={d => humanFormat(d)} />
                        }
                      />
                    }
                  />
                }
                xAxis={
                  <LinearXAxis
                    type="time"
                    tickSeries={<LinearXAxisTickSeries interval={timeMinute} />}
                  />
                }
              />
            </>
          ) : (
            <>Loading...</>
          )}
        </motion.section>
      </div>
    </div>
  );
};
