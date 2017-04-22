/**
 * Created by reedvilanueva on 10/15/16.
 */

import { ReactiveDict } from 'meteor/reactive-dict';
// import { Tracker } from 'meteor/tracker';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { Users, UsersSchema } from '../../api/users/users.js';
import { SkillGraphCollection } from '../../api/skill-graph/SkillGraphCollection.js';
import { EdgesCollection } from '../../api/skill-graph/EdgesCollection.js'

const utils = require('../../api/skill-graph/graphUtilities');  // to use the make readable function

/* eslint-disable object-shorthand, no-unused-vars */

const displayErrorMessages = 'displayErrorMessages';

Template.Edit_Profile_Page.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('Users');
    SkillGraphCollection.subscribe();
    EdgesCollection.subscribe();
  });
  this.messageFlags = new ReactiveDict();
  this.messageFlags.set(displayErrorMessages, false);
  this.context = UsersSchema.namedContext('Edit_Profile_Page');
});


Template.Edit_Profile_Page.helpers({
  getGraphSkills() {
    console.log(SkillGraphCollection.getSkills())
    return SkillGraphCollection.getSkills();
  },

  userDataField(fieldVal) {
    // app/imports/startup/client/router.js defines the 'id' vs '_id' bindings
    //   see app/imports/ui/pages/home-page.html
    // uses the id param specified in home-page.html
    //   see https://github.com/kadirahq/flow-router#routes-definition
    const user = Users.findOne(FlowRouter.getParam('_id'));

    // See https://dweldon.silvrback.com/guards to understand '&&' in next line.
    // if the contact exists, then return the fieldVal
    return user && user[fieldVal];
  },

  errorClass() {
    return Template.instance().messageFlags.get(displayErrorMessages) ? 'error' : '';
  },

  displayFieldError(fieldName) {
    const errorKeys = Template.instance().context.invalidKeys();
    return _.find(errorKeys, (keyObj) => keyObj.name === fieldName);
  },

  getSkillString: function() {
    const user = Users.findOne(FlowRouter.getParam('_id'));
    let skillString = '';
    for (let i = 0; i < user.skills.length; i += 1) {
      skillString += user.skills[i] + ',';
    }
    skillString = skillString.substring(0, skillString.length - 1);
    console.log(skillString);
    return skillString;
  },

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

Template.Edit_Profile_Page.events({
  'submit .user-data-form'(event, instance) {
    event.preventDefault();
    // Get contact info (text fields)
    const firstName = event.target.firstName.value;  // based on associated html id tags
    const lastName = event.target.lastName.value;
    const bio = event.target.bio.value;
    let skills = event.target.skills.value.split(',');
    skills = _.map(skills, (skill) => { return utils.makeReadable(skill); });

    //const updatedUser = { firstName, lastName, bio, skills };

    // Clear out any old validation errors.
    //instance.context.resetValidation();
    // Invoke clean so that newStudentData reflects what will be inserted.
    //UsersSchema.clean(updatedUser);
    // Determine validity.
    //instance.context.validate(updatedUser);
    // console.log(skills);
    Users.update({ _id: FlowRouter.getParam('_id') }, { $set: { firstName: firstName } });
    Users.update({ _id: FlowRouter.getParam('_id') }, { $set: { lastName: lastName } });
    Users.update({ _id: FlowRouter.getParam('_id') }, { $set: { bio: bio } });
    Users.update({ _id: FlowRouter.getParam('_id') }, { $set: { skills: skills } });

    // use skills posted in this project to update skillgraph
    SkillGraphCollection.addVertexList(skills);
    // FIXME: debug messages from the addVertexList method are displayed on client console
    // FIXME: groups of skills get edge weights increased even if they are not 'new' to the user's skills

    FlowRouter.go('User_Profile_Page_2', { _id: FlowRouter.getParam('_id') });
  },
});

Template.Edit_Profile_Page.onRendered(function onRendered() {
  $('.ui.fluid.multiple.selection.search.dropdown')
      .dropdown({
        allowAdditions: true,
      });
});
