/**
 * Created by reedvilanueva on 10/20/16.
 */
import {Template} from 'meteor/templating';
import {ReactiveDict} from 'meteor/reactive-dict';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {_} from 'meteor/underscore';
import { Meteor } from 'meteor/meteor'  // to access Meteor.users collection

// consts to use in reactive dicts
const displayErrorMessages = 'displayErrorMessages';

const homeActive = 'homeActive';
const eventsActive = 'eventsActive';
const friendsActive = 'friendsActive';

Template.Site_Admin_Page.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('UserData');  // extended Meteor.user collection data
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
Template.Site_Admin_Page.helpers({
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
  }
});

Template.Site_Admin_Page.helpers({
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

Template.Site_Admin_Page.onRendered(function enableSemantic() {
  const instance = this;
  // instance.$('select.ui.dropdown').dropdown();
  // instance.$('.ui.selection.dropdown').dropdown();
  // instance.$('select.dropdown').dropdown();
  // instance.$('.ui.checkbox').checkbox();
  // instance.$('.ui.radio.checkbox').checkbox();

  // secondary menu logic FIXME: does not work
  instance.$('select.ui.secondary.menu').ready(function () {
    $('.ui .item').on('click', function () {
      $('.ui .item').removeClass('active');
      $(this).addClass('active');
    });
  });
});

Template.Site_Admin_Page.events({
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