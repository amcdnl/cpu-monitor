import { useRef, useEffect } from 'react';
import socket from 'socket.io-client';

// Lets create a new socket client
// This is a singleton since javascript uses a locator pattern
export const client = socket('http://localhost:4001');

// A simple hook to bind to socket.io events and remove them on unmount
export const useSocket = (
  event: string,
  callback: (...args: any[]) => void
) => {
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
