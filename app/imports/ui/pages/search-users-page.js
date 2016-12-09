/**
 * Created by neilteves on 11/17/16.
 */
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor'; // to access Meteor.users collection
import {Users, UsersSchema} from '../../api/users/users.js';
import {SkillGraphCollection} from '../../api/skill-graph/SkillGraphCollection.js';
import {EdgesCollection} from '../../api/skill-graph/EdgesCollection.js'

// to use the makereadable function
const utils = require('../../api/skill-graph/graphUtilities');

// consts to use in reactive dicts
let getInput = '';
let myCursor = Users.find();
Session.set("countFoundUsers", 0);
let countFoundUsers = Session.get("countFoundUsers");

Template.Search_Users_Page.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('Users');
    SkillGraphCollection.subscribe();
    EdgesCollection.subscribe();
  });
});

Template.Search_Users_Page.onRendered(function onRendered() {
  // need to init. jquery plugins AFTER meteor done inserting (eg. with spacebars)
  // in dynamic document. see http://stackoverflow.com/a/30834745
  const instance = this;
  instance.$('.ui.fluid.multiple.selection.search.dropdown')
      .dropdown({
        allowAdditions: true,
      });
});

Template.Search_Users_Page.helpers({
  getGraphSkills() {
    console.log(SkillGraphCollection.getSkills())
    return SkillGraphCollection.getSkills();
  },
  projNum() {
    return countFoundUsers = Session.get("countFoundUsers");
  },
  compareFound() {
    if (Session.get("countFoundUsers") > 0)
    {
      return true;
    } else {
      return false;
    }
  },
  'iterateProjects': function() {
    return myCursor.fetch();
  },
});

Template.Search_Users_Page.events({
  'submit .form-register': function (event, template) {
    event.preventDefault();

    countFoundUsers = Session.set("countFoundUsers", 0);
    // getInput = event.target.searchInput.value;
    getInput = event.target.skills.value;

    console.log('search input: ' + getInput);

    myCursor = Users.find({skills: getInput});
    countFoundUsers = Session.set("countFoundUsers", _.size(myCursor.fetch()));

    // // Prints to console the number of found projects
    // console.log('found projects: ' + Session.get("countFoundProjects"));

    // // .fetch() makes an object Array of what is inside the myCursor variable
    // console.log(myCursor.fetch());

    // // _.size() counts the number of items in the array
    // console.log(_.size(myCursor.fetch()));

    // // i'm calling on the first item in the myCursor.fetch() array
    // console.log(myCursor.fetch()[0]);
    // console.log(myCursor.fetch()[0].projectName);
  },
  'submit .form-clear': function (event, template) {
    event.preventDefault();
    countFoundUsers = Session.set("countFoundUsers", 0);
    myCursor = Users.find({skills: ''});
    countFoundUsers = Session.set("countFoundUsers", _.size(myCursor.fetch()));
  },
});
