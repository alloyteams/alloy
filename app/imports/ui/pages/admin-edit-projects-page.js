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
let projectsCollection;

Template.Edit_Projects_Page.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('UserData');  // extended Meteor.user collection data
    this.subscribe('Users');
    this.subscribe('Projects');
    projectsCollection = Projects.find();
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
  'foundProjects': function() {
    _dep.depend();  // allows helper to run reactively, see http://stackoverflow.com/a/18216255
    // console.log(projectsCollection.fetch());
    return _.sortBy(projectsCollection.fetch(), 'projectName');
  },
});


Template.Edit_Projects_Page.onRendered(function enableSemantic() {

});

Template.Edit_Projects_Page.events({
  'submit .form-delete-project': function (event, template) {
    event.preventDefault();

    if (confirm('Are you sure you want to delete the project?')) {
      const project_ID = event.target.projectId.value;
      const project = Projects.findOne({ _id: project_ID });
      const projectMembers = project.members;

      // console.log(projectMembers);

      _.each(projectMembers, function (username) {
        /** Remove project from User **/
        const user = Users.find({ 'username': username }).fetch()[0];
        const userId = user['_id'];
        let userProjects = user['projects'];
        const indexOfProject = userProjects.indexOf(project._id);
        if (indexOfProject > -1) {
          userProjects.splice(indexOfProject, 1);
        }
        Users.update({ _id: userId }, { $set: { projects: userProjects } });
      })

      /** Remove the project from the Projects collection **/
      Projects.remove(project._id);

      _dep.changed();
    }
  },
});