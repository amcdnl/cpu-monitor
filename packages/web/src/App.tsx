import React, { FC, useState, useRef, useEffect } from 'react';
import socket from 'socket.io-client';
import { AreaChart } from 'reaviz';
import './App.css';
import moment from 'moment';
import humanFormat from 'human-format';

// Lets create a new socket client
// This is a singleton since javascript uses a locator pattern
const client = socket('http://localhost:4001');

const useSocket = (event: string, callback: (...args: any[]) => void) => {
  // For those of you at home, we need to read a often changing callback, lets use a ref to handle it
  // Reference: https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    // Create a function handle w/ the context of the socket so apply arguments
    function socketHandler(this: SocketIOClient.Socket, ...args: any[]) {
      if (callbackRef.current) {
        callbackRef.current.apply(this, args);
      }
    }

    if (event) {
      // Handle our events w/ the passed callback
      client.on(event, socketHandler);

      return () => {
        // Make sure to clean those handlers up on teardown
        client.removeListener(event, socketHandler);
      };
    }
  }, [event]);
};

interface CPUData {
  loadAverage: any;
  cpus: number;
  hostname: string;
  time: string;
  totalMemory: number;
  freeMemory: number;
}

export const App: FC = () => {
  // Lets create some simple states to render below
  const [cpus, setCpus] = useState<number>(0);
  const [totalMemory, setTotalMemory] = useState<number>(0);
  const [hostname, setHostname] = useState<string>('');
  const [memoryData, setMemoryData] = useState<any[]>([]);
  const [cpuData, setCpuData] = useState<any[]>([]);

  // Listen for all our updates and update the sate
  useSocket('updates', (data: CPUData) => {
    console.log('Updates', data);

    setCpus(data.cpus);
    setHostname(data.hostname);
    setTotalMemory(data.totalMemory);

    setCpuData([
      // Filter out events that are less than 10 minutes
      ...cpuData.filter(m =>
        moment(m.time).isSameOrAfter(moment(new Date()).subtract(10, 'm'))
      ),
      {
        key: new Date(data.time),
        data: data.loadAverage[0] / data.cpus
      }
    ]);

    setMemoryData([
      // Filter out events that are less than 10 minutes
      ...memoryData.filter(m =>
        moment(m.time).isSameOrAfter(moment(new Date()).subtract(10, 'm'))
      ),
      {
        key: new Date(data.time),
        data: data.freeMemory
      }
    ]);
  });

  return (
    <div className="App">
      <header>
        <h1>Hello {hostname}!</h1>
      </header>
      <div className="main">
        <section>
          <h2>CPUs - {cpus.toLocaleString()}</h2>
        </section>
        <section>
          <h2>Memory - {humanFormat(totalMemory)}</h2>
          {memoryData.length > 1 ? (
            <AreaChart height={200} data={memoryData} />
          ) : (
            <>Loading...</>
          )}
        </section>
      </div>
    </div>
  );
};
