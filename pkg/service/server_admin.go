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

type AdminServerConfig struct {
	Port          uint
	Logger        *utils.Logger
	SnapshotCtrl  *SnapshotController
	SocketHandler *SocketHandler
}

func NewHttpAdminServer(c *AdminServerConfig) *http.Server {

	s := NewAdminServer(c)

	cors := cors.New(cors.Options{
		AllowCredentials: true,
		AllowedMethods:   []string{"POST", "PUT", "DELETE", "GET", "OPTIONS"},
		AllowedOrigins:   []string{"http://localhost:3001", "http://localhost:3000"},
	})

	router := mux.NewRouter()

	router.Methods("GET").Path("/").HandlerFunc(s.Health)

	router.Path("/api/proxy").Methods("GET").HandlerFunc(s.ListProxy)
	router.Path("/api/proxy").Methods("POST").HandlerFunc(s.AddProxy)
	router.Path("/api/proxy/{id}").Methods("PUT").HandlerFunc(s.UpdateProxy)
	router.Path("/api/proxy/{id}").Methods("DELETE").HandlerFunc(s.RemoveProxy)

	router.Path("/api/mocker").Methods("GET").HandlerFunc(s.ListMocker)
	router.Path("/api/mocker").Methods("POST").HandlerFunc(s.AddMocker)
	router.Path("/api/mocker/{id}").Methods("PUT").HandlerFunc(s.UpdateMocker)
	router.Path("/api/mocker/{id}").Methods("DELETE").HandlerFunc(s.RemoveMocker)

	router.PathPrefix("/admin").Methods("GET").HandlerFunc(s.RenderAdmin)
	router.PathPrefix("/static").Methods(http.MethodGet).Handler(
		http.StripPrefix("/static", http.FileServer(http.Dir("/assets/admin/static"))),
	)
	router.PathPrefix("/socket.io").Handler(c.SocketHandler.Server)

	return &http.Server{
		Addr:    fmt.Sprintf(":%d", c.Port),
		Handler: cors.Handler(router),
	}
}

type AdminServer struct {
	formDecoder  *schema.Decoder
	adminService *AdminService
}

func NewAdminServer(base *AdminServerConfig) *AdminServer {
	formDecoder := schema.NewDecoder()
	formDecoder.SetAliasTag("json")
	return &AdminServer{
		formDecoder:  formDecoder,
		adminService: NewAdminService(base),
	}
}

func (s *AdminServer) injectReqParam(m map[string]string, body *interface{}) error {

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

func (s *AdminServer) parseReqBody(r *http.Request, body interface{}) error {
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

func (s *AdminServer) renderResBody(w http.ResponseWriter, status int, bs []byte) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	if _, err := w.Write(bs); err != nil {
		log.Println(err)
	}
}

func (s *AdminServer) Health(w http.ResponseWriter, r *http.Request) {
	var (
		reqBody = &HealthReq{}
		resBody = &HealthRes{}
	)
	if err := s.parseReqBody(r, reqBody); err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	resBody, err := s.adminService.Health(context.Background(), reqBody)
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

func (s *AdminServer) AddProxy(w http.ResponseWriter, r *http.Request) {
	var (
		reqBody = &AddProxyReq{}
		resBody = &AddProxyRes{}
	)
	if err := s.parseReqBody(r, reqBody); err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	resBody, err := s.adminService.AddProxy(context.Background(), reqBody)
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

func (s *AdminServer) UpdateProxy(w http.ResponseWriter, r *http.Request) {
	var (
		reqBody = &UpdateProxyReq{}
		resBody = &UpdateProxyRes{}
	)
	if err := s.parseReqBody(r, reqBody); err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	resBody, err := s.adminService.UpdateProxy(context.Background(), reqBody)
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

func (s *AdminServer) ListProxy(w http.ResponseWriter, r *http.Request) {
	var (
		reqBody = &ListProxyReq{}
		resBody = &ListProxyRes{}
	)
	if err := s.parseReqBody(r, reqBody); err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	resBody, err := s.adminService.ListProxy(context.Background(), reqBody)
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

func (s *AdminServer) RemoveProxy(w http.ResponseWriter, r *http.Request) {
	var (
		reqBody = &RemoveProxyReq{}
		resBody = &RemoveProxyRes{}
	)
	if err := s.parseReqBody(r, reqBody); err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	resBody, err := s.adminService.RemoveProxy(context.Background(), reqBody)
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

func (s *AdminServer) AddMocker(w http.ResponseWriter, r *http.Request) {
	var (
		reqBody = &AddMockerReq{}
		ctx     = context.Background()
	)
	defer ctx.Done()

	if err := s.parseReqBody(r, reqBody); err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	resBody, err := s.adminService.AddMocker(ctx, reqBody)

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

func (s *AdminServer) UpdateMocker(w http.ResponseWriter, r *http.Request) {
	var (
		reqBody = &UpdateMockerReq{}
		resBody = &UpdateMockerRes{}
	)
	if err := s.parseReqBody(r, reqBody); err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	resBody, err := s.adminService.UpdateMocker(context.Background(), reqBody)
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

func (s *AdminServer) ListMocker(w http.ResponseWriter, r *http.Request) {
	var (
		reqBody = &ListMockerReq{}
		resBody = &ListMockerRes{}
	)
	if err := s.parseReqBody(r, reqBody); err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	resBody, err := s.adminService.ListMocker(context.Background(), reqBody)
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

func (s *AdminServer) RemoveMocker(w http.ResponseWriter, r *http.Request) {
	var (
		reqBody = &RemoveMockerReq{}
		resBody = &RemoveMockerRes{}
	)
	if err := s.parseReqBody(r, reqBody); err != nil {
		s.renderResBody(w, 500, []byte(err.Error()))
		return
	}
	resBody, err := s.adminService.RemoveMocker(context.Background(), reqBody)
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
