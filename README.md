# Census app

Census is an app that allows an admin user to record details of participants. In addition, these records can be updated and marked as inactive (soft-deleted). 

## Running locally
Create .env file with following content
```
CYCLIC_DB= joyous-overcoat-bullCyclicDB
CYCLIC_BUCKET_NAME = cyclic-joyous-overcoat-bull-eu-west-1
CLIENT_ID = EIfN6wd8tvpuCOpoEMG4bjtLb3KwcI6D
ISSUER_BASE_URL = https://dev-52eru17pevbl2nn2.eu.auth0.com
SECRET = RkWwl_nb3Mo67vuNNMVuts43cZAyE1gZC8hIXRCq6s_uIEsnlMMTvmBzVOBqH-Gb
BASE_URL = https://joyous-overcoat-bull.cyclic.app/
```
and run
```
npm install
npm start
```

## Usage

Visit [census] (https://joyous-overcoat-bull.cyclic.app/participants) to see list of all participants. Users must log in with Admin credentials. 

Admin users can get a list of all participants,  add  new participants, update existing participant records, and change the status of a record to remove it from being shown in the list of all participants.

## Contributing

Nicholas Currie

