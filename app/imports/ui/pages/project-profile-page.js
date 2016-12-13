/**
 * Created by reedvilanueva on 10/26/16.
 */
import {Template} from 'meteor/templating';
import {ReactiveDict} from 'meteor/reactive-dict';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {_} from 'meteor/underscore';
import {Meteor} from 'meteor/meteor'  // to access Meteor.users collection
import {Projects, ProjectsSchema} from '../../api/projects/projects.js';
import {Users, UsersSchema} from '../../api/users/users.js';

// consts to use in reactive dicts
const displayErrorMessages = 'displayErrorMessages';

const homeActive = 'homeActive';
const eventsActive = 'eventsActive';
const friendsActive = 'friendsActive';

Template.Project_Profile_Page.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('Users');
    this.subscribe('Projects');
  });

  // use reactive dict to store error messages
  this.messageFlags = new ReactiveDict();  // recall, reactive dicts can store template key/vals w/out refreshing
  this.messageFlags.set(displayErrorMessages, false);

  this.navMenuActive = new ReactiveDict();
  this.navMenuActive.set(homeActive, true);
  this.navMenuActive.set(eventsActive, false);
  this.navMenuActive.set(friendsActive, false);

  this.context = ProjectsSchema.namedContext('Project_Profile_Page');
});

// useful thing to note, all Collection docs. have a _id key that is uniq. to that doc
Template.Project_Profile_Page.helpers({
  /**
   * @param fieldVal
   * @returns {*} The specified value fieldVal of the project document specified by the router to this page
   */
  projectDataField(fieldVal) {
    // app/imports/startup/client/router.js defines the 'id' vs '_id' bindings
    //   see app/imports/ui/pages/home-page.html
    // uses the id param specified in page that routed to this page
    //   see https://github.com/kadirahq/flow-router#routes-definition
    const project = Projects.findOne(FlowRouter.getParam('_id'));
    // See https://dweldon.silvrback.com/guards to understand '&&' in next line.
    // once the subcribed collection has loaded, if the user exists, then return the specified fieldVal
    return project && project[fieldVal];
  },
  userDataField(fieldVal) {
    // app/imports/startup/client/router.js defines the 'id' vs '_id' bindings
    //   see app/imports/ui/pages/home-page.html
    // uses the id param specified in page that routed to this page
    //   see https://github.com/kadirahq/flow-router#routes-definition
    const user = Users.findOne({ _id: FlowRouter.getParam('_id') });
    // See https://dweldon.silvrback.com/guards to understand '&&' in next line.
    // once the subcribed collection has loaded, if the user exists, then return the specified fieldVal
    return user && user[fieldVal];
  },
  getMyId: function() {
    const userName = Meteor.user().profile.name;
    const userNameId = Users.find({ 'username': userName }).fetch()[0]['_id'];
    return userNameId;
  },
  isAdmin() {
    // duplicate code here b/c helpers can't call each other by default. see http://stackoverflow.com/q/17229302
    const project = Projects.findOne(FlowRouter.getParam('_id'));
    return _.contains(project.admins, Meteor.user().profile.name);
  },
  userId: function () {
    return Meteor.userId();
  },
  hasRequests() {
    const project = Projects.findOne(FlowRouter.getParam('_id'));
    const requests = project['joinRequests'];
    if (requests.length == 0) {
      return false;
    }
    else {
      return true;
    }
  },
  notRequestedToJoin() {
    const project = Projects.findOne(FlowRouter.getParam('_id'));
    if (_.contains(project.joinRequests, Meteor.user().profile.name)) {
      return false;
    }
    else {
      return true;
    }
  },
  notMember() {
    const project = Projects.findOne(FlowRouter.getParam('_id'));
    if (_.contains(project.members, Meteor.user().profile.name)) {
      return false;
    }
    else {
      return true;
    }
  },
});

Template.Project_Profile_Page.helpers({
  homeActiveClass() {
    return Template.instance().navMenuActive.get(homeActive) ? 'active' : '';  // 'active' string also doubles as truthy
  },
  eventsActiveClass() {
    return Template.instance().navMenuActive.get(eventsActive) ? 'active' : '';
  },
  friendsActiveClass() {
    return Template.instance().navMenuActive.get(friendsActive) ? 'active' : '';
  },
  errorClass() {
    return Template.instance().messageFlags.get(displayErrorMessages) ? 'error' : '';  // empty string is falsey
  },
  displayFieldError(fieldName) {
    const errorKeys = Template.instance().context.invalidKeys();
    return _.find(errorKeys, (keyObj) => keyObj.name === fieldName);
  },
});
/*
 Template.Project_Profile_Page.onRendered(function enableSemantic() {
 // secondary menu logic FIXME: does not work (used events and helpers instead)
 instance.$('select.ui.secondary.menu').ready(function () {
 $('.ui .item').on('click', function () {
 $('.ui .item').removeClass('active');
 $(this).addClass('active');
 });
 });
 });
 */
Template.Project_Profile_Page.events({
  // change what nav menu tab is active (I know this is an ugly way to do it, but can fix later)
  'click .homeTab' (event, instance) {
    event.preventDefault();
    Template.instance().navMenuActive.set(homeActive, true);

    Template.instance().navMenuActive.set(eventsActive, false);
    Template.instance().navMenuActive.set(friendsActive, false);
  },
  'click .eventsTab' (event, instance) {
    event.preventDefault();
    Template.instance().navMenuActive.set(eventsActive, true);

    Template.instance().navMenuActive.set(homeActive, false);
    Template.instance().navMenuActive.set(friendsActive, false);
  },
  'click .friendsTab' (event, instance) {
    event.preventDefault();
    Template.instance().navMenuActive.set(friendsActive, true);

    Template.instance().navMenuActive.set(eventsActive, false);
    Template.instance().navMenuActive.set(homeActive, false);
  },
  // TODO: This should probably move to project-admin-page when that page is done
  'click .addMember' (event, instance) {
    event.preventDefault();

    const memberToAdd = event.currentTarget.value;
    const project = Projects.findOne(FlowRouter.getParam('_id'));
    if (_.contains(project.members, memberToAdd)) {
      console.log(`${memberToAdd} is already a member of this project`)
    } else {
      // add requesting user to project.members and remove them from the project.pendingRequests array
      // see https://docs.mongodb.com/manual/reference/operator/update/pull/#up._S_pull
      console.log(`adding ${memberToAdd} to ${project.projectName}`)
      Projects.update({ _id: project._id }, { $addToSet: { members: memberToAdd } });
      Projects.update({ _id: project._id }, { $pull: { joinRequests: memberToAdd } });  // assumes uniq. usernames
    }
  },
  'click .ui.green.join.button' (event, instance){
    event.preventDefault();
    const memberToAdd = Meteor.user().profile.name;
    const project = Projects.findOne(FlowRouter.getParam('_id'));
    if (_.contains(project.joinRequests, memberToAdd)) {
      console.log("User has already requested to join");
    }
    else {
      Projects.update({ _id: project._id }, { $addToSet: { joinRequests: memberToAdd } });
      console.log("added to joinRequests");
    }
  },
  'click .ui.basic.green.button': function (event, instance) {
    /** Accept request to join event **/
    event.preventDefault();
    const userToAdd = event.currentTarget.id;
    console.log(userToAdd);
    /** Check if user exists **/
    const user = Users.find({ 'username': userToAdd }).fetch()[0];
    /** If User exists, proceed to add **/
    if (user != null) {
      const project = Projects.findOne(FlowRouter.getParam('_id'));
      let newMembers = project['members'];
      //console.log(newMembers);
      let indexOfUser = newMembers.indexOf(userToAdd);
      //console.log(indexOfUser);
      if (indexOfUser === -1) {
        newMembers.push(userToAdd);
        newMembers.sort();
      }
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
      let pendingRequests = project['joinRequests'];
      const index = pendingRequests.indexOf(userToAdd);
      if (index > -1) {
        pendingRequests.splice(index, 1);
      }
      Projects.update({ _id: project['_id'] }, { $set: { joinRequests: pendingRequests } });
    }
  },
  /** Decline Join Request **/
  'click .ui.basic.red.button': function (event, instance) {
    /** Remove request from project **/
    const project = Projects.findOne(FlowRouter.getParam('_id'));
    const declinedUser = event.currentTarget.id;
    let pendingRequests = project['joinRequests'];
    const index = pendingRequests.indexOf(declinedUser);
    if (index > -1) {
      pendingRequests.splice(index, 1);
    }
    Projects.update({ _id: project['_id'] }, { $set: { joinRequests: pendingRequests } });
  },
//   // logic for 'submit' event for 'contact-data-form' 'button'
//   'submit .contact-data-form'(event, instance) {
//     event.preventDefault();
//     // Get contact info (text fields)
//     const firstName = event.target.firstName.value;  // based on associated html id tags
//     const lastName = event.target.lastName.value;
//     const address = event.target.address.value;
//     const phone = event.target.phone.value;
//     const email = event.target.email.value;
//     const newContact = { firstName, lastName, address, phone, email };
//
//     // Clear out any previous validation errors.
//     instance.context.resetValidation();
//     // Invoke clean so that newContact reflects what will be inserted.
//     ContactsSchema.clean(newContact);
//
//     // Determine validity against schema.
//     instance.context.validate(newContact);
//     if (instance.context.isValid()) {
//       // insert new contact data into collection
//       Contacts.insert(newContact);
//       instance.messageFlags.set(displayErrorMessages, false);
//
//       // redirect back to Home_Page
//       FlowRouter.go('Home_Page');
//     } else {
//       instance.messageFlags.set(displayErrorMessages, true);
//     }
//   },
});

Template.Project_Profile_Page.onRendered(function onRendered() {
  $('.ui.dropdown')
      .dropdown();
});
