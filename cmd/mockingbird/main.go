package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"github.com/lab-envoy/pkg/dao"
	"github.com/lab-envoy/pkg/service"
	"github.com/lab-envoy/pkg/utils"
	"io/ioutil"
	"log"
	"net/http"
	"sync"
	"time"
)

var (
	logger          utils.Logger
	port            uint
	nodeID          string
	routesConfFile  string
	socketNamespace string
	envoyHost       string
)

func init() {
	logger = utils.Logger{}
	flag.BoolVar(&logger.Debug, "debug", false, "Enable xDS server debug logging")
	flag.UintVar(&port, "port", 4000, "xDS management server port")
	flag.StringVar(&socketNamespace, "nsp", "/", "Socket nsp")
	flag.StringVar(&nodeID, "nodeID", "mockingbird-default-id", "Node ID")
	flag.StringVar(&routesConfFile, "routesConfFile", "/src/mockingbird.config.json", "Routes config file path")
	flag.StringVar(&envoyHost, "envoyHost", "http://envoy:10001", "Envoy host")
}

func main() {

	flag.Parse()

	snapshotInternalMemoryDao := dao.NewInternalMemorySnapshotDao()
	snapshotCtrl := service.NewSnapshotController(nodeID, &snapshotInternalMemoryDao, logger)

	err := snapshotCtrl.Init(service.InitOpt{
		InitFile: routesConfFile,
	})

	if err != nil {
		logger.Errorf("snapshotCtrl.Init failed", err)
	}

	if err := snapshotCtrl.RefreshSnapshot(); err != nil {
		logger.Errorf("snapshotCtrl refresh snapshot failed", err)
	}

	socketHandler, err := service.NewSocketHandler("/", &logger)

	if err != nil {
		logger.Errorf("start socket server fail")
	}

	managementServiceConfig := &service.EnvoyManagementServerConfig{
		Port:               port,
		Logger:             &logger,
		SnapshotController: &snapshotCtrl,
	}

	opConf := &service.OperationServerConf{
		Port: 3000,
	}

	opBase := &service.OperationServerBase{
		Logger:        &logger,
		SnapshotCtrl:  &snapshotCtrl,
		SocketHandler: socketHandler,
	}

	RunServers(managementServiceConfig, opConf, opBase)
}

func RunServers(
	m *service.EnvoyManagementServerConfig,
	opConf *service.OperationServerConf,
	opBase *service.OperationServerBase,
) {

	var wg sync.WaitGroup
	wg.Add(3)

	go func() {
		defer func() {
			opBase.SocketHandler.Server.Close()
			wg.Done()
		}()

		log.Printf("socket handler will start serv")
		if err := opBase.SocketHandler.Server.Serve(); err != nil {
			log.Println(err)
		}
	}()

	go func() {
		defer wg.Done()

		log.Printf("management server will listen on %d\n", m.Port)
		if err, _ := service.NewGRCPManagementServer(m); err != nil {
			log.Println(err)
		}
	}()

	go func() {
		defer wg.Done()

		log.Printf("operation server will listen HTTP/1.1 on %d\n", opConf.Port)
		if err := service.NewHttpOperationServer(opConf, opBase).ListenAndServe(); err != nil {
			log.Println(err)
		}
	}()

	go func() {
		s := service.StatusEvent{
			Envoy:       "unknown",
			Mockingbird: "alive",
		}
		for {
			rooms := opBase.SocketHandler.Server.Rooms(socketNamespace)
			bs, _ := json.Marshal(s)
			for _, r := range rooms {
				opBase.SocketHandler.Server.BroadcastToRoom(socketNamespace, r, service.StatusEventName, string(bs))
			}
			if s.Envoy == "alive" {
				time.Sleep(time.Minute)
			} else {
				time.Sleep(15 * time.Second)
			}
			res, err := http.Get(fmt.Sprintf("%s/ready", envoyHost))
			if err != nil {
				log.Println("get err", err)
				s.Envoy = "disconnect"
				continue
			}
			body, err := ioutil.ReadAll(res.Body)
			res.Body.Close()
			if err != nil && string(body) != "LIVE" {
				log.Println("body err", err, string(body), string(body) != "LIVE")
				s.Envoy = "disconnect"
				continue
			}
			s.Envoy = "alive"
		}
	}()

	wg.Wait()
}
