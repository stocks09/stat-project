# Stat Test Project Instructions 

## Techstack Used
1. Sails
2. Skeleton (Responsive Grid Layout) - http://getskeleton.com/
3. NodeJS with Npm 
4. EJS 
5. ChartJS

## Install NodeJS and NPM (Node Package Manager)

### Download NodeJS
1. Download installer at https://nodejs.org/en/
2. Run the installer
3. Follow the prompts

### Test NodeJS & NPM are successfully installed
cmd>node -v
cmd>npm -v


## Install sailsjs 
### On Mac
cmd>sudo npm -g install sails

### On Windows
cmd>npm -g install sails
 

### Install all modules dependancy for this project
cmd>npm install


## Connection to MySQL

Please replace default MySQL connection information in the connections.js found under project /config/ 


statMysqlServer: 
{
     adapter: 'sails-mysql',
     host: 'YOUR_HOST_NAME',
     user: 'stat_user',  
     password: 'PASSWORD',  
     database: 'statProjectDB'  
}


## Database Setup

### SQL Dump
Please run SQL Script 'statProjectDB_rankings.sql' against MySQL to create 'statProjectDB' database and 'rankings' table.

statProjectDB_rankings.sql is located under stat-project/data/dbschema/

 
## Start NodeJS Server
cmd>sails lift

## Go to Visualization page
URL http://localhost:1337

 


