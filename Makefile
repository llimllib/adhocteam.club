# currently the program is running as a `go run` in a tmux session. Is that good enough?
# probably haha
.PHONY: push
push:
	rsync -avuz main.go hubvan:/srv/adhocteam.club
	rsync -avuz static/*.png static/*.html static/*.js hubvan:/srv/adhocteam.club/static/
