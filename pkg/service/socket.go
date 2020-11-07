package service

import (
	socket "github.com/googollee/go-socket.io"
	"github.com/lab-envoy/pkg/utils"
)

type SocketHandler struct {
	Server *socket.Server
	Logger *utils.Logger
}

func NewSocketHandler(l *utils.Logger) (*SocketHandler, error) {
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

	h.Server.OnConnect("/", func(s socket.Conn) error {
		s.SetContext("")
		h.Logger.Infof("connected:", s.ID())
		return nil
	})

	h.Server.OnEvent("/", "notice", func(s socket.Conn, msg string) {
		h.Logger.Infof("notice:", msg)
		s.Emit("reply", "have "+msg)
	})

	h.Server.OnEvent("/chat", "msg", func(s socket.Conn, msg string) string {
		s.SetContext(msg)
		return "recv " + msg
	})

	h.Server.OnEvent("/", "bye", func(s socket.Conn) string {
		last := s.Context().(string)
		s.Emit("bye", last)
		s.Close()
		return last
	})

	h.Server.OnError("/", func(s socket.Conn, e error) {
		h.Logger.Errorf("meet error:", e)
	})

	h.Server.OnDisconnect("/", func(s socket.Conn, msg string) {
		h.Logger.Errorf("closed", msg)
	})

}
