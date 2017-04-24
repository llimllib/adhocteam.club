// from https://raw.githubusercontent.com/gorilla/websocket/master/examples/command/main.go
package main

import (
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var (
	addr    = flag.String("addr", "127.0.0.1:8080", "http service address")
	cmdPath string
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Maximum message size allowed from peer.
	maxMessageSize = 8192

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Time to wait before force close on connection.
	closeGracePeriod = 10 * time.Second
)

func ping(ws *websocket.Conn, done chan struct{}) {
	ticker := time.NewTicker(pingPeriod)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			log.Println("pinging")
			if err := ws.WriteControl(websocket.PingMessage, []byte{}, time.Now().Add(writeWait)); err != nil {
				log.Println("ping:", err)
			}
		case <-done:
			return
		}
	}
}

func internalError(ws *websocket.Conn, msg string, err error) {
	log.Println(msg, err)
	ws.WriteMessage(websocket.TextMessage, []byte("Internal server error."))
}

var upgrader = websocket.Upgrader{}

var commands = make(chan string)

func serveWs(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade:", err)
		return
	}

	defer ws.Close()

	for {
		cmd := <-commands
		log.Printf("got cmd %s", cmd)
		ws.SetWriteDeadline(time.Now().Add(writeWait))
		log.Printf("writing %s", cmd)
		if err := ws.WriteMessage(websocket.TextMessage, []byte(cmd)); err != nil {
			log.Printf("error writing %s", err)
			ws.Close()
			break
		}
	}
}

func serveHome(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", 405)
		return
	}
	log.Printf("static%s", r.URL.Path)
	http.ServeFile(w, r, fmt.Sprintf("static%s", r.URL.Path))
}

func serveCommand(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", 405)
		return
	}

	buf := make([]byte, 1024*1024)
	num, err := r.Body.Read(buf)
	if err != nil && err != io.EOF {
		log.Printf("read error")
		return
	}

	cmd := string(buf[:num])
	log.Printf("read command %s", cmd)
	commands <- cmd
}

func main() {
	http.HandleFunc("/", serveHome)
	http.HandleFunc("/command", serveCommand)
	http.HandleFunc("/ws", serveWs)
	log.Fatal(http.ListenAndServe(*addr, nil))
}
