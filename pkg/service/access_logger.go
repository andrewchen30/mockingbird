package service

import (
	"fmt"
	accesslog "github.com/envoyproxy/go-control-plane/envoy/service/accesslog/v2"
	"log"
)

type AccessLogService struct {
	entries []string
}

func (svc *AccessLogService) StreamAccessLogs(stream accesslog.AccessLogService_StreamAccessLogsServer) error {
	fmt.Print("StreamAccessLogs started")
	log.Print("StreamAccessLogs started")
	var logName string
	for {
		msg, err := stream.Recv()
		if err != nil {
			fmt.Print("StreamAccessLogs err", err)
			log.Print("StreamAccessLogs err", err)
			return nil
		}
		if msg.Identifier != nil {
			logName = msg.Identifier.LogName
		}
		fmt.Print("StreamAccessLogs", logName)
		log.Print("StreamAccessLogs", logName)
		switch entries := msg.LogEntries.(type) {
		case *accesslog.StreamAccessLogsMessage_HttpLogs:
			fmt.Print("StreamAccessLogsMessage_HttpLogs entries.HttpLogs", entries.HttpLogs)
			log.Print("StreamAccessLogsMessage_HttpLogs entries.HttpLogs", entries.HttpLogs)
		case *accesslog.StreamAccessLogsMessage_TcpLogs:
			fmt.Print("StreamAccessLogsMessage_TcpLogs entries.TcpLogs", entries.TcpLogs)
			log.Print("StreamAccessLogsMessage_TcpLogs entries.TcpLogs", entries.TcpLogs)
		}
	}
}
