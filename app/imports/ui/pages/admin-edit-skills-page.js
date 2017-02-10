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
import {SkillGraphCollection} from '../../api/skill-graph/SkillGraphCollection.js';
import {EdgesCollection} from '../../api/skill-graph/EdgesCollection.js';

// consts to use in reactive dicts
const displayErrorMessages = 'displayErrorMessages';

const homeActive = 'homeActive';
const eventsActive = 'eventsActive';
const friendsActive = 'friendsActive';

let skillsCollection;

Template.Edit_Skills_Page.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('UserData');  // extended Meteor.user collection data
    this.subscribe('Users');
    this.subscribe('Projects');
    SkillGraphCollection.subscribe();
    EdgesCollection.subscribe();
    skillsCollection = SkillGraphCollection.find()
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
Template.Edit_Skills_Page.helpers({
  userDataField(fieldVal) {
    // here, we search by username, which we assume to be uniq.
    const user = Meteor.users.findOne({ username: Meteor.user().username });  // returns undefined if no matching doc. found
    // See https://dweldon.silvrback.com/guards to understand '&&' in next line.
    // once the subcribed collection has loaded, if the user exists, then return the specified fieldVal
    return user && user[fieldVal];
  },
  firstName: function () {
    return Meteor.user().username;
  },
  userId: function () {
    return Meteor.userId();
  },
  siteAdmin() {
    const user = Users.findOne({ username: Meteor.user().profile.name });
    const bool = user['isSiteAdmin'];
    if (bool == true) {
      return true;
    } else {
      return false;
    }
  },
  countProjects: function () {
    return Projects.find().fetch().length;
  },
  countUsers: function () {
    return Users.find().fetch().length;
  },
  countSkills: function () {
    return SkillGraphCollection.find().fetch().length;
  },
  countEdges: function () {
    return EdgesCollection.find().fetch().length;
  },
  'foundSkills': function() {
    console.log(skillsCollection.fetch());
    return skillsCollection;
  },
});


Template.Edit_Skills_Page.onRendered(function enableSemantic() {

});

Template.Edit_Skills_Page.events({

});