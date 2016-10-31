/**
 * Created by reedvilanueva on 10/17/16.
 */
import { Contacts } from '../../api/contacts/contacts.js';
import { Projects } from '../../api/projects/projects.js';
import { Meteor } from 'meteor/meteor';

// 'autopublish' pkg has been removed
Meteor.publish('Contacts', function publishContactsData() {
  return Contacts.find();
});

// By default, only the current user’s username, emails and profile are published to the client
// see https://docs.meteor.com/api/accounts.html#Meteor-users
Meteor.publish("UserData", function () {
  if (this.userId) {
    // publish our extended Meteor.user collection data to client
    return Meteor.users.find({_id: this.userId},
        {fields: {
                  "projects": 1,
                  'events': 1,
                  "adminProjects": 1,
                  'isSiteAdmin': 1
                 }});
  } else {
    this.ready();
  }
});

Meteor.publish('Projects', function publishUsersData() {
  return Projects.find();
});


