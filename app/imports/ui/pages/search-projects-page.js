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

var results = [];
var countFoundProjects = Session.get("countFoundProjects");

Template.Search_Projects_Page.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('Users');
    this.subscribe('Projects');
  });

  Session.set("countFoundProjects", 0);
});

Template.Search_Projects_Page.onRendered(function enableSemantic() {
  // TODO:
});

Template.Search_Projects_Page.helpers({
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
  getProjects() {
    return results;
  }
});

Template.Search_Projects_Page.events({
  'submit .form-register': function (event, template) {
    event.preventDefault();

    countFoundProjects = Session.set("countFoundProjects", 0);
    let searchTerms = event.target.searchInput.value.split(",");
    searchTerms = _.map(searchTerms, (skill) => { return utils.makeReadable(skill); });

    console.log('search input: ' + searchTerms);

    results = _.map(searchTerms, (term) => { return Projects.find({ skillsWanted: term }).fetch(); });
    results = results.concat(_.map(searchTerms, (term) => { return Projects.find({ skills: term }).fetch(); }));
    results = _.flatten(results);

    countFoundProjects = Session.set("countFoundProjects", results.length);

  },
  'submit .form-clear': function (event, template) {
    event.preventDefault();
    countFoundProjects = Session.set("countFoundProjects", 0);
  },
});
