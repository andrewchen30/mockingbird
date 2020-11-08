package service

import (
	socket "github.com/googollee/go-socket.io"
	"github.com/lab-envoy/pkg/utils"
)

type SocketHandler struct {
	Server    *socket.Server
	Logger    *utils.Logger
	NameSpace string
}

func NewSocketHandler(NameSpace string, l *utils.Logger) (*SocketHandler, error) {
	s, err := socket.NewServer(nil)
	if err != nil {
		return nil, err
	}

	socketHandler := &SocketHandler{
		Server: s,
		Logger: l,
	}

	socketHandler.InitHandlers()

	return socketHandler, nil
}

func (h *SocketHandler) InitHandlers() {

	h.Server.OnConnect(h.NameSpace, func(s socket.Conn) error {
		s.SetContext("")
		h.Logger.Infof("connected:", s.ID())
		return nil
	})

	h.Server.OnError(h.NameSpace, func(s socket.Conn, e error) {
		h.Logger.Errorf("meet error:", e)
	})

	h.Server.OnDisconnect(h.NameSpace, func(s socket.Conn, msg string) {
		h.Logger.Errorf("closed", msg)
	})

}

const StatusEventName = "status_event"

type StatusEvent struct {
	Envoy       string `json:"envoy"`
	Mockingbird string `json:"mockingbird"`
}
