import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import {Projects, ProjectsSchema} from '../../api/projects/projects.js';
import {Users, UsersSchema} from '../../api/users/users.js';

/* eslint-disable no-console */

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

  /* initialize a new user */

  // create a default club to be joined by all users (for testing)
  // FIXME: is this the bet way to have a default collection obj. accessable at startup (may also want to add validation)?

  // NOTE: The const declaration creates a read-only reference to a value.
  // It does not mean the value it holds is immutable, just that the variable
  // identifier cannot be reassigned
  const defaultProject = {
    projectName: 'The Null Project',
    bio: 'This is the null project,\nwere all in it!',
    events: ['nullProject event-1', 'nullProject event-2'],
    url: 'https://theNullProject.org',
  };
  // if the default project has not yet been added to Projects collection, do so.
  // returns 'undefined' if none found (falsey), else first matched obj. (truthy?)
  let defaultExists = Projects.findOne({projectName: 'The Null Project'});
  if(!(defaultExists)){
    Projects.insert(defaultProject);
  }

  // initialize newUser account info ad add to Users collection
  const newUser = {
    username: user.username,
    projects: [defaultProject.projectName],
    events: ['The Null Event-1', 'The Null Event-2'],
    adminProjects: [defaultProject.projectName],
    isSiteAdmin: false
  };
  Users.insert(newUser);  // this means User documents will have different _id than the Meteor.user._id
                          // unless we create our own _id or Meteor.users.
                          // see https://guide.meteor.com/accounts.html#adding-fields-on-registration

  // This is a test of adding members to projects dynamically, rather than at project declaration.
  // add this user as a member and admin of the default project
  // see https://docs.mongodb.com/manual/reference/operator/update/
  // TODO: add function to Projects collection api that allows user.projects and project.members to be set simultaneously
  Projects.update({projectName: 'The Null Project'}, { $addToSet: {members: newUser.username} });
  Projects.update({projectName: 'The Null Project'}, { $addToSet: {admins: newUser.username} });

  // // extending Meteor.user collection with custom fields
  // // this is the recommended way, see https://guide.meteor.com/accounts.html#adding-fields-on-registration
  // // TODO: find how to extend the Meteor.user schema to always include these fields
  // user.projects = [defaultProject.projectName];  // assumes projectNames are all uniq. (else need some other uniq. ID)
  // user.events = ['The Null Event-1', 'The Null Event-2'];
  // user.adminProjects = [defaultProject.projectName];
  // user.isSiteAdmin = false;


  // We still want the default hook's 'profile' behavior.
  if (options.profile)
    user.profile = options.profile;

  return user;
});



/* When running app for first time, pass a settings file to set up a default user account. */
if (Meteor.users.find().count() === 0) {
  if (!!Meteor.settings.defaultAccount) {
    Accounts.createUser({
      username: Meteor.settings.defaultAccount.username,
      password: Meteor.settings.defaultAccount.password,
    });
  } else {
    console.log('No default user!  Please invoke meteor with a settings file.');
  }
}