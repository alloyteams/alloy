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
  projects: {  // used to reference what project user is part of
    label: 'projects',
    type: [String],  // assumes all projects names uniq. else need other identifier
    optional: true,
    max: 200,
  },
  events: {
    label: 'events',  // TODO: events may be better implememted as references to an Events collection doc.
    type: [String],  // assumes all event names uniq. else need other identifier
    optional: false,
  },
  adminProjects: {  // used to reference what projects user if admin/leader of
    label: 'adminProjects',
    type: [String],  // assumes all projects names uniq. else need other identifier
    optional: true,
    max: 200,
  },
  isSiteAdmin: {
    label: 'isSiteAdmin',
    type: Boolean,
    optional: false,
  },
});

Users.attachSchema(UsersSchema);
