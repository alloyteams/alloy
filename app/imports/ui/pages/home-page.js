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
import { Users } from '../../api/users/users.js';

Template.Home_Page.onCreated(function onCreated() {
  this.autorun(() => {
    // 'autopublish' pkg has been removed
    this.subscribe('Contacts');
    this.subscribe('Projects');
    this.subscribe('Users');
  });
});

Template.Home_Page.helpers({

  /**
   * @returns {*} All of the Contacts documents.
   */
  contactsList() {
    return Contacts.find();
  },
  /**
   * @param fieldVal
   * @returns {*} The specified value fieldVal of the project document specified by the router to this page
   */
  userDataField(fieldVal) {
    // app/imports/startup/client/router.js defines the 'id' vs '_id' bindings
    //   see app/imports/ui/pages/home-page.html
    // uses the id param specified in page that routed to this page
    //   see https://github.com/kadirahq/flow-router#routes-definition
    const user = Users.findOne({ username: Meteor.user().profile.name });
    console.log(user[fieldVal]);
    // See https://dweldon.silvrback.com/guards to understand '&&' in next line.
    // once the subcribed collection has loaded, if the user exists, then return the specified fieldVal
    return user && user[fieldVal];
  },
});
