# currently the program is running as a `go run` in a tmux session. Is that good enough?
# probably haha
.PHONY: push
push: ateam
	chmod -R a+r static/
	rsync -avuz ateam hubvan:/srv/adhocteam.club
	rsync -avuz static/*.png static/*.jpg static/*.html static/*.js static/*.mp3 hubvan:/srv/adhocteam.club/static/

ateam: main.go
	GOOS=linux GOARCH=amd64 go build -o ateam main.go

slides:
	FLASK_APP=slides.py FLASK_DEBUG=1 flask run
