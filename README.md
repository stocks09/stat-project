# Stat Test Project Setup 

## Techstack Used
1. Sails
2. Skeleton (Responsive Grid Layout) - http://getskeleton.com/
3. NodeJS with Npm 

## Install NodeJS 


## Install sailsjs 
### On Mac
cmd>sudo npm -g install sails

### On Windows
cmd>npm -g install sails

### Install grunt-cli
cmd>npm install -g grunt-cli

### Install all modules dependancy for this project
cmd>npm install



## Connection to MySQL

Please provide MySQL connection information in under project /config/connections.js 

 
statMysqlServer: {
     adapter: 'sails-mysql',
     host: 'localhost',
     user: 'stat_user',  
     password: 'statpass',  
     database: 'statProjectDB'  
}


## Database Setup
 
### Run SQL Script 'statProjectDB_rankings.sql' against MySQL to create database and 'rankings' table
statProjectDB_rankings.sql is located under stat-project/data/dbschema/

 

## Start NodeJS Server
cmd>sails lift

## Go to Visualization page
URL http://localhost:1337
 


