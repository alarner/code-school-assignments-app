this["JST"] = this["JST"] || {};

this["JST"]["assets/templates/assignment.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<section class="assignment">\n\t<p class="error" ng-show="error.generic" ng-bind="error.generic"></p>\n\t<div ng-show="assignment">\n\t\t<h1>{{ assignment.name }}</h1>\n\t\t<div>Due on: {{ assignment.dueAt | date : \'fullDate\' }}</div>\n\t\t<div><a ng-href="{{ assignment.url }}">Link to instructions</a></div>\n\t</div>\n</section>';

}
return __p
};

this["JST"]["assets/templates/create-assignment.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<section class="form assignment">\n\t<h1>Add Assignment</h1>\n\t<form class="form" ng-submit="create(assignment)">\n\t\t<div ng-include="\'templates/partials/assignment-form.html\'"></div>\n\t\t<button type="submit" class="btn">Create Assignment</button>\n\t</form>\n</section>';

}
return __p
};

this["JST"]["assets/templates/dashboard.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<section class="dashboard">\n\t<div ng-hide="week.length">\n\t\tThere are no assignments right now. Come back later...\n\t</div>\n\t<div class="week" ng-repeat="week in assignments">\n\t\t<h1>{{ week.start.toDate() | date : \'MMM. d\'}} - {{ week.end.toDate() | date : \'MMM. d\'}}</h1>\n\t\t<div class="assignments">\n\t\t\t<div class="a" ng-repeat="assignment in week.assignments">\n\t\t\t\t<!--<a href="#" class="status" ng-class="assignment.status()" ui-sref="assignment({id: assignment.attributes.id})"></a>-->\n\t\t\t\t<a href="#" class="datetime" ui-sref="assignment({id: assignment.attributes.id})">\n\t\t\t\t\t<div>{{ assignment.attributes.dueAt.toDate() | date : \'EEEE\'}}</div>\n\t\t\t\t\t<div class="time">{{ assignment.attributes.dueAt.toDate() | date : \'h:mm a\'}}</div>\n\t\t\t\t</a>\n\t\t\t\t<a href="#" ui-sref="assignment({id: assignment.attributes.id})">\n\t\t\t\t\t<div ng-bind="assignment.attributes.name"></div>\n\t\t\t\t\t<div class="status" ng-show="user.isStudent()">Status: <span ng-class="assignment.status(\'color\')">{{ assignment.status(\'name\') }}</span></div>\n\t\t\t\t</a>\n\n\t\t\t\t<div class="buttons">\n\t\t\t\t\t<a ui-sref="submit({id: assignment.attributes.id})" class="btn" ng-show="user.isStudent()">{{ assignment.hasSubmission() ? \'Re-s\' : \'S\' }}ubmit</a>\n\t\t\t\t\t<a ui-sref="edit-assignment({id: assignment.attributes.id})" class="btn" ng-show="user.isInstructor()">Edit</a>\n\t\t\t\t\t<a ng-href="{{ assignment.attributes.url }}" class="btn">\n\t\t\t\t\t\t<div class="ion-link"></div>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t</div>\n</section>';

}
return __p
};

this["JST"]["assets/templates/edit-assignment.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<section class="form assignment">\n\t<h1 ng-bind="assignment.name"></h1>\n\t<form class="form" ng-submit="edit(assignment)">\n\t\t<div ng-include="\'templates/partials/assignment-form.html\'"></div>\n\t\t<button type="button" class="btn danger" ng-click="verifyDelete()">Delete</button>\n\t\t<button type="submit" class="btn">Save Assignment</button>\n\t</form>\n</section>';

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
__p += '<section class="user-form">\n\t<div class="avatar"></div>\n\t<h1>Log in</h1>\n\t<form class="form" ng-submit="login(credentials)">\n\t\t<p class="error" ng-show="error.generic" ng-bind="error.generic"></p>\n\t\t<label ng-class="error.identifier ? \'error\' : \'\'">\n\t\t\t<input type="text" placeholder="Email" ng-model="credentials.identifier">\n\t\t\t<p class="error" ng-bind="error.identifier"></p>\n\t\t</label>\n\t\t<label ng-class="error.password ? \'error\' : \'\'">\n\t\t\t<input type="password" placeholder="Password" ng-model="credentials.password">\n\t\t\t<p class="error" ng-bind="error.password"></p>\n\t\t</label>\n\t\t<button type="submit">Log in</button>\n\t</form>\n</section>';

}
return __p
};

this["JST"]["assets/templates/partials/assignment-form.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<label ng-class="error.name ? \'error\' : \'\'">\n\t<div class="label required">Name</div>\n\t<input type="text" placeholder="Enter the assignment name" ng-model="assignment.name">\n\t<p class="error" ng-bind="error.name" ng-show="error.name"></p>\n</label>\n<label ng-class="error.url ? \'error\' : \'\'">\n\t<div class="label required">URL</div>\n\t<input type="text" placeholder="Enter the assignment URL" ng-model="assignment.url">\n\t<p class="error" ng-bind="error.url" ng-show="error.url"></p>\n</label>\n<label ng-class="error.dueDate ? \'error\' : \'\'">\n\t<div class="label required">Due Date</div>\n\t<input type="date" ng-model="assignment.dueDate">\n\t<p class="error" ng-bind="error.dueDate" ng-show="error.dueDate"></p>\n</label>\n<label ng-class="error.dueTime ? \'error\' : \'\'">\n\t<div class="label required">Time</div>\n\t<input type="time" ng-model="assignment.dueTime" step="60">\n\t<p class="error" ng-bind="error.dueTime" ng-show="error.dueTime"></p>\n</label>';

}
return __p
};

this["JST"]["assets/templates/partials/verify-delete-assignment.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="dialog-contents">\n\t<p>Are you sure you want to permanently delete this assignment?</p>\n\t<button type="button" class="btn danger" ng-click="closeThisDialog(\'delete\')">Delete</button>\n\t<button type="button" class="btn" ng-click="closeThisDialog(\'cancel\')">Cancel</button>\n</div>';

}
return __p
};

this["JST"]["assets/templates/permission-denied.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += 'permission denied';

}
return __p
};

this["JST"]["assets/templates/register.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<section class="user-form">\n\t<div class="avatar"></div>\n\t<h1>Register</h1>\n\t<form class="form" ng-submit="register(credentials)" novalidate>\n\t\t<p class="error" ng-show="error.generic" ng-bind="error.generic"></p>\n\t\t<label ng-class="error.firstName ? \'error\' : \'\'">\n\t\t\t<input type="text" placeholder="First Name" ng-model="credentials.firstName">\n\t\t\t<p class="error" ng-bind="error.firstName"></p>\n\t\t</label>\n\t\t<label ng-class="error.lastName ? \'error\' : \'\'">\n\t\t\t<input type="text" placeholder="Last Name" ng-model="credentials.lastName">\n\t\t\t<p class="error" ng-bind="error.lastName"></p>\n\t\t</label>\n\t\t<label ng-class="error.identifier ? \'error\' : \'\'">\n\t\t\t<input type="text" placeholder="Email" ng-model="credentials.identifier">\n\t\t\t<p class="error" ng-bind="error.identifier"></p>\n\t\t</label>\n\t\t<label ng-class="error.password ? \'error\' : \'\'">\n\t\t\t<input type="password" placeholder="Password" ng-model="credentials.password">\n\t\t\t<p class="error" ng-bind="error.password"></p>\n\t\t</label>\n\t\t<button type="submit">Register</button>\n\t</form>\n</section>';

}
return __p
};

this["JST"]["assets/templates/submit.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<section class="form submit">\n\t<h1>{{ assignment.name }}</h1>\n\t<form class="form" ng-submit="submit(submission)">\n\t\t<p class="error" ng-show="error.generic" ng-bind="error.generic"></p>\n\t\t<label ng-class="error.url ? \'error\' : \'\'">\n\t\t\t<div class="label required">URL</div>\n\t\t\t<input type="text" placeholder="Enter the submission URL" ng-model="submission.url">\n\t\t\t<p class="error" ng-bind="error.url" ng-show="error.url"></p>\n\t\t</label>\n\t\t<label ng-class="error.notes ? \'error\' : \'\'">\n\t\t\t<div class="label required">Notes</div>\n\t\t\t<textarea placeholder="Did you complete everything? If not, what is missing? What did you struggle with?" ng-model="submission.notes"></textarea>\n\t\t\t<p class="error" ng-bind="error.notes" ng-show="error.notes"></p>\n\t\t</label>\n\t\t<button type="submit" class="btn">Submit</button>\n\t</form>\n</section>';

}
return __p
};