package service

import (
	"context"
	"fmt"
	clusterservice "github.com/envoyproxy/go-control-plane/envoy/service/cluster/v3"
	discoverygrpc "github.com/envoyproxy/go-control-plane/envoy/service/discovery/v3"
	endpointservice "github.com/envoyproxy/go-control-plane/envoy/service/endpoint/v3"
	listenerservice "github.com/envoyproxy/go-control-plane/envoy/service/listener/v3"
	routeservice "github.com/envoyproxy/go-control-plane/envoy/service/route/v3"
	runtimeservice "github.com/envoyproxy/go-control-plane/envoy/service/runtime/v3"
	secretservice "github.com/envoyproxy/go-control-plane/envoy/service/secret/v3"

	xds "github.com/envoyproxy/go-control-plane/pkg/server/v3"
	"github.com/lab-envoy/pkg/utils"
	"google.golang.org/grpc"
	"log"
	"net"
)

const (
	grpcMaxConcurrentStreams = 1000000
)

type EnvoyXdsConfig struct {
	Port               uint
	SnapshotController *SnapshotController
	Logger             *utils.Logger
}

func registerServer(grpcServer *grpc.Server, server xds.Server) {
	discoverygrpc.RegisterAggregatedDiscoveryServiceServer(grpcServer, server)
	endpointservice.RegisterEndpointDiscoveryServiceServer(grpcServer, server)
	clusterservice.RegisterClusterDiscoveryServiceServer(grpcServer, server)
	routeservice.RegisterRouteDiscoveryServiceServer(grpcServer, server)
	listenerservice.RegisterListenerDiscoveryServiceServer(grpcServer, server)
	secretservice.RegisterSecretDiscoveryServiceServer(grpcServer, server)
	runtimeservice.RegisterRuntimeDiscoveryServiceServer(grpcServer, server)
}

// RunServer starts an xDS server at the given port.
func NewGrpcXdsServer(c *EnvoyXdsConfig) (error, *grpc.Server) {
	var grpcOptions []grpc.ServerOption
	grpcOptions = append(grpcOptions, grpc.MaxConcurrentStreams(grpcMaxConcurrentStreams))
	grpcServer := grpc.NewServer(grpcOptions...)

	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", c.Port))
	if err != nil {
		log.Fatal(err)
	}

	sv3 := xds.NewServer(
		context.Background(),
		c.SnapshotController,
		NewCustomCallbacks(c.Logger),
	)

	registerServer(grpcServer, sv3)

	return grpcServer.Serve(lis), grpcServer
}

type Callbacks struct {
	logger *utils.Logger
}

func NewCustomCallbacks(l *utils.Logger) Callbacks {
	return Callbacks{
		logger: l,
	}
}

func (c Callbacks) OnFetchRequest(ctx context.Context, request *discoverygrpc.DiscoveryRequest) error {
	c.logger.Debugf("OnFetchRequest")
	return nil
}

func (c Callbacks) OnFetchResponse(request *discoverygrpc.DiscoveryRequest, response *discoverygrpc.DiscoveryResponse) {
	c.logger.Debugf("OnFetchResponse")
}

func (c Callbacks) OnStreamOpen(ctx context.Context, i int64, s string) error {
	c.logger.Debugf("OnStreamOpen")
	return nil
}

func (c Callbacks) OnStreamClosed(i int64) {
	c.logger.Debugf("OnStreamClosed")
}

func (c Callbacks) OnStreamRequest(i int64, req *discoverygrpc.DiscoveryRequest) error {
	c.logger.Infof("OnStreamRequest", i, req)
	return nil
}

func (c Callbacks) OnStreamResponse(i int64, req *discoverygrpc.DiscoveryRequest, res *discoverygrpc.DiscoveryResponse) {
	c.logger.Infof("OnStreamResponse", i, req, res)
}
