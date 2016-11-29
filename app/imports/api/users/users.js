/**
 * Created by reedvilanueva on 11/1/16.
 */
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

/* eslint-disable object-shorthand */

export const Users = new Mongo.Collection('Users');

/**
 * Create the schema for Stuff
 */
export const UsersSchema = new SimpleSchema({
  username: {  // assumes that usernames will be uniq. else need to store user's _id
    label: 'username',
    type: String,
    optional: false,
    max: 200,
  },

  firstName: {  // assumes that usernames will be uniq. else need to store user's _id
    label: 'firstName',
    type: String,
    optional: true,
    max: 50,
  },

  lastName: {  // assumes that usernames will be uniq. else need to store user's _id
    label: 'lastName',
    type: String,
    optional: true,
    max: 50,
  },

  bio: {
    label: 'bio',
    type: String,
    optional: true,
    max: 500,
  },
  skills: {
    label: 'skills',
    type: [String],
    optional: true,
    max: 200,
    maxCount: 200,
  },
  interests: {
    label: 'interests',
    type: [String],
    optional: true,
    max: 200,
    maxCount: 200,
  },
  events: {
    label: 'events',  // TODO: events may be better implememted as references to an Events collection doc.
    type: [String],   // assumes all event names uniq. else need other identifier
    optional: false,
  },
  projects: {  // used to reference what project user is part of
    label: 'projects',
    type: [String],  // assumes all projects names uniq. else need other identifier
    optional: true,
    max: 200,
    maxCount: 200,
  },
  adminProjects: {  // used to reference what projects user if admin/leader of
    label: 'adminProjects',
    type: [String],  // assumes all projects names uniq. else need other identifier
    optional: true,
    max: 200,
    maxCount: 200,
  },
  pendingRequests: {
    label: 'pendingRequests',
    type: [String],
    optional: true,
    max: 200,
    maxCount: 50,
  },
  followedPeople: {
    label: 'followedPeople',
    type: [String],  // must be uniq. identifiers of other users
    optional: true,
    max: 200,
    maxCount: 200,
  },
  followedProjects: {
    label: 'followedProjects',
    type: [String], // must be uniq. identifiers of projects (use project doc _id field?)
    optional: true,
    max: 200,
    maxCount: 200,
  },
  followedBy: {
    label: 'followedBy',
    type: [String], // must be uniq. identifiers of projects (use project doc _id field?)
    optional: true,
    max: 200,
    maxCount: 200,
  },
  isSiteAdmin: {
    label: 'isSiteAdmin',
    type: Boolean,
    optional: false,
  },
});

Users.attachSchema(UsersSchema);
