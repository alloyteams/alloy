/**
 * Created by neilteves on 01/11/17.
 */
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor'; // to access Meteor.users collection
import {Projects, ProjectsSchema} from '../../api/projects/projects.js';
import {Users, UsersSchema} from '../../api/users/users.js';
import {SkillGraphCollection} from '../../api/skill-graph/SkillGraphCollection.js';
import {EdgesCollection} from '../../api/skill-graph/EdgesCollection.js'

// to use the makereadable function
const utils = require('../../api/skill-graph/graphUtilities');

// consts to use in reactive dicts
const displayErrorMessages = 'displayErrorMessages';

var foundProjects;
Session.set("countFoundProjects", 0);
var countFoundProjects = Session.get("countFoundProjects");
var foundUsers;
Session.set("countFoundUsers", 0);
var countFoundUsers = Session.get("countFoundUsers");

// allows search result to update reactivley
var _dep = new Deps.Dependency();

Template.Search.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('Users');
    this.subscribe('Projects');
    SkillGraphCollection.subscribe();
    EdgesCollection.subscribe();
  });
});

Template.Search.onRendered(function onRendered() {
  // need to init. jquery plugins AFTER meteor done inserting (eg. with spacebars)
  // in dynamic document. see http://stackoverflow.com/a/30834745
  const instance = this;
  instance.$('.ui.fluid.multiple.selection.search.dropdown')
      .dropdown({
        allowAdditions: true,
      });
});

Template.Search.helpers({
  getProjectSkills() {
    return _.uniq(_.flatten(_.pluck(Projects.find().fetch(), 'skillsWanted'))).sort();
  },
  getUserSkills() {
    return _.uniq(_.flatten(_.pluck(Users.find().fetch(), 'skills'))).sort()
  },
  projNum() {
    return countFoundProjects = Session.get("countFoundProjects");
  },
  compareFound() {
    if (Session.get("countFoundProjects") > 0 || Session.get("countFoundUsers") > 0)
    {
      return true;
    } else {
      return false;
    }
  },
  'foundProjects': function() {
    _dep.depend();  // allows helper to run reactively, see http://stackoverflow.com/a/18216255
    return foundProjects;
  },
  'foundUsers': function() {
    _dep.depend();  // allows helper to run reactively, see http://stackoverflow.com/a/18216255
    return foundUsers;
  },
});

Template.Search.events({
  'submit .form-register-projects': function (event, template) {
    event.preventDefault();

    countFoundProjects = Session.set("countFoundProjects", 0);

    let terms = event.target.skills.value.split(',');
    terms = _.map(terms, (skill) => { return utils.makeReadable(skill); });

    foundProjects = Projects.find({skillsWanted: { $in: terms }});
    countFoundProjects = Session.set("countFoundProjects", foundProjects.fetch().length);

    // allows both projects and user queries to reactively update
    countFoundUsers = Session.set("countFoundUsers", 0);
    foundUsers = Users.find({skills: ''});
    countFoundUsers = Session.set("countFoundUsers", foundUsers.fetch().length);

    _dep.changed();
  },
  'submit .form-register-users': function (event, template) {
    event.preventDefault();

    countFoundUsers = Session.set("countFoundUsers", 0);

    let terms = event.target.skills.value.split(',');
    terms = _.map(terms, (skill) => { return utils.makeReadable(skill); });

    foundUsers = Users.find({skills: { $in: terms }});
    countFoundUsers = Session.set("countFoundUsers", foundUsers.fetch().length);

    // allows both projects and user queries to reactively update
    countFoundProjects = Session.set("countFoundProjects", 0);
    foundProjects = Projects.find({skillsWanted: ''});
    countFoundProjects = Session.set("countFoundProjects", foundProjects.fetch().length);

    _dep.changed();
  },
});

Template.Search.onDestroyed(function () {
  foundProjects = undefined;
  countFoundProjects = Session.set("countFoundProjects", 0);
  foundUsers = undefined;
  countFoundUsers = Session.set("countFoundUsers", 0);
});
