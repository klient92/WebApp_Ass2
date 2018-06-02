Instructions to run the app
===========================

* Delete all the hidden files and irrelative files under revisions folder
* Run the process.js file under the public-data folder
* Open iTerm(terminal) and navigate to the public-data-revisions folder, then run command:
 ls -1 *.json | while read jsonfile; do mongoimport -h localhost -d wikilatic -c revisions --file $jsonfile --jsonArray --type json; done
* Open the setrole.js file and make sure that line 34 was commented and run it.
* Open the setrole.js file and make sure that line 33 was uncommented and line 34 was commented and then run it.
* run the app.js and wait for several seconds until the "Bulk update role: rgl finished"