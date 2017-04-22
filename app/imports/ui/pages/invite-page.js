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
  isRestricted() {
    const user = Users.findOne({ username: Meteor.user().profile.name });
    const bool = user['isRestricted'];
    if (bool == true) {
      return true;
    } else {
      return false;
    }
  },
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
        // emailMsg = "<img src='/app/public/images/alloy-bare-wordmark.png'> You have a request to join Alloy from " + Meteor.user().profile.name + ".";
        htmlMsg = "<div style='border: 3px solid #27AAE1; border-radius: 3px; padding-top: 30px;'>" +
            "<a href='http://www.alloy.rocks'><img src='https://github.com/alloyteams/alloy/blob/master/app/public/images/alloy-wordmark.png?raw=true'" +
            "style='display: block; margin: auto;'></a><br><br>" +
            "<div style='background-color: #F8F8F8;'>" +
            "<div style='text-align: center; font-size: large; max-width: 450px; margin: 0 auto; padding: 10px;'>" +
            "You have a request to join Alloy from <span style='color: #A6CE39; text-transform: uppercase;'>" + Meteor.user().profile.name + "</span>.  " +
            "Alloy is a tool to help students of UH Manoa find projects and find people for projects of their own.  " +
            "Have an idea for a project that would look good on your resume? Want to do your own custom senior project?  " +
            "Or do you just want to experiment and learn something new with other students who just want to do the same?<br><br><br>" +
            "Click the banner above or the link http://www.alloy.rocks to go to our website." +
            "</div></div></div>";

        // Sending an email to alloy email account about project invite
        Meteor.call(
            'sendHtmlEmail',
            userToInvite,
            'alloyUH@gmail.com',
            'ALLOY-NOTIFICATION-INVITE',
            htmlMsg
        );
        // console.log("email sent");

        $('.ui.basic.invite.success.modal')
            .modal('show')
        ;
      }
    }

  },
});
