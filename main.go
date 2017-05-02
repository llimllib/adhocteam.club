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
var clients []*websocket.Conn

func serveWs(w http.ResponseWriter, r *http.Request) {
	log.Println("opening ws")
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade:", err)
		return
	}

	defer ws.Close()

	clients = append(clients, ws)

	for {
		cmd := <-commands
		for i, client := range clients {
			log.Printf("got cmd %s", cmd)
			client.SetWriteDeadline(time.Now().Add(writeWait))
			log.Printf("writing %s", cmd)
			err := client.WriteMessage(websocket.TextMessage, []byte(cmd))
			if err != nil {
				log.Printf("error writing %s", err)
				// remove the client
				clients = append(clients[:i], clients[i+1:]...)
				client.Close()
			}
		}
	}

	log.Println("closing ws")
}

func serveStatic(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", 405)
		return
	}
	log.Printf("%s", r.URL.Path)
	http.ServeFile(w, r, fmt.Sprintf(".%s", r.URL.Path))
}

func serveHome(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", 405)
		return
	}
	log.Printf("%s", r.URL.Path)
	http.ServeFile(w, r, "static/index.html")
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
	w.Write([]byte("OK"))

	log.Printf("read command %s", cmd)
	commands <- cmd
}

func main() {
	log.Println("heyo")
	http.HandleFunc("/static/", serveStatic)
	http.HandleFunc("/command", serveCommand)
	http.HandleFunc("/ws", serveWs)
	http.HandleFunc("/", serveHome)
	log.Fatal(http.ListenAndServe(*addr, nil))
}
