package service

import (
	"context"
	"github.com/lab-envoy/pkg/dao"
	"github.com/lab-envoy/pkg/utils"
)

type Operations interface {
	Health(context.Context, *HealthReq) (*HealthRes, error)

	AddProxy(context.Context, *AddProxyReq) (*AddProxyRes, error)
	UpdateProxy(context.Context, *UpdateProxyReq) (*UpdateProxyRes, error)
	ListProxy(context.Context, *ListProxyReq) (*ListProxyRes, error)
	RemoveProxy(context.Context, *RemoveProxyReq) (*RemoveProxyRes, error)

	AddMocker(context.Context, *AddMockerReq) (*AddMockerRes, error)
	UpdateMocker(context.Context, *UpdateMockerReq) (*UpdateMockerRes, error)
	ListMocker(context.Context, *ListMockerReq) (*ListMockerRes, error)
	RemoveMocker(context.Context, *RemoveMockerReq) (*RemoveMockerRes, error)
}

type OperationsEndpoints struct {
	logger       *utils.Logger
	snapshotCtrl *SnapshotController
}

func NewOperationsEndpoints(base *OperationServerBase) *OperationsEndpoints {
	return &OperationsEndpoints{
		logger:       base.Logger,
		snapshotCtrl: base.SnapshotCtrl,
	}
}

// ===================================================

type HealthReq struct {
}

type HealthRes struct {
	Result string `json:"result"`
}

func (o OperationsEndpoints) Health(_ context.Context, req *HealthReq) (*HealthRes, error) {
	return &HealthRes{
		Result: "ok",
	}, nil
}

// ===================================================

type AddProxyReq struct {
}

type AddProxyRes struct {
}

func (o OperationsEndpoints) AddProxy(_ context.Context, req *AddProxyReq) (*AddProxyRes, error) {
	panic("implement me")
	return &AddProxyRes{}, nil
}

// ===================================================

type UpdateProxyReq struct {
}

type UpdateProxyRes struct {
}

func (o OperationsEndpoints) UpdateProxy(_ context.Context, req *UpdateProxyReq) (*UpdateProxyRes, error) {
	panic("implement me")
}

// ===================================================

type ListProxyReq struct {
}

type ListProxyRes struct {
}

func (o OperationsEndpoints) ListProxy(_ context.Context, req *ListProxyReq) (*ListProxyRes, error) {
	panic("implement me")
}

// ===================================================

type RemoveProxyReq struct {
}

type RemoveProxyRes struct {
}

func (o OperationsEndpoints) RemoveProxy(_ context.Context, req *RemoveProxyReq) (*RemoveProxyRes, error) {
	panic("implement me")
}

// ===================================================

type AddMockerReq struct {
	Desc      string     `json:"desc"`
	Status    dao.Status `json:"status"`
	Prefix    string     `json:"prefix"`
	ReqMethod string     `json:"reqMethod"`
	ResStatus int        `json:"resStatus"`
	ResBody   string     `json:"resBody"`
}

type AddMockerRes struct {
	Mocker *dao.DirectResponse `json:"mocker"`
}

func (o OperationsEndpoints) AddMocker(_ context.Context, req *AddMockerReq) (*AddMockerRes, error) {
	dr := &dao.DirectResponse{
		Status:    req.Status,
		Desc:      req.Desc,
		Prefix:    req.Prefix,
		ReqMethod: req.ReqMethod,
		ResStatus: req.ResStatus,
		ResBody:   req.ResBody,
	}

	if dr.Status == "" {
		dr.Status = dao.StatusActive
	}

	if err := o.snapshotCtrl.UnshiftDirectResponse(dr, true); err != nil {
		return nil, err
	}
	return &AddMockerRes{Mocker: dr}, nil
}

// ===================================================

type UpdateMockerReq struct {
	ID        int        `json:"id"`
	Status    dao.Status `json:"status"`
	Desc      string     `json:"desc"`
	Prefix    string     `json:"prefix"`
	ReqMethod string     `json:"reqMethod"`
	ResStatus int        `json:"resStatus"`
	ResBody   string     `json:"resBody"`
}

type UpdateMockerRes struct {
	Mocker *dao.DirectResponse `json:"mocker"`
}

func (o OperationsEndpoints) UpdateMocker(_ context.Context, req *UpdateMockerReq) (*UpdateMockerRes, error) {
	dr := &dao.DirectResponse{
		ID:        req.ID,
		Status:    req.Status,
		Desc:      req.Desc,
		Prefix:    req.Prefix,
		ReqMethod: req.ReqMethod,
		ResStatus: req.ResStatus,
		ResBody:   req.ResBody,
	}
	if err := o.snapshotCtrl.Dao.UpdateDirectResByID(dr); err != nil {
		return nil, err
	}
	if err := o.snapshotCtrl.RefreshSnapshot(); err != nil {
		return nil, err
	}
	return &UpdateMockerRes{Mocker: dr}, nil
}

// ===================================================

type ListMockerReq struct {
}

type ListMockerRes struct {
	Mockers []dao.DirectResponse `json:"mockers"`
}

func (o OperationsEndpoints) ListMocker(_ context.Context, req *ListMockerReq) (*ListMockerRes, error) {
	mockers, err := o.snapshotCtrl.Dao.ListDirectRes()
	if err != nil {
		return nil, err
	}
	return &ListMockerRes{Mockers: mockers}, nil
}

// ===================================================

type RemoveMockerReq struct {
	ID int `json:"id"`
}

type RemoveMockerRes struct {
}

func (o OperationsEndpoints) RemoveMocker(_ context.Context, req *RemoveMockerReq) (*RemoveMockerRes, error) {
	if err := o.snapshotCtrl.Dao.RemoveDirectResByID(req.ID); err != nil {
		return nil, err
	}
	if err := o.snapshotCtrl.RefreshSnapshot(); err != nil {
		return nil, err
	}
	return &RemoveMockerRes{}, nil
}
