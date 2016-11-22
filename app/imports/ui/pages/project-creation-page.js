/**
 * Created by Tim on 11/17/16.
 */
import {Template} from 'meteor/templating';
import {ReactiveDict} from 'meteor/reactive-dict';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {_} from 'meteor/underscore';
import {Projects, ProjectsSchema} from '../../api/projects/projects.js';
import {Meteor} from 'meteor/meteor'  // to access Meteor.users collection
import { SkillGraphCollection } from '../../api/skill-graph/SkillGraphCollection.js';

// consts to use in reactive dicts
const displayErrorMessages = 'displayErrorMessages';

Template.Project_Creation_Page.onCreated(function onCreated() {
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

Template.Project_Creation_Page.onRendered(function enableSemantic() {
  const instance = this;
  // instance.$('select.ui.dropdown').dropdown();
  // instance.$('.ui.selection.dropdown').dropdown();
  // instance.$('select.dropdown').dropdown();
  // instance.$('.ui.checkbox').checkbox();
  // instance.$('.ui.radio.checkbox').checkbox();
});

Template.Project_Creation_Page.events({
//   // logic for 'submit' event for 'project-data-form' 'form submission' event
  'submit .project-data-form'(event, instance) {
    event.preventDefault();

    // Get contact info (text fields)
    const newProjectName = event.target.projectName.value;  // based on associated html id tags
    const newBio = event.target.bio.value;
    const newMembers = [Meteor.user().profile.name];
    const newSkills = event.target.skills.value.split(",");
    const newUrl = event.target.projectUrl.value;
    const newProject = {
      projectName: newProjectName,
      bio: newBio,
      events: [],
      skills: newSkills,
      skillsWanted: newSkills,
      members: newMembers,
      admins: [Meteor.user().profile.name],
      url: newUrl,
      createdAt: new Date(),
    };

    //FIXME: currently, users track thier projects by name, so changing name makes projects unfindable to users
    //       this is only temp. problem since later implementations will have users track projects by doc. _id
    //       once they request to join on the project's profile page.
    //Projects.update({ _id: FlowRouter.getParam('_id') }, { $set: { projectName: projectName }});
    //Projects.update({ _id: FlowRouter.getParam('_id') }, { $set: { bio: bio }});

    //FlowRouter.go('Project_Profile_Page', {_id: FlowRouter.getParam('_id')});

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
      console.log(Projects.find({ projectName: newProjectName }).fetch());

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
