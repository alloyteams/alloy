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
var foundUsers;
Session.set("countFoundUsers", 0);
var countFoundUsers = Session.get("countFoundUsers");

var _dep = new Deps.Dependency();  // allows search result to update reactivley

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
    console.log(SkillGraphCollection.getSkills());
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
  'foundUsers': function() {
    _dep.depend();  // allows helper to run reactively, see http://stackoverflow.com/a/18216255
    console.log(foundUsers.fetch());
    return foundUsers;
  },
});

Template.Search_Users_Page.events({
  'submit .form-register': function (event, template) {
    event.preventDefault();

    countFoundUsers = Session.set("countFoundUsers", 0);
    foundUsers = undefined;

    let terms = event.target.skills.value.split(',');
    terms = _.map(terms, (skill) => { return utils.makeReadable(skill); });

    foundUsers = Users.find({skills: { $in: terms }});
    countFoundUsers = Session.set("countFoundUsers", foundUsers.fetch().length);

    _dep.changed();
  },

});

Template.Search_Users_Page.onDestroyed(function () {
  foundUsers = undefined;
  countFoundUsers = Session.set("countFoundUsers", 0);
});
