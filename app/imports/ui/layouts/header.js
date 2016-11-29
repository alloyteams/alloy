import {Template} from 'meteor/templating';
import {Users, UsersSchema} from '../../api/users/users.js';

// The Header menu does not use dropdown menus, but most menus do.
// Here's how to do the required initialization for Semantic UI dropdown menus.
Template.Header.onRendered(function enableDropDown() {
  this.$('.dropdown').dropdown();
});

Template.Header.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('Users');
  });
  });

// Here's how to do the required initialization for Semantic UI dropdown menus.
  Template.Header.onRendered(function enableDropDown() {
    this.$('.dropdown').dropdown({
      action: 'select',
    });
  });

  Template.Header.helpers({
    getMyId: function() {
      const userName = Meteor.user().profile.name;
      const userNameId = Users.find({ 'username': userName }).fetch()[0]['_id'];
      return userNameId;
    },
  });
