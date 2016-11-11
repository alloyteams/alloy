import { Template } from 'meteor/templating';
import { EasySearch } from 'meteor/easy:search';
import { Projects } from '../../api/projects/projects.js';

// The Header menu does not use dropdown menus, but most menus do.
// Here's how to do the required initialization for Semantic UI dropdown menus.
Template.Header.onRendered(function enableDropDown() {
  this.$('.dropdown').dropdown();
});