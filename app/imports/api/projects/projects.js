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
  events: {
    label: 'events',
    type: [String],  // TODO: should eventually be a custom event object
    optional: true,
    max: 200,
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

});
Projects.attachSchema(ProjectsSchema);

// for testing: for testing logic of user discovering and joining a club
const joinableNullClub = {
  projectName: 'joinableNull Club',
  bio: 'Cross over children. All are welcome',
  events: ['Bad B-Movies', 'Chair Stackathon'],
  url: 'https://join.us'
};
Projects.insert(joinableNullClub);

// NOTE: rather than adding methods to an api/collection file to give certain collections different behaviors
// this (http://stackoverflow.com/a/21546609) seems to be to offical way to do it.