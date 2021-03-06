/**
 * Created by reedvilanueva on 10/20/16.
 */
import {Template} from 'meteor/templating';
import {ReactiveDict} from 'meteor/reactive-dict';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {_} from 'meteor/underscore';
import {Users, UsersSchema} from '../../api/users/users.js';
import {Projects, ProjectsSchema} from '../../api/projects/projects.js';
import {Meteor} from 'meteor/meteor'  // to access Meteor.users collection
import {SkillGraphCollection} from '../../api/skill-graph/SkillGraphCollection.js';
import {EdgesCollection} from '../../api/skill-graph/EdgesCollection.js';

// consts to use in reactive dicts
const displayErrorMessages = 'displayErrorMessages';
const utils = require('../../api/skill-graph/graphUtilities');  // to use the makereadable function

Template.Project_Admin_Page.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('Users');
    this.subscribe('Projects');  // extended Meteor.user collection data

    SkillGraphCollection.subscribe();
    EdgesCollection.subscribe();
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
  },

  getSkillString: function () {
    const project = Projects.findOne(FlowRouter.getParam('_id'));
    let skillString = '';
    for (let i = 0; i < project.skillsWanted.length; i += 1) {
      skillString += project.skillsWanted[i] + ',';
    }
    skillString = skillString.substring(0, skillString.length - 1);
    return skillString;
  },

  getGraphSkills() {
    console.log(SkillGraphCollection.getSkills());
    return SkillGraphCollection.getSkills();
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
  /*
   instance.$('select.ui.secondary.menu').ready(function () {
   $('.ui .item').on('click', function () {
   $('.ui .item').removeClass('active');
   $(this).addClass('active');
   });
   });
   */
});

Template.Project_Admin_Page.events({
//   // logic for 'submit' event for 'project-data-form' 'form submission' event
  'submit .project-data-form'(event, instance) {
    event.preventDefault();

    // Get contact info (text fields)
    const projectName = event.target.projectName.value;  // based on associated html id tags
    const bio = event.target.bio.value;
    let skillsWanted = event.target.skillsWanted.value.split(',');
    skillsWanted = _.map(skillsWanted, (skill) => { return utils.makeReadable(skill); });
    const url = event.target.projectUrl.value;

    console.log(skillsWanted);
    Projects.update({ _id: FlowRouter.getParam('_id') }, {
      $set: {
        projectName: projectName,
        bio: bio,
        skillsWanted: skillsWanted,
        url: url,
        modifiedAt: new Date()
      }
    });

    SkillGraphCollection.addVertexList(skillsWanted);

    FlowRouter.go('Project_Profile_Page', { _id: FlowRouter.getParam('_id') });
  },
});

Template.Project_Admin_Page.onRendered(function onRendered() {
  $('.ui.fluid.multiple.selection.search.dropdown')
      .dropdown({
        allowAdditions: true,
      });
});
