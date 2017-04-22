/**
 * Created by neilteves on 01/28/2017.
 */
import {Template} from 'meteor/templating';
import {ReactiveDict} from 'meteor/reactive-dict';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {_} from 'meteor/underscore';
import { Meteor } from 'meteor/meteor'  // to access Meteor.users collection
import {Projects, ProjectsSchema} from '../../api/projects/projects.js';
import {Users, UsersSchema} from '../../api/users/users.js';

// consts to use in reactive dicts
const displayErrorMessages = 'displayErrorMessages';
const utils = require('../../api/skill-graph/graphUtilities');  // to use the make readable function
var _dep = new Deps.Dependency(); // allows search result to update reactivley

const homeActive = 'homeActive';
const eventsActive = 'eventsActive';
const friendsActive = 'friendsActive';

Template.Edit_Users_Page.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('UserData');  // extended Meteor.user collection data
    this.subscribe('Users');
    this.subscribe('Projects');
  });

  // use reactive dict to store error messages
  this.messageFlags = new ReactiveDict();  // recall, reactive dicts can store template key/vals w/out refreshing
  this.messageFlags.set(displayErrorMessages, false);

  this.navMenuActive = new ReactiveDict();
  this.navMenuActive.set(homeActive, true);
  this.navMenuActive.set(eventsActive, false);
  this.navMenuActive.set(friendsActive, false);
});

// useful thing to note, all Collection docs. have a _id key that is uniq. to that doc
Template.Edit_Users_Page.helpers({
  siteAdmin() {
    const user = Users.findOne({ username: Meteor.user().profile.name });
    const bool = user['isSiteAdmin'];
    if (bool == true) {
      return true;
    } else {
      return false;
    }
  },
  'foundUsers': function() {
    _dep.depend();  // allows helper to run reactively, see http://stackoverflow.com/a/18216255
    return Users.find().fetch();
  },
});


Template.Edit_Users_Page.onRendered(function enableSemantic() {

});

Template.Edit_Users_Page.events({
  'submit .form-unrestrict-user'(event, instance) {
    event.preventDefault();

    const user_ID = event.target.userId.value;
    // console.log(user_ID);

    Users.update({ _id: user_ID }, { $set: { isRestricted: false } });

    const targetUserEmail = Users.findOne({ _id: user_ID }).username + "@hawaii.edu";
    htmlMsg = "<div style='border: 3px solid #27AAE1; border-radius: 3px; padding-top: 20px;'>" +
        "<a href='http://www.alloy.rocks'><img src='https://github.com/alloyteams/alloy/blob/master/app/public/images/alloy-wordmark.png?raw=true'" +
        "style='display: block; margin: auto;'></a><br>" +
        "<div style='background-color: #F8F8F8;'>" +
        "<div style='text-align: center; font-size: large; max-width: 450px; margin: 0 auto; padding: 10px;'>" +
        "The restriction on your account has been lifted." +
        "</div></div></div>";

    // Sending an email to alloy email account about REPORT
    Meteor.call(
        'sendHtmlEmail',
        targetUserEmail,
        'alloyUH@gmail.com',
        'ALLOY-NOTIFICATION-RESTRICTION-REMOVED',
        htmlMsg
    );
    // console.log("email sent");

    _dep.changed();
  },
  'submit .form-restrict-user'(event, instance) {
    event.preventDefault();

    const user_ID = event.target.userId.value;
    // console.log(user_ID);

    const user = Users.findOne({ _id: user_ID });
    Users.update({ _id: user_ID }, { $set: { isRestricted: true } });

    const targetUserEmail = Users.findOne({ _id: user_ID }).username + "@hawaii.edu";
    htmlMsg = "<div style='border: 3px solid #27AAE1; border-radius: 3px; padding-top: 20px;'>" +
        "<a href='http://www.alloy.rocks'><img src='https://github.com/alloyteams/alloy/blob/master/app/public/images/alloy-wordmark.png?raw=true'" +
        "style='display: block; margin: auto;'></a><br>" +
        "<div style='background-color: #F8F8F8;'>" +
        "<div style='text-align: center; font-size: large; max-width: 450px; margin: 0 auto; padding: 10px;'>" +
        "Your account has been RESTRICTED.  Please contact alloyUH@gmail.com for more information." +
        "</div></div></div>";

    // Sending an email to alloy email account about REPORT
    Meteor.call(
        'sendHtmlEmail',
        targetUserEmail,
        'alloyUH@gmail.com',
        'ALLOY-NOTIFICATION-USER-RESTRICTED',
        htmlMsg
    );
    // console.log("email sent");

    _dep.changed();
  }
});