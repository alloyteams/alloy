/**
 * Created by neilteves on 11/17/16.
 */
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor'; // to access Meteor.users collection
import { Projects, ProjectsSchema } from '../../api/projects/projects.js';

// consts to use in reactive dicts
const displayErrorMessages = 'displayErrorMessages';

const homeActive = 'homeActive';
const eventsActive = 'eventsActive';
const friendsActive = 'friendsActive';

let getInput = '';
let myCursor = [];
let countFoundProjects = 0;

Template.Search_Page.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('Users');
    this.subscribe('Projects');
  });

  // use reactive dict to store error messages
  this.messageFlags = new ReactiveDict();  // recall, reactive dicts can store template key/vals w/out refreshing
  this.messageFlags.set(displayErrorMessages, false);

  this.navMenuActive = new ReactiveDict();
  this.navMenuActive.set(homeActive, true);
  this.navMenuActive.set(eventsActive, false);
  this.navMenuActive.set(friendsActive, false);
});

Template.Search_Page.onRendered(function enableSemantic() {
  // TODO:
});

Template.Search_Page.helpers({
  projNum() {
    return countNum;
  },
  compareFound() {
    if (countFoundProjects > 0)
    {
      console.log("alpha");
      return true;
    } else {
      console.log("bravo");
      return false;
    }
  },
  homeActiveClass() {
    return Template.instance().navMenuActive.get(homeActive) ? 'active' : '';  // 'active' string also doubles as truthy
  },
  eventsActiveClass() {
    return Template.instance().navMenuActive.get(eventsActive) ? 'active' : '';
  },
  friendsActiveClass() {
    return Template.instance().navMenuActive.get(friendsActive) ? 'active' : '';
  },
  errorClass() {
    return Template.instance().messageFlags.get(displayErrorMessages) ? 'error' : '';  // empty string is falsey
  },
  displayFieldError(fieldName) {
    const errorKeys = Template.instance().context.invalidKeys();
    return _.find(errorKeys, (keyObj) => keyObj.name === fieldName);
  },
});

Template.Search_Page.events({
  'submit .form-register': function (event, template) {
    event.preventDefault();
    getInput = event.target.searchInput.value;

    console.log('search input: ' + getInput);

    myCursor = Projects.find({skills: getInput});
    countFoundProjects = _.size(myCursor.fetch());

    console.log('found projects: ' + countFoundProjects);

    // // .fetch() makes an object Array of what is inside the myCursor variable
    // console.log(myCursor.fetch());
    // // _.size() counts the number of items in the array
    // console.log(_.size(myCursor.fetch()));
    // // i'm calling on the first item in the myCursor.fetch() array
    // console.log(myCursor.fetch()[0]);
    console.log(myCursor.fetch()[0].projectName);
  },
});
