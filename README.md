# cpu-monitor
Browser-based CPU load monitoring application

![img](https://content.screencast.com/users/amcdaniel22/folders/Snagit/media/fff1fd26-d70e-45b1-b677-f9d41d608e4c/04.06.2020-10.32.png)

## Running
- `yarn install`
- `yarn start:api`
- `yarn start:web`
- http://localhost:3000

## Commands
- `yarn start:web`: Starts web app using CRA
- `yarn start:api`: Starts web server
- `yarn build`: Builds the web app for production
- `yarn test:web`: Tests the web app

## Architecture
- Web: Create React App using Typescript using reaviz (my library) for charting
- API: Express / Socket.io Server

## TODO Improvements
- Improve UI start time - currently has to wait for next 10s interval
- Improve charts - Add some ability to set markers when a threshold exceeded
