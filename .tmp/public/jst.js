this["JST"] = this["JST"] || {};

this["JST"]["assets/templates/create-assignment.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<section class="form assignment">\n\t<h1>Add Assignment</h1>\n\t<form class="form" ng-submit="create(assignment)">\n\t\t<label ng-class="error.name ? \'error\' : \'\'">\n\t\t\t<div class="label required">Name</div>\n\t\t\t<input type="text" placeholder="Enter the assignment name" ng-model="assignment.name">\n\t\t\t<p class="error" ng-bind="error.name" ng-show="error.name"></p>\n\t\t</label>\n\t\t<label ng-class="error.url ? \'error\' : \'\'">\n\t\t\t<div class="label required">URL</div>\n\t\t\t<input type="text" placeholder="Enter the assignment URL" ng-model="assignment.url">\n\t\t\t<p class="error" ng-bind="error.url" ng-show="error.url"></p>\n\t\t</label>\n\t\t<label ng-class="error.dueDate ? \'error\' : \'\'">\n\t\t\t<div class="label required">Due Date</div>\n\t\t\t<input type="date" ng-model="assignment.dueDate">\n\t\t\t<p class="error" ng-bind="error.dueDate" ng-show="error.dueDate"></p>\n\t\t</label>\n\t\t<label ng-class="error.dueTime ? \'error\' : \'\'">\n\t\t\t<div class="label required">Time</div>\n\t\t\t<input type="time" ng-model="assignment.dueTime" step="60">\n\t\t\t<p class="error" ng-bind="error.dueTime" ng-show="error.dueTime"></p>\n\t\t</label>\n\t\t<button type="submit" class="btn">Create Assignment</button>\n\t</form>\n</section>';

}
return __p
};

this["JST"]["assets/templates/home.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += 'home';

}
return __p
};

this["JST"]["assets/templates/login.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<section class="user-form">\n\t<div class="avatar"></div>\n\t<h1>Log in</h1>\n\t<form class="form" ng-submit="login(credentials)">\n\t\t<p class="error" ng-repeat="errorMessage in error.generic" ng-bind="errorMessage"></p>\n\t\t<label ng-class="error.identifier ? \'error\' : \'\'">\n\t\t\t<input type="text" placeholder="Email" ng-model="credentials.identifier">\n\t\t\t<p class="error" ng-bind="error.identifier"></p>\n\t\t</label>\n\t\t<label ng-class="error.password ? \'error\' : \'\'">\n\t\t\t<input type="password" placeholder="Password" ng-model="credentials.password">\n\t\t\t<p class="error" ng-bind="error.password"></p>\n\t\t</label>\n\t\t<button type="submit">Log in</button>\n\t</form>\n</section>';

}
return __p
};

this["JST"]["assets/templates/register.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<section class="user-form">\n\t<div class="avatar"></div>\n\t<h1>Register</h1>\n\t<form class="form" ng-submit="register(credentials)" novalidate>\n\t\t<p class="error" ng-repeat="errorMessage in error.generic" ng-bind="errorMessage"></p>\n\t\t<label ng-class="error.identifier ? \'error\' : \'\'">\n\t\t\t<input type="text" placeholder="Email" ng-model="credentials.identifier">\n\t\t\t<p class="error" ng-bind="error.identifier"></p>\n\t\t</label>\n\t\t<label ng-class="error.password ? \'error\' : \'\'">\n\t\t\t<input type="password" placeholder="Password" ng-model="credentials.password">\n\t\t\t<p class="error" ng-bind="error.password"></p>\n\t\t</label>\n\t\t<button type="submit">Register</button>\n\t</form>\n</section>';

}
return __p
};