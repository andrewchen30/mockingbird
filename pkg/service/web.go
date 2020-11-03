package service

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

func (s *OperationServer) RenderAdmin(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")

	html, err := ioutil.ReadFile("/assets/admin/index.html")
	if err != nil {
		html = []byte(fmt.Sprintf("render admin html failed %s", err.Error()))
	}
	if _, err := w.Write(html); err != nil {
		log.Println(err)
	}
}
