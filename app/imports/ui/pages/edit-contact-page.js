/**
 * Created by reedvilanueva on 10/15/16.
 */

import { ReactiveDict } from 'meteor/reactive-dict';
// import { Tracker } from 'meteor/tracker';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { Contacts, ContactsSchema } from '../../api/contacts/contacts.js';

/* eslint-disable object-shorthand, no-unused-vars */

const displayErrorMessages = 'displayErrorMessages';

Template.Edit_Contact_Page.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('Contacts');
  });
  this.messageFlags = new ReactiveDict();
  this.messageFlags.set(displayErrorMessages, false);
  this.context = ContactsSchema.namedContext('Edit_Contact_Page');
});


Template.Edit_Contact_Page.helpers({
  contactDataField(fieldVal) {
    // app/imports/startup/client/router.js defines the 'id' vs '_id' bindings
    //   see app/imports/ui/pages/home-page.html
    // uses the id param specified in home-page.html
    //   see https://github.com/kadirahq/flow-router#routes-definition
    const contact = Contacts.findOne(FlowRouter.getParam('id')); 

    // See https://dweldon.silvrback.com/guards to understand '&&' in next line.
    // if the contact exists, then return the fieldVal
    return contact && contact[fieldVal];
  },
  errorClass() {
    return Template.instance().messageFlags.get(displayErrorMessages) ? 'error' : '';
  },
  displayFieldError(fieldName) {
    const errorKeys = Template.instance().context.invalidKeys();
    return _.find(errorKeys, (keyObj) => keyObj.name === fieldName);
  },
});

// Template.Edit_Student_Data_Page.onRendered(function enableSemantic() {
//   const template = this;
//   template.subscribe('Contacts', () => {
//     // Use this template.subscribe callback to guarantee that the following code executes after subscriptions OK.
//     Tracker.afterFlush(() => {
//       // Use Tracker.afterFlush to guarantee that the DOM is re-rendered before calling JQuery.
//       template.$('select.ui.dropdown').dropdown();
//       template.$('.ui.selection.dropdown').dropdown();
//       template.$('select.dropdown').dropdown();
//       template.$('.ui.checkbox').checkbox();
//       template.$('.ui.radio.checkbox').checkbox();
//     });
//   });
// });

Template.Edit_Contact_Page.events({
  'submit .contact-data-form'(event, instance) {
    event.preventDefault();
    // Get contact info (text fields)
    const firstName = event.target.firstName.value;  // based on associated html id tags
    const lastName = event.target.lastName.value;
    const address = event.target.address.value;
    const phone = event.target.phone.value;
    const email = event.target.email.value;
    const updatedContact = { firstName, lastName, address, phone, email };

    // Clear out any old validation errors.
    instance.context.resetValidation();
    // Invoke clean so that newStudentData reflects what will be inserted.
    ContactsSchema.clean(updatedContact);
    // Determine validity.
    instance.context.validate(updatedContact);

    if (instance.context.isValid()) {
      // app/imports/startup/client/router.js defines the 'id' vs '_id' bindings
      //   see app/imports/ui/pages/home-page.html
      Contacts.update(FlowRouter.getParam('id'), { $set: updatedContact });
      instance.messageFlags.set(displayErrorMessages, false);

      // redirect back to Home_Page
      FlowRouter.go('Home_Page');
    } else {
      instance.messageFlags.set(displayErrorMessages, true);
    }
  },
});
