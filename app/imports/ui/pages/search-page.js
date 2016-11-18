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
let myCursor = Projects.find();
Session.set("countFoundProjects", 0);
let countFoundProjects = Session.get("countFoundProjects");

Template.Search_Page.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('Users');
    this.subscribe('Projects');
  });
});

Template.Search_Page.onRendered(function enableSemantic() {
  // TODO:
});

Template.Search_Page.helpers({
  projNum() {
    return countFoundProjects = Session.get("countFoundProjects");
  },
  compareFound() {
    if (Session.get("countFoundProjects") > 0)
    {
      return true;
    } else {
      return false;
    }
  },
  'iterateProjects': function() {
    return myCursor.fetch();
  },
});

Template.Search_Page.events({
  'submit .form-register': function (event, template) {
    event.preventDefault();
    getInput = event.target.searchInput.value;

    console.log('search input: ' + getInput);

    myCursor = Projects.find({skills: getInput});
    // countFoundProjects = _.size(myCursor.fetch());
    countFoundProjects = Session.set("countFoundProjects", _.size(myCursor.fetch()));

    console.log('found projects: ' + Session.get("countFoundProjects"));

    // // .fetch() makes an object Array of what is inside the myCursor variable
    // console.log(myCursor.fetch());
    // // _.size() counts the number of items in the array
    // console.log(_.size(myCursor.fetch()));
    // // i'm calling on the first item in the myCursor.fetch() array
    // console.log(myCursor.fetch()[0]);
    console.log(myCursor.fetch()[0].projectName);
    console.log(Projects.find());
  },
});
