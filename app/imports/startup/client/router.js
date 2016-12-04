import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

FlowRouter.route('/', {  // set homepage at reference address "/"
  name: 'Home_Page',
  action() {
    // render using homepage-body layout, with param 'main' mapping to Home_Page template
    BlazeLayout.render('Homepage_Body', { main: 'Home_Page' });
  },
});

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

FlowRouter.route('/user-profile2/:_id', {
  name: 'User_Profile_Page_2',
  action() {
    BlazeLayout.render('App_Body', { main: 'User_Profile_Page_2' });
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

FlowRouter.route('/categories', {
  name: 'Categories_Page',
  action() {
    BlazeLayout.render('App_Body', { main: 'Categories_Page' });
  },
});

FlowRouter.route('/search', {
  name: 'Search_Page',
  action() {
    BlazeLayout.render('Search_Page_Body', { search_main: 'Search_Page' });
  },
});

FlowRouter.route('/search/search_projects', {
  name: 'Search_Projects_Page',
  action() {
    BlazeLayout.render('Search_Page_Body', { search_main: 'Search_Projects_Page' });
  },
});

FlowRouter.route('/search/search_users', {
  name: 'Search_Users_Page',
  action() {
    BlazeLayout.render('Search_Page_Body', { search_main: 'Search_Users_Page' });
  },
});

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_Body', { main: 'App_Not_Found' });
  },
};
