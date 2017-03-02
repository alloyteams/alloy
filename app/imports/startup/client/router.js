import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

FlowRouter.route('/', {  // set homepage at reference address "/"
  name: 'Home_Page',
  action() {
    // render using homepage-body layout, with param 'main' mapping to Home_Page template
    BlazeLayout.render('Homepage_Body', { main: 'Home_Page' });
  },
});

//User_Profile_Page_2 is primary profile
FlowRouter.route('/user-profile2/:_id', {
  name: 'User_Profile_Page_2',
  action() {
    BlazeLayout.render('App_Body', { main: 'User_Profile_Page_2' });
  },
});

//Todo Deprecated, remove and migrate user profile 2 to primary
FlowRouter.route('/user-profile', {
  name: 'User_Profile_Page',
  action() {
    BlazeLayout.render('App_Body', { main: 'User_Profile_Page' });
  },
});

FlowRouter.route('/edit-profile/:_id', {
  name: 'Edit_Profile_Page',
  action() {
    BlazeLayout.render('App_Body', { main: 'Edit_Profile_Page' });
  },
});

FlowRouter.route('/project-profile/:_id', {
  name: 'Project_Profile_Page',
  action() {
    BlazeLayout.render('App_Body', { main: 'Project_Profile_Page' });
  },
});

FlowRouter.route('/create-project', {
  name: 'Project_Creation_Page',
  action() {
    BlazeLayout.render('App_Body', { main: 'Project_Creation_Page' });
  },
});

FlowRouter.route('/project-admin-profile/:_id', {
  name: 'Project_Admin_Page',
  action() {
    BlazeLayout.render('App_Body', { main: 'Project_Admin_Page' });
  },
});

FlowRouter.route('/admin', {
  name: 'Site_Admin_Page',
  action() {
    BlazeLayout.render('App_Body', { main: 'Site_Admin_Page' });
  },
});

FlowRouter.route('/admin/skills', {
  name: 'Edit_Skills_Page',
  action() {
    BlazeLayout.render('App_Body', { main: 'Edit_Skills_Page' });
  },
});

FlowRouter.route('/admin/projects', {
  name: 'Edit_Projects_Page',
  action() {
    BlazeLayout.render('App_Body', { main: 'Edit_Projects_Page' });
  },
});

FlowRouter.route('/admin/users', {
  name: 'Edit_Users_Page',
  action() {
    BlazeLayout.render('App_Body', { main: 'Edit_Users_Page' });
  },
});

FlowRouter.route('/admin/users', {
  name: 'Edit_Users_Page',
  action() {
    BlazeLayout.render('App_Body', { main: 'Edit_Users_Page' });
  },
});

FlowRouter.route('/add-contact', {
  name: 'Add_Contact_Page',
  action() {
    BlazeLayout.render('App_Body', { main: 'Add_Contact_Page' });
  },
});

FlowRouter.route('/search', {
  name: 'Search',
  action() {
    BlazeLayout.render('App_Body', { main: 'Search' });
  },
});

FlowRouter.route('/categories', {
  name: 'Categories_Page',
  action() {
    BlazeLayout.render('App_Body', { main: 'Categories_Page' });
  },
});

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_Body', { main: 'App_Not_Found' });
  },
};

// Testing for upload system

FlowRouter.route('/upload', {
  name: 'Upload',
  action() {
    BlazeLayout.render('App_Body', { main: 'Upload' });
  },
});
