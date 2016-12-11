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

// These values must be 0 <= relatedPerSkill, suggestionsPerSkill <= displayLimit < INF
const displayLimit = 10;
const relatedPerSkill = 5;
const suggestionsPerSkill = 5;  // must be <= displayLimit

Template.Suggested_Projects.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('Users');
    this.subscribe('Projects');
    SkillGraphCollection.subscribe();
    EdgesCollection.subscribe();
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
    // TODO: choose docs. in natural / default order
    // see https://docs.mongodb.com/manual/reference/operator/aggregation/sort/#ascending-descending-sort
    // TODO: currently subscribes to all docs. and filters only 10, can set subscription limit if desired
    // see http://stackoverflow.com/questions/19161000/how-to-use-meteor-limit-properly
    return Projects.find({}, {
      $sort: { modifiedAt: -1 },
      limit: displayLimit
    });
  },

  getMyId: function() {
    const userName = Meteor.user().profile.name;
    const userNameId = Users.find({ 'username': userName }).fetch()[0]['_id'];
    return userNameId;
  },

  // does not necessarily only return array of displayLimit or less project suggestions
  // FIXME: current latency potentially very high b/c duplicates in arrays that are filtered out too late
  // TODO: add feature for user to decide how many of these suggestions to see
  suggestedProjects() {
    // here, we search by logged-in username (using the Meteor.users collection),
    // which we assume to be uniq. and in Users. Returns undefined if no matching doc. found
    const user = Users.findOne({ username: Meteor.user().profile.name });  // if not using UH cas, use: Meteor.user().username
    console.log(user);

    // get suggestionsPerSkill number of most weighted related skills for each skill
    // store as array of 'readable' versions of the skills as taken from skillgraph
    let relatedSkills = _.flatten(
        _.map(user.skills, (seed) => {
          console.log(`suggested-projects: suggestedProjects: relatedSkills: seed: ${seed}`);
          let pq = SkillGraphCollection.adjMaxPQ(seed);
          console.log(pq);
          // relies on assumption that seed is in 'readable' form (defined in api/skill-graph/graphUtilities.js)
          // ie. assumes all user.skills entered in edit-user-profile page and that the page enforces 'readable'
          let related = [seed];
          for (let i = 0; i < relatedPerSkill && pq.length > 0; i++) {
            let edgeDoc = pq.dequeue();
            let otherVertex = EdgesCollection.other(edgeDoc, seed);
            related.push(otherVertex.skillReadable);
          }
          return related;
        })
    );
    console.log('relatedSkills');
    console.log(relatedSkills);
    // account for different skills being related to the same thing
    relatedSkills = _.uniq(relatedSkills);
    // relies on assumption that all projects have skills in 'readable' form (defined in api/skill-graph/graphUtilities.js)

    // For each suggestedSkill, get suggestionsPerSkill projects with that skill in skillsWanted and skills field
    let suggestions = [];
    _.each(relatedSkills, (skill) => {
      console.log(skill);
      console.log(Projects.find({ skillsWanted: skill }, { limit: suggestionsPerSkill }).fetch());
      suggestions = suggestions.concat(
          Projects.find({ skillsWanted: skill }, { limit: suggestionsPerSkill }).fetch()
      );
    });
    console.log('suggestions');
    console.log(suggestions);
    suggestions = _.uniq(suggestions, (project) => { return project._id; });

    // TODO: need efficient way to enforce a displayLimit on the number of suggestions displayed
    // /**
    //  * function to return a random integer between min (inclusive) and max (inclusive)
    //  * Using Math.round() will give you a non-uniform distribution.
    //  */
    // function getRandomInt(min, max) {
    //   return Math.floor(Math.random() * (max - min + 1)) + min;
    // }
    //
    // // generate array of random indices fo the suggestions array to display
    // let indices = [];
    // let displayCount = 0;
    // while (indices.length < displayLimit && displayCount < suggestions.length) {
    //   let randomnumber = getRandomInt(0, suggestions.length - 1);
    //   if (indices.indexOf(randomnumber) > -1) continue;
    //   indices[indices.length] = randomnumber;
    //   displayCount++;
    // }

    suggestions = _.shuffle(suggestions);
    suggestions = (suggestions.length < displayLimit) ? suggestions : _.first(suggestions, displayLimit);

    return suggestions;
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