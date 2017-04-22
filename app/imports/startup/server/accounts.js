import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import {Projects, ProjectsSchema} from '../../api/projects/projects.js';
import {Users, UsersSchema} from '../../api/users/users.js';
import {_} from 'meteor/underscore';
import {SkillGraphCollection} from '../../api/skill-graph/SkillGraphCollection.js';

/* eslint-disable no-console */

/* Validate username against UH cas, sending a specific error message on failure. */
Accounts.validateNewUser(function (user) {
  if (user) {
    // get username from uh-cas login service (if valid)
    const username = user.services.cas.id;
    if (username) return true;
  } else throw new Meteor.Error(403, 'User not allowed / valid');
});

if (!Meteor.settings.cas) {
  console.log('CAS settings not found! Hint: "meteor --settings ../config/settings.development.json"');
}

Accounts.onCreateUser(function (options, user) {
  /* From http://docs.meteor.com/api/accounts.html
   A user document can contain any data you want to store about a user.
   Meteor treats the following fields specially:

   1. username: a unique String identifying the user.
   2. emails: an Array of Objects with keys address and verified; an email address
   may belong to at most one user. verified is a Boolean which is true if the user has
   verified the address with a token sent over email.
   3. createdAt: the Date at which the user document was created.
   4. profile: an Object which the user can create and update with any data. Do not store
   anything on profile that you wouldn’t want the user to edit unless you have a deny
   rule on the Meteor.users collection.
   5. services: an Object containing data used by particular login services. For example,
   its reset field contains tokens used by forgot password links, and its resume field
   contains tokens used to keep you logged in between sessions.
   * */

  // initialize newUser account info with some default/test info and add to Users collection
  const newUser = {
    username: user.services.cas.id,  // if not using UH cas, use: user.username
    skills: [],
    interests: [],
    events: [],
    projects: [],
    adminProjects: [],
    followedPeople: [],  // In real cases, would need guarantee that added user existed
    followedProjects: [],
    followedBy: [],
    isSiteAdmin: false,
    pendingRequests: [],
  };

  // On creation of application makes these users site admin
  if (user.services.cas.id == 'ew7' || user.services.cas.id == 'tevesn' || user.services.cas.id == 'mjm4')
  {
    newUser.isSiteAdmin = true;
  }

  Users.insert(newUser);  // this means User documents will have different _id than the Meteor.user._id
                          // unless we create our own _id or Meteor.users.
                          // see https://guide.meteor.com/accounts.html#adding-fields-on-registration
  SkillGraphCollection.addVertexList(newUser.skills);

  // We still want the default hook's 'profile' behavior.
  if (options.profile)
    user.profile = options.profile;

  return user;
});
