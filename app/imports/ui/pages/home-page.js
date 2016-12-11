/**
 * Created by reedvilanueva on 10/16/16.
 */
import {Template} from 'meteor/templating';
import {Contacts} from '../../api/contacts/contacts.js';

import {Projects, ProjectsSchema} from '../../api/projects/projects.js';
import {BaseCollection} from '../../api/base/BaseCollection.js'
import {
  SkillGraphCollection,
  Edge
} from '../../api/skill-graph/SkillGraphCollection.js';
import {Users} from '../../api/users/users.js';

Template.Home_Page.onCreated(function onCreated() {
  this.autorun(() => {
    // 'autopublish' pkg has been removed
    this.subscribe('Contacts');
    this.subscribe('Projects');
    this.subscribe('Users');
  });
});

Template.Home_Page.helpers({

  /**
   * @returns {*} All of the Contacts documents.
   */
  contactsList() {
    return Contacts.find();
  },
  /**
   * @param fieldVal
   * @returns {*} The specified value fieldVal of the project document specified by the router to this page
   */
  userDataField(fieldVal) {
    // app/imports/startup/client/router.js defines the 'id' vs '_id' bindings
    //   see app/imports/ui/pages/home-page.html
    // uses the id param specified in page that routed to this page
    //   see https://github.com/kadirahq/flow-router#routes-definition
    const user = Users.findOne({ username: Meteor.user().profile.name });
    console.log(user[fieldVal]);
    // See https://dweldon.silvrback.com/guards to understand '&&' in next line.
    // once the subcribed collection has loaded, if the user exists, then return the specified fieldVal
    return user && user[fieldVal];
  },
  projectName(projectId) {
    const project = Projects.findOne(projectId);
    return project['projectName'];
  },
});

Template.Home_Page.events({
  'click .ui.basic.green.button': function (event, instance) {
    /** Accept request to join event **/
    //Debug Console Log
    //console.log('Trying to click');
    //console.log(event);
    event.preventDefault();
    let userToAdd = Meteor.user().profile.name;
    userToAdd = String(userToAdd).toLowerCase();
    console.log(userToAdd);
    /** Check if user exists **/
    const user = Users.find({ 'username': userToAdd }).fetch()[0];
    /** If User exists, proceed to add **/
    if (user != null) {
      console.log(event.currentTarget.id);
      const project = Projects.findOne(event.currentTarget.id);
      console.log(project);
      let newMembers = project['members'];
      //console.log(newMembers);
      let indexOfUser = newMembers.indexOf(userToAdd);
      //console.log(indexOfUser);
      if (indexOfUser === -1) {
        newMembers.push(userToAdd);
        newMembers.sort();
      }
      /** For Future admin support
       let newAdmins = project.admins;
       indexOfUser = newAdmins.indexOf(userToAdd);
       if (indexOfUser > -1) {
      newAdmins.splice(indexOfUser, 1);
    }
       **/
      /** Add user to project **/
      Projects.update({ _id: project['_id'] }, { $set: { members: newMembers } });
      /** Add project from User **/
      const userId = user['_id'];
      let userProjects = user['projects'];
      const indexOfProject = userProjects.indexOf(project._id);
      if (indexOfProject === -1) {
        userProjects.push(project._id);
        userProjects.sort();
      }
      //console.log(userProjects);
      Users.update({ _id: userId }, { $set: { projects: userProjects } });

      /** Remove request **/
      const declinedProj = event.currentTarget.id;
      let pendingRequests = user['pendingRequests'];
      const index = pendingRequests.indexOf(declinedProj);
      if (index > -1) {
        pendingRequests.splice(index, 1);
      }
      Users.update({ _id: userId }, { $set: { pendingRequests: pendingRequests } });
    }
    else {
      $('.ui.basic.modal')
          .modal('show')
      ;
    }
    event.currentTarget.parentNode.children[0].value = '';
  },
  /** Decline Join Request **/
  'click .ui.basic.red.button': function (event, instance) {
    /** Remove request from user **/
    let user = Users.find({ 'username': Meteor.user().profile.name }).fetch()[0];
    const userId = user['_id'];
    const declinedProj = event.currentTarget.id;
    let pendingRequests = user['pendingRequests'];
    const index = pendingRequests.indexOf(declinedProj);
    if (index > -1) {
      pendingRequests.splice(index, 1);
    }
    Users.update({ _id: userId }, { $set: { pendingRequests: pendingRequests } });

  },
})
;
