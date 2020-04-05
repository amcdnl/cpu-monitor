import React, { FC, useState, useRef, useEffect } from 'react';
import socket from 'socket.io-client';
import { AreaChart } from 'reaviz';
import './App.css';
import moment from 'moment';

const client = socket('http://localhost:4001');

const useSocket = (event: string, callback: (...args: any[]) => void) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    function socketHandler(this: SocketIOClient.Socket, ...args: any[]) {
      if (callbackRef.current) {
        callbackRef.current.apply(this, args);
      }
    }

    if (event) {
      client.on(event, socketHandler);

      return () => {
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
  const [cpus, setCpus] = useState<number>(0);
  const [totalMemory, setTotalMemory] = useState<number>(0);
  const [hostname, setHostname] = useState<string>('');
  const [memoryData, setMemoryData] = useState<any[]>([]);

  useSocket('updates', (data: CPUData) => {
    console.log('Updates', data);
    setCpus(data.cpus);
    setHostname(data.hostname);
    setTotalMemory(data.totalMemory);

    setMemoryData([
      ...memoryData.filter(m =>
        moment(m.time).isSameOrAfter(moment(new Date()))
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
          <h2>Memory - {totalMemory.toLocaleString()}</h2>
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
