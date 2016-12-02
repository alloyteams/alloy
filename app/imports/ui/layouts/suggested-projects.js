/**
 * Created by reedvilanueva on 11/5/16.
 */
import {Template} from 'meteor/templating';
import {ReactiveDict} from 'meteor/reactive-dict';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {_} from 'meteor/underscore';
import {Meteor} from 'meteor/meteor'  // to access Meteor.users collection
import {Projects, ProjectsSchema} from '../../api/projects/projects.js';
import {Users, UsersSchema} from '../../api/users/users.js';
import {SkillGraphCollection} from '../../api/skill-graph/SkillGraphCollection.js';
import {EdgesCollection} from '../../api/skill-graph/EdgesCollection.js';
import PriorityQueue from 'js-priority-queue';

const utils = require('../../api/skill-graph/graphUtilities');

// consts to use in reactive dicts
const displayErrorMessages = 'displayErrorMessages';
const displayLimit = 6;
const suggestionsPerSkill = 2;  // must be <= displayLimit
const numSkills = Math.floor(displayLimit / suggestionsPerSkill);

Template.Suggested_Projects.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('Users');
    this.subscribe('Projects');
  });

  // use reactive dict to store error messages
  this.messageFlags = new ReactiveDict();  // recall, reactive dicts can store template key/vals w/out refreshing
  this.messageFlags.set(displayErrorMessages, false);

});

// useful thing to note, all Collection docs. have a _id key that is uniq. to that doc
Template.Suggested_Projects.helpers({
  /**
   * @returns {*} 10 of the Projects documents.
   */
  projectsList() {
    // TODO: currently chooses docs. in natural / default order (may want to change this later)
    // TODO: currently subscribes to all docs. and filters only 10, can set subscription limit if desired
    // see http://stackoverflow.com/questions/19161000/how-to-use-meteor-limit-properly
    return Projects.find({}, { limit: displayLimit });
  },
  suggestProjects() {
    // here, we search by logged-in username (using the Meteor.users collection),
    // which we assume to be uniq. and in Users. Returns undefined if no matching doc. found
    const user = Users.findOne({ username: Meteor.user().profile.name });  // if not using UH cas, use: Meteor.user().username

    // randomly choose some skills from user.skills to make suggestions for
    let count = 0;
    const skills = _.filter(user.skills, (skill) => {
      if (count < numSkills) {
        // 50% chance of this skill passing filter
        if (Math.random() < 0.5) {
          count++;
          return true;
        } else return false;
      } else return false;
    });
    console.log(skills);

    // get suggestionsPerSkill number of most weighted related skills for each skill
    const suggestedSkills = _.flatten(
        _.map(skills, (skill) => {
          let pq = SkillGraphCollection.adjMaxPQ(skill);
          let related = [];
          for (let i = 0; i < suggestionsPerSkill; i++) {
            let edgeDoc = pq.dequeue();
            related.push(EdgesCollection.other(edgeDoc, skill));
          }
          return related;
        })
    );
    console.log(suggestedSkills);

    // for each suggestedSkill, get suggestionsPerSkill projects with that skill in skillsWanted field

  },

});

Template.Suggested_Projects.helpers({
  errorClass() {
    return Template.instance().messageFlags.get(displayErrorMessages) ? 'error' : '';  // empty string is falsey
  },
  displayFieldError(fieldName) {
    const errorKeys = Template.instance().context.invalidKeys();
    return _.find(errorKeys, (keyObj) => keyObj.name === fieldName);
  },
});

// Template.Suggested_Projects.onRendered(function enableSemantic() {
//   const instance = this;
//   instance.$('select.ui.dropdown').dropdown();
//   instance.$('.ui.selection.dropdown').dropdown();
//   instance.$('select.dropdown').dropdown();
//   instance.$('.ui.checkbox').checkbox();
//   instance.$('.ui.radio.checkbox').checkbox();
// });

// Template.Suggested_Projects.events({
//
// });