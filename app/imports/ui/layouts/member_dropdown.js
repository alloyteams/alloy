import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {_} from 'meteor/underscore';
import {Meteor} from 'meteor/meteor'; // to access Meteor.users collection
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
  admin(member) {
    const project = Projects.findOne(this.projectId);
    if (_.contains(project.admins, member)) {
      return true;
    }
    return false;
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
      const indexOfProject = userProjects.indexOf(project._id);
      if (indexOfProject > -1) {
        userProjects.splice(indexOfProject, 1);
      }
      Users.update({ _id: userId }, { $set: { projects: userProjects } });
      //Debug Console Log
      //console.log(Users.findOne(userId));
    }
  },
  /** Escalate user to Admin level **/
  'click .ui.icon.admin.button': function (event, instance) {
    event.preventDefault();
    const newAdmin = event.currentTarget.id;
    const project = Projects.findOne(this.projectId);
    let newAdmins = project.admins;
    indexOfUser = newAdmins.indexOf(newAdmin);
    if (indexOfUser === -1) {
      newAdmins.push(newAdmin);
    }
    Projects.update({ _id: project['_id'] }, { $set: { admins: newAdmins } });
    /** Update user **/
    const user = Users.findOne({ 'username': newAdmin }).fetch()[0];
    const userId = user['_id'];
    let userAdminProjects = user['adminProjects'];
    const indexOfProject = userAdminProjects.indexOf(project._id);
    if (indexOfProject === -1) {
      userAdminProjects.push(project._id);
    }
    Users.update({ _id: userId }, { $set: { adminProjects: userAdminProjects } });
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
    // console.log(userToAdd);
    /** Check if user exists **/
    const user = Users.find({ 'username': userToAdd }).fetch()[0];
    // console.log(user);
    /** If User exists, proceed to request to add **/
    if (user != null) {
      const userId = user['_id'];
      const project = Projects.findOne(this.projectId);
      let userRequests = user['pendingRequests'];
      // console.log(userRequests);
      let indexOfRequest = userRequests.indexOf(project['_id']);
      let indexOfProj = user['projects'].indexOf(project['_id']);
      if (indexOfRequest === -1 && indexOfProj === -1) {
        userRequests.push(project['_id']);

        mailRecipient = userToAdd + "@hawaii.edu";
        // emailMsg = "You have a request to join project " + project['projectName'] + " from " + Meteor.user().profile.name + ".";
        htmlMsg = "<div style='border: 3px solid #27AAE1; border-radius: 3px; padding-top: 20px;'>" +
            "<a href='http://www.alloy.rocks'><img src='https://github.com/alloyteams/alloy/blob/master/app/public/images/alloy-wordmark.png?raw=true'" +
            "style='display: block; margin: auto;'></a><br>" +
            "<div style='background-color: #F8F8F8;'>" +
            "<div style='text-align: center; font-size: large; max-width: 450px; margin: 0 auto; padding: 10px;'>" +
            "You have a request to join project <span style='color: #A6CE39; text-transform: uppercase;'>" + project['projectName'] + "</span> " +
            "from <span style='color: #A6CE39; text-transform: uppercase;'>" + Meteor.user().profile.name + "</span>." +
            "</div></div></div>";

        // Sending an email to alloy email account about project invite
        Meteor.call(
            'sendHtmlEmail',
            mailRecipient,
            'alloyUH@gmail.com',
            'ALLOY-NOTIFICATION-INVITE',
            htmlMsg
        );
        // console.log("email sent");

        Users.update({ _id: userId }, { $set: { pendingRequests: userRequests } });
        $('.ui.basic.success.modal')
            .modal('show')
        ;
      } else {
        $('.ui.basic.existing.modal')
            .modal('show')
        ;
      }
    } else {
      $('.ui.basic.invalid.modal')
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
