/**
 * Created by neil on 11/10/2016.
 */

import {Meteor} from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { EasySearch } from 'meteor/easy:search';
import { Projects } from '../../api/projects/projects.js';


Template.search.onCreated(function appBodyOnCreated() {
  // placeholder: typically you will put global subscriptions here if you remove the autopublish package.
});

Template.search.helpers({
  // placeholder: if you display dynamic data in your layout, you will put your template helpers here.
})

Template.search.events({
  'submit .form-register': function (event, template) {
    event.preventDefault();
    let getInput = event.target.searchInput.value;

    console.log('search input: ' + getInput);

    let myCursor = Projects.find({skills: getInput});

    console.log(myCursor.fetch());
  },
});
