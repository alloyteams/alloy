/**
 * Created by neilteves on 03/08/17.
 */
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

/* eslint-disable object-shorthand */

export const AdminFeed = new Mongo.Collection('AdminFeed');

/**
 * Create the schema for AdminFeed collection
 */
export const UsersSchema = new SimpleSchema({
  reportedBy: {  // assumes that usernames will be uniq. else need to store user's _id
    label: 'reportedBy',
    type: String,
    optional: false,
    max: 200,
  },

  report: {
    label: 'report',
    type: String,
    optional: false,
    max: 500,
  },

  createdAt: {
    label: 'createdAt',
    type: Date,      // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
    optional: false,
  },

  msgRead: {
    label: 'msgRead',
    type: Boolean,
    optional: false,
  },
});

AdminFeed.attachSchema(AdminFeedSchema);
