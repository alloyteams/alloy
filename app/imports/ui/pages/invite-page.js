/**
 * Created by neil on 4/13/2017.
 */
import {Template} from 'meteor/templating';
import {ReactiveDict} from 'meteor/reactive-dict';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {_} from 'meteor/underscore';
import {Users, UsersSchema} from '../../api/users/users.js';
import {Meteor} from 'meteor/meteor'  // to access Meteor.users collection

Template.Invite_Page.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('Users');
  });
});

Template.Invite_Page.onRendered(function onRendered() {
  // need to init. jquery plugins AFTER meteor done inserting (eg. with spacebars)
  // in dynamic document. see http://stackoverflow.com/a/30834745
  const instance = this;
  instance.$('.ui.fluid.multiple.selection.search.dropdown')
      .dropdown({
        allowAdditions: true,
      });
});

Template.Invite_Page.helpers({

});

Template.Invite_Page.events({
  'click .ui.invite.button': function (event, instance) {
    event.preventDefault();

    let userToInvite = event.currentTarget.parentNode.children[0].value;
    userToInvite = userToInvite.trim();

    if (userToInvite === '') {
      // console.log("clicked");
    } else {
      userToInvite = String(userToInvite).toLowerCase();
      // console.log(userToInvite);
      const allUsers = Users.find().fetch();
      // console.log(allUsers);

      if (_.findWhere(allUsers, {'username': userToInvite})) {
        // console.log("User already exists");
        $('.ui.basic.invite.exist.modal')
            .modal('show')
        ;
      } else {
        // console.log("Invite sent");
        userToInvite = userToInvite + "@hawaii.edu";
        emailMsg = "You have a request to join Alloy from " + Meteor.user().profile.name + ".";

        // Sending an email to alloy email account about project invite
        Meteor.call(
            'sendEmail',
            userToInvite,
            'alloyUH@gmail.com',
            'ALLOY-NOTIFICATION-INVITE',
            emailMsg
        );
        // console.log("email sent");

        $('.ui.basic.invite.success.modal')
            .modal('show')
        ;
      }
    }

  },
});
