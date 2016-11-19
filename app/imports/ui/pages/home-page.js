/**
 * Created by reedvilanueva on 10/16/16.
 */
import {Template} from 'meteor/templating';
import {Contacts} from '../../api/contacts/contacts.js';

import {Projects, ProjectsSchema} from '../../api/projects/projects.js';
import {BaseCollection} from '../../api/base/BaseCollection.js'
import {
    SkillGraphCollection,
    Edge
} from '../../api/skill-graph/SkillGraphCollection.js';

Template.Home_Page.onCreated(function onCreated() {
  this.autorun(() => {
    // 'autopublish' pkg has been removed
    this.subscribe('Contacts');
    this.subscribe('Projects');
  });
});

Template.Home_Page.helpers({

  /**
   * @returns {*} All of the Contacts documents.
   */
  contactsList() {
    return Contacts.find();
  },

});
