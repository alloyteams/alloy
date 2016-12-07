import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {_} from 'meteor/underscore';
import {Meteor} from 'meteor/meteor'  // to access Meteor.users collection
import {Projects, ProjectsSchema} from '../../api/projects/projects.js';
import {Users, UsersSchema} from '../../api/users/users.js';

Template.Member_Dropdown.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('Projects');
  });

  this.context = ProjectsSchema.namedContext('Member_Dropdown');
  this.projectId = new ReactiveVar(null);
});

// useful thing to note, all Collection docs. have a _id key that is uniq. to that doc
Template.Member_Dropdown.helpers({
  /**
   * @param fieldVal
   * @returns {*} The specified value fieldVal of the project document specified by the router to this page
   */
  projectMemberList(_id) {
    this.projectId = _id;
    const project = Projects.findOne(_id);
    return project && project['members'];
  },
});

Template.Member_Dropdown.events({
  'click .ui.right.floated.negative.icon.button': function (event, instance) {
    if (confirm('Are you sure you want to remove this user?')) {
      /** Removing user event **/
      //Debug Console Log
      //console.log('Trying to click');
      //console.log(event);
      event.preventDefault();
      const userToDelete = event.currentTarget.id;
      const project = Projects.findOne(this.projectId);
      let newMembers = project.members;
      let indexOfUser = newMembers.indexOf(userToDelete);
      if (indexOfUser > -1) {
        newMembers.splice(indexOfUser, 1);
      }
      let newAdmins = project.admins;
      indexOfUser = newAdmins.indexOf(userToDelete);
      if (indexOfUser > -1) {
        newAdmins.splice(indexOfUser, 1);
      }
      /** Remove user from project **/
      Projects.update({ _id: this.projectId }, { $set: { members: newMembers } });
      Projects.update({ _id: this.projectId }, { $set: { admins: newAdmins } });
      /** Remove project from User **/
      const user = Users.find({ 'username': userToDelete }).fetch()[0];
      //Debug Console Log
      //console.log(user);
      const userId = user['_id'];
      let userProjects = user['projects'];
      const indexOfProject = userProjects.indexOf(project.projectName);
      if (indexOfProject > -1) {
        userProjects.splice(indexOfProject, 1);
      }
      Users.update({ _id: userId }, { $set: { projects: userProjects } });
      //Debug Console Log
      //console.log(Users.findOne(userId));
    }
  },
  /** New Add User method using notifications **/
  'click .ui.plus.icon.button': function (event, instance) {
    /** Adding User Event **/
    //Debug Console Log
    //console.log('Trying to click');
    //console.log(event);
    event.preventDefault();
    let userToAdd = event.currentTarget.parentNode.children[0].value;
    userToAdd = String(userToAdd).toLowerCase();
    console.log(userToAdd);
    /** Check if user exists **/
    const user = Users.find({ 'username': userToAdd }).fetch()[0];
    console.log(user);
    /** If User exists, proceed to request to add **/
    if (user != null) {
      const userId = user['_id'];
      const project = Projects.findOne(this.projectId);
      let userRequests = user['pendingRequests'];
      console.log(userRequests);
      let indexOfProj = userRequests.indexOf(project['projectName']);
      if (indexOfProj === -1) {
        userRequests.push(project['projectName']);
      }
      Users.update({ _id: userId }, { $set: { pendingRequests: userRequests } });
    }
    else {
      $('.ui.basic.modal')
          .modal('show')
      ;
    }
    event.currentTarget.parentNode.children[0].value = '';
  },
})
;

Template.Member_Dropdown.onRendered(function onRendered() {
  this.$('.ui.dropdown')
      .dropdown({
        direction: 'downward',
        action: 'nothing',
      });
});
