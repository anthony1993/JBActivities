# Journey Builder Custom Activities
## Contains a generic activity

**NOTE:** Deploy individual branches via multiple Heroku apps.

**IMPORTANT:** In the sample edit page configuration /JBActivities/blob/master/public/ixn/activities/generic-activity/sample-config.html you will need to edit the HTML to reflect the context of your Heroku app. 

Look for TODO and other comments in that file! 

If you do not update the HTML your edit configuration in Journey Builder will hang!

### Heroku Config Vars

* ACTIVITY_DESCRIPTION - description of activity
* ACTIVITY_NAME - name of activity that will be shown in JB
* HEROKU_APP_NAME - name of heroku app
* KEY - key of JB activity created in app center
* CA_IMG_40 - 40px Custom Activity logo location (absolute URL required)
* CA_IMG_15 - 15px Custom Activity logo location (absolute URL required)
* EXECUTE_ENDPOINT_URL - full endpoint URL to send JB Activity events (can leave as default)
* ENDPOINT_NAME - polar-taiga
* CA_EDIT_URL - https URL of the edit window page (template can be found in this github repo)
* EDIT_HEIGHT - height of the Custom Activity config window 
* EDIT_WIDTH - width of the Custom Activity config window
* CA_NUM_STEPS - the number of configuration steps your Custom Activity will have
* NUM_OUTCOMES - if this activity is to be used as a flow control, set a value of greater than 0 here
* BRANCH[0-x] - if you want to specify names for the branches, add a key of BRANCH0, or BRANCH1 and the value should be what you want displayed in Journey Builder.

The above parameters and their descriptions will be available when you click on the "Deploy" button below.

<a href="https://heroku.com/deploy">
  <img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy">
</a>
