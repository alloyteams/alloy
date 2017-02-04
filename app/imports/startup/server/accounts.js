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

  /* initialize a new user */
  const defaultUser = {
    username: 'default',  // if not using UH cas, use: user.username
    skills: ['Hugging'],
    interests: ['working together'],
    events: [],
    projects: [],
    adminProjects: [],
    followedPeople: [],  // In real cases, would need guarantee that added user existed
    followedProjects: [],
    followedBy: [],
    isSiteAdmin: false,
    pendingRequests: [],
  };
  let defaultUserExists = Users.findOne({ username: defaultUser.username });
  if (!(defaultUserExists)) {
    Users.insert(defaultUser);
  }

  // create a default club to be joined by all users (for testing)
  // FIXME: is this the bet way to have a default collection obj. accessable at startup (may also want to add validation)?
  // NOTE: The const declaration creates a read-only reference to a value.
  // It does not mean the value it holds is immutable, just that the variable
  // identifier cannot be reassigned
  const defaultProject = {
    projectName: 'The Null Project',
    bio: 'This is the null project,\nwere all in it!',
    events: ['nullProject event-1', 'nullProject event-2'],
    skillsWanted: ['Javascript', 'Joining', 'Clicking'],
    url: 'https://theNullProject.org',
    createdAt: new Date(),  // could immediately get string with: new Date().toString().split(' ').splice(0, 4).join(' ')
  };
  // if the default project has not yet been added to Projects collection, do so.
  // returns 'undefined' if none found (falsey), else first matched obj. (truthy?)
  let defaultExists = Projects.findOne({ projectName: defaultProject.projectName });
  if (!(defaultExists)) {
    Projects.insert(defaultProject);

    // TESTING: update SkillGraphCollection with this new defaultProject
    SkillGraphCollection.addVertexList(defaultProject.skillsWanted);
    _.each(defaultProject.skillsWanted, (skill) => {
      console.log(`${SkillGraphCollection.adjListToString(skill)}`);
    });

    let pq = SkillGraphCollection.adjMaxPQ('clicking');
    const currSize = pq.length;
    console.log("'clicking' PQ");
    for (let i = 0; i < currSize; i++) {
      console.log(pq.dequeue());
    }
  }

  // initialize newUser account info with some default/test info and add to Users collection
  const newUser = {
    username: user.services.cas.id,  // if not using UH cas, use: user.username
    skills: ['Hugging'],
    interests: ['working together'],
    events: ['The Null Event-1', 'The Null Event-2'],
    projects: [Projects.findOne({ projectName: defaultProject.projectName })._id],
    adminProjects: [Projects.findOne({ projectName: defaultProject.projectName })._id],
    followedPeople: ['edwardNullen123'],  // In real cases, would need guarantee that added user existed
    followedProjects: [defaultProject.projectName],
    followedBy: ['edwardNullen123'],
    isSiteAdmin: false,
    pendingRequests: [],
  };

  // On creation of application makes these users site admin
  if (user.services.cas.id == 'ew7' || user.services.cas.id == 'tevesn')
  {
    newUser.isSiteAdmin = true;
  }

  Users.insert(newUser);  // this means User documents will have different _id than the Meteor.user._id
                          // unless we create our own _id or Meteor.users.
                          // see https://guide.meteor.com/accounts.html#adding-fields-on-registration
  SkillGraphCollection.addVertexList(newUser.skills);

  // This is a test of adding members to projects dynamically, rather than at project declaration.
  // add this user as a member and admin of the default project array fields
  // see https://docs.mongodb.com/manual/reference/operator/update/
  Projects.update({ projectName: defaultProject.projectName }, { $addToSet: { members: newUser.username } });
  Projects.update({ projectName: defaultProject.projectName }, { $addToSet: { admins: newUser.username } });

  // We still want the default hook's 'profile' behavior.
  if (options.profile)
    user.profile = options.profile;

  return user;
});

// FIXME: causes 'id required' error when using UH accounts-cas. Should just delete?
/* When running app for first time, pass a settings file to set up a default user account if no other users. */
if (Meteor.users.find().count() === 0) {
// for testing: for testing logic of user discovering and joining a club
  const joinableNullProject = {
    projectName: 'joinableNull Project',
    bio: 'Cross over children. All are welcome',
    events: ['Bad B-Movies', 'Chair Stackathon'],
    skillsWanted: ['Finding', 'Clicking', 'Joining'],
    url: 'https://join.us',
    createdAt: new Date(),
  };
  // if the default project has not yet been added to Projects collection, do so.
  // returns 'undefined' if none found (falsey), else first matched obj. (truthy?)
  let exists = Projects.findOne({ projectName: joinableNullProject.projectName });
  if (!(exists)) {
    Projects.insert(joinableNullProject);

    // TESTING: update SkillGraphCollection with this new defaultProject
    // adding vertcies to SkillGraphCollection
    SkillGraphCollection.addVertexList(joinableNullProject.skillsWanted);

    _.each(joinableNullProject.skillsWanted, (skill) => {
      console.log(`${SkillGraphCollection.adjListToString(skill)}`);
    });

    let pq = SkillGraphCollection.adjMaxPQ('clicking');
    const currSize = pq.length;
    console.log("'clicking' PQ");
    for (let i = 0; i < currSize; i++) {
      console.log(pq.dequeue());
    }
  }
}