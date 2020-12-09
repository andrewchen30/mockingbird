import React from 'react';
import { useContext, useState, useCallback, useEffect } from 'react';
import { HttpLogEvent } from '../../interfaces/pkg/pb/events_pb';
import { socketCtx, pareEventData } from '../../utils/socket';

export const AccessLogsList = () => {
  const socket = useContext(socketCtx);
  const [logs, setLogs] = useState<HttpLogEvent.AsObject[]>([]);
  const socketCb = useCallback(() => {
    socket.on('http_log_event', function (data: any) {
      const e = pareEventData<HttpLogEvent.AsObject>(data);
      if (!e) {
        return;
      }
      setLogs([e, ...logs].slice(0, 10));
    });
  }, [socket, logs]);

  useEffect(() => {
    socketCb();
  });

  return (
    <div>
      top 1- logs
      {logs.map((log) => (
        <div>
          [{log.resCode}]{log.reqMethod} - {log.authority}/{log.path}
        </div>
      ))}
    </div>
  );
};
