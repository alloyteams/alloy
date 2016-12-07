/**
 * Created by reedvilanueva on 10/26/16.
 */
import {Template} from 'meteor/templating';
import {ReactiveDict} from 'meteor/reactive-dict';
import {FlowRouter} from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor'  // to access Meteor.users collection
import { Users, UsersSchema } from '../../api/users/users.js';
import { Projects, ProjectsSchema } from '../../api/projects/projects.js';

// consts to use in reactive dicts
const displayErrorMessages = 'displayErrorMessages';

Template.User_Profile_Page_2.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('Users');
    this.subscribe('Projects');
  });

  // use reactive dict to store error messages
  this.messageFlags = new ReactiveDict();  // recall, reactive dicts can store template key/vals w/out refreshing
  this.messageFlags.set(displayErrorMessages, false);

  this.context = UsersSchema.namedContext('User_Profile_Page_2');
});

// useful thing to note, all Collection docs. have a _id key that is uniq. to that doc
Template.User_Profile_Page_2.helpers({
  /**
   * @param fieldVal
   * @returns {*} The specified value fieldVal of the project document specified by the router to this page
   */
  userDataField(fieldVal) {
    // app/imports/startup/client/router.js defines the 'id' vs '_id' bindings
    //   see app/imports/ui/pages/home-page.html
    // uses the id param specified in page that routed to this page
    //   see https://github.com/kadirahq/flow-router#routes-definition
    const user = Users.findOne({ _id: FlowRouter.getParam('_id') });
    // See https://dweldon.silvrback.com/guards to understand '&&' in next line.
    // once the subcribed collection has loaded, if the user exists, then return the specified fieldVal
    return user && user[fieldVal];
  },
  projectDataField(projectId, fieldVal) {
    const project = Projects.findOne({ _id: projectId });
    return project && project[fieldVal];
  },
  isAdmin() {
    // duplicate code here b/c helpers can't call each other by default. see http://stackoverflow.com/q/17229302
    // TODO: check that this function actually checks if current user is allowed admin permissions
    const userId = Users.findOne(FlowRouter.getParam('_id'))['_id'];
    const userName = Meteor.user().profile.name;
    const userNameId = Users.find({'username':userName}).fetch()[0]['_id'];
    console.log(userId);
    console.log(userNameId);
    return userId == userNameId;
  },
  userId: function () {
    return Meteor.userId();
  }
});

Template.User_Profile_Page_2.helpers({
  errorClass() {
    return Template.instance().messageFlags.get(displayErrorMessages) ? 'error' : '';  // empty string is falsey
  },
  displayFieldError(fieldName) {
    const errorKeys = Template.instance().context.invalidKeys();
    return _.find(errorKeys, (keyObj) => keyObj.name === fieldName);
  },
});

Template.User_Profile_Page_2.onRendered(function enableSemantic() {
  const instance = this;
  // instance.$('select.ui.dropdown').dropdown();
  // instance.$('.ui.selection.dropdown').dropdown();
  // instance.$('select.dropdown').dropdown();
  // instance.$('.ui.checkbox').checkbox();
  // instance.$('.ui.radio.checkbox').checkbox();

  // secondary menu logic FIXME: does not work (used events and helpers instead)
  instance.$('select.ui.secondary.menu').ready(function () {
    $('.ui .item').on('click', function () {
      $('.ui .item').removeClass('active');
      $(this).addClass('active');
    });
  });
});

// Template.User_Profile_Page_2.events({
// });
