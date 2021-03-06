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
const utils = require('../../api/skill-graph/graphUtilities');  // to use the make readable function
var _dep = new Deps.Dependency(); // allows search result to update reactivley

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
  countSkills: function () {
    return SkillGraphCollection.find().fetch().length;
  },
  'foundSkills': function() {
    _dep.depend();  // allows helper to run reactively, see http://stackoverflow.com/a/18216255
    // console.log(skillsCollection.fetch());
    return _.sortBy(skillsCollection.fetch(), 'skillReadable');
  },
});


Template.Edit_Skills_Page.onRendered(function enableSemantic() {

});

Template.Edit_Skills_Page.events({
  'submit .form-register-skills': function (event, template) {
    event.preventDefault();

    let skills = event.target.skills.value.split(',');
    skills = _.map(skills, (skill) => { return utils.makeReadable(skill); });

    SkillGraphCollection.addVertexList(skills);

    _dep.changed();
  },
  'submit .form-register-remove': function (event, template) {
    event.preventDefault();

    let skillNameReadable = event.target.skillName.value;
    let skill_ID = event.target.skillId.value;
    let userIdArray = [];
    let projectIdArray = [];

    SkillGraphCollection.removeVertex(skill_ID);

    let foundUsers = Users.find({skills: skillNameReadable}); //creates an array that has users that contains the target skill
    let foundUsersCount = foundUsers.fetch().length; //creates a variable with the number of users found
    for (let userIndex = 0; userIndex < foundUsersCount; userIndex++) { //LOOP: pushes each found users _id into an array
      userIdArray.push(foundUsers.fetch()[userIndex]._id);
    }
    // console.log(userIdArray);
    for (let userIndex = 0; userIndex < foundUsersCount; userIndex++) { //LOOP: updates each found users skills
      let currentUser = Users.find({_id: userIdArray[userIndex]});
      // console.log(currentUser.fetch());
      let newSkills = _.without(currentUser.fetch()[0].skills, skillNameReadable);
      // console.log(newSkills);
      Users.update({ _id: currentUser.fetch()[0]._id }, { $set: { skills: newSkills } });
    }

    let foundProjects = Projects.find({skillsWanted: skillNameReadable}); //creates an array that has projects that contains the target skill
    let foundProjectsCount = foundProjects.fetch().length; //creates a variable with the number of projects found
    for (let projectIndex = 0; projectIndex < foundProjectsCount; projectIndex++) { //LOOP: pushes each found projects _id into an array
      projectIdArray.push(foundProjects.fetch()[projectIndex]._id);
    }
    // console.log(projectIdArray);
    for (let projectIndex = 0; projectIndex < foundProjectsCount; projectIndex++) { //LOOP: updates each found projects skills
      let currentProject = Projects.find({_id: projectIdArray[projectIndex]});
      // console.log(currentProject.fetch());
      let newSkills = _.without(currentProject.fetch()[0].skillsWanted, skillNameReadable);
      // console.log(newSkills);
      Projects.update({ _id: currentProject.fetch()[0]._id }, {$set: { skillsWanted: newSkills } });
    }

    // console.log("clicked delete button: [" + skill_ID + "] [" + skillNameReadable +"]");

    _dep.changed();
  },
});