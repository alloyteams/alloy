/**
 * Created by reedvilanueva on 10/19/16.
 */
import {Template} from 'meteor/templating';
import {ReactiveDict} from 'meteor/reactive-dict';
import {ReactiveVar} from 'meteor/reactive-var';
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


Template.User_Profile_Page.onCreated(function onCreated() {
  this.autorun(() => {
    // this.subscribe('UserData');  // extended Meteor.user collection data
    this.subscribe('Users');
    this.subscribe('Projects');
  });

  // use reactive dict to store error messages
  this.messageFlags = new ReactiveDict();  // recall, reactive dicts can store template key/vals w/out refreshing
  this.messageFlags.set(displayErrorMessages, false);

  // navMenuActive used to control which secondary menu tab is active (since the jquery does not work)
  this.navMenuActive = new ReactiveDict();
  this.navMenuActive.set(homeActive, true);
  this.navMenuActive.set(eventsActive, false);
  this.navMenuActive.set(friendsActive, false);

  this.isMemberFlag = new ReactiveVar(false);
  // this.context = ProjectsSchema.namedContext('Project_Profile_Page');
});

// useful thing to note, all Collection docs. have a _id key that is uniq. to that doc
Template.User_Profile_Page.helpers({
  userDataField(fieldVal) {
    // here, we search by logged-in username (using the Meteor.users collection),
    // which we assume to be uniq. and in Users. Returns undefined if no matching doc. found
    const user = Users.findOne({ username: Meteor.user().profile.name });  // if not using UH cas, use: Meteor.user().username
    // See https://dweldon.silvrback.com/guards to understand '&&' in next line.
    // once the subcribed collection has loaded, if the user exists, then return the specified fieldVal
    return user && user[fieldVal];
  },
  getProjectData(projectName, fieldVal) {
    const project = Projects.findOne({ projectName: projectName });
    return project && project[fieldVal];
  },
  firstName: function () {
    return Meteor.user().username;
  },
  userId: function () {
    return Meteor.userId();
  }
});

Template.User_Profile_Page.helpers({
  homeActiveClass() {
    return Template.instance().navMenuActive.get(homeActive) ? 'active' : '';  // 'active' string also doubles as truthy
  },
  eventsActiveClass() {
    return Template.instance().navMenuActive.get(eventsActive) ? 'active' : '';
  },
  friendsActiveClass() {
    return Template.instance().navMenuActive.get(friendsActive) ? 'active' : '';
  },
  isMemberFlag() {
    return Template.instance().isMemberFlag.get();
  },
  errorClass() {
    return Template.instance().messageFlags.get(displayErrorMessages) ? 'error' : '';  // empty string is falsey
  },
  displayFieldError(fieldName) {
    const errorKeys = Template.instance().context.invalidKeys();
    return _.find(errorKeys, (keyObj) => keyObj.name === fieldName);
  },
});

Template.User_Profile_Page.onRendered(function enableSemantic() {
  const instance = this;
  // instance.$('select.ui.dropdown').dropdown();
  // instance.$('.ui.selection.dropdown').dropdown();
  // instance.$('select.dropdown').dropdown();
  // instance.$('.ui.checkbox').checkbox();
  // instance.$('.ui.radio.checkbox').checkbox();

  // secondary menu logic FIXME: does not work (have resorted to using a reactiveDict)
  instance.$('select.ui.secondary.menu').ready(function () {
    $('.ui .item').on('click', function () {
      $('.ui .item').removeClass('active');
      $(this).addClass('active');
    });
  });
});

Template.User_Profile_Page.events({
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
  'click .joinRequest' (event, instance) {
    // get username (and email: username@hawaii.edu ?).
    // add this user info to an inbox for the project.
    // to identify the project referenced by the button,
    // see http://stackoverflow.com/a/20920683 or http://stackoverflow.com/a/28984303

    event.preventDefault();

    instance.isMemberFlag.set(false);  // FIXME: why is isMemberFlag marked as unresolved or fales not allowed as param?
    const user = Users.findOne({ username: Meteor.user().profile.name });
    const project = Projects.findOne({ _id: event.currentTarget.id });
    // check if user is already a member of this project
     if (_.contains(project.members, user.username)) {
       instance.isMemberFlag.set(true);

       // TODO: display notification that this user is already a member
    } else {
      // update user and project docs. to reflect new request
      // untrusted code can only modify docs. by their _id field
      Projects.update({ _id: project._id }, { $addToSet: { joinRequests: user.username } });
      Users.update({ _id: user._id }, { $addToSet: { pendingRequests: project.projectName } });

      // TODO: display some notification that request has been sent
    }
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
