/**
 * Created by reedvilanueva on 10/20/16.
 */
import {Template} from 'meteor/templating';
import {ReactiveDict} from 'meteor/reactive-dict';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {_} from 'meteor/underscore';
import { Projects, ProjectsSchema } from '../../api/projects/projects.js';
import { Meteor } from 'meteor/meteor'  // to access Meteor.users collection


// consts to use in reactive dicts
const displayErrorMessages = 'displayErrorMessages';


Template.Project_Admin_Page.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('Projects');  // extended Meteor.user collection data
  });

  // use reactive dict to store error messages
  this.messageFlags = new ReactiveDict();  // recall, reactive dicts can store template key/vals w/out refreshing
  this.messageFlags.set(displayErrorMessages, false);
  this.context = ProjectsSchema.namedContext('Project_Admin_Page');
});

// useful thing to note, all Collection docs. have a _id key that is uniq. to that doc
Template.Project_Admin_Page.helpers({
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
  firstName: function () {
    return Meteor.user().username;
  },
  userId: function () {
    return Meteor.userId();
  }
});

Template.Project_Admin_Page.helpers({
  errorClass() {
    return Template.instance().messageFlags.get(displayErrorMessages) ? 'error' : '';  // empty string is falsey
  },
  displayFieldError(fieldName) {
    const errorKeys = Template.instance().context.invalidKeys();
    return _.find(errorKeys, (keyObj) => keyObj.name === fieldName);
  },
});

Template.Project_Admin_Page.onRendered(function enableSemantic() {
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

Template.Project_Admin_Page.events({
//   // logic for 'submit' event for 'project-data-form' 'form submission' event
  'submit .project-data-form'(event, instance) {
    event.preventDefault();
    // Get contact info (text fields)
    const projectName = event.target.projectName.value;  // based on associated html id tags
    const bio = event.target.bio.value;
    // const address = event.target.address.value;
    // const phone = event.target.phone.value;
    // const email = event.target.email.value;
    // const newContact = { firstName, lastName, address, phone, email };

    //FIXME: currently, users track thier projects by name, so changing name makes projects unfindable to users
    //       this is only temp. problem since later implementations will have users track projects by doc. _id
    //       once they request to join on the project's profile page.
    Projects.update({ _id: FlowRouter.getParam('_id') }, { $set: { projectName: projectName }});
    Projects.update({ _id: FlowRouter.getParam('_id') }, { $set: { bio: bio }});

    //FIXME: this code below is for inserting a totally new project, out code just updates.
    //       need to modify to validate for updates.
    // // Clear out any previous validation errors.
    // instance.context.resetValidation();
    // // Invoke clean so that newContact reflects what will be inserted.
    // ProjectsSchema.clean(newContact);
    //
    // // Determine validity against schema.
    // instance.context.validate(newContact);
    // if (instance.context.isValid()) {
    //   // insert new contact data into collection
    //   Projects.insert(newContact);
    //   instance.messageFlags.set(displayErrorMessages, false);
    //
    //   // redirect back to Home_Page
    //   FlowRouter.go('Home_Page');
    // } else {
    //   instance.messageFlags.set(displayErrorMessages, true);
    // }
  },
});