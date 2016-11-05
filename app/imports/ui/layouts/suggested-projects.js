/**
 * Created by reedvilanueva on 11/5/16.
 */
import {Template} from 'meteor/templating';
import {ReactiveDict} from 'meteor/reactive-dict';
import {FlowRouter} from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor'  // to access Meteor.users collection
import { Projects, ProjectsSchema } from '../../api/projects/projects.js';
import { Users, UsersSchema } from '../../api/users/users.js';

// consts to use in reactive dicts
const displayErrorMessages = 'displayErrorMessages';

Template.Suggested_Projects.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('Users');
    this.subscribe('Projects');
  });

  // use reactive dict to store error messages
  this.messageFlags = new ReactiveDict();  // recall, reactive dicts can store template key/vals w/out refreshing
  this.messageFlags.set(displayErrorMessages, false);

});

// useful thing to note, all Collection docs. have a _id key that is uniq. to that doc
Template.Suggested_Projects.helpers({
  /**
   * @returns {*} 10 of the Projects documents.
   */
  projectsList() {
    // TODO: currently chooses docs. in natural / default order (may want to change this later)
    // TODO: currently subscribes to all docs. and filters only 10, can set subscription limit if desired
    // see http://stackoverflow.com/questions/19161000/how-to-use-meteor-limit-properly
    const displayLimit = 4;
    return Projects.find({}, {limit: displayLimit});
  },

});

Template.Suggested_Projects.helpers({
  errorClass() {
    return Template.instance().messageFlags.get(displayErrorMessages) ? 'error' : '';  // empty string is falsey
  },
  displayFieldError(fieldName) {
    const errorKeys = Template.instance().context.invalidKeys();
    return _.find(errorKeys, (keyObj) => keyObj.name === fieldName);
  },
});

Template.Suggested_Projects.onRendered(function enableSemantic() {
  const instance = this;
  // instance.$('select.ui.dropdown').dropdown();
  // instance.$('.ui.selection.dropdown').dropdown();
  // instance.$('select.dropdown').dropdown();
  // instance.$('.ui.checkbox').checkbox();
  // instance.$('.ui.radio.checkbox').checkbox();
});

Template.Suggested_Projects.events({

});