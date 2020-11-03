package dao

import (
	"fmt"
	"github.com/envoyproxy/go-control-plane/pkg/cache/types"
	"github.com/envoyproxy/go-control-plane/pkg/cache/v3"
	"sync"
)

const (
	ListenerName = "listener_01"
	ListenerPort = 10000
	RouteName    = "route_01"
)

func NewInternalMemorySnapshotDao() InternalMemorySnapshot {
	return InternalMemorySnapshot{
		mutex:          sync.Mutex{},
		currentVersion: 0,
		easyRoutes:     []ProxyRoute{},
	}
}

type InternalMemorySnapshot struct {
	routeName      string
	mutex          sync.Mutex
	currentVersion int
	easyRoutes     []ProxyRoute
	directRes      []DirectResponse
}

type Resource struct {
	endpoints []types.Resource
	clusters  []types.Resource
	routes    []types.Resource
	listeners []types.Resource
	runtimes  []types.Resource
	secrets   []types.Resource
}

func (i *InternalMemorySnapshot) getNextEzRouteID() int {
	id := 1
	for _, ez := range i.easyRoutes {
		if ez.ID > id {
			id = ez.ID
		}
	}
	return id + 1
}

func (i *InternalMemorySnapshot) getNextDirectResID() int {
	id := 1
	for _, ez := range i.directRes {
		if ez.ID > id {
			id = ez.ID
		}
	}
	return id + 1
}

func (i *InternalMemorySnapshot) UnshiftRouter(ez *ProxyRoute) error {
	i.mutex.Lock()
	ez.ID = i.getNextEzRouteID()
	i.easyRoutes = append([]ProxyRoute{*ez}, i.easyRoutes...)
	i.mutex.Unlock()
	return nil
}

func (i *InternalMemorySnapshot) UpdateRouterByID(newEz *ProxyRoute) error {
	i.mutex.Lock()
	for idx, ez := range i.easyRoutes {
		if ez.ID == newEz.ID {
			i.easyRoutes[idx] = *newEz
		}
	}
	i.mutex.Unlock()
	return nil
}

func (i *InternalMemorySnapshot) ListRouter() ([]ProxyRoute, error) {
	return i.easyRoutes, nil
}

func (i *InternalMemorySnapshot) RemoveRouterByID(id int) error {
	i.mutex.Lock()
	var arr []ProxyRoute
	for idx, ez := range i.easyRoutes {
		if ez.ID != id {
			arr = append(arr, i.easyRoutes[idx])
		}
	}
	i.easyRoutes = arr
	i.mutex.Unlock()
	return nil
}

func (i *InternalMemorySnapshot) UnshiftDirectRes(dr *DirectResponse) error {
	i.mutex.Lock()
	dr.ID = i.getNextDirectResID()
	i.directRes = append([]DirectResponse{*dr}, i.directRes...)
	i.mutex.Unlock()
	return nil
}

func (i *InternalMemorySnapshot) UpdateDirectResByID(newDr *DirectResponse) error {
	i.mutex.Lock()
	for idx, dr := range i.directRes {
		if dr.ID == newDr.ID {
			i.directRes[idx] = *newDr
		}
	}
	i.mutex.Unlock()
	return nil
}

func (i *InternalMemorySnapshot) ListDirectRes() ([]DirectResponse, error) {
	return i.directRes, nil
}

func (i *InternalMemorySnapshot) RemoveDirectResByID(id int) error {
	i.mutex.Lock()
	var arr []DirectResponse
	for idx, dr := range i.directRes {
		if dr.ID != id {
			arr = append(arr, i.directRes[idx])
		}
	}
	i.directRes = arr
	i.mutex.Unlock()
	return nil
}

func (i *InternalMemorySnapshot) GenerateSnapshot() (cache.Snapshot, error) {

	i.currentVersion += 1

	src := Resource{
		listeners: []types.Resource{
			makeHTTPListener(ListenerName, RouteName),
		},
		routes: []types.Resource{
			makeRoute(RouteName, i.easyRoutes, i.directRes),
		},
		clusters: parseClustersToResource(
			makeClusters(i.easyRoutes),
		),
	}

	return cache.NewSnapshot(
		fmt.Sprintf("%d", i.currentVersion),
		src.endpoints,
		src.clusters,
		src.routes,
		src.listeners,
		src.runtimes,
		src.secrets,
	), nil
}
