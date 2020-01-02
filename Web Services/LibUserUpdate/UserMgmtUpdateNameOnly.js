var logger = require('../log');
var Q = require('q');

module.exports.getCredentials = function () {
    var options = {};
    options.customerAlias = "CUSTOMERALIAS";
    options.databaseAlias = "DATABASEALIAS";
    options.userId = "USERID";
    options.password = "PASSWORD";
    options.clientId = 'DEVELOPERKEY';
    options.clientSecret = 'DEVELOPERSECRET';
    return options;
};

module.exports.main = function (ffCollection, vvClient, response) {
    /*Script Name:  UserMgmtUpdateNameOnly
     Customer:      VV Code Example.
     Purpose:       The purpose of this script is to update a user's name by calling LibUserUpdate.
     Parameters:    The following represent variables passed into the function:  
                    User Managment Form fields. 

     Return Array:  The following represents the array of information returned to the calling function.  This is a standardized response.
                    Any item in the array at points 2 or above can be used to return multiple items of information.
                    0 - Status: Success, Error
		            1 - Message
                    2 - User GUID
                    3 - User Site ID

     Pseudocode:   1. Validate information
                   2. Call LibUserUpdate

     Date of Dev:   01/02/2020
     Last Rev Date: 

     Revision Notes:
     01/02/2020 - Kendra Austin: Initial creation of the business process.

     */

    logger.info('Start of the process UserMgmtUpdateNameOnly at ' + Date());

    //Configuration Variables

    //Script Variables
    var errors = [];                    //Used to hold errors as they are found, to return together.
    var revisionId = ffCollection.getFormFieldByName('REVISIONID');
    var userID = ffCollection.getFormFieldByName('Email').value;
    var firstName = ffCollection.getFormFieldByName('First Name').value;
    var middleInitial = ffCollection.getFormFieldByName('MI').value;
    var lastName = ffCollection.getFormFieldByName('Last Name').value;

    //Initialization of the return object
    var returnObj = [];

    //Start the promise chain
    var result = Q.resolve();

    return result.then(function () {

        //Validate passed in fields
        if (!revisionId || !revisionId.value) {
            errors.push("The REVISIONID parameter was not supplied.")
        }
        else {
            revisionId = revisionId.value;
        }

        //Validate other passed in fields
        if (userID.trim() == '') {
            errors.push('The field that contains the username is not populated. Unable to enable the user. Please contact a system administrator.');
        }

        //Return all validation errors at once.
        if (errors.length > 0) {
            throw new Error(errors);
        }
    })
        .then(function () {

            var updateUserObject = [];

            var userInfo = {};
            userInfo.name = 'Action';
            userInfo.value = 'Update';
            updateUserObject.push(userInfo);

            userInfo = {};
            userInfo.name = 'User ID';
            userInfo.value = userID;
            updateUserObject.push(userInfo);

            userInfo = {};
            userInfo.name = 'First Name';
            userInfo.value = firstName;
            updateUserObject.push(userInfo);

            userInfo = {};
            userInfo.name = 'Middle Initial';
            userInfo.value = middleInitial;
            updateUserObject.push(userInfo);

            userInfo = {};
            userInfo.name = 'Last Name';
            userInfo.value = lastName;
            updateUserObject.push(userInfo);

            return vvClient.scripts.runWebService('LibUserUpdate', updateUserObject).then(function (userResp) {
                //Check for a successful result
                if (userResp.meta.status === 200) {
                    //check userResp.data for success here
                    if (userResp.data[0] == 'Success') {
                        logger.info('User updated successfully.');
                        //LibUserUpdate returns the user GUID. If received successfully, pass back client side
                        if (userResp.data[2]) {
                            returnObj[2] = userResp.data[2];
                        }

                        //LibUserUpdate returns the user site ID. If received successfully, pass back client side
                        if (userResp.data[3]) {
                            returnObj[3] = userResp.data[3];
                        }
                    }
                    else if (userResp.data[0] == 'Error') {
                        throw new Error('The call to update the user returned with an error. ' + userResp.data[1]);
                    }
                    else {
                        throw new Error("The call to update the user returned with an unhandled error. Please try again or contact a system administrator.");
                    }
                }
                else {
                    throw new Error("The call to the UserUpdate library returned with an error status. Status returned was: " + userResp.meta.status);
                }
            });
        })
        .then(function () {
            returnObj[0] = 'Success';
            returnObj[1] = 'User Updated.';
            return response.json(returnObj);
        })
        .catch(function (err) {
            logger.info(JSON.stringify(err));

            returnObj[0] = 'Error';

            if (err && err.message) {
                returnObj[1] = err.message;
            } else {
                returnObj[1] = "An unhandled error has occurred. The message returned was: " + err;
            }

            return response.json(returnObj);
        })
};
