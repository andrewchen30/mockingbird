package service

import (
	"github.com/envoyproxy/go-control-plane/pkg/cache/v3"
	"github.com/lab-envoy/pkg/dao"
	"github.com/lab-envoy/pkg/utils"
)

type InitOpt struct {
	InitFile string
}

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

func (ctrl *SnapshotController) Init(opt InitOpt) error {
	if err := ctrl.Dao.LoadFromFile(opt.InitFile); err != nil {
		ctrl.logger.Errorf("Load init config file not found")
		return err
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
