/**
 * Created by Tim on 11/17/16.
 */
import {Template} from 'meteor/templating';
import {ReactiveDict} from 'meteor/reactive-dict';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {_} from 'meteor/underscore';
import {Projects, ProjectsSchema} from '../../api/projects/projects.js';
import {Users, UsersSchema} from '../../api/users/users.js';
import {Meteor} from 'meteor/meteor'  // to access Meteor.users collection
import { SkillGraphCollection } from '../../api/skill-graph/SkillGraphCollection.js';

// consts to use in reactive dicts
const displayErrorMessages = 'displayErrorMessages';

Template.Project_Creation_Page.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('Users');  // extended Meteor.user collection data
  });
  // use reactive dict to store error messages
  this.messageFlags = new ReactiveDict();  // recall, reactive dicts can store template key/vals w/out refreshing
  this.messageFlags.set(displayErrorMessages, false);
  this.context = ProjectsSchema.namedContext('Project_Creation_Page');
});

Template.Project_Creation_Page.helpers({
  errorClass() {
    return Template.instance().messageFlags.get(displayErrorMessages) ? 'error' : '';  // empty string is falsey
  },
  displayFieldError(fieldName) {
    const errorKeys = Template.instance().context.invalidKeys();
    return _.find(errorKeys, (keyObj) => keyObj.name === fieldName);
  },
});

Template.Project_Creation_Page.events({
//   // logic for 'submit' event for 'project-data-form' 'form submission' event
  'submit .project-data-form'(event, instance) {
    event.preventDefault();

    // Get project info (text fields)
    const newProjectName = event.target.projectName.value;  // based on associated html id tags
    const newBio = event.target.bio.value;
    const newMember = Meteor.user().profile.name;
    // split string of comma-seperated words into array of strings
    const newSkills = event.target.skills.value.split(",");
    const newUrl = event.target.projectUrl.value;
    const newProject = {
      projectName: newProjectName,
      bio: newBio,
      events: [],
      skills: newSkills,
      skillsWanted: newSkills,
      members: [newMember],
      admins: [newMember],
      url: newUrl,
      createdAt: new Date(),
    };

    // Clear out any previous validation errors.
    instance.context.resetValidation();
    // Invoke clean so that newContact reflects what will be inserted.
    ProjectsSchema.clean(newProject);

    // Determine validity against schema.
    instance.context.validate(newProject);
    if (instance.context.isValid()) {
      // insert new contact data into collection
      Projects.insert(newProject);
      instance.messageFlags.set(displayErrorMessages, false);

      // Update the user to reflect new project
      const user = Users.find({ username: newMember }).fetch()[0];
      const userID = user['_id'];
      let projects = user['projects'];
      projects.push(newProjectName);
      let adminProjects = user['adminProjects'];
      adminProjects.push(newProjectName);
      Users.update({ _id: userID }, { $set: { projects: projects } });
      Users.update({ _id: userID }, { $set: { adminProjects: adminProjects } });
      // redirect back to Home_Page
      FlowRouter.go('Home_Page');
    } else {
      console.log("Trying to create failed");

      instance.messageFlags.set(displayErrorMessages, true);
    }
  },
});

Template.Project_Creation_Page.onRendered(function onRendered() {
  $('.ui.fluid.multiple.selection.search.dropdown')
      .dropdown({
        allowAdditions: true,
      });
});
