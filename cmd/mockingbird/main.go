package main

import (
	"encoding/json"
	"fmt"
	"github.com/jessevdk/go-flags"
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
	Port         uint   `long:"xds.port" env:"PORT" description:"xds server port." default:"4000"`
	EnvoyHost    string `long:"envoyHost" env:"ENVOY_HOST" default:"http://envoy:10001"`
	NodeID       string `long:"nodeId" env:"NODE_ID" description:"xds node id." default:"mockingbird-default-id"`
	RoutesConfig string `long:"routesConfig" env:"ROUTES_CONFIG" description:"routes default config file path" default:"/src/mockingbird.config.json"`
}

type SocketConfig struct {
	Namespace string `long:"namespace" env:"NAMESPACE" description:"namespace" default:"/"`
}

type Envs struct {
	Port uint `long:"port" env:"OP_PORT" description:"admin server port." default:"3000"`

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

	logger.Debugf("Env", env)

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

	envoyXdsConfig := &service.EnvoyXdsConfig{
		Port:               env.XdsServerConfig.Port,
		Logger:             &logger,
		SnapshotController: &snapshotCtrl,
	}

	opBase := &service.AdminServerConfig{
		Port:          env.Port,
		Logger:        &logger,
		SnapshotCtrl:  &snapshotCtrl,
		SocketHandler: socketHandler,
	}

	RunServers(env, envoyXdsConfig, opBase)
}

func RunServers(
	env *Envs,
	xdsConfig *service.EnvoyXdsConfig,
	adminConfig *service.AdminServerConfig,
) {

	var wg sync.WaitGroup
	wg.Add(4)

	go func() {
		defer func() {
			adminConfig.SocketHandler.Server.Close()
			wg.Done()
		}()

		log.Printf("socket handler will start serv")
		if err := adminConfig.SocketHandler.Server.Serve(); err != nil {
			log.Println(err)
		}
	}()

	go func() {
		defer wg.Done()

		log.Printf("xds server will listen on %d\n", xdsConfig.Port)
		if err, _ := service.NewGrpcXdsServer(xdsConfig); err != nil {
			log.Println(err)
		}
	}()

	go func() {
		defer wg.Done()

		log.Printf("admin server will listen HTTP/1.1 on %d\n", adminConfig.Port)
		if err := service.NewHttpAdminServer(adminConfig).ListenAndServe(); err != nil {
			log.Println(err)
		}
	}()

	go func() {
		defer wg.Done()
		s := service.StatusEvent{
			Envoy:       "unknown",
			Mockingbird: "alive",
		}
		for {
			rooms := adminConfig.SocketHandler.Server.Rooms(env.SocketConfig.Namespace)
			bs, _ := json.Marshal(s)
			for _, r := range rooms {
				adminConfig.SocketHandler.Server.BroadcastToRoom(env.SocketConfig.Namespace, r, service.StatusEventName, string(bs))
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
