# currently the program is running as a `go run` in a tmux session. Is that good enough?
# probably haha
.PHONY: push
push: ateam
	rsync -avuz ateam hubvan:/srv/adhocteam.club
	rsync -avuz static/*.png static/*.html static/*.js hubvan:/srv/adhocteam.club/static/

ateam: main.go
	GOOS=linux GOARCH=amd64 go build -o ateam main.go
