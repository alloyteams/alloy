/**
 * Created by reedvilanueva on 10/15/16.
 */
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import { Contacts, ContactsSchema } from '../../api/contacts/contacts.js';


const displayErrorMessages = 'displayErrorMessages';

Template.Add_Contact_Page.onCreated(function onCreated() {
  // use reactive dict to store error messages
  this.messageFlags = new ReactiveDict();  // recall, reactive dicts can store template key/vals w/out refreshing
  this.messageFlags.set(displayErrorMessages, false);

  // attach our context for validation to the ContactsSchema (set context name to match the template name)
  this.context = ContactsSchema.namedContext('Add_Contact_Page');
});

Template.Add_Contact_Page.helpers({
  errorClass() {
    return Template.instance().messageFlags.get(displayErrorMessages) ? 'error' : '';  // empty string is falsey
  },
  displayFieldError(fieldName) {
    const errorKeys = Template.instance().context.invalidKeys();
    return _.find(errorKeys, (keyObj) => keyObj.name === fieldName);
  },
});

// Template.Create_Student_Data_Page.onRendered(function enableSemantic() {
//   const instance = this;
//   instance.$('select.ui.dropdown').dropdown();
//   instance.$('.ui.selection.dropdown').dropdown();
//   instance.$('select.dropdown').dropdown();
//   instance.$('.ui.checkbox').checkbox();
//   instance.$('.ui.radio.checkbox').checkbox();
// });

Template.Add_Contact_Page.events({
  // logic for 'submit' event for 'contact-data-form' 'button'
  'submit .contact-data-form'(event, instance) {
    event.preventDefault();
    // Get contact info (text fields)
    const firstName = event.target.firstName.value;  // based on associated html id tags
    const lastName = event.target.lastName.value;
    const address = event.target.address.value;
    const phone = event.target.phone.value;
    const email = event.target.email.value;
    const newContact = { firstName, lastName, address, phone, email };

    // Clear out any previous validation errors.
    instance.context.resetValidation();
    // Invoke clean so that newContact reflects what will be inserted.
    ContactsSchema.clean(newContact);

    // Determine validity against schema.
    instance.context.validate(newContact);
    if (instance.context.isValid()) {
      // insert new contact data into collection
      Contacts.insert(newContact);
      instance.messageFlags.set(displayErrorMessages, false);

      // redirect back to Home_Page
      FlowRouter.go('Home_Page');
    } else {
      instance.messageFlags.set(displayErrorMessages, true);
    }
  },
});
