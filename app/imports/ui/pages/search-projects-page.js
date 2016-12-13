/**
 * Created by neilteves on 11/17/16.
 */
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor'; // to access Meteor.users collection
import { Projects, ProjectsSchema } from '../../api/projects/projects.js';
import {SkillGraphCollection} from '../../api/skill-graph/SkillGraphCollection.js';
import {EdgesCollection} from '../../api/skill-graph/EdgesCollection.js'

// to use the makereadable function
const utils = require('../../api/skill-graph/graphUtilities');

// consts to use in reactive dicts
const displayErrorMessages = 'displayErrorMessages';

var foundProjects;
Session.set("countFoundProjects", 0);
var countFoundProjects = Session.get("countFoundProjects");

var _dep = new Deps.Dependency();  // allows search result to update reactivley

Template.Search_Projects_Page.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('Users');
    this.subscribe('Projects');
    SkillGraphCollection.subscribe();
    EdgesCollection.subscribe();
  });
});

Template.Search_Projects_Page.onRendered(function onRendered() {
  // need to init. jquery plugins AFTER meteor done inserting (eg. with spacebars)
  // in dynamic document. see http://stackoverflow.com/a/30834745
  const instance = this;
  instance.$('.ui.fluid.multiple.selection.search.dropdown')
      .dropdown({
        allowAdditions: true,
      });
});

Template.Search_Projects_Page.helpers({
  getGraphSkills() {
    console.log(SkillGraphCollection.getSkills());
    return SkillGraphCollection.getSkills();
  },
  projNum() {
    return countFoundProjects = Session.get("countFoundProjects");
  },
  compareFound() {
    if (Session.get("countFoundProjects") > 0)
    {
      return true;
    } else {
      return false;
    }
  },
  'foundProjects': function() {
    _dep.depend();  // allows helper to run reactively, see http://stackoverflow.com/a/18216255
    console.log(foundProjects.fetch());
    return foundProjects;
  },
});

Template.Search_Projects_Page.events({
  'submit .form-register': function (event, template) {
    event.preventDefault();

    countFoundProjects = Session.set("countFoundProjects", 0);
    let terms = event.target.skills.value.split(',');
    terms = _.map(terms, (skill) => { return utils.makeReadable(skill); });

    // console.log('search input: ' + getInput);

    foundProjects = Projects.find({skillsWanted: { $in: terms }});
    countFoundProjects = Session.set("countFoundProjects", foundProjects.fetch().length);

    _dep.changed();

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

});

Template.Search_Projects_Page.onDestroyed(function () {
  foundProjects = undefined
  countFoundProjects = Session.set("countFoundProjects", 0);
});
