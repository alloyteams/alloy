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

Template.Edit_Projects_Page.onCreated(function onCreated() {
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
Template.Edit_Projects_Page.helpers({
  siteAdmin() {
    const user = Users.findOne({ username: Meteor.user().profile.name });
    const bool = user['isSiteAdmin'];
    if (bool == true) {
      return true;
    } else {
      return false;
    }
  },
});


Template.Edit_Projects_Page.onRendered(function enableSemantic() {

});

Template.Edit_Projects_Page.events({

});