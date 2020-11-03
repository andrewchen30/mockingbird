package service

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/gorilla/schema"
	"github.com/lab-envoy/pkg/utils"
	"github.com/rs/cors"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
)

type OperationServerConf struct {
	Port uint
}

type OperationServerBase struct {
	Logger       *utils.Logger
	SnapshotCtrl *SnapshotController
}

func NewHttpOperationServer(opConf *OperationServerConf, base *OperationServerBase) *http.Server {

	s := NewOperationServer(base)

	router := mux.NewRouter()
	router.Methods("GET").Path("/").HandlerFunc(s.Health)

	router.Path("/api/proxy").Methods("GET").HandlerFunc(s.ListProxy)           // TODO: implement it
	router.Path("/api/proxy").Methods("POST").HandlerFunc(s.AddProxy)           // TODO: implement it
	router.Path("/api/proxy/{id}").Methods("PUT").HandlerFunc(s.UpdateProxy)    // TODO: implement it
	router.Path("/api/proxy/{id}").Methods("DELETE").HandlerFunc(s.RemoveProxy) // TODO: implement it

	router.Path("/api/mocker").Methods("GET").HandlerFunc(s.ListMocker)
	router.Path("/api/mocker").Methods("POST").HandlerFunc(s.AddMocker)
	router.Path("/api/mocker/{id}").Methods("PUT").HandlerFunc(s.UpdateMocker)
	router.Path("/api/mocker/{id}").Methods("DELETE").HandlerFunc(s.RemoveMocker)

	router.PathPrefix("/admin").HandlerFunc(s.RenderAdmin)
	router.PathPrefix("/static").Handler(http.StripPrefix("/static", http.FileServer(http.Dir("/assets/admin/static"))))

	cors := cors.New(cors.Options{
		AllowedMethods:   []string{"POST", "PUT", "DELETE", "GET"},
		AllowedOrigins:   []string{"http://localhost:3001", "http://localhost:3000"},
		AllowCredentials: true,
	})

	return &http.Server{
		Addr:    fmt.Sprintf(":%d", opConf.Port),
		Handler: cors.Handler(router),
	}
}

type OperationServer struct {
	formDecoder         *schema.Decoder
	operationsEndpoints *OperationsEndpoints
}

func NewOperationServer(base *OperationServerBase) *OperationServer {
	formDecoder := schema.NewDecoder()
	formDecoder.SetAliasTag("json")

	return &OperationServer{
		formDecoder:         formDecoder,
		operationsEndpoints: NewOperationsEndpoints(base),
	}
}

func (s *OperationServer) injectReqParam(m map[string]string, body *interface{}) error {

	params := map[string]interface{}{}

	if len(m) == 0 {
		return nil
	}

	for k, v := range m {
		params[k] = v
	}

	// try to parse id to int
	if params["id"] != "" {
		integerID, _ := strconv.ParseInt(m["id"], 10, 0)
		if integerID != 0 {
			params["id"] = int(integerID)
		}
	}

	paramsJson, err := json.Marshal(params)
	if err != nil {
		return err
	}
	if err := json.Unmarshal(paramsJson, body); err != nil {
		return err
	}
	return nil
}

func (s *OperationServer) parseReqBody(r *http.Request, body interface{}) error {
	// parse query string
	r.ParseMultipartForm(33554432)
	if err := s.formDecoder.Decode(body, r.Form); err != nil {
		return err
	}

	if err := s.injectReqParam(mux.Vars(r), &body); err != nil {
		return err
	}

	if r.Method == http.MethodPost || r.Method == http.MethodPut {
		// parse json body
		bs, err := ioutil.ReadAll(r.Body)
		if err != nil {
			return err
		}
		if err := json.Unmarshal(bs, body); err != nil {
			return err
		}
	}
	return nil
}

func (s *OperationServer) renderResBody(w http.ResponseWriter, status int, bs []byte) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	if _, err := w.Write(bs); err != nil {
		log.Println(err)
	}
}

func (s *OperationServer) Health(w http.ResponseWriter, r *http.Request) {
	var (
		reqBody = &HealthReq{}
		resBody = &HealthRes{}
	)
	if err := s.parseReqBody(r, reqBody); err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	resBody, err := s.operationsEndpoints.Health(context.Background(), reqBody)
	if err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	result, err := json.Marshal(*resBody)
	if err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	s.renderResBody(w, 200, result)
}

func (s *OperationServer) AddProxy(w http.ResponseWriter, r *http.Request) {
	var (
		reqBody = &AddProxyReq{}
		resBody = &AddProxyRes{}
	)
	if err := s.parseReqBody(r, reqBody); err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	resBody, err := s.operationsEndpoints.AddProxy(context.Background(), reqBody)
	if err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	result, err := json.Marshal(*resBody)
	if err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	s.renderResBody(w, 201, result)
}

func (s *OperationServer) UpdateProxy(w http.ResponseWriter, r *http.Request) {
	var (
		reqBody = &UpdateProxyReq{}
		resBody = &UpdateProxyRes{}
	)
	if err := s.parseReqBody(r, reqBody); err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	resBody, err := s.operationsEndpoints.UpdateProxy(context.Background(), reqBody)
	if err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	result, err := json.Marshal(*resBody)
	if err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	s.renderResBody(w, 200, result)
}

func (s *OperationServer) ListProxy(w http.ResponseWriter, r *http.Request) {
	var (
		reqBody = &ListProxyReq{}
		resBody = &ListProxyRes{}
	)
	if err := s.parseReqBody(r, reqBody); err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	resBody, err := s.operationsEndpoints.ListProxy(context.Background(), reqBody)
	if err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	result, err := json.Marshal(*resBody)
	if err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	s.renderResBody(w, 200, result)
}

func (s *OperationServer) RemoveProxy(w http.ResponseWriter, r *http.Request) {
	var (
		reqBody = &RemoveProxyReq{}
		resBody = &RemoveProxyRes{}
	)
	if err := s.parseReqBody(r, reqBody); err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	resBody, err := s.operationsEndpoints.RemoveProxy(context.Background(), reqBody)
	if err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	result, err := json.Marshal(*resBody)
	if err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	s.renderResBody(w, 204, result)
}

func (s *OperationServer) AddMocker(w http.ResponseWriter, r *http.Request) {
	var (
		reqBody = &AddMockerReq{}
		ctx     = context.Background()
	)
	defer ctx.Done()

	if err := s.parseReqBody(r, reqBody); err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	resBody, err := s.operationsEndpoints.AddMocker(ctx, reqBody)

	if err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	result, err := json.Marshal(*resBody)
	if err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	s.renderResBody(w, 201, result)
}

func (s *OperationServer) UpdateMocker(w http.ResponseWriter, r *http.Request) {
	var (
		reqBody = &UpdateMockerReq{}
		resBody = &UpdateMockerRes{}
	)
	if err := s.parseReqBody(r, reqBody); err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	resBody, err := s.operationsEndpoints.UpdateMocker(context.Background(), reqBody)
	if err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	result, err := json.Marshal(*resBody)
	if err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	s.renderResBody(w, 200, result)
}

func (s *OperationServer) ListMocker(w http.ResponseWriter, r *http.Request) {
	var (
		reqBody = &ListMockerReq{}
		resBody = &ListMockerRes{}
	)
	if err := s.parseReqBody(r, reqBody); err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	resBody, err := s.operationsEndpoints.ListMocker(context.Background(), reqBody)
	if err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	result, err := json.Marshal(*resBody)
	if err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	s.renderResBody(w, 200, result)
}

func (s *OperationServer) RemoveMocker(w http.ResponseWriter, r *http.Request) {
	var (
		reqBody = &RemoveMockerReq{}
		resBody = &RemoveMockerRes{}
	)
	if err := s.parseReqBody(r, reqBody); err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	resBody, err := s.operationsEndpoints.RemoveMocker(context.Background(), reqBody)
	if err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	result, err := json.Marshal(*resBody)
	if err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	s.renderResBody(w, 204, result)
}
