package service

import (
	"encoding/json"
	accesslog "github.com/envoyproxy/go-control-plane/envoy/service/accesslog/v2"
	"github.com/lab-envoy/pkg/pb"
	"log"
)

type AccessLogService struct {
	entries       []string
	SocketHandler *SocketHandler
}

func NewAccessLogService(socketHandler *SocketHandler) *AccessLogService {
	return &AccessLogService{
		SocketHandler: socketHandler,
	}
}

func (svc *AccessLogService) StreamAccessLogs(stream accesslog.AccessLogService_StreamAccessLogsServer) error {
	var logName string
	for {
		msg, err := stream.Recv()
		if err != nil {
			log.Print("StreamAccessLogs err", err)
			return nil
		}
		if msg.Identifier != nil {
			logName = msg.Identifier.LogName
		}
		switch entries := msg.LogEntries.(type) {
		case *accesslog.StreamAccessLogsMessage_HttpLogs:
			log.Print("StreamAccessLogsMessage_HttpLogs entries.HttpLogs", entries.HttpLogs)
			_ = svc.SendHttpSocketEvent(logName, entries.HttpLogs)
		case *accesslog.StreamAccessLogsMessage_TcpLogs:
		}
	}
}

func (svc *AccessLogService) SendHttpSocketEvent(_ string, l *accesslog.StreamAccessLogsMessage_HTTPAccessLogEntries) error {
	for _, entry := range l.LogEntry {

		log.Print("entry.GetResponse().String()", entry.GetResponse().ResponseTrailers)

		e := pb.HttpLogEvent{
			Authority: entry.GetRequest().Authority,
			Path:      entry.GetRequest().Path,
			UserAgent: entry.GetRequest().UserAgent,
			ReqId:     entry.GetRequest().RequestId,
			ReqMethod: entry.GetRequest().RequestMethod.String(),
			ResCode:   int32(entry.GetResponse().ResponseCode.Value),
		}

		rooms := svc.SocketHandler.Server.Rooms(svc.SocketHandler.NameSpace)
		bs, err := json.Marshal(e)
		if err != nil {
			log.Print("SendHttpSocketEvent marshal err", err)
			return err
		}
		for _, r := range rooms {
			svc.SocketHandler.Server.BroadcastToRoom(svc.SocketHandler.NameSpace, r, HttpLogEventName, string(bs))
		}
	}
	return nil
}
