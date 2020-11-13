package main

import (
	"encoding/json"
	"fmt"
	flags "github.com/jessevdk/go-flags"
	"github.com/lab-envoy/pkg/dao"
	"github.com/lab-envoy/pkg/service"
	"github.com/lab-envoy/pkg/utils"
	"io/ioutil"
	"log"
	"net/http"
	"sync"
	"time"
)

type XdsServerConfig struct {
	Port         uint   `long:"xds.port" env:"PORT" description:"xDS management server port." default:"4000"`
	EnvoyHost    string `long:"envoyHost" env:"ENVOY_HOST" default:"http://envoy:10001"`
	NodeID       string `long:"nodeId" env:"NODE_ID" description:"xDS node id." default:"mockingbird-default-id"`
	RoutesConfig string `long:"routesConfig" env:"ROUTES_CONFIG" description:"routes default config file path" default:"/src/mockingbird.config.json"`
}

type SocketConfig struct {
	Namespace string `long:"namespace" env:"NAMESPACE" description:"namespace" default:"/"`
}

type Envs struct {
	Port uint `long:"port" env:"PORT" description:"operations server port." default:"3000"`

	SocketConfig    SocketConfig    `group:"Socket" namespace:"socket" env-namespace:"SOCKET"`
	XdsServerConfig XdsServerConfig `group:"Xds" namespace:"xds" env-namespace:"XDS_SERVER"`
}

func initEnv() (*Envs, error) {
	var env Envs
	_, err := flags.NewParser(&env, flags.Default).Parse()
	if err != nil {
		return nil, err
	}
	return &env, nil
}

func main() {
	logger := utils.Logger{}

	env, err := initEnv()
	if err != nil {
		logger.Errorf("parse log failed", err)
		return
	}

	log.Print("Env", env)

	snapshotInternalMemoryDao := dao.NewInternalMemorySnapshotDao()
	snapshotCtrl := service.NewSnapshotController(env.XdsServerConfig.NodeID, &snapshotInternalMemoryDao, logger)

	err = snapshotCtrl.Init(service.InitOpt{
		InitFile: env.XdsServerConfig.RoutesConfig,
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

	xDsServConfig := &service.EnvoyManagementServerConfig{
		Port:               env.XdsServerConfig.Port,
		Logger:             &logger,
		SnapshotController: &snapshotCtrl,
	}

	opConf := &service.OperationServerConf{
		Port: env.Port,
	}

	opBase := &service.OperationServerBase{
		Logger:        &logger,
		SnapshotCtrl:  &snapshotCtrl,
		SocketHandler: socketHandler,
	}

	RunServers(env, xDsServConfig, opConf, opBase)
}

func RunServers(
	env *Envs,
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
			rooms := opBase.SocketHandler.Server.Rooms(env.SocketConfig.Namespace)
			bs, _ := json.Marshal(s)
			for _, r := range rooms {
				opBase.SocketHandler.Server.BroadcastToRoom(env.SocketConfig.Namespace, r, service.StatusEventName, string(bs))
			}
			if s.Envoy == "alive" {
				time.Sleep(time.Minute)
			} else {
				time.Sleep(15 * time.Second)
			}
			res, err := http.Get(fmt.Sprintf("%s/ready", env.XdsServerConfig.EnvoyHost))
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
