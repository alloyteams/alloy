/**
 * Created by reedvilanueva on 10/23/16.
 */

import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

/* eslint-disable object-shorthand */

export const Projects = new Mongo.Collection('Projects');

/**
 * Create the schema for Stuff
 */
export const ProjectsSchema = new SimpleSchema({
  projectName: {  // assumes that usernames will be uniq. else need to store user's _id
    label: 'projectName',
    type: String,
    optional: false,
    max: 200,
  },
  bio: {
    label: 'bio',
    type: String,
    optional: false,
    max: 200,
  },
  pictures: {
    label: 'pictures',
    type: [String],     // FIXME: may need to change; urls may have chars that need to be escaped in Strings
    optional: true,
    maxCount: 20,
  },
  events: {
    label: 'events',
    type: [String],  // TODO: should eventually be a custom event object
    optional: true,
    max: 200,
  },
  skillsWanted: {
    label: 'skillsWanted',
    type: [String],
    optional: true,
    max: 200,
    maxCount: 200,
  },
  url: {
    label: 'url',
    type: String,
    optional: true,
  },
  members: {
    label: 'members',
    type: [String],  // TODO: may what to have more info per member (array of n-tuples)
    optional: true,
  },
  admins: {
    label: 'admins',
    type: [String],
    optional: true,
  },
  joinRequests: {
    label: 'joinRequests',
    type: [String],  // TODO: can use user's username; would need to do another publish of Users w/ only public info
    optional: true,
    maxCount: 100,  // TODO: this should probably be smaller, to reduce chance of someone having a huge backlog
  },
  createdAt: {
    label: 'createdAt',
    type: Date,      // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
    optional: false,
  },
  modifiedAt: {
    label: 'modifiedAt',
    type: Date,      // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
    optional: true,
  }
});
Projects.attachSchema(ProjectsSchema);
