package service

import (
	"github.com/envoyproxy/go-control-plane/pkg/cache/v3"
	"github.com/lab-envoy/pkg/dao"
	"github.com/lab-envoy/pkg/utils"
)

type SnapshotController struct {
	cache.SnapshotCache
	Dao    *dao.InternalMemorySnapshot
	logger utils.Logger
	nodeId string
}

func NewSnapshotController(nodeId string, cacheDao *dao.InternalMemorySnapshot, logger utils.Logger) SnapshotController {
	return SnapshotController{
		SnapshotCache: cache.NewSnapshotCache(false, cache.IDHash{}, logger),
		Dao:           cacheDao,
		logger:        logger,
		nodeId:        nodeId,
	}
}

func (ctrl *SnapshotController) Init() {
	// TODO: import default setting
}

func (ctrl *SnapshotController) UnshiftRouter(ezr *dao.ProxyRoute, refresh bool) error {
	if err := ctrl.Dao.UnshiftRouter(ezr); err != nil {
		return err
	}
	if refresh {
		return ctrl.RefreshSnapshot()
	}
	return nil
}

func (ctrl *SnapshotController) UnshiftDirectResponse(dr *dao.DirectResponse, refresh bool) error {
	if err := ctrl.Dao.UnshiftDirectRes(dr); err != nil {
		return nil
	}
	if refresh {
		return ctrl.RefreshSnapshot()
	}
	return nil
}

func (ctrl *SnapshotController) RefreshSnapshot() error {
	snapshot, err := ctrl.Dao.GenerateSnapshot()
	if err != nil {
		return err
	}
	if err := snapshot.Consistent(); err != nil {
		ctrl.logger.Errorf("snapshot inconsistency: %+v\n%+v", snapshot, err)
		return err
	}
	if err := ctrl.SetSnapshot(ctrl.nodeId, snapshot); err != nil {
		ctrl.logger.Errorf("snapshot error %q for %+v", err, snapshot)
		return err
	}
	ctrl.logger.Infof("snapshot refreshed")
	return nil
}
