Instructions to run the app
===========================

Warning! The files under revisions folder has been already processed, if new data sets are need, please delete all files under revisions folder, and follow the steps below.
---------
1. Delete all the hidden files and irrelative files under revisions folder
1. Run the process.js file under the public-data folder
1. Open iTerm(terminal) and navigate to the public-data-revisions folder, then run command:
 ls -1 *.json | while read jsonfile; do mongoimport -h localhost -d wikilatic -c revisions --file $jsonfile --jsonArray --type json; done
1. Open the setrole.js file and make sure that line 34 was commented and run it.
1. Open the setrole.js file and make sure that line 33 was uncommented and line 34 was commented and then run it.
1. Open config.json file under root folder, set "firstLoad" to "0".
1. run the app.js and wait for several seconds until the "Bulk update role: rgl finished".

Warning! If no new data set is needed. Please follow the steps below.
---------
1. Open iTerm(terminal) and navigate to the public-data-revisions folder, then run command:
 ls -1 *.json | while read jsonfile; do mongoimport -h localhost -d wikilatic -c revisions --file $jsonfile --jsonArray --type json; done
1. Open the setrole.js file and make sure that line 34 was commented and run it.
1. Open the setrole.js file and make sure that line 33 was uncommented and line 34 was commented and then run it.
1. Open config.json file under root folder, set "firstLoad" to "0".
1. run the app.js and wait for several seconds until the "Bulk update role: rgl finished".
