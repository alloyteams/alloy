/**
 * Created by reedvilanueva on 10/17/16.
 */
import { Projects } from '../../api/projects/projects.js';
import { Users } from '../../api/users/users.js';
import { CategoriesDict } from '../../api/categories-dict/categories-dict.js';
import { SkillGraphCollection } from '../../api/skill-graph/SkillGraphCollection.js';
import { EdgesCollection } from '../../api/skill-graph/EdgesCollection.js';
import { AdminFeed } from '../../api/admin-feed/admin-feed.js';
import { Images } from '../../api/images/images.js';
import { Meteor } from 'meteor/meteor';

// 'autopublish' pkg has been removed

Meteor.publish('Users', function publishUsersData() {
  return Users.find();
});

Meteor.publish('Projects', function publishProjectsData() {
  return Projects.find();
});

Meteor.publish('CategoriesDict', function publishCategoriesDictData() {
  return CategoriesDict.find();
});

Meteor.publish('AdminFeed', function publishAdminFeedData() {
  return AdminFeed.find();
});

Meteor.publish('Images', function publishImagesFeedData() {
  return Images.find();
});

SkillGraphCollection.publish();
EdgesCollection.publish();
