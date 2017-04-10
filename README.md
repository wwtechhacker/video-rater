# MovieRater ![](https://app.codeship.com/projects/7cdda2d0-8179-0134-0e32-4ac14629b467/status?branch=master)
Crawl and merge ptt/imdb/yahoo movie data, help easy search high rating movie in Chinese and English.
![](https://asing1001.github.io/portfolio/index/movierater.jpg)

## Quick Start 
`npm install && npm run build && npm start` then open http://localhost:3003

## Developement
Please open two command line:  
For UI developement, server run at http://localhost:3004:
1. `npm start`
2. `npm run webpack`

For server developement, server run at http://localhost:3003:
1. `npm run tsc:w`
2. `npm run nodemon`

## Test
`npm run test`

## Application flow
1. Server start
2. Load data in cache, include recent movie list, all merged data
3. Start scheduler for crawl yahoo/imdb/ptt

## Reference
The project UI is using [Material-UI](https://github.com/callemall/material-ui)
