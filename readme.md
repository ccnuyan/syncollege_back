# features

# how to use

## global scope modules  
    npm i -g babel-cli react-native-cli webpack webpack-dev-server eslint mocha nodemon electron

## modules
    npm i

## chrome 
    chrome://flags/#allow-insecure-localhost
allow

## dev mode
    npm run fe-dev  // frontend  
    npm run wp-dev  // webpack

## nginx-config
    server {
        # server entry
        listen  80;
        location /api/ {
            # frontend
            proxy_pass http://localhost:17000/;
        }
    }

## pages

## prod mode
`npm start`

## vscode plugin
    eslint

## deployment

## docker deployment
...