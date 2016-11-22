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

FlowRouter.route('/site-admin-profile', {
  name: 'Site_Admin_Page',
  action() {
    BlazeLayout.render('App_Body', { main: 'Site_Admin_Page' });
  },
});

FlowRouter.route('/add-contact', {
  name: 'Add_Contact_Page',
  action() {
    BlazeLayout.render('App_Body', { main: 'Add_Contact_Page' });
  },
});

FlowRouter.route('/edit-contact/:id', {
  name: 'Edit_Contact_Page',
  action() {
    BlazeLayout.render('App_Body', { main: 'Edit_Contact_Page' });
  },
});

FlowRouter.route('/categories', {
  name: 'Categories_Page',
  action() {
    BlazeLayout.render('App_Body', { main: 'Categories_Page' });
  },
});

FlowRouter.route('/list', {
  name: 'List_Stuff_Page',
  action() {
    BlazeLayout.render('App_Body', { main: 'List_Stuff_Page' });
  },
});

FlowRouter.route('/add', {
  name: 'Add_Stuff_Page',
  action() {
    BlazeLayout.render('App_Body', { main: 'Add_Stuff_Page' });
  },
});

FlowRouter.route('/stuff/:_id', {
  name: 'Edit_Stuff_Page',
  action() {
    BlazeLayout.render('App_Body', { main: 'Edit_Stuff_Page' });
  },
});

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_Body', { main: 'App_Not_Found' });
  },
};


// TODO: CREATING DYNAMIC SEARCH PAGES FOR SEARCHING PROJECTS OR USERS
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
