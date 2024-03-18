# Census app

Census is an app that allows an admin user to record details of participants. In addition, these records can be updated and marked as inactive (soft-deleted). 

##Need a Cyclic account where an app can be deployed. 
A .env file needs to be created that includes the following: 
CYCLIC_DB
CYCLIC_BUCKET_NAME
CLIENT_ID
ISSUE_BASE_URL
SECRET
BASE_URL

The above fields can be found at CYCLIC website. 
For local development local credentials needs to be copy and pasted into the terminal before running the app. 
These can be found on the CYCLIC website under "Data/Storage". 


npm install
npm start
```

## Usage

Visit [census] (https://joyous-overcoat-bull.cyclic.app/participants) to see list of all participants. Users must log in with Admin credentials. 

Admin users can get a list of all participants,  add  new participants, update existing participant records, and change the status of a record to remove it from being shown in the list of all participants.

## Contributing

Nicholas Currie

