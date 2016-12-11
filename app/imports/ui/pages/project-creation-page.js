/**
 * Created by Tim on 11/17/16.
 */
import {Template} from 'meteor/templating';
import {ReactiveDict} from 'meteor/reactive-dict';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {_} from 'meteor/underscore';
import {Projects, ProjectsSchema} from '../../api/projects/projects.js';
import {Users, UsersSchema} from '../../api/users/users.js';
import {CategoriesDict, CategoriesDictSchema} from '../../api/categories-dict/categories-dict.js';
import {Meteor} from 'meteor/meteor'  // to access Meteor.users collection
import {SkillGraphCollection} from '../../api/skill-graph/SkillGraphCollection.js';
import {EdgesCollection} from '../../api/skill-graph/EdgesCollection.js'

const utils = require('../../api/skill-graph/graphUtilities');  // to use the makereadable function

// consts to use in reactive dicts
const displayErrorMessages = 'displayErrorMessages';

Template.Project_Creation_Page.onCreated(function onCreated() {
  this.autorun(() => {
    // this.subscribe('UserData');  // extended Meteor.user collection data
    this.subscribe('CategoriesDict');

    // FIXME: which of these subscriptions is actually necessary? Ask Prof.
    SkillGraphCollection.subscribe();
    EdgesCollection.subscribe();
    this.subscribe('Projects');
    this.subscribe('Users');
  });

  // use reactive dict to store error messages
  this.messageFlags = new ReactiveDict();  // recall, reactive dicts can store template key/vals w/out refreshing
  this.messageFlags.set(displayErrorMessages, false);
  this.context = ProjectsSchema.namedContext('Project_Creation_Page');
});

Template.Project_Creation_Page.helpers({
  getGraphSkills() {
    console.log(SkillGraphCollection.getSkills())
    return SkillGraphCollection.getSkills();
  },
  errorClass() {
    return Template.instance().messageFlags.get(displayErrorMessages) ? 'error' : '';  // empty string is falsey
  },
  displayFieldError(fieldName) {
    const errorKeys = Template.instance().context.invalidKeys();
    return _.find(errorKeys, (keyObj) => keyObj.name === fieldName);
  },
});

Template.Project_Creation_Page.onRendered(function onRendered() {
  // need to init. jquery plugins AFTER meteor done inserting (eg. with spacebars)
  // in dynamic document. see http://stackoverflow.com/a/30834745
  const instance = this;
  instance.$('.ui.fluid.multiple.selection.search.dropdown')
      .dropdown({
        allowAdditions: true,
      });
});

Template.Project_Creation_Page.events({
//   // logic for 'submit' event for 'project-data-form' 'form submission' event
  'submit .project-data-form'(event, instance) {
    event.preventDefault();

    // Get project info (text fields)
    const newProjectName = event.target.projectName.value;  // based on associated html id tags
    const newBio = event.target.bio.value;
    const creator = Meteor.user().profile.name;
    // split string of comma-seperated strings into array of strings
    let newSkills = event.target.skills.value.split(",");
    newSkills = _.map(newSkills, (skill) => {
      return utils.makeReadable(skill);
    });
    const newUrl = event.target.projectUrl.value;
    const newProject = {
      projectName: newProjectName,
      bio: newBio,
      events: [],
      skillsWanted: newSkills,
      members: [creator],
      admins: [creator],
      joinRequests: [],
      url: newUrl,
      createdAt: new Date(),
    };

    // Clear out any previous validation errors.
    instance.context.resetValidation();
    // Invoke clean so that newContact reflects what will be inserted.
    ProjectsSchema.clean(newProject);

    // Determine validity against schema and check if a project already using given name
    const exists = Projects.findOne({ projectName: newProjectName });
    instance.context.validate(newProject);
    if (instance.context.isValid() && !exists) {
      // insert new contact data into collection
      Projects.insert(newProject);
      instance.messageFlags.set(displayErrorMessages, false);

      // Update the user to reflect new project
      const user = Users.findOne({ username: creator });
      const userID = user['_id'];
      const projectId = Projects.findOne({ projectName: newProjectName })._id;
      Users.update({ _id: userID }, { $addToSet: { projects: projectId } });
      Users.update({ _id: userID }, { $addToSet: { adminProjects: projectId } });

      // use skills posted in this project to update skillgraph
      SkillGraphCollection.addVertexList(newSkills);
      // FIXME: debug messages from the addVertexList method are displayed on client console

      // redirect back to Home_Page
      FlowRouter.go('Home_Page');
    } else {
      console.log("Trying to create failed");

      instance.messageFlags.set(displayErrorMessages, true);
    }
  },
});
