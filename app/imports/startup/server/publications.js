/**
 * Created by reedvilanueva on 10/17/16.
 */
import { Contacts } from '../../api/contacts/contacts.js';
import { Projects } from '../../api/projects/projects.js';
import { Users } from '../../api/users/users.js';
import { SkillGraphCollection } from '../../api/skill-graph/SkillGraphCollection.js';
import { EdgesCollection } from '../../api/skill-graph/EdgesCollection.js';
import { Meteor } from 'meteor/meteor';

// 'autopublish' pkg has been removed
Meteor.publish('Contacts', function publishContactsData() {
  return Contacts.find();
});

Meteor.publish('Users', function publishUsersData() {
  return Users.find();
});

Meteor.publish('Projects', function publishProjectsData() {
  return Projects.find();
});

SkillGraphCollection.publish();
EdgesCollection.publish();


