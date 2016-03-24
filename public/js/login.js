var CHECKED_IN = false;

window.fbAsyncInit = function() {
  FB.init({
    appId: '118351225185470',
    xfbml: true,
    version: 'v2.4'
  });

};

// Load the SDK asynchronously
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s);
  js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.


function facebookLogin() {
  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      FB.api('/me', {
        fields: 'email,name,birthday,gender'
      }, function(response) {
        postFBinfo(response.name, response.id, response.email);
        console.log(response);
      });
    }
    else {
      FB.login(function(response) {

        if (response.status === 'connected') {
          FB.api('/me', {
            fields: 'email,name'
          }, function(response) {
            postFBinfo(response.name, response.id, response.email);
          });
        }
        else if (response.status === 'not_authorized') {

        }
        else {

        }
      }, {
        scope: 'public_profile,email'
      });
    }
  });
}

function postFBinfo(name, password, email) {
  $.post("/users/FBlogin", {
      name: name,
      password: password,
      email: email
    })
    .done(function(data) {
      if (!data.success) {
        $('#errorMsg').html(data.error);
        $('#errorAlert').removeClass('hidden');
      }
      else if (data.success) {
        window.location.replace("/vip");
      }
    });
}

function signup() {
  $.post("/users/adduser", {
      name: $('#username').val(),
      password: $('#password').val(),
      email: $('#email').val()
    })
    .done(function(data) {
      if (!data.success) {
        $('#errorMsg').html(data.error);
        $('#errorAlert').removeClass('hidden');
      }
      else if (data.success) {
        window.location.replace("/vip");
      }
    });
}

function login() {
  $.post("/users/login", {
      password: $('#password').val(),
      email: $('#email').val()
    })
    .done(function(data) {
      if (!data.success) {
        $('#errorMsg').html(data.error);
        $('#errorAlert').removeClass('hidden');
      }
      else if (data.success) {
        window.location.replace("/vip");
      }
    });
}

function logout() {
  $.post("/users/weblogout")
    .done(function(data) {
      if (data.success) {
        window.location.replace("/vip");
      }
    });
}
