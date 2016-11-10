import { Template } from 'meteor/templating';
import { EasySearch } from 'meteor/easy:search';
import { Projects } from '../../api/projects/projects.js';
import { ProjectsIndex } from '../../api/projects/projects_index.js';

// The Header menu does not use dropdown menus, but most menus do.
// Here's how to do the required initialization for Semantic UI dropdown menus.
Template.Header.onRendered(function enableDropDown() {
  this.$('.dropdown').dropdown();
});

// Trying to implement EasySearch with projects
Template.Header.helpers({
  inputAttributes: function () {
    return { 'class': 'easy-search-input', 'placeholder': 'Start searching...' };
  },
  index: function () {
    return ProjectsIndex;
  },
})
