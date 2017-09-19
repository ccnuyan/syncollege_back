    git pull
    docker rm -f sb001
    docker rmi -f syncollege-back:001
    docker build -t syncollege-back:001 .
    docker run -d --name sb001 -p 27000:17000 syncollege-back:001
    docker logs sb001