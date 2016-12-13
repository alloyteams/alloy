import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor';  // to access Meteor.users collection
import { Projects, ProjectsSchema } from '../../api/projects/projects.js';
import { Users, UsersSchema } from '../../api/users/users.js';
import { SkillGraphCollection } from '../../api/skill-graph/SkillGraphCollection.js';
import { EdgesCollection } from '../../api/skill-graph/EdgesCollection.js';
import PriorityQueue from 'js-priority-queue';
